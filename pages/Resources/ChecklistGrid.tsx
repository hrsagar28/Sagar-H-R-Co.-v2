import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CHECKLIST_DATA } from '../../constants';

const ChecklistGrid: React.FC = () => {
  return (
    <div className="rounded-[2.5rem] border border-brand-border bg-brand-surface p-8 shadow-sm md:p-12 print:border-0 print:p-0 print:shadow-none">
      <div className="mb-8">
        <h2 className="font-heading text-3xl font-bold text-brand-dark">Document Checklists</h2>
        <p className="mt-2 text-brand-stone">Download or print requirements for various services.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Object.entries(CHECKLIST_DATA).map(([key, data]) => (
          <Link
            to={`/resources/checklist/${key}`}
            key={key}
            className="group flex items-center justify-between rounded-2xl border border-brand-border bg-brand-bg p-6 transition-[border-color,box-shadow] hover:border-brand-moss hover:shadow-lg print:border-gray-300 print:bg-white"
          >
            <div>
              <h3 className="font-bold text-brand-dark transition-colors group-hover:text-brand-moss">{data.title}</h3>
              <p className="mt-1 line-clamp-1 text-xs text-brand-stone">{data.subtitle}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-stone transition-colors group-hover:bg-brand-moss group-hover:text-white print:hidden">
              <ArrowRight size={18} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChecklistGrid;
