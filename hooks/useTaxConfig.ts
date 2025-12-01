
import { useState, useEffect } from 'react';
import { TaxConfig } from '../components/TaxCalculator/types';
import { logger } from '../utils/logger';
import { apiClient, ApiError } from '../utils/api';

export const useTaxConfig = () => {
  const [config, setConfig] = useState<TaxConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchConfig = async () => {
      const baseUrl = (import.meta as any)?.env?.BASE_URL || '/';
      const url = `${baseUrl}data/tax-config.json`.replace('//', '/');

      try {
        const data = await apiClient.get<TaxConfig>(url);
        if (isMounted) {
          setConfig(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          logger.error('Error fetching tax config:', err);
          let msg = 'Failed to load latest tax rules. Using defaults.';
          if (err instanceof ApiError && err.code === 'NETWORK_ERROR') {
             msg = 'Offline: Using cached/default tax rules.';
          }
          setError(msg);
          setLoading(false);
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
