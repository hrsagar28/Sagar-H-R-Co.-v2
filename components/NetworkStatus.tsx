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
    <div className="fixed top-0 left-0 right-0 z-[2000] bg-amber-500 text-white text-center py-2 px-4 font-bold text-sm shadow-md flex items-center justify-center gap-2 animate-fade-in-up">
      <WifiOff size={16} />
      You are currently offline. Some features may be unavailable.
    </div>
  );
};

export default NetworkStatus;