import { useState, useEffect } from 'react';
import { TaxConfig } from '../components/TaxCalculator/types';
import { logger } from '../utils/logger';

export const useTaxConfig = () => {
  const [config, setConfig] = useState<TaxConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/data/tax-config.json');
        if (!response.ok) {
          throw new Error('Failed to load tax configuration');
        }
        const data: TaxConfig = await response.json();
        setConfig(data);
        setLoading(false);
      } catch (err) {
        logger.error('Error fetching tax config:', err);
        setError('Failed to load latest tax rules. Using defaults.');
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, loading, error };
};