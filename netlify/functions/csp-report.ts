import type { Handler } from '@netlify/functions';

// SEC-4: this endpoint is public and unauthenticated. Cap the body we read and
// log, and throttle how often we log, so a flood of (spoofable) reports can't
// run up log volume ("denial-of-wallet").
const MAX_LOGGED_CHARS = 2000;
const THROTTLE_MS = 10 * 1000;
let lastLoggedAt = 0;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: '' };
  }

  const now = Date.now();
  if (now - lastLoggedAt >= THROTTLE_MS) {
    lastLoggedAt = now;
    const body = (event.body || '').slice(0, MAX_LOGGED_CHARS);
    console.warn('CSP violation report (truncated)', body);
  }

  return { statusCode: 204, body: '' };
};
