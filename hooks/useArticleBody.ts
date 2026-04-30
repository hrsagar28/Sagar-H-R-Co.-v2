import { useCallback, useEffect, useState } from 'react';
import { logger } from '../utils/logger';

const getArticleBodyUrl = (slug: string) => {
  const baseUrl = (import.meta as any)?.env?.BASE_URL || '/';
  const path = `content/insights/${slug}.md`;
  if (typeof window === 'undefined') return `${baseUrl.replace(/\/$/, '')}/${path}`;
  return new URL(path, new URL(baseUrl, window.location.origin)).toString();
};

const isSafeInsightSlug = (slug: string) => /^[a-z0-9-]+$/i.test(slug);
const articleBodyCache = new Map<string, string>();

export const useArticleBody = (slug?: string, enabled = true) => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    if (!slug || !enabled) {
      setContent(null);
      setLoading(false);
      setError(false);
      return;
    }

    if (!isSafeInsightSlug(slug)) {
      logger.error('Rejected unsafe insight slug', { slug });
      setContent(null);
      setLoading(false);
      setError(true);
      return;
    }

    const controller = new AbortController();
    const cachedContent = articleBodyCache.get(slug);
    if (cachedContent && reloadKey === 0) {
      setContent(cachedContent);
      setLoading(false);
      setError(false);
      return;
    }

    setContent(cachedContent || null);
    setLoading(true);
    setError(false);

    fetch(getArticleBodyUrl(slug), { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Article body returned ${res.status}`);
        return res.text();
      })
      .then((text) => {
        if (!controller.signal.aborted) {
          articleBodyCache.set(slug, text);
          setContent(text);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        logger.error('Failed to load article body', { slug, error: err });
        setError(true);
        setLoading(false);
      });

    return () => controller.abort();
  }, [slug, enabled, reloadKey]);

  return { content, loading, error, refetch };
};
