import Button from '../components/ui/Button';

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
    if (confirm('Reset all progress for this checklist?')) {
      setCheckedItems({});
      addToast('Progress reset.', 'info');
    }
  };

  const handleCopy = () => {
    if (!checklist) return;

    let text = `${checklist.title}\n${checklist.subtitle}\n\n`;
    checklist.sections.forEach((section) => {
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
    addToast('Checklist copied to clipboard', 'success');
    setTimeout(() => setJustCopied(false), 2000);
  };

  const toggleItem = (sectionTitle: string, index: number) => {
    const key = `${sectionTitle}-${index}`;
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Calculate Progress
  const progress = useMemo(() => {
    if (!checklist) return 0;
    let total = 0;
    let completed = 0;
    checklist.sections.forEach((s) => {
      s.items.forEach((_, i) => {
        total++;
        if (checkedItems[`${s.title}-${i}`]) completed++;
      });
    });
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }, [checklist, checkedItems]);

  if (!checklist) return null;

  return (
    <div className="min-h-screen bg-brand-bg px-4 pb-20 pt-32 md:px-6 md:pt-40 print:h-auto print:bg-white print:pb-0 print:pt-0">
      <SEO
        title={`${checklist.title} | Resources`}
        description={`Download and view the checklist for ${checklist.title}. ${checklist.subtitle}`}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Resources', url: '/resources' },
          { name: checklist.title, url: window.location.pathname },
        ]}
      />

      <div className="container mx-auto max-w-4xl print:max-w-full print:p-0">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Breadcrumbs items={[{ label: 'Resources', path: '/resources' }, { label: 'Checklists' }]} />

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="rounded-full border border-brand-border bg-white p-2.5 text-brand-dark transition-colors hover:bg-brand-bg"
              title="Copy to Clipboard"
            >
              {justCopied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
            </button>
            <button
              onClick={handleReset}
              className="rounded-full border border-brand-border bg-white p-2.5 text-brand-dark transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              title="Reset Progress"
            >
              <RotateCcw size={18} />
            </button>
            <Button
              variant="solid"
              className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold shadow-md transition-colors hover:bg-brand-dark"
              onClick={handlePrint}
            >
              <Printer size={16} /> Print / PDF
            </Button>
          </div>
        </div>

        {/* Progress Bar (Hidden in Print) */}
        <div className="mb-8 print:hidden">
          <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-widest text-brand-stone">
            <span>Progress</span>
            <span>{progress}% Completed</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-brand-border">
            <div
              className="h-full bg-brand-moss transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-brand-border bg-white p-12 shadow-xl md:p-16 print:rounded-none print:border-0 print:p-0 print:shadow-none">
          {/* Print Only Header (Letterhead Style) */}
          <div className="mb-8 hidden flex-col items-center border-b-2 border-black pb-4 text-center print:flex">
            <div className="mb-1 font-serif text-3xl font-bold uppercase tracking-widest text-black">
              {CONTACT_INFO.name}
            </div>
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-black">Chartered Accountants</p>
            <p className="text-xs text-black">
              {CONTACT_INFO.address.city} | {CONTACT_INFO.phone.display} | {CONTACT_INFO.email}
            </p>
          </div>

          {/* Checklist Header */}
          <div className="mb-10 border-b-2 border-brand-bg pb-8 text-center print:mb-6 print:border-black print:pb-4">
            <h1 className="mb-4 font-heading text-3xl font-bold text-brand-dark md:text-4xl print:mb-2 print:text-2xl print:text-black">
              {checklist.title}
            </h1>
            <p className="text-lg font-medium text-brand-stone print:text-sm print:text-black">{checklist.subtitle}</p>
          </div>

          <div className="space-y-10 print:space-y-6">
            {checklist.sections.map((section, idx) => (
              <div key={idx} className="break-inside-avoid">
                <h3 className="mb-6 border-b border-brand-border/50 pb-2 font-heading text-xl font-bold text-brand-dark print:mb-3 print:border-black print:pb-1 print:text-lg print:text-black">
                  {section.title}
                </h3>
                <ul className="space-y-4 print:space-y-2">
                  {section.items.map((item, i) => {
                    const key = `${section.title}-${i}`;
                    const isChecked = !!checkedItems[key];

                    return (
                      <li
                        key={i}
                        className={`flex items-start gap-4 rounded-xl p-3 transition-colors print:gap-2 print:p-0 ${isChecked ? 'bg-brand-moss/5 print:bg-transparent' : 'hover:bg-brand-bg print:hover:bg-transparent'}`}
                      >
                        <div
                          className="mt-1 shrink-0 cursor-pointer print:cursor-default"
                          onClick={() => toggleItem(section.title, i)}
                        >
                          {/* Interactive Checkbox for Web */}
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded border transition-all print:hidden ${isChecked ? 'border-brand-moss bg-brand-moss text-white' : 'border-brand-stone/40 bg-white'}`}
                          >
                            {isChecked && <Check size={14} />}
                          </div>

                          {/* Print Representation */}
                          <div className="hidden h-4 w-4 border border-black print:block">
                            {isChecked && <span className="-mt-1 block text-center font-bold">✓</span>}
                          </div>
                        </div>

                        <div
                          className={`flex-grow cursor-pointer select-none text-lg font-medium leading-relaxed text-brand-stone print:select-auto print:text-base print:text-black ${isChecked ? 'line-through opacity-70 print:no-underline print:opacity-100' : ''}`}
                          onClick={() => toggleItem(section.title, i)}
                        >
                          <ReactMarkdown
                            components={{
                              p: ({ node, ...props }) => <span {...props} />,
                              strong: ({ node, ...props }) => (
                                <strong className="font-bold text-brand-dark print:text-black" {...props} />
                              ),
                            }}
                          >
                            {item}
                          </ReactMarkdown>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 border-t border-brand-border pt-8 text-center text-sm font-bold uppercase tracking-widest text-brand-stone print:mt-8 print:border-black print:pt-4 print:text-black">
            {CONTACT_INFO.name} • Chartered Accountants • {CONTACT_INFO.address.city}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChecklistDetail;
