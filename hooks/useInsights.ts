import { useState, useEffect, useCallback } from 'react';
import { InsightItem } from '../types';
import { logger } from '../utils/logger';
import { apiClient, ApiError } from '../utils/api';
import { parseInsights } from '../utils/insightValidation';

let insightsPromise: Promise<InsightItem[]> | null = null;

// Audit NOV-04: the build script renders the pages to text (scripts/
// static-body.tsx), where effects do not run and nothing can be fetched. It
// hands the articles over beforehand; in the browser this stays null and the
// hook fetches as it always has.
let seeded: InsightItem[] | null = null;
export const seedInsights = (items: InsightItem[]) => {
  seeded = items;
};

const getInsightsUrl = () => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  if (typeof window === 'undefined') return `${baseUrl.replace(/\/$/, '')}/data/insights.json`;
  return new URL('data/insights.json', new URL(baseUrl, window.location.origin)).toString();
};

const fetchInsights = () => {
  if (!insightsPromise) {
    insightsPromise = apiClient.get<unknown[]>(getInsightsUrl()).then((data) => {
      try {
        return parseInsights(data);
      } catch (error) {
        throw new ApiError(error instanceof Error ? error.message : 'Invalid insights payload.', 0, 'INVALID_RESPONSE');
      }
    });
  }
  return insightsPromise;
};

export const useInsights = () => {
  const [insights, setInsights] = useState<InsightItem[]>(() => seeded ?? []);
  const [loading, setLoading] = useState(() => seeded === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadInsights = async () => {
      try {
        const data = await fetchInsights();
        if (!controller.signal.aborted) {
          setInsights(data);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          logger.error('Error fetching insights:', err);
          let msg = 'Unable to load insights.';
          if (err instanceof ApiError) {
            if (err.code === 'NETWORK_ERROR') msg = 'Network error. Please check your connection.';
            else if (err.code === 'TIMEOUT') msg = 'Request timed out.';
            else if (err.code === 'INVALID_RESPONSE') msg = 'Insights data is invalid.';
          }
          setError(msg);
          setLoading(false);
        }
      }
    };

    loadInsights();

    return () => {
      controller.abort();
    };
  }, []);

  const getInsightBySlug = useCallback(
    (slug: string) => {
      return insights.find((i) => i.slug === slug);
    },
    [insights],
  );

  return { insights, loading, error, getInsightBySlug };
};
