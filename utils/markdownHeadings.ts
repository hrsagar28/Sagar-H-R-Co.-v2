export interface MarkdownHeading {
  id: string;
  level: 2 | 3;
  text: string;
}

export const slugifyHeading = (value: string) => value
  .toLowerCase()
  .replace(/&amp;/g, 'and')
  .replace(/[^a-z0-9\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-');

export const extractMarkdownHeadings = (content: string): MarkdownHeading[] => {
  const seen = new Map<string, number>();
  const headings: MarkdownHeading[] = [];
  const headingPattern = /^(#{2,3})\s+(.+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = headingPattern.exec(content)) !== null) {
    const level = match[1].length as 2 | 3;
    const text = match[2].replace(/[*_`[\]]/g, '').trim();
    const baseId = slugifyHeading(text);
    const count = seen.get(baseId) || 0;
    seen.set(baseId, count + 1);
    headings.push({ id: count ? `${baseId}-${count + 1}` : baseId, level, text });
  }

  return headings;
};
