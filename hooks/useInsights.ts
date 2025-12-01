
import { useState, useEffect, useCallback } from 'react';
import { InsightItem } from '../types';
import { logger } from '../utils/logger';
import { apiClient, ApiError } from '../utils/api';

export const useInsights = () => {
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchInsights = async () => {
      // Construct robust path using Vite's BASE_URL or fallback to relative
      const baseUrl = (import.meta as any)?.env?.BASE_URL || '/';
      const url = `${baseUrl}data/insights.json`.replace('//', '/');

      try {
        const data = await apiClient.get<InsightItem[]>(url);
        if (isMounted) {
          setInsights(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          logger.error('Error fetching insights:', err);
          let msg = 'Unable to load insights.';
          if (err instanceof ApiError) {
             if (err.code === 'NETWORK_ERROR') msg = 'Network error. Please check your connection.';
             else if (err.code === 'TIMEOUT') msg = 'Request timed out.';
          }
          setError(msg);
          setLoading(false);
        }
      }
    };

    fetchInsights();

    return () => {
      isMounted = false;
    };
  }, []);

  const getInsightBySlug = useCallback((slug: string) => {
    return insights.find(i => i.slug === slug);
  }, [insights]);

  return { insights, loading, error, getInsightBySlug };
};
