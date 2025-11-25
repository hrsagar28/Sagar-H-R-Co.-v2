import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CHECKLIST_DATA } from '../constants';
import { Printer, CheckSquare } from 'lucide-react';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';

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
    <div className="pt-32 md:pt-40 pb-20 px-4 md:px-6 bg-brand-bg min-h-screen print:pt-0 print:pb-0 print:bg-white print:h-auto">
      <SEO 
        title={`${checklist.title} | Resources`}
        description={`Download and view the checklist for ${checklist.title}. ${checklist.subtitle}`}
      />

      <div className="container mx-auto max-w-4xl print:max-w-full print:p-0">
        
        <div className="flex justify-between items-center mb-12 print:hidden flex-wrap gap-4">
          <Breadcrumbs 
            items={[
              { label: 'Resources', path: '/resources' },
              { label: 'Checklists' }
            ]} 
          />
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-brand-moss text-white rounded-full font-bold hover:bg-brand-dark transition-colors shadow-md"
          >
            <Printer size={16} /> Print Checklist
          </button>
        </div>

        <div className="bg-white p-12 md:p-16 rounded-[2rem] border border-brand-border shadow-xl print:shadow-none print:border-0 print:p-0 print:rounded-none">
          {/* Print Header */}
          <div className="text-center border-b-2 border-brand-bg pb-8 mb-10 print:border-black print:mb-6 print:pb-4">
             <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-dark mb-4 print:text-2xl print:mb-2">{checklist.title}</h1>
             <p className="text-brand-stone font-medium text-lg print:text-black print:text-sm">{checklist.subtitle}</p>
          </div>

          <div className="space-y-10 print:space-y-6">
             {checklist.sections.map((section, idx) => (
               <div key={idx} className="break-inside-avoid">
                 <h3 className="text-xl font-heading font-bold text-brand-dark mb-6 pb-2 border-b border-brand-border/50 print:text-lg print:mb-3 print:border-black print:pb-1">
                   {section.title}
                 </h3>
                 <ul className="space-y-4 print:space-y-2">
                   {section.items.map((item, i) => (
                     <li key={i} className="flex items-start gap-4 print:gap-2">
                       <div className="mt-1 text-brand-moss shrink-0 print:text-black">
                         <CheckSquare size={20} className="print:hidden" />
                         <span className="hidden print:inline-block w-4 h-4 border-2 border-black mr-2"></span>
                       </div>
                       <span className="text-brand-stone font-medium text-lg leading-relaxed print:text-black print:text-base" dangerouslySetInnerHTML={{ __html: item }}></span>
                     </li>
                   ))}
                 </ul>
               </div>
             ))}
          </div>

          <div className="mt-16 pt-8 border-t border-brand-border text-center text-brand-stone text-sm font-bold uppercase tracking-widest print:mt-8 print:pt-4 print:border-black print:text-black">
             Sagar H R & Co. • Chartered Accountants • Mysuru
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChecklistDetail;