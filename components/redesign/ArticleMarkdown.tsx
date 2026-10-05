import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';
import { SITE_URL } from '../../config/site';

// Markdown for the redesigned Insights articles. Plain elements only: the look
// comes from redesign.css (`.lsec`, `.alead`), so this stays free of classes
// except the summary box and the table wrapper.

/** `:::summary … :::` becomes the "Key takeaways" box. */
const remarkSummary = () => (tree: Root) => {
  visit(tree, 'containerDirective', (node) => {
    if (node.name !== 'summary') return;
    node.data = { ...(node.data ?? {}), hName: 'div', hProperties: { className: 'asum' } };
  });
};

const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    div: [...(defaultSchema.attributes?.div ?? []), ['className', 'asum']],
  },
};

const isExternal = (href?: string) => {
  if (!href || !/^https?:\/\//.test(href)) return false;
  try {
    return new URL(href).origin !== new URL(SITE_URL).origin;
  } catch {
    return true;
  }
};

const ArticleMarkdown: React.FC<{ children: string }> = ({ children }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm, remarkDirective, remarkSummary]}
    rehypePlugins={[[rehypeSanitize, schema]]}
    components={{
      // Sections are split on "## ", so a heading inside one is a sub-heading.
      h1: ({ node: _node, children, ...props }) => <h3 {...props}>{children}</h3>,
      h2: ({ node: _node, children, ...props }) => <h3 {...props}>{children}</h3>,
      a: ({ node: _node, href, ...props }) =>
        isExternal(href) ? (
          <a href={href} target="_blank" rel="noopener noreferrer nofollow" {...props} />
        ) : (
          <a href={href} {...props} />
        ),
      // Wide tables scroll sideways on a phone instead of overflowing.
      table: ({ node: _node, ...props }) => (
        <div className="tscroll">
          <table {...props} />
        </div>
      ),
    }}
  >
    {children}
  </ReactMarkdown>
);

export default ArticleMarkdown;
