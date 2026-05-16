import { InsightItem } from '../types';

export const isValidInsight = (item: unknown): item is InsightItem => {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;
  const hasRequiredStrings = [
    'id',
    'title',
    'category',
    'date',
    'summary',
    'slug',
    'author',
    'authorId',
    'readTime',
  ].every((key) => typeof candidate[key] === 'string' && Boolean(candidate[key]));

  if (!hasRequiredStrings) return false;
  if (
    candidate.tags !== undefined &&
    (!Array.isArray(candidate.tags) || !candidate.tags.every((tag) => typeof tag === 'string' && Boolean(tag)))
  )
    return false;
  if (candidate.wordCount !== undefined && (typeof candidate.wordCount !== 'number' || candidate.wordCount < 0))
    return false;
  if (candidate.dateModified !== undefined && typeof candidate.dateModified !== 'string') return false;
  // Audit I-04: featuredOnHome is optional; reject only on wrong type.
  if (candidate.featuredOnHome !== undefined && typeof candidate.featuredOnHome !== 'boolean') return false;
  // `featured` (legacy / unrelated) is similarly typed as boolean if present.
  if (candidate.featured !== undefined && typeof candidate.featured !== 'boolean') return false;
  return true;
};

export const parseInsights = (data: unknown): InsightItem[] => {
  if (!Array.isArray(data) || !data.every(isValidInsight)) {
    throw new Error('Invalid insights payload.');
  }
  return data;
};

export const getLeadingH1Warning = (markdown: string, source = 'markdown') => {
  const firstContentLine = markdown
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .find((line) => line.trim().length > 0);

  if (!firstContentLine || !/^#(?!#)\s+/.test(firstContentLine.trim())) {
    return null;
  }

  return `${source} starts with a level-1 markdown heading. Article pages already render the title as <h1>; start article markdown at ##.`;
};
