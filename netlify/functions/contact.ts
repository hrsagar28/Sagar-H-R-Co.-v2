import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { createHash } from 'crypto';

// SEC-3: two counters. The per-email cap is the primary UX limit; the per-IP
// cap can't be dodged by rotating the email field, so it stops a single source
// from spamming under many addresses.
const MAX_ATTEMPTS_PER_EMAIL = 5;
const MAX_ATTEMPTS_PER_IP = 20;
const WINDOW_MS = 24 * 60 * 60 * 1000;

// SEC-4: reject obviously-oversized bodies before doing any work.
const MAX_BODY_BYTES = 100 * 1024;

// SEC-4: only accept cross-origin POSTs from our own site / Netlify previews.
const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true; // Same-origin requests may omit Origin; don't block them.
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === 'casagar.co.in' ||
      hostname.endsWith('.casagar.co.in') ||
      hostname.endsWith('.netlify.app') ||
      hostname === 'localhost'
    );
  } catch {
    return false;
  }
};

// The fabricated ID that shipped as the old default. Treated as "not configured".
const PLACEHOLDER_ENDPOINT = 'https://formsubmit.co/ajax/a1b2c3d4e5f6g7h8';

// SEC-1 / CF-8: server-side allowlist. Only these keys are ever forwarded to
// FormSubmit. Everything else the client sends -- FormSubmit control fields
// (_cc, _replyto, _autoresponse, _next, ...) and our own honeypot / anti-bot
// fields -- is dropped here, so a direct POST cannot inject them.
const CONTACT_FIELDS = ['name', 'email', 'phone', 'company', 'subject', 'message'] as const;
const CAREER_FIELDS = [
  'fullName',
  'fatherName',
  'mobile',
  'email',
  'dob',
  'qualification',
  'experience',
  'previousCompanies',
  'whyJoin',
  'position',
] as const;
// The only FormSubmit meta fields we deliberately allow (subject line + table layout).
const ALLOWED_META_FIELDS = ['_subject', '_template'] as const;
const ALLOWED_FIELDS = new Set<string>([...CONTACT_FIELDS, ...CAREER_FIELDS, ...ALLOWED_META_FIELDS]);

// Fields whose line breaks are meaningful and should be preserved.
const MULTILINE_FIELDS = new Set(['message', 'whyJoin', 'previousCompanies']);
const MAX_FIELD_LENGTH = 5000;

// Control characters. Single-line fields strip them all (incl. CR/LF/tab);
// multiline fields keep tab (U+0009), line feed (U+000A) and carriage return
// (U+000D). Built via RegExp() so the source stays pure ASCII.
const CONTROL_CHARS_ALL = new RegExp('[\\u0000-\\u001F\\u007F]+', 'g');
const CONTROL_CHARS_KEEP_BREAKS = new RegExp('[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]+', 'g');

type ContactPayload = Record<string, unknown>;
type RateState = { count?: number; firstAttempt?: number };
type RateWindow = { count: number; firstAttempt: number };

const json = (statusCode: number, body: Record<string, string>) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const getClientIp = (headers: Record<string, string | undefined>) => {
  const forwardedFor = headers['x-forwarded-for']?.split(',')[0]?.trim();
  return headers['x-nf-client-connection-ip'] || headers['client-ip'] || forwardedFor || 'unknown';
};

const valueAsString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

// Header-safe server-side sanitisation (SEC-1). The client already sanitises,
// but that is bypassable by a direct POST, so we repeat it here.
const sanitizeField = (key: string, raw: unknown): string => {
  const value = typeof raw === 'string' ? raw : String(raw ?? '');
  const preserveBreaks = MULTILINE_FIELDS.has(key);
  let out = value.replace(preserveBreaks ? CONTROL_CHARS_KEEP_BREAKS : CONTROL_CHARS_ALL, preserveBreaks ? '' : ' ');
  if (!preserveBreaks) out = out.replace(/\s+/g, ' ');
  return out.trim().slice(0, MAX_FIELD_LENGTH);
};

const buildForwardPayload = (payload: ContactPayload): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const key of Object.keys(payload)) {
    if (!ALLOWED_FIELDS.has(key)) continue;
    const sanitized = sanitizeField(key, payload[key]);
    if (sanitized) out[key] = sanitized;
  }
  return out;
};

// CF-1 / SEC-2: resolve the real endpoint or `null`. Fail closed on null.
const getFormSubmitEndpoint = (): string | null => {
  const endpoint = process.env.FORM_SUBMIT_ENDPOINT?.trim();
  if (!endpoint || endpoint === PLACEHOLDER_ENDPOINT) return null;
  if (!/^https:\/\/formsubmit\.co\/ajax\/.+/.test(endpoint)) return null;
  return endpoint;
};

const hashKey = (input: string) => createHash('sha256').update(input).digest('hex');
const today = () => new Date().toISOString().slice(0, 10);

const getEmailRateLimitKey = (ip: string, email: string) => hashKey(`${ip}:${email.toLowerCase()}:${today()}`);
const getIpRateLimitKey = (ip: string) => hashKey(`ip:${ip}:${today()}`);

const verifyBotpoison = async (solution: string) => {
  const secretKey = process.env.BOTPOISON_SECRET_KEY;
  if (!secretKey) {
    // SEC-5: with no secret we can't verify. Fail OPEN by default so the form
    // keeps working before Botpoison is configured, but fail CLOSED when the
    // operator opts in (set REQUIRE_BOTPOISON=true once keys are live).
    if (process.env.REQUIRE_BOTPOISON === 'true') {
      console.error('[contact] REQUIRE_BOTPOISON is set but BOTPOISON_SECRET_KEY is missing. Rejecting submission.');
      return false;
    }
    if (process.env.CONTEXT === 'production') {
      console.warn('[contact] Botpoison secret not configured — spam protection is OFF for this submission.');
    }
    return true;
  }
  if (!solution) return false;

  const response = await fetch('https://api.botpoison.com/verify', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ secretKey, solution }),
  });

  if (!response.ok) return false;
  const result = await response.json().catch(() => ({ ok: false }));
  return Boolean(result.ok);
};

// CF-2 / CF-3: read the current window without mutating it, and survive Blobs
// being unavailable. Returns 'unavailable' if the store can't be reached so the
// caller can let the submission through rather than break 100% of traffic.
const readRateLimit = async (key: string): Promise<RateWindow | 'unavailable'> => {
  try {
    const store = getStore('contact-rate-limit');
    const now = Date.now();
    const previous = (await store.get(key, { type: 'json' }).catch(() => null)) as RateState | null;
    const withinWindow = Boolean(previous?.firstAttempt && now - previous.firstAttempt < WINDOW_MS);
    return {
      count: withinWindow ? previous?.count || 0 : 0,
      firstAttempt: withinWindow && previous?.firstAttempt ? previous.firstAttempt : now,
    };
  } catch {
    return 'unavailable';
  }
};

// CF-2: only a successful send consumes a slot, so a failed gateway / retry
// after an error never locks a genuine user out for 24h.
const recordSuccessfulSend = async (key: string, window: RateWindow) => {
  try {
    const store = getStore('contact-rate-limit');
    await store.setJSON(key, { count: window.count + 1, firstAttempt: window.firstAttempt });
  } catch {
    // Blobs unavailable -- the email already went out; don't fail the request.
  }
};

const forwardToFormSubmit = (endpoint: string, formPayload: Record<string, string>) =>
  fetch(endpoint, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify(formPayload),
  });

export const handler: Handler = async (event) => {
  // CF-3: nothing below can throw an unhandled 500 with a raw stack.
  try {
    if (event.httpMethod !== 'POST') {
      return json(405, { error: 'Method not allowed' });
    }

    // SEC-4: cheap rejections first, before any Blobs/Botpoison network cost.
    if (!isAllowedOrigin(event.headers.origin || event.headers.referer)) {
      return json(403, { error: 'Request origin not allowed.' });
    }

    const rawBody = event.body || '';
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
      return json(413, { error: 'Submission too large.' });
    }

    let payload: ContactPayload;
    try {
      payload = JSON.parse(rawBody || '{}') as ContactPayload;
    } catch {
      return json(400, { error: 'Invalid request. Please try again.' });
    }

    const honeypot =
      valueAsString(payload._honey) || valueAsString(payload._hp_wauth_do_not_fill) || valueAsString(payload.honeypot);
    if (honeypot) {
      return json(422, { error: 'Submission rejected.' });
    }

    // CF-1 / SEC-2: refuse to forward anywhere until a real, activated endpoint
    // is configured -- never fall back to an alias we don't control.
    const endpoint = getFormSubmitEndpoint();
    if (!endpoint) {
      console.error(
        '[contact] FORM_SUBMIT_ENDPOINT is not configured with a real, activated FormSubmit address. Refusing to forward the submission.',
      );
      return json(503, {
        error: 'The contact form is temporarily unavailable. Please email us directly.',
      });
    }

    // SEC-3 / SEC-4: check both rate-limit counters BEFORE the Botpoison call,
    // so already-throttled traffic never costs a verification round-trip.
    const email = valueAsString(payload.email);
    const ip = getClientIp(event.headers);
    const emailKey = getEmailRateLimitKey(ip, email);
    const ipKey = getIpRateLimitKey(ip);
    const [emailWindow, ipWindow] = await Promise.all([readRateLimit(emailKey), readRateLimit(ipKey)]);

    const emailOverLimit = emailWindow !== 'unavailable' && emailWindow.count >= MAX_ATTEMPTS_PER_EMAIL;
    const ipOverLimit = ipWindow !== 'unavailable' && ipWindow.count >= MAX_ATTEMPTS_PER_IP;
    if (emailOverLimit || ipOverLimit) {
      return json(429, { error: 'You have reached the submission limit for today. Please email us directly.' });
    }

    const botpoisonOk = await verifyBotpoison(valueAsString(payload._botpoison));
    if (!botpoisonOk) {
      return json(422, { error: 'We could not verify your submission. Please refresh the page and try again.' });
    }

    const response = await forwardToFormSubmit(endpoint, buildForwardPayload(payload));
    if (!response.ok) {
      return json(502, { error: 'The contact gateway did not accept the message. Please email us directly.' });
    }

    // CF-2 / SEC-3: only a successful send consumes a slot, and it consumes one
    // in both counters.
    await Promise.all([
      emailWindow !== 'unavailable' ? recordSuccessfulSend(emailKey, emailWindow) : Promise.resolve(),
      ipWindow !== 'unavailable' ? recordSuccessfulSend(ipKey, ipWindow) : Promise.resolve(),
    ]);

    return { statusCode: 204, body: '' };
  } catch (error) {
    console.error('[contact] Unhandled error while processing submission', error);
    return json(500, { error: 'Server error. Please email us directly.' });
  }
};
