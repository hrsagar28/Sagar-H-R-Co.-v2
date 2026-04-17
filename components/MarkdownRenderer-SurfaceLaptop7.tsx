import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import DOMPurify from 'dompurify';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [isLegacyHtml, setIsLegacyHtml] = useState(false);

  useEffect(() => {
    if (content && content.trim().startsWith('<')) {
      console.warn('Legacy HTML content detected. Please migrate this content to markdown.');
      setIsLegacyHtml(true);
    } else {
      setIsLegacyHtml(false);
    }
  }, [content]);

  if (!content) return null;

  if (isLegacyHtml) {
    return (
      <div 
        className={`article-wrapper ${className}`}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
      />
    );
  }

  return (
    <div className={`article-wrapper ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeSanitize]}
        components={{
          h1: ({node, ...props}) => <h1 className="font-serif font-medium text-4xl md:text-5xl text-brand-dark mt-12 mb-6" {...props} />,
          h2: ({node, ...props}) => <h2 className="font-serif font-bold text-3xl md:text-4xl text-brand-dark mt-16 mb-6 tracking-tight" {...props} />,
          h3: ({node, ...props}) => <h3 className="font-heading font-bold text-xl md:text-2xl text-brand-dark mt-10 mb-4" {...props} />,
          p: ({node, ...props}) => <p className="mb-6 leading-8 text-brand-stone font-normal text-lg md:text-[1.15rem] md:leading-[1.9]" {...props} />,
          a: ({node, ...props}) => <a className="text-brand-moss font-bold border-b border-brand-moss/30 hover:border-brand-moss transition-colors decoration-0 pb-0.5 pointer" {...props} />,
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
          pre: ({node, ...props}) => <pre className="bg-brand-dark text-white p-6 rounded-2xl overflow-x-auto text-sm font-mono mb-8 shadow-xl" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="relative pl-8 py-2 my-10 text-2xl md:text-3xl text-brand-dark font-serif italic leading-normal border-l-4 border-brand-moss bg-brand-moss/5 rounded-r-xl" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
