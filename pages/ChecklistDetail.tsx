import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CHECKLIST_DATA } from '../constants';
import { ArrowLeft, Printer, CheckSquare } from 'lucide-react';

const ChecklistDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const checklist = slug ? CHECKLIST_DATA[slug] : null;

  useEffect(() => {
    if (!checklist) {
      navigate('/resources');
    }
    window.scrollTo(0, 0);
  }, [slug, checklist, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (!checklist) return null;

  return (
    <div className="pt-32 md:pt-40 pb-20 px-4 md:px-6 bg-brand-bg min-h-screen">
      <div className="container mx-auto max-w-4xl">
        
        <div className="flex justify-between items-center mb-12 print:hidden">
          <Link to="/resources" className="inline-flex items-center gap-2 text-brand-stone hover:text-brand-dark font-bold text-sm uppercase tracking-wider transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Resources
          </Link>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-brand-moss text-white rounded-full font-bold hover:bg-brand-dark transition-colors shadow-md"
          >
            <Printer size={16} /> Print Checklist
          </button>
        </div>

        <div className="bg-white p-12 md:p-16 rounded-[2rem] border border-brand-border shadow-xl print:shadow-none print:border-0 print:p-0">
          {/* Print Header */}
          <div className="text-center border-b-2 border-brand-bg pb-8 mb-10">
             <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-dark mb-4">{checklist.title}</h1>
             <p className="text-brand-stone font-medium text-lg">{checklist.subtitle}</p>
          </div>

          <div className="space-y-10">
             {checklist.sections.map((section, idx) => (
               <div key={idx} className="break-inside-avoid">
                 <h3 className="text-xl font-heading font-bold text-brand-dark mb-6 pb-2 border-b border-brand-border/50">
                   {section.title}
                 </h3>
                 <ul className="space-y-4">
                   {section.items.map((item, i) => (
                     <li key={i} className="flex items-start gap-4">
                       <div className="mt-1 text-brand-moss shrink-0">
                         <CheckSquare size={20} className="print:hidden" />
                         <span className="hidden print:inline-block w-5 h-5 border border-gray-400 mr-2"></span>
                       </div>
                       <span className="text-brand-stone font-medium text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: item }}></span>
                     </li>
                   ))}
                 </ul>
               </div>
             ))}
          </div>

          <div className="mt-16 pt-8 border-t border-brand-border text-center text-brand-stone text-sm font-bold uppercase tracking-widest">
             Sagar H R & Co. • Chartered Accountants • Mysuru
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChecklistDetail;
