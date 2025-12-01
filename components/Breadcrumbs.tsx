
import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const { Link } = ReactRouterDOM;

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  // Construct Schema
  const schemaItems = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://casagar.co.in/"
    },
    ...items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 2,
      "name": item.label,
      "item": item.path ? `https://casagar.co.in${item.path}` : undefined
    }))
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": schemaItems
  };

  useEffect(() => {
    const scriptId = 'json-ld-breadcrumbs';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    
    script.text = JSON.stringify(breadcrumbSchema);

    return () => {
      const s = document.getElementById(scriptId);
      if (s) s.remove();
    };
  }, [items]);

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-sm font-medium ${className}`}>
      <ol className="flex items-center flex-wrap gap-2">
        <li>
          <Link 
            to="/" 
            className="flex items-center gap-1 text-brand-stone hover:text-brand-moss transition-colors"
            title="Home"
          >
            <Home size={14} />
          </Link>
        </li>
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight size={14} className="text-brand-stone/50" />
              {item.path && !isLast ? (
                <Link 
                  to={item.path}
                  className="text-brand-stone hover:text-brand-moss transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-brand-dark font-bold whitespace-nowrap" aria-current="page">
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