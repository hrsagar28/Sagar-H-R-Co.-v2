import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

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
  const shouldReduceMotion = useReducedMotion();

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

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <XCircle className="text-red-500" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-orange-500" size={20} />;
      case 'info':
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };

  const getStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-white border-green-200 text-green-900';
      case 'error':
        return 'bg-white border-red-200 text-red-900';
      case 'warning':
        return 'bg-white border-orange-200 text-orange-900';
      case 'info':
      default:
        return 'bg-white border-blue-200 text-blue-900';
    }
  };

  const animationClass = shouldReduceMotion
    ? isVisible
      ? 'opacity-100'
      : 'opacity-0'
    : isVisible
      ? 'translate-x-0 opacity-100'
      : 'translate-x-full opacity-0';

  return (
    // A11Y-4: the toast is presentational; the message is announced once via the
    // persistent live region (see ToastContainer), so no role/aria-live here to
    // avoid double announcements.
    <div
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${getStyles()} ${animationClass} `}
      onMouseEnter={pauseDismissTimer}
      onMouseLeave={resumeDismissTimer}
      onFocus={pauseDismissTimer}
      onBlur={resumeDismissTimer}
    >
      <div className="mt-0.5 shrink-0">{getIcon()}</div>
      <p className="flex-1 text-sm font-medium leading-relaxed">{message}</p>
      {/* A11Y-4: 44px touch target (was a bare 16px icon). */}
      <button
        onClick={handleClose}
        className="-mr-1 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
