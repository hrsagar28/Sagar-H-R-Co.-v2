import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-network-status flex animate-fade-in-up items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-center text-sm font-bold text-white shadow-md">
      <WifiOff size={16} />
      You are currently offline. Some features may be unavailable.
    </div>
  );
};

export default NetworkStatus;
