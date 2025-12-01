
import { useState, useEffect } from 'react';
import { apiClient, ApiError } from '../utils/api';
import { logger } from '../utils/logger';

export function useResourceData<T>(fileName: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      const baseUrl = (import.meta as any)?.env?.BASE_URL || '/';
      const url = `${baseUrl}data/${fileName}`.replace('//', '/');

      try {
        const result = await apiClient.get<T>(url);
        if (isMounted) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          logger.error(`Error fetching resource ${fileName}:`, err);
          let msg = 'Failed to load data.';
          if (err instanceof ApiError && err.code === 'NETWORK_ERROR') {
             msg = 'Offline: Unable to fetch data.';
          }
          setError(msg);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [fileName]);

  return { data, loading, error };
}
