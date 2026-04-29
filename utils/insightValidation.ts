import { InsightItem } from '../types';

export const isValidInsight = (item: unknown): item is InsightItem => {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;
  return ['id', 'title', 'category', 'date', 'summary', 'slug', 'author', 'readTime']
    .every((key) => typeof candidate[key] === 'string' && Boolean(candidate[key]));
};

export const parseInsights = (data: unknown): InsightItem[] => {
  if (!Array.isArray(data) || !data.every(isValidInsight)) {
    throw new Error('Invalid insights payload.');
  }
  return data;
};

