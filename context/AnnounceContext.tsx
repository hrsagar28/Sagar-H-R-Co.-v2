import React, { createContext, useContext, useState, useCallback } from 'react';
import LiveRegion from '../components/LiveRegion';

interface AnnounceContextType {
  announce: (message: string, politeness?: 'polite' | 'assertive') => void;
}

const AnnounceContext = createContext<AnnounceContextType | undefined>(undefined);

export const AnnounceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');

  const announce = useCallback((msg: string, pol: 'polite' | 'assertive' = 'polite') => {
    setMessage(msg);
    setPoliteness(pol);
    // Clear message after a short delay so it can be announced again if needed
    // The screen reader picks it up when the DOM updates
    setTimeout(() => setMessage(''), 3000);
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