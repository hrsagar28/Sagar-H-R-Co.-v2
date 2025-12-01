
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CHECKLIST_DATA, CONTACT_INFO } from '../constants';
import { Printer, CheckSquare, RotateCcw, Copy, Check, Download } from 'lucide-react';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import ReactMarkdown from 'react-markdown';
import useLocalStorage from '../hooks/useLocalStorage';
import { useToast } from '../hooks/useToast';

const ChecklistDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const checklist = slug ? CHECKLIST_DATA[slug] : null;
  const { addToast } = useToast();

  // Storage key specific to this checklist
  const storageKey = `checklist_progress_${slug}`;
  const [checkedItems, setCheckedItems] = useLocalStorage<Record<string, boolean>>(storageKey, {});
  const [justCopied, setJustCopied] = useState(false);

  useEffect(() => {
    if (!checklist) {
      navigate('/resources');
    }
    window.scrollTo(0, 0);
  }, [slug, checklist, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (confirm("Reset all progress for this checklist?")) {
        setCheckedItems({});
        addToast("Progress reset.", "info");
    }
  };

  const handleCopy = () => {
    if (!checklist) return;
    
    let text = `${checklist.title}\n${checklist.subtitle}\n\n`;
    checklist.sections.forEach(section => {
        text += `\n--- ${section.title} ---\n`;
        section.items.forEach((item, idx) => {
            const key = `${section.title}-${idx}`;
            const isChecked = checkedItems[key] ? '[x]' : '[ ]';
            // Simple markdown striper
            const cleanItem = item.replace(/\*\*/g, '');
            text += `${isChecked} ${cleanItem}\n`;
        });
    });

    navigator.clipboard.writeText(text);
    setJustCopied(true);
    addToast("Checklist copied to clipboard", "success");
    setTimeout(() => setJustCopied(false), 2000);
  };

  const toggleItem = (sectionTitle: string, index: number) => {
      const key = `${sectionTitle}-${index}`;
      setCheckedItems(prev => ({
          ...prev,
          [key]: !prev[key]
      }));
  };

  // Calculate Progress
  const progress = useMemo(() => {
      if (!checklist) return 0;
      let total = 0;
      let completed = 0;
      checklist.sections.forEach(s => {
          s.items.forEach((_, i) => {
              total++;
              if (checkedItems[`${s.title}-${i}`]) completed++;
          });
      });
      return total === 0 ? 0 : Math.round((completed / total) * 100);
  }, [checklist, checkedItems]);

  if (!checklist) return null;

  return (
    <div className="pt-32 md:pt-40 pb-20 px-4 md:px-6 bg-brand-bg min-h-screen print:pt-0 print:pb-0 print:bg-white print:h-auto">
      <SEO 
        title={`${checklist.title} | Resources`}
        description={`Download and view the checklist for ${checklist.title}. ${checklist.subtitle}`}
      />

      <div className="container mx-auto max-w-4xl print:max-w-full print:p-0">
        
        <div className="flex justify-between items-center mb-8 print:hidden flex-wrap gap-4">
          <Breadcrumbs 
            items={[
              { label: 'Resources', path: '/resources' },
              { label: 'Checklists' }
            ]} 
          />
          
          <div className="flex gap-2">
             <button 
                onClick={handleCopy}
                className="p-2.5 bg-white border border-brand-border text-brand-dark rounded-full hover:bg-brand-bg transition-colors"
                title="Copy to Clipboard"
             >
                {justCopied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
             </button>
             <button 
                onClick={handleReset}
                className="p-2.5 bg-white border border-brand-border text-brand-dark rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                title="Reset Progress"
             >
                <RotateCcw size={18} />
             </button>
             <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-moss text-white rounded-full font-bold hover:bg-brand-dark transition-colors shadow-md text-sm"
             >
                <Printer size={16} /> Print / PDF
             </button>
          </div>
        </div>

        {/* Progress Bar (Hidden in Print) */}
        <div className="mb-8 print:hidden">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-brand-stone mb-2">
                <span>Progress</span>
                <span>{progress}% Completed</span>
            </div>
            <div className="h-2 w-full bg-brand-border rounded-full overflow-hidden">
                <div 
                    className="h-full bg-brand-moss transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>

        <div className="bg-white p-12 md:p-16 rounded-[2rem] border border-brand-border shadow-xl print:shadow-none print:border-0 print:p-0 print:rounded-none">
          
          {/* Print Only Header (Letterhead Style) */}
          <div className="hidden print:flex flex-col items-center mb-8 border-b-2 border-black pb-4 text-center">
             <h1 className="text-3xl font-serif font-bold uppercase tracking-widest text-black mb-1">{CONTACT_INFO.name}</h1>
             <p className="text-sm font-bold uppercase tracking-wider text-black mb-2">Chartered Accountants</p>
             <p className="text-xs text-black">
                {CONTACT_INFO.address.city} | {CONTACT_INFO.phone.display} | {CONTACT_INFO.email}
             </p>
          </div>

          {/* Checklist Header */}
          <div className="text-center border-b-2 border-brand-bg pb-8 mb-10 print:border-black print:mb-6 print:pb-4">
             <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-dark mb-4 print:text-2xl print:mb-2 print:text-black">{checklist.title}</h1>
             <p className="text-brand-stone font-medium text-lg print:text-black print:text-sm">{checklist.subtitle}</p>
          </div>

          <div className="space-y-10 print:space-y-6">
             {checklist.sections.map((section, idx) => (
               <div key={idx} className="break-inside-avoid">
                 <h3 className="text-xl font-heading font-bold text-brand-dark mb-6 pb-2 border-b border-brand-border/50 print:text-lg print:mb-3 print:border-black print:pb-1 print:text-black">
                   {section.title}
                 </h3>
                 <ul className="space-y-4 print:space-y-2">
                   {section.items.map((item, i) => {
                     const key = `${section.title}-${i}`;
                     const isChecked = !!checkedItems[key];
                     
                     return (
                     <li key={i} className={`flex items-start gap-4 p-3 rounded-xl transition-colors print:p-0 print:gap-2 ${isChecked ? 'bg-brand-moss/5 print:bg-transparent' : 'hover:bg-brand-bg print:hover:bg-transparent'}`}>
                       <div className="mt-1 shrink-0 cursor-pointer print:cursor-default" onClick={() => toggleItem(section.title, i)}>
                         {/* Interactive Checkbox for Web */}
                         <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all print:hidden ${isChecked ? 'bg-brand-moss border-brand-moss text-white' : 'border-brand-stone/40 bg-white'}`}>
                            {isChecked && <Check size={14} />}
                         </div>
                         
                         {/* Print Representation */}
                         <div className="hidden print:block w-4 h-4 border border-black">
                            {isChecked && <span className="block text-center -mt-1 font-bold">✓</span>}
                         </div>
                       </div>
                       
                       <div 
                         className={`text-brand-stone font-medium text-lg leading-relaxed print:text-black print:text-base cursor-pointer select-none print:select-auto flex-grow ${isChecked ? 'line-through opacity-70 print:no-underline print:opacity-100' : ''}`}
                         onClick={() => toggleItem(section.title, i)}
                        >
                         <ReactMarkdown
                            components={{
                                p: ({node, ...props}) => <span {...props} />,
                                strong: ({node, ...props}) => <strong className="font-bold text-brand-dark print:text-black" {...props} />
                            }}
                         >
                            {item}
                         </ReactMarkdown>
                       </div>
                     </li>
                   )})}
                 </ul>
               </div>
             ))}
          </div>

          <div className="mt-16 pt-8 border-t border-brand-border text-center text-brand-stone text-sm font-bold uppercase tracking-widest print:mt-8 print:pt-4 print:border-black print:text-black">
             {CONTACT_INFO.name} • Chartered Accountants • {CONTACT_INFO.address.city}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChecklistDetail;
