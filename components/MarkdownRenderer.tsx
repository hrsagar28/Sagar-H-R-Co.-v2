import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { visit } from 'unist-util-visit';
import { Check, Copy } from 'lucide-react';
import { SITE_URL } from '../config/site';
import { slugifyHeading } from '../utils/markdownHeadings';
import './MarkdownRenderer.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const getNodeText = (children: React.ReactNode): string =>
  React.Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') return String(child);
      if (React.isValidElement<{ children?: React.ReactNode }>(child)) return getNodeText(child.props.children);
      return '';
    })
    .join('');

const remarkSummaryDirective = () => (tree: any) => {
  visit(tree, 'containerDirective', (node: any) => {
    if (node.name !== 'summary') return;
    node.data = {
      ...(node.data || {}),
      hName: 'div',
      hProperties: { className: 'summary-card' },
    };
  });
};

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    div: [...(defaultSchema.attributes?.div || []), ['className', 'summary-card']],
  },
};

const CopyablePre: React.FC<React.HTMLAttributes<HTMLPreElement>> = ({ children, ...props }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="group relative mb-8 overflow-hidden rounded-2xl shadow-xl">
      <pre className="m-0 overflow-x-auto rounded-2xl bg-brand-dark p-6 font-mono text-sm text-white" {...props}>
        {children}
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Code copied' : 'Copy code'}
        className="absolute right-3 top-3 z-10 rounded-lg border border-white/20 bg-white/10 p-2 text-white opacity-100 transition-opacity hover:bg-white/20 focus:opacity-100 md:opacity-0 md:group-hover:opacity-100"
      >
        {copied ? (
          <Check size={16} aria-hidden="true" focusable="false" className="text-green-300" />
        ) : (
          <Copy size={16} aria-hidden="true" focusable="false" />
        )}
      </button>
    </div>
  );
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const headingCounts = new Map<string, number>();

  const getHeadingId = (children: React.ReactNode) => {
    const baseId = slugifyHeading(getNodeText(children));
    const count = headingCounts.get(baseId) || 0;
    headingCounts.set(baseId, count + 1);
    return count ? `${baseId}-${count + 1}` : baseId;
  };

  if (!content) return null;

  return (
    <div className={`article-wrapper ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkDirective, remarkSummaryDirective]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
        components={{
          h1: ({ node, children, ...props }) => (
            <h2
              role="heading"
              aria-level={2}
              id={getHeadingId(children)}
              className="mb-6 mt-16 scroll-mt-32 font-serif text-3xl font-bold tracking-tight text-brand-dark md:text-4xl"
              {...props}
            >
              {children}
            </h2>
          ),
          h2: ({ node, children, ...props }) => (
            <h2
              id={getHeadingId(children)}
              className="mb-6 mt-16 scroll-mt-32 font-serif text-3xl font-bold tracking-tight text-brand-dark md:text-4xl"
              {...props}
            >
              {children}
            </h2>
          ),
          h3: ({ node, children, ...props }) => (
            <h3
              id={getHeadingId(children)}
              className="mb-4 mt-10 scroll-mt-32 font-heading text-xl font-bold text-brand-dark md:text-2xl"
              {...props}
            >
              {children}
            </h3>
          ),
          h4: ({ node, children, ...props }) => (
            <h4
              id={getHeadingId(children)}
              className="mb-3 mt-8 scroll-mt-32 font-heading text-lg font-bold text-brand-dark md:text-xl"
              {...props}
            >
              {children}
            </h4>
          ),
          h5: ({ node, children, ...props }) => (
            <h5
              id={getHeadingId(children)}
              className="mb-3 mt-8 scroll-mt-32 font-heading text-base font-bold text-brand-dark md:text-lg"
              {...props}
            >
              {children}
            </h5>
          ),
          h6: ({ node, children, ...props }) => (
            <h6
              id={getHeadingId(children)}
              className="mb-3 mt-8 scroll-mt-32 font-heading text-sm font-bold uppercase tracking-widest text-brand-dark md:text-base"
              {...props}
            >
              {children}
            </h6>
          ),
          p: ({ node, ...props }) => (
            <p
              className="mb-6 text-lg font-normal leading-8 text-brand-stone md:text-[1.15rem] md:leading-[1.9]"
              {...props}
            />
          ),
          a: ({ node, href, ...props }) => {
            const isHttp = Boolean(href?.startsWith('http://') || href?.startsWith('https://'));
            const isExternal = (() => {
              if (!isHttp || !href) return false;
              try {
                return new URL(href, SITE_URL).origin !== new URL(SITE_URL).origin;
              } catch {
                return true;
              }
            })();
            return (
              <a
                href={href}
                className="cursor-pointer border-b border-brand-moss/30 pb-0.5 font-bold text-brand-moss no-underline transition-colors hover:border-brand-moss"
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer nofollow' : undefined}
                {...props}
              />
            );
          },
          ul: ({ node, ...props }) => <ul className="my-8 space-y-3 pl-1" {...props} />,
          ol: ({ node, ...props }) => (
            <ol
              className="my-8 list-decimal space-y-3 pl-5 text-lg font-medium leading-relaxed text-brand-stone"
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li className="relative pl-8 text-lg font-medium leading-relaxed text-brand-stone" {...props} />
          ),
          code: (props) => {
            const { children, className, node, ...rest } = props;
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !className?.includes('language-');
            return isInline ? (
              <code className="rounded bg-brand-bg px-1.5 py-0.5 font-mono text-sm text-brand-moss" {...rest}>
                {children}
              </code>
            ) : (
              <code className={className} {...rest}>
                {children}
              </code>
            );
          },
          pre: ({ node, ...props }) => <CopyablePre {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="relative my-10 rounded-r-xl border-l-4 border-brand-moss bg-brand-moss/5 py-2 pl-6 font-serif text-2xl italic leading-normal text-brand-dark md:text-3xl"
              {...props}
            />
          ),
          // GFM tables (e.g. the 1961→2025 section map). Wrap so wide tables
          // scroll horizontally on narrow screens instead of overflowing.
          table: ({ node, children, ...props }) => (
            <div className="table-scroll">
              <table {...props}>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
