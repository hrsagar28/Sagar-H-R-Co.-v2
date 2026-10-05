import { slugifyHeading } from './markdownHeadings';

export interface ArticleSection {
  id: string;
  title: string;
  body: string;
}

export interface ArticleParts {
  /** Everything before the first "## " heading: the opening and the summary box. */
  lead: string;
  sections: ArticleSection[];
  /** The italic small print after a closing "---", if the article ends with one. */
  note: string;
}

/**
 * Splits an Insights article (markdown) into the parts the document layout
 * shows: the opening, one section per "## " heading (the contents list), and
 * the closing small print. Section ids are the heading slugs, so links to
 * /insights/<slug>#<heading> keep working.
 */
export const splitArticle = (markdown: string): ArticleParts => {
  let text = markdown.replace(/\r\n/g, '\n').trim();

  let note = '';
  const rule = text.lastIndexOf('\n---\n');
  if (rule !== -1) {
    const tail = text.slice(rule + 5).trim();
    if (/^_[\s\S]+_$/.test(tail) && !tail.includes('\n## ')) {
      note = tail.slice(1, -1).trim();
      text = text.slice(0, rule).trim();
    }
  }

  const pieces = text.split(/^## +(.+)$/m);
  const lead = (pieces[0] ?? '').trim();
  const seen = new Map<string, number>();
  const sections: ArticleSection[] = [];
  for (let index = 1; index < pieces.length; index += 2) {
    const title = (pieces[index] ?? '').replace(/[*_`[\]]/g, '').trim();
    const base = slugifyHeading(title) || 'section';
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    sections.push({
      id: count ? `${base}-${count + 1}` : base,
      title,
      body: (pieces[index + 1] ?? '').trim(),
    });
  }

  return { lead, sections, note };
};
