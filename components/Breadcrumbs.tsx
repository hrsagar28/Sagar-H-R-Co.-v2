
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-sm font-medium ${className}`}>
      <ol className="flex items-center flex-wrap gap-2">
        <li>
          <Link 
            to="/" 
            className="flex items-center gap-1 text-zone-text-muted hover:text-zone-accent transition-colors"
            title="Home"
          >
            <Home size={14} aria-hidden="true" focusable="false" />
          </Link>
        </li>
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight size={14} className="text-zone-text-muted/50" aria-hidden="true" focusable="false" />
              {item.path && !isLast ? (
                <Link 
                  to={item.path}
                  className="text-zone-text-muted hover:text-zone-accent transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-zone-text font-bold whitespace-nowrap" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
