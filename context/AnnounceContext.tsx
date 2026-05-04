import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import LiveRegion from '../components/LiveRegion';

interface AnnounceContextType {
  announce: (message: string, politeness?: 'polite' | 'assertive') => void;
}

const AnnounceContext = createContext<AnnounceContextType | undefined>(undefined);

export const AnnounceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');
  const lastMessage = useRef('');
  const clearTimer = useRef<number | null>(null);

  const announce = useCallback((msg: string, pol: 'polite' | 'assertive' = 'polite') => {
    const nextMessage = msg === lastMessage.current ? `${msg}\u200B` : msg;
    lastMessage.current = nextMessage;
    setMessage(nextMessage);
    setPoliteness(pol);
    if (clearTimer.current) window.clearTimeout(clearTimer.current);
    clearTimer.current = window.setTimeout(() => setMessage(''), 7000);
  }, []);

  return (
    <AnnounceContext.Provider value={{ announce }}>
      {children}
      <LiveRegion message={message} politeness={politeness} />
    </AnnounceContext.Provider>
  );
};

export const useAnnounceContext = () => {
  const context = useContext(AnnounceContext);
  if (!context) {
    throw new Error('useAnnounce must be used within an AnnounceProvider');
  }
  return context;
};
