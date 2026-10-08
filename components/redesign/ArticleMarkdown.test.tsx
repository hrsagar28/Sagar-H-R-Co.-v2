import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ArticleMarkdown from './ArticleMarkdown';

describe('ArticleMarkdown', () => {
  it('renders the summary box heading as a paragraph, not an h3 (Audit A11Y-05)', () => {
    const { container } = render(<ArticleMarkdown>{':::summary\n### In short\n\n- One point\n:::'}</ArticleMarkdown>);

    expect(container.querySelector('h3')).toBeNull();
    const heading = container.querySelector('.asum > p.asum-h');
    expect(heading).toHaveTextContent('In short');
    expect(container.querySelector('.asum li')).toHaveTextContent('One point');
  });
});
