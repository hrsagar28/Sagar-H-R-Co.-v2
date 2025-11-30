import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { IMPORTANT_LINKS } from '../../constants';

const ImportantLinksGrid: React.FC = () => {
  return (
    <div className="bg-brand-surface rounded-[2.5rem] p-8 md:p-12 border border-brand-border shadow-sm print:shadow-none print:border-0 print:p-0 animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-3xl font-heading font-bold text-brand-dark">Important Links</h2>
        <p className="text-brand-stone mt-2">Quick access to official government portals and services.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-10">
        {IMPORTANT_LINKS.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-xl font-bold text-brand-dark mb-6 pb-2 border-b border-brand-border/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-moss/10 flex items-center justify-center text-brand-moss">
                <Globe size={18} />
              </div>
              {section.category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.links.map((link, i) => (
                <a 
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-5 rounded-2xl bg-brand-bg border border-brand-border hover:border-brand-moss hover:shadow-lg transition-all flex items-center justify-between gap-4 h-full"
                >
                  <span className="font-bold text-sm text-brand-dark group-hover:text-brand-moss transition-colors line-clamp-2">
                    {link.name}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-brand-stone border border-brand-border group-hover:bg-brand-moss group-hover:text-white group-hover:border-brand-moss transition-all shrink-0">
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