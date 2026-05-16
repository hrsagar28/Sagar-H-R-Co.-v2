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
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 text-zone-text-muted transition-colors hover:text-zone-accent"
          >
            <Home size={14} aria-hidden="true" focusable="false" />
            <span className="sr-only">Home</span>
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
                  className="whitespace-nowrap text-zone-text-muted transition-colors hover:text-zone-accent"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="whitespace-nowrap font-bold text-zone-text" aria-current="page">
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
