import React, { useEffect, useRef, useState } from 'react';

type Status = 'online' | 'offline' | 'back';

/**
 * A bar along the bottom of the screen while the visitor is offline, and a
 * short "Back online" note when the connection returns. Styles in index.css
 * (.sx-offline). UX-7: announced to assistive tech through role="status".
 */
const NetworkStatus: React.FC = () => {
  const [status, setStatus] = useState<Status>(() => (navigator.onLine ? 'online' : 'offline'));
  const timer = useRef(0);

  useEffect(() => {
    const handleOffline = () => {
      window.clearTimeout(timer.current);
      setStatus('offline');
    };
    const handleOnline = () => {
      setStatus((current) => (current === 'offline' ? 'back' : current));
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setStatus('online'), 3000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.clearTimeout(timer.current);
    };
  }, []);

  if (status === 'online') return null;

  return (
    <div role="status" aria-live="polite" className={`sx-offline ${status === 'back' ? 'back' : ''}`}>
      {status === 'back'
        ? 'Back online.'
        : 'You are offline. Pages you have not opened yet will load once the connection is back.'}
    </div>
  );
};

export default NetworkStatus;
