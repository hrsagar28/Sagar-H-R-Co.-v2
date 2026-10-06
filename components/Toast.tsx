import React, { useCallback, useEffect, useRef, useState } from 'react';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, variant, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  // UX-3 / WCAG 2.2.1: the auto-dismiss timer pauses while the toast is hovered
  // or keyboard-focused, so error toasts carrying recovery steps can be read at
  // the user's pace. We track remaining time rather than restarting from full.
  const dismissTimer = useRef<number | undefined>(undefined);
  const remainingRef = useRef(duration);
  const startedAtRef = useRef(0);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    // Wait for exit animation to finish before removing from DOM
    setTimeout(() => {
      onClose(id);
    }, 300);
  }, [id, onClose]);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimer.current !== undefined) {
      window.clearTimeout(dismissTimer.current);
      dismissTimer.current = undefined;
    }
  }, []);

  const startDismissTimer = useCallback(
    (ms: number) => {
      clearDismissTimer();
      startedAtRef.current = Date.now();
      remainingRef.current = ms;
      dismissTimer.current = window.setTimeout(handleClose, ms);
    },
    [clearDismissTimer, handleClose],
  );

  const pauseDismissTimer = useCallback(() => {
    if (dismissTimer.current === undefined) return;
    clearDismissTimer();
    remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAtRef.current));
  }, [clearDismissTimer]);

  const resumeDismissTimer = useCallback(() => {
    if (dismissTimer.current !== undefined) return;
    startDismissTimer(remainingRef.current > 0 ? remainingRef.current : duration);
  }, [duration, startDismissTimer]);

  useEffect(() => {
    // Trigger entry animation
    requestAnimationFrame(() => setIsVisible(true));

    startDismissTimer(duration);
    return () => clearDismissTimer();
  }, [duration, startDismissTimer, clearDismissTimer]);

  return (
    // A11Y-4: the toast is presentational; the message is announced once via the
    // persistent live region (see ToastContainer), so no role/aria-live here to
    // avoid double announcements.
    // 2026 redesign: a dark square note with a coloured rule on the left
    // (green when something worked, copper when it did not); styles in
    // index.css (.sx-toast). Reduced motion fades without the lift.
    <div
      className={`sx-toast ${variant} ${isVisible ? 'on' : ''}`}
      onMouseEnter={pauseDismissTimer}
      onMouseLeave={resumeDismissTimer}
      onFocus={pauseDismissTimer}
      onBlur={resumeDismissTimer}
    >
      <p>{message}</p>
      {/* A11Y-4: 44px touch target. */}
      <button type="button" onClick={handleClose} aria-label="Close message">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
