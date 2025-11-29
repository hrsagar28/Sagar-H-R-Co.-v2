
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`article-wrapper ${className}`}>
      <ReactMarkdown
        components={{
          // H1 is usually handled by the page header, but mapped here just in case
          h1: ({ node, ...props }) => (
            <h1 className="font-heading font-extrabold text-4xl md:text-5xl mt-10 mb-6 text-brand-dark tracking-tight leading-tight" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="font-heading font-extrabold text-3xl mt-14 mb-6 text-brand-dark tracking-tight leading-tight relative pl-4 before:content-[''] before:absolute before:left-0 before:top-[0.25em] before:bottom-[0.25em] before:w-1 before:bg-brand-moss before:rounded-full" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="font-heading font-bold text-xl mt-10 mb-4 text-brand-dark" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-7 font-normal text-brand-stone text-lg leading-relaxed" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-none pl-0 mb-10 grid gap-4" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-6 mb-10 space-y-2 text-brand-stone font-medium" {...props} />
          ),
          li: ({ node, ...props }) => {
            // Check parent to determine style (ul vs ol)
            const isOrdered = node?.parent?.type === 'element' && node.parent.tagName === 'ol';
            if (isOrdered) {
               return <li className="pl-2" {...props} />;
            }
            return (
              <li className="relative pl-8 text-lg text-brand-dark font-medium before:content-['→'] before:absolute before:left-0 before:top-0 before:text-brand-moss before:font-black" {...props} />
            );
          },
          strong: ({ node, ...props }) => (
            <strong className="text-brand-dark font-bold" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-brand-moss border-b-2 border-brand-moss/20 hover:bg-brand-moss/10 hover:border-brand-moss transition-all font-semibold decoration-0" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-brand-moss pl-6 py-2 my-8 italic text-brand-stone text-xl bg-brand-bg/50 rounded-r-xl" {...props} />
          ),
          code: ({ node, ...props }) => (
            <code className="bg-brand-surface-dark text-gray-200 px-2 py-1 rounded text-sm font-mono" {...props} />
          ),
          pre: ({ node, ...props }) => (
            <pre className="bg-brand-surface-dark text-gray-200 p-6 rounded-2xl overflow-x-auto mb-8 text-sm font-mono shadow-inner" {...props} />
          ),
          // Special handling for the summary card if encoded in HTML within markdown or custom syntax
          div: ({ node, className, ...props }) => {
            if (className === 'summary-card') {
                return (
                    <div className="bg-brand-bg/60 backdrop-blur-md border border-brand-border border-l-[6px] border-l-brand-moss p-8 rounded-r-3xl my-14 shadow-lg relative overflow-hidden group" {...props}>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle,rgba(26,77,46,0.1)_0%,transparent_70%)] pointer-events-none"></div>
                        {props.children}
                    </div>
                )
            }
            return <div className={className} {...props} />
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
