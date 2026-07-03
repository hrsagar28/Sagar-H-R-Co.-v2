import React, { useEffect, useRef } from 'react';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';
import { useAnnounce } from '../hooks/useAnnounce';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();
  const { announce } = useAnnounce();

  // A11Y-4: announce new toasts through the single persistent live region
  // (AnnounceProvider) rather than relying on a live region that mounts with
  // the toast — the latter is unreliably announced across SR/browser combos.
  const announcedIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    for (const toast of toasts) {
      if (announcedIds.current.has(toast.id)) continue;
      announcedIds.current.add(toast.id);
      const politeness = toast.variant === 'error' || toast.variant === 'warning' ? 'assertive' : 'polite';
      announce(toast.message, politeness);
    }
    // Forget ids that are no longer mounted so the set can't grow unbounded.
    const live = new Set(toasts.map((t) => t.id));
    for (const id of announcedIds.current) {
      if (!live.has(id)) announcedIds.current.delete(id);
    }
  }, [toasts, announce]);

  return (
    <div className="pointer-events-none fixed bottom-0 right-0 z-toast flex w-full max-w-sm flex-col gap-3 p-6">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          variant={toast.variant}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
