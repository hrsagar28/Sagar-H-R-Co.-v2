
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowLeft, Home, FileText, MessageSquare } from 'lucide-react';

const { Link } = ReactRouterDOM;

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 relative overflow-hidden">
       {/* Background Grid */}
       <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none"></div>
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-moss/5 rounded-full blur-[100px] pointer-events-none"></div>

       <div className="max-w-3xl w-full text-center relative z-10 pt-20">
          <span className="inline-block px-4 py-1 rounded-full border border-brand-border bg-brand-surface text-xs font-bold uppercase tracking-widest text-brand-stone mb-8">
             Error 404
          </span>
          <h1 className="text-8xl md:text-[10rem] font-heading font-bold text-brand-dark leading-none tracking-tighter mb-4 opacity-10 select-none">
             404
          </h1>
          <h2 className="text-4xl md:text-6xl font-heading font-bold text-brand-dark mb-6 -mt-12 md:-mt-20 relative z-20">
             Page Not Found
          </h2>
          <p className="text-xl text-brand-stone font-medium mb-12 max-w-xl mx-auto">
             The page you are looking for doesn't exist or has been moved. Let's get you back on track.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <Link to="/" className="p-6 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-moss hover:shadow-lg transition-all group flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-bg flex items-center justify-center text-brand-dark group-hover:bg-brand-moss group-hover:text-white transition-colors">
                   <Home size={20} />
                </div>
                <span className="font-bold text-brand-dark">Home</span>
             </Link>
             <Link to="/services" className="p-6 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-moss hover:shadow-lg transition-all group flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-bg flex items-center justify-center text-brand-dark group-hover:bg-brand-moss group-hover:text-white transition-colors">
                   <FileText size={20} />
                </div>
                <span className="font-bold text-brand-dark">Our Services</span>
             </Link>
             <Link to="/contact" className="p-6 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-moss hover:shadow-lg transition-all group flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-bg flex items-center justify-center text-brand-dark group-hover:bg-brand-moss group-hover:text-white transition-colors">
                   <MessageSquare size={20} />
                </div>
                <span className="font-bold text-brand-dark">Contact Us</span>
             </Link>
          </div>
          
          <div className="mt-12">
            <Link to="/" className="inline-flex items-center gap-2 text-brand-stone font-bold uppercase tracking-wider text-sm hover:text-brand-moss transition-colors">
               <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>
       </div>
    </div>
  );
};

export default NotFound;