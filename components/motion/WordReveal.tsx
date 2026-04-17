import React, { Children, isValidElement } from 'react';
import { m, useReducedMotion, LazyMotion, domAnimation } from 'framer-motion';

export interface WordRevealProps {
  children: React.ReactNode;
  delay?: number;
  stagger?: number;
  className?: string;
}

export function WordReveal({ children, delay = 0.15, stagger = 0.12, className = '' }: WordRevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <span className={className}>{children}</span>;
  }

  const words: React.ReactNode[] = [];

  const extractWords = (node: React.ReactNode) => {
    if (typeof node === 'string') {
      const parts = node.split(/\s+/).filter(Boolean);
      parts.forEach(part => words.push(part));
    } else if (Array.isArray(node)) {
      node.forEach(extractWords);
    } else if (isValidElement(node)) {
      if (node.type === React.Fragment) {
        extractWords(node.props.children);
      } else {
        words.push(node);
      }
    } else if (node !== null && node !== undefined) {
      words.push(String(node));
    }
  };

  extractWords(children);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: '100%' },
    visible: {
      opacity: 1,
      y: '0%',
      transition: { duration: 1.0, ease: [0.23, 1, 0.32, 1] },
    },
  };

  return (
    <LazyMotion features={domAnimation}>
      <m.span
        className={`inline-block ${className}`}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10%' }}
      >
        {words.map((word, idx) => (
          <React.Fragment key={idx}>
            <span className="inline-flex overflow-hidden pb-1 -mb-1 align-bottom">
              <m.span variants={itemVariants} className="inline-block whitespace-nowrap">
                {word}
              </m.span>
            </span>
            {idx < words.length - 1 && ' '}
          </React.Fragment>
        ))}
      </m.span>
    </LazyMotion>
  );
}
