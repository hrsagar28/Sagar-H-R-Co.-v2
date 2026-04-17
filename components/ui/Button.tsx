import React from 'react';

type ButtonVariant = 'solid' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'solid', size = 'md', asChild = false, children, ...props }, ref) => {
    
    let variantStyles = '';
    switch(variant) {
      case 'solid':
        variantStyles = 'bg-brand-moss text-white hover:bg-[#0f2e1b]';
        break;
      case 'outline':
        variantStyles = 'border border-brand-moss text-brand-moss hover:bg-brand-moss/10';
        break;
      case 'ghost':
        variantStyles = 'text-brand-moss hover:underline underline-offset-4';
        break;
    }
    
    let sizeStyles = '';
    switch(size) {
      case 'sm':
        sizeStyles = 'px-3 py-1.5 text-sm';
        break;
      case 'md':
        sizeStyles = 'px-4 py-2 text-base';
        break;
      case 'lg':
        sizeStyles = 'px-6 py-3 text-base';
        break;
    }
    
    const baseStyles = 'rounded-full font-heading font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-moss focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';
    
    const combinedClassName = `${baseStyles} ${sizeStyles} ${variantStyles} ${className}`.trim();
    
    if (asChild) {
      if (React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
          className: `${combinedClassName} ${children.props.className || ''}`.replace(/\s+/g, ' ').trim(),
          ...props,
        });
      }
      return null;
    }
    
    return (
      <button ref={ref} className={combinedClassName} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
