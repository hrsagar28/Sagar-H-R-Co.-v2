import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowLeft, Home, FileText, MessageSquare } from 'lucide-react';
import SEO from '../components/SEO';

const { Link } = ReactRouterDOM;

const NotFound: React.FC = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-bg px-4">
      <SEO title="Page Not Found | Sagar H R & Co." description="The requested page could not be found." noindex />
      {/* Background Grid */}
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-30"></div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-moss/5 blur-[100px]"></div>

      <div className="relative z-10 w-full max-w-3xl pt-20 text-center">
        <span className="mb-8 inline-block rounded-full border border-brand-border bg-brand-surface px-4 py-1 text-xs font-bold uppercase tracking-widest text-brand-stone">
          Error 404
        </span>
        <h1 className="mb-4 select-none font-heading text-8xl font-bold leading-none tracking-tighter text-brand-dark opacity-10 md:text-[10rem]">
          404
        </h1>
        <h2 className="relative z-20 -mt-12 mb-6 font-heading text-4xl font-bold text-brand-dark md:-mt-20 md:text-6xl">
          Page Not Found
        </h2>
        <p className="mx-auto mb-12 max-w-xl text-xl font-medium text-brand-stone">
          The page you are looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            to="/"
            className="group flex flex-col items-center gap-4 rounded-2xl border border-brand-border bg-brand-surface p-6 transition-all hover:border-brand-moss hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-bg text-brand-dark transition-colors group-hover:bg-brand-moss group-hover:text-white">
              <Home size={20} />
            </div>
            <span className="font-bold text-brand-dark">Home</span>
          </Link>
          <Link
            to="/services"
            className="group flex flex-col items-center gap-4 rounded-2xl border border-brand-border bg-brand-surface p-6 transition-all hover:border-brand-moss hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-bg text-brand-dark transition-colors group-hover:bg-brand-moss group-hover:text-white">
              <FileText size={20} />
            </div>
            <span className="font-bold text-brand-dark">Our Services</span>
          </Link>
          <Link
            to="/contact"
            className="group flex flex-col items-center gap-4 rounded-2xl border border-brand-border bg-brand-surface p-6 transition-all hover:border-brand-moss hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-bg text-brand-dark transition-colors group-hover:bg-brand-moss group-hover:text-white">
              <MessageSquare size={20} />
            </div>
            <span className="font-bold text-brand-dark">Contact Us</span>
          </Link>
        </div>

        <div className="mt-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-stone transition-colors hover:text-brand-moss"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
