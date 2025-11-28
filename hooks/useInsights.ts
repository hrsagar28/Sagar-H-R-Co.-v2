import { useState, useEffect, useCallback } from 'react';
import { InsightItem } from '../types';
import { logger } from '../utils/logger';

export const useInsights = () => {
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch('/data/insights.json');
        if (!response.ok) {
          throw new Error('Failed to load insights');
        }
        const data: InsightItem[] = await response.json();
        setInsights(data);
        setLoading(false);
      } catch (err) {
        logger.error('Error fetching insights:', err);
        setError('Unable to load insights.');
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const getInsightBySlug = useCallback((slug: string) => {
    return insights.find(i => i.slug === slug);
  }, [insights]);

  return { insights, loading, error, getInsightBySlug };
};