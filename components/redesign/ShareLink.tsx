import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from './icons';

/**
 * "Share this article". On a phone or tablet it opens the device's own share
 * sheet (WhatsApp, mail and the rest); with a mouse it copies the link, which
 * is what people expect from a computer.
 */
const ShareLink: React.FC<{ title: string; url: string }> = ({ title, url }) => {
  const [message, setMessage] = useState('');
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const say = (text: string) => {
    setMessage(text);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(''), 3000);
  };

  const share = async () => {
    const touch = window.matchMedia?.('(pointer: coarse)').matches;
    if (touch && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url });
      } catch {
        // Closed without sharing; nothing to say.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      say('Link copied');
    } catch {
      say('Copy the address from the address bar');
    }
  };

  return (
    <p className="ashare">
      <button type="button" onClick={share}>
        Share this article
        <ArrowRight />
      </button>
      <span className="done" role="status" aria-live="polite">
        {message}
      </span>
    </p>
  );
};

export default ShareLink;
