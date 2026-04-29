
import { useState, useEffect, useCallback } from 'react';
import { InsightItem } from '../types';
import { logger } from '../utils/logger';
import { apiClient, ApiError } from '../utils/api';

let insightsPromise: Promise<InsightItem[]> | null = null;

const isValidInsight = (item: unknown): item is InsightItem => {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;
  return ['id', 'title', 'category', 'date', 'summary', 'slug', 'author', 'readTime']
    .every((key) => typeof candidate[key] === 'string' && candidate[key]);
};

const getInsightsUrl = () => {
  const baseUrl = (import.meta as any)?.env?.BASE_URL || '/';
  if (typeof window === 'undefined') return `${baseUrl.replace(/\/$/, '')}/data/insights.json`;
  return new URL('data/insights.json', new URL(baseUrl, window.location.origin)).toString();
};

const fetchInsights = () => {
  if (!insightsPromise) {
    insightsPromise = apiClient.get<unknown[]>(getInsightsUrl()).then((data) => {
      if (!Array.isArray(data) || !data.every(isValidInsight)) {
        throw new ApiError('Invalid insights payload.', 0, 'INVALID_RESPONSE');
      }
      return data;
    });
  }
  return insightsPromise;
};

export const useInsights = () => {
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadInsights = async () => {
      try {
        const data = await fetchInsights();
        if (isMounted) {
          setInsights(data);
          setError(null);
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

    loadInsights();

    return () => {
      isMounted = false;
    };
  }, []);

  const getInsightBySlug = useCallback((slug: string) => {
    return insights.find(i => i.slug === slug);
  }, [insights]);

  return { insights, loading, error, getInsightBySlug };
};
