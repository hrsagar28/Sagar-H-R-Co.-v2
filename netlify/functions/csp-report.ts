import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: '' };
  }

  console.warn('CSP violation report', event.body || '');
  return { statusCode: 204, body: '' };
};
