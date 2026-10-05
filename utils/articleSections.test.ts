import { describe, expect, it } from 'vitest';
import { splitArticle } from './articleSections';

const ARTICLE = `Opening paragraph.

:::summary

### Key Takeaways

- One point.
  :::

## The **headline** change

Body of the first section.

### A sub-heading

More text.

## What does _not_ change

- A list.

---

_This article is for general information only._`;

describe('splitArticle', () => {
  it('splits the opening, one section per "## " heading, and the closing small print', () => {
    const { lead, sections, note } = splitArticle(ARTICLE);

    expect(lead).toContain('Opening paragraph.');
    expect(lead).toContain(':::summary');
    expect(sections.map((section) => [section.id, section.title])).toEqual([
      ['the-headline-change', 'The headline change'],
      ['what-does-not-change', 'What does not change'],
    ]);
    expect(sections[0]?.body).toContain('### A sub-heading');
    expect(sections[1]?.body).toBe('- A list.');
    expect(note).toBe('This article is for general information only.');
  });

  it('keeps a rule that is not followed by small print, and numbers repeated headings', () => {
    const { sections, note } = splitArticle('## Notes\n\nOne\n\n---\n\nTwo\n\n## Notes\n\nThree');

    expect(note).toBe('');
    expect(sections.map((section) => section.id)).toEqual(['notes', 'notes-2']);
    expect(sections[0]?.body).toContain('---');
  });
});
