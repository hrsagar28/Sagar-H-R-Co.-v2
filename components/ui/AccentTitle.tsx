import React from 'react';

interface AccentTitleProps {
  as?: 'h1' | 'h2' | 'h3';
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
      const existingClass = child.props.className || '';
      // Default classes for <em> within AccentTitle
      return React.cloneElement(child as React.ReactElement<any>, {
        className: `font-serif italic font-normal ${accentClasses} ${existingClass}`.trim()
      });
    }
    
    if (child.props.children) {
      return React.cloneElement(child as React.ReactElement<any>, {
        children: processChildren(child.props.children, accentClasses)
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
  style
}) => {
  const baseClasses = `font-heading font-light tracking-[-0.02em] leading-[1] ${balance ? 'text-balance' : ''}`;
  
  return (
    <As className={`${baseClasses} ${className}`.trim()} style={style}>
      {processChildren(children, accentClassName)}
    </As>
  );
};
