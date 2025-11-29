import { useState, useEffect } from 'react';
import { TaxConfig } from '../components/TaxCalculator/types';
import { logger } from '../utils/logger';

export const useTaxConfig = () => {
  const [config, setConfig] = useState<TaxConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchConfig = async () => {
      const retries = 3;
      const baseDelay = 1000;

      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch('/data/tax-config.json');
          if (!response.ok) {
            throw new Error(`Failed to load tax configuration: ${response.statusText}`);
          }
          const data: TaxConfig = await response.json();
          
          if (isMounted) {
            setConfig(data);
            setLoading(false);
          }
          return; // Success, exit loop
        } catch (err) {
          // If this was the last attempt, log error and set state
          if (i === retries - 1) {
            logger.error('Error fetching tax config after retries:', err);
            if (isMounted) {
              setError('Failed to load latest tax rules. Using defaults.');
              setLoading(false);
            }
          } else {
            // Wait with exponential backoff before retrying
            const delay = baseDelay * Math.pow(2, i);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
    };

    fetchConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  return { config, loading, error };
};