import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { visit } from 'unist-util-visit';
import { Check, Copy } from 'lucide-react';
import { SITE_URL } from '../config/site';
import { slugifyHeading } from '../utils/markdownHeadings';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const getNodeText = (children: React.ReactNode): string => React.Children.toArray(children)
  .map((child) => {
    if (typeof child === 'string' || typeof child === 'number') return String(child);
    if (React.isValidElement(child)) return getNodeText(child.props.children);
    return '';
  })
  .join('');

const remarkSummaryDirective = () => (tree: any) => {
  visit(tree, 'containerDirective', (node: any) => {
    if (node.name !== 'summary') return;
    node.data = {
      ...(node.data || {}),
      hName: 'div',
      hProperties: { className: 'summary-card' }
    };
  });
};

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    div: [
      ...(defaultSchema.attributes?.div || []),
      ['className', 'summary-card']
    ]
  }
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
    <div className="relative group mb-8 rounded-2xl overflow-hidden shadow-xl">
      <pre className="bg-brand-dark text-white p-6 rounded-2xl overflow-x-auto text-sm font-mono m-0" {...props}>
        {children}
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Code copied' : 'Copy code'}
        className="absolute top-3 right-3 p-2 bg-white/10 border border-white/20 rounded-lg text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-white/20 z-10"
      >
        {copied ? <Check size={16} aria-hidden="true" focusable="false" className="text-green-300" /> : <Copy size={16} aria-hidden="true" focusable="false" />}
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
          h1: ({node, children, ...props}) => <h2 id={getHeadingId(children)} className="font-serif font-bold text-3xl md:text-4xl text-brand-dark mt-16 mb-6 tracking-tight scroll-mt-32" {...props}>{children}</h2>,
          h2: ({node, children, ...props}) => <h2 id={getHeadingId(children)} className="font-serif font-bold text-3xl md:text-4xl text-brand-dark mt-16 mb-6 tracking-tight scroll-mt-32" {...props}>{children}</h2>,
          h3: ({node, children, ...props}) => <h3 id={getHeadingId(children)} className="font-heading font-bold text-xl md:text-2xl text-brand-dark mt-10 mb-4 scroll-mt-32" {...props}>{children}</h3>,
          h4: ({node, children, ...props}) => <h4 id={getHeadingId(children)} className="font-heading font-bold text-lg md:text-xl text-brand-dark mt-8 mb-3 scroll-mt-32" {...props}>{children}</h4>,
          h5: ({node, children, ...props}) => <h5 id={getHeadingId(children)} className="font-heading font-bold text-base md:text-lg text-brand-dark mt-8 mb-3 scroll-mt-32" {...props}>{children}</h5>,
          h6: ({node, children, ...props}) => <h6 id={getHeadingId(children)} className="font-heading font-bold text-sm md:text-base uppercase tracking-widest text-brand-dark mt-8 mb-3 scroll-mt-32" {...props}>{children}</h6>,
          p: ({node, ...props}) => <p className="mb-6 leading-8 text-brand-stone font-normal text-lg md:text-[1.15rem] md:leading-[1.9]" {...props} />,
          a: ({node, href, ...props}) => {
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
                className="text-brand-moss font-bold border-b border-brand-moss/30 hover:border-brand-moss transition-colors no-underline pb-0.5 cursor-pointer"
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer nofollow' : undefined}
                {...props}
              />
            );
          },
          ul: ({node, ...props}) => <ul className="space-y-3 my-8 pl-1" {...props} />,
          ol: ({node, ...props}) => <ol className="space-y-3 my-8 pl-5 list-decimal text-brand-stone font-medium text-lg leading-relaxed" {...props} />,
          li: ({node, ...props}) => <li className="relative pl-8 text-brand-stone font-medium text-lg leading-relaxed" {...props} />,
          code: (props) => {
            const {children, className, node, ...rest} = props;
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !className?.includes('language-');
            return isInline ? (
              <code className="bg-brand-bg text-brand-moss px-1.5 py-0.5 rounded font-mono text-sm" {...rest}>
                {children}
              </code>
            ) : (
              <code className={className} {...rest}>
                {children}
              </code>
            );
          },
          pre: ({node, ...props}) => <CopyablePre {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="relative pl-6 py-2 my-10 text-2xl md:text-3xl text-brand-dark font-serif italic leading-normal border-l-4 border-brand-moss bg-brand-moss/5 rounded-r-xl" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
