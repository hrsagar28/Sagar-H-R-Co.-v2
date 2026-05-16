import React from 'react';

interface AccentTitleProps {
  as?: 'h1' | 'h2' | 'h3' | 'div';
  children: React.ReactNode;
  className?: string;
  accentClassName?: string;
  balance?: boolean;
  style?: React.CSSProperties;
}

// Recursively traverse children and clone <em> elements to append classes
function processChildren(children: React.ReactNode, accentClasses: string): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) {
      return child;
    }

    if (child.type === 'em') {
      const emChild = child as React.ReactElement<{ className?: string }>;
      const existingClass = emChild.props.className || '';
      // Default classes for <em> within AccentTitle
      return React.cloneElement(emChild, {
        className: `font-serif italic font-normal ${accentClasses} ${existingClass}`.trim(),
      });
    }

    const childWithChildren = child as React.ReactElement<{ children?: React.ReactNode }>;
    if (childWithChildren.props.children) {
      return React.cloneElement(childWithChildren, {
        children: processChildren(childWithChildren.props.children, accentClasses),
      });
    }

    return child;
  });
}

export const AccentTitle: React.FC<AccentTitleProps> = ({
  as: As = 'h1',
  children,
  className = '',
  accentClassName = 'text-brand-moss',
  balance = false,
  style,
}) => {
  'use memo';
  const baseClasses = `font-heading font-light tracking-[-0.02em] leading-[1] ${balance ? 'text-balance' : ''}`;

  return (
    <As className={`${baseClasses} ${className}`.trim()} style={style}>
      {processChildren(children, accentClassName)}
    </As>
  );
};
