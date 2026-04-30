import { InsightItem } from '../types';

export const isValidInsight = (item: unknown): item is InsightItem => {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;
  const hasRequiredStrings = ['id', 'title', 'category', 'date', 'summary', 'slug', 'author', 'authorId', 'readTime']
    .every((key) => typeof candidate[key] === 'string' && Boolean(candidate[key]));

  if (!hasRequiredStrings) return false;
  if (candidate.tags !== undefined && (!Array.isArray(candidate.tags) || !candidate.tags.every((tag) => typeof tag === 'string' && Boolean(tag)))) return false;
  if (candidate.wordCount !== undefined && (typeof candidate.wordCount !== 'number' || candidate.wordCount < 0)) return false;
  if (candidate.dateModified !== undefined && typeof candidate.dateModified !== 'string') return false;
  return true;
};

export const parseInsights = (data: unknown): InsightItem[] => {
  if (!Array.isArray(data) || !data.every(isValidInsight)) {
    throw new Error('Invalid insights payload.');
  }
  return data;
};
