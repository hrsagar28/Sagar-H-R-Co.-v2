
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CHECKLIST_DATA } from '../../constants';

const { Link } = ReactRouterDOM;

const ChecklistGrid: React.FC = () => {
  return (
    <div className="bg-brand-surface rounded-[2.5rem] p-8 md:p-12 border border-brand-border shadow-sm print:shadow-none print:border-0 print:p-0 animate-fade-in-up">
        <div className="mb-8">
            <h2 className="text-3xl font-heading font-bold text-brand-dark">Document Checklists</h2>
            <p className="text-brand-stone mt-2">Download or print requirements for various services.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(CHECKLIST_DATA).map(([key, data]) => (
                <Link to={`/resources/checklist/${key}`} key={key} className="group p-6 rounded-2xl bg-brand-bg border border-brand-border hover:border-brand-moss hover:shadow-lg transition-all flex justify-between items-center print:border-gray-300 print:bg-white">
                    <div>
                    <h3 className="font-bold text-brand-dark group-hover:text-brand-moss transition-colors">{data.title}</h3>
                    <p className="text-xs text-brand-stone mt-1 line-clamp-1">{data.subtitle}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-stone group-hover:bg-brand-moss group-hover:text-white transition-all print:hidden">
                    <ArrowRight size={18} />
                    </div>
                </Link>
            ))}
        </div>
    </div>
  );
};

export default ChecklistGrid;