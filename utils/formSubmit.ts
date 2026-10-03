import { apiClient, ApiError } from './api';
import { logger } from './logger';
import { CONTACT_INFO } from '../config/contact';

interface FormSubmitReply {
  success?: unknown;
  message?: unknown;
}

/**
 * Sends a form (contact or careers) to FormSubmit, which emails it to the firm.
 *
 * The request goes straight from the visitor's browser. FormSubmit answers
 * requests from hosting servers with 403, so the earlier Netlify function in
 * between never delivered anything. FormSubmit's own `_honey` field and spam
 * filter screen submissions, and each form keeps its client-side rate limit.
 *
 * FormSubmit can answer 200 and still refuse a message (for example before the
 * address has been activated), saying so in the body as `success: "false"`.
 */
export const submitToFormSubmit = async (payload: Record<string, string>): Promise<void> => {
  // Leave out blank optional fields so the email lists only what was filled in.
  const filled = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== ''));
  const reply = await apiClient.post<FormSubmitReply | null>(CONTACT_INFO.formEndpoint, filled);
  if (reply && String(reply.success) === 'false') {
    logger.error('FormSubmit did not accept the message', { message: reply.message });
    throw new ApiError(
      `We could not send your message. Please email us directly at ${CONTACT_INFO.email}`,
      502,
      'SERVER_ERROR',
    );
  }
};
