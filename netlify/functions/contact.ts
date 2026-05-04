import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { createHash } from 'crypto';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 24 * 60 * 60 * 1000;
const DEFAULT_FORM_SUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/a1b2c3d4e5f6g7h8';

type ContactPayload = Record<string, unknown>;
type UploadedFilePayload = {
  name?: unknown;
  type?: unknown;
  size?: unknown;
  contentBase64?: unknown;
};

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
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const isUploadedFilePayload = (value: unknown): value is UploadedFilePayload =>
  Boolean(value) && typeof value === 'object';

const validateUpload = (payload: ContactPayload) => {
  if (!isUploadedFilePayload(payload.resumeFile)) return true;

  const { name, type, size, contentBase64 } = payload.resumeFile;
  const fileName = valueAsString(name).toLowerCase();
  const mimeType = valueAsString(type).toLowerCase();
  const declaredSize = Number(size);
  const encoded = valueAsString(contentBase64);

  if (
    !/\.(pdf|doc|docx)$/.test(fileName) ||
    !Number.isFinite(declaredSize) ||
    declaredSize > MAX_UPLOAD_BYTES ||
    !encoded
  ) {
    return false;
  }

  const bytes = Buffer.from(encoded, 'base64');
  if (bytes.byteLength > MAX_UPLOAD_BYTES) return false;

  const isPdf = bytes.subarray(0, 5).toString('ascii') === '%PDF-';
  const isOleDoc = bytes.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
  const isZipBasedDocx = bytes.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  const isZip = fileName.endsWith('.zip') || mimeType.includes('zip');

  if (isZip) return false;
  if (fileName.endsWith('.pdf')) return isPdf && mimeType.includes('pdf');
  if (fileName.endsWith('.doc')) return isOleDoc;
  if (fileName.endsWith('.docx')) return isZipBasedDocx;

  return false;
};

const getRateLimitKey = (ip: string, email: string) => {
  const day = new Date().toISOString().slice(0, 10);
  return createHash('sha256').update(`${ip}:${email.toLowerCase()}:${day}`).digest('hex');
};

const verifyBotpoison = async (solution: string) => {
  const secretKey = process.env.BOTPOISON_SECRET_KEY;
  if (!secretKey) return true;
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

const checkRateLimit = async (key: string) => {
  const store = getStore('contact-rate-limit');
  const now = Date.now();
  const previous = (await store.get(key, { type: 'json' }).catch(() => null)) as {
    count?: number;
    firstAttempt?: number;
  } | null;
  const firstAttempt = previous?.firstAttempt && now - previous.firstAttempt < WINDOW_MS ? previous.firstAttempt : now;
  const count = firstAttempt === previous?.firstAttempt ? (previous.count || 0) + 1 : 1;

  if (count >= MAX_ATTEMPTS) {
    return false;
  }

  await store.setJSON(key, { count, firstAttempt });
  return true;
};

const forwardToFormSubmit = async (payload: ContactPayload) => {
  const endpoint = process.env.FORM_SUBMIT_ENDPOINT || DEFAULT_FORM_SUBMIT_ENDPOINT;
  const { _botpoison, ...formPayload } = payload;

  return fetch(endpoint, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify(formPayload),
  });
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  let payload: ContactPayload;
  try {
    payload = JSON.parse(event.body || '{}') as ContactPayload;
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const honeypot =
    valueAsString(payload._honey) || valueAsString(payload._hp_wauth_do_not_fill) || valueAsString(payload.honeypot);
  if (honeypot) {
    return json(422, { error: 'Submission rejected' });
  }

  if (!validateUpload(payload)) {
    return json(422, { error: 'Invalid upload' });
  }

  const botpoisonOk = await verifyBotpoison(valueAsString(payload._botpoison));
  if (!botpoisonOk) {
    return json(422, { error: 'Bot verification failed' });
  }

  const email = valueAsString(payload.email);
  const ip = getClientIp(event.headers);
  const allowed = await checkRateLimit(getRateLimitKey(ip, email));
  if (!allowed) {
    return json(429, { error: 'Too many submissions' });
  }

  const response = await forwardToFormSubmit(payload);
  if (!response.ok) {
    return json(502, { error: 'Submission gateway failed' });
  }

  return { statusCode: 204, body: '' };
};
