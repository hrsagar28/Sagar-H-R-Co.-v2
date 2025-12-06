
import React from 'react';
import { sanitizeHTML } from '../utils/sanitize';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  return (
    <div 
      className={`article-wrapper ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }}
    />
  );
};

export default MarkdownRenderer;
