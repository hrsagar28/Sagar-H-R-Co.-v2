import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { IMPORTANT_LINKS } from '../../constants';

const ImportantLinksGrid: React.FC = () => {
  return (
    <div className="rounded-[2.5rem] border border-brand-border bg-brand-surface p-8 shadow-sm md:p-12 print:border-0 print:p-0 print:shadow-none">
      <div className="mb-8">
        <h2 className="font-heading text-3xl font-bold text-brand-dark">Important Links</h2>
        <p className="mt-2 text-brand-stone">Quick access to official government portals and services.</p>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {IMPORTANT_LINKS.map((section, idx) => (
          <div key={idx}>
            <h3 className="mb-6 flex items-center gap-3 border-b border-brand-border/50 pb-2 text-xl font-bold text-brand-dark">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-moss/10 text-brand-moss">
                <Globe size={18} />
              </div>
              {section.category}
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {section.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${link.name} (opens in new window)`}
                  className="group flex h-full items-center justify-between gap-4 rounded-2xl border border-brand-border bg-brand-bg p-5 transition-[border-color,box-shadow] hover:border-brand-moss hover:shadow-lg"
                >
                  <span className="line-clamp-2 text-sm font-bold text-brand-dark transition-colors group-hover:text-brand-moss">
                    {link.name}
                  </span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-border bg-white text-brand-stone transition-colors group-hover:border-brand-moss group-hover:bg-brand-moss group-hover:text-white">
                    <ExternalLink size={14} />
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImportantLinksGrid;
