import React from 'react';
import { CONTACT_INFO } from '../../config/contact';

interface SendFailedProps {
  /** What could not be sent: "message" on the Contact form, "application" on Careers. */
  what: 'message' | 'application';
  /** Offer WhatsApp as well as the phone and email (the Contact form). */
  whatsapp?: boolean;
}

/**
 * Audit NOV-01: shown above the Send button when a form could not be sent, and
 * left there until the next attempt. The forms post to an outside service
 * (utils/formSubmit.ts); when it fails, the visitor needs another way to reach
 * the firm, not a status code in a toast that is gone in five seconds.
 */
const SendFailed: React.FC<SendFailedProps> = ({ what, whatsapp = false }) => (
  <p className="fail" role="alert">
    We could not send your {what} just now. Please call{' '}
    <a className="tnum" href={`tel:${CONTACT_INFO.phone.value}`}>
      {CONTACT_INFO.phone.display}
    </a>
    {whatsapp && (
      <>
        ,{' '}
        <a href={CONTACT_INFO.social.whatsapp} target="_blank" rel="noopener noreferrer">
          message us on WhatsApp<span className="vh"> (opens in a new tab)</span>
        </a>
      </>
    )}{' '}
    or email <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>. What you have typed is still here.
  </p>
);

export default SendFailed;
