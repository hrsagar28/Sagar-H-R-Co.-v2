
import { useState, useEffect, useCallback } from 'react';
import { InsightItem } from '../types';
import { logger } from '../utils/logger';

export const useInsights = () => {
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchInsights = async () => {
      const retries = 3;
      const baseDelay = 1000;

      // Construct robust path using Vite's BASE_URL or fallback to relative
      const baseUrl = (import.meta as any).env.BASE_URL || '/';
      const url = `${baseUrl}data/insights.json`.replace('//', '/');

      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to load insights: ${response.statusText}`);
          }
          const data: InsightItem[] = await response.json();
          
          if (isMounted) {
            setInsights(data);
            setLoading(false);
          }
          return; // Success
        } catch (err) {
          if (i === retries - 1) {
            logger.error('Error fetching insights after retries:', err);
            if (isMounted) {
              setError('Unable to load insights.');
              setLoading(false);
            }
          } else {
            const delay = baseDelay * Math.pow(2, i);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
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