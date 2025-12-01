
import React, { useEffect, useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Calendar, Clock, Share2, Printer, Check, Twitter, Linkedin, ArrowUp, Link as LinkIcon, ArrowUpRight } from 'lucide-react';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { CONTACT_INFO } from '../constants';
import { logger } from '../utils/logger';
import { useInsights, useScrollPosition } from '../hooks';
import InsightDetailSkeleton from '../components/skeletons/InsightDetailSkeleton';
import MarkdownRenderer from '../components/MarkdownRenderer';

const { useParams, Link, useNavigate } = ReactRouterDOM;

const InsightDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { insights, loading, getInsightBySlug } = useInsights();
  
  // Replaced manual scroll listener with hook
  const { scrollY } = useScrollPosition(50);
  
  const [shareCopied, setShareCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const insight = useMemo(() => {
    if (!slug) return undefined;
    return getInsightBySlug(slug);
  }, [slug, getInsightBySlug, insights]);

  // Redirect if not found after loading
  useEffect(() => {
    if (!loading && !insight && slug) {
      navigate('/insights');
    }
  }, [loading, insight, slug, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Calculate Reading progress based on scrollY from hook
  const scrollProgress = useMemo(() => {
    if (typeof document === 'undefined') return 0;
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (windowHeight === 0) return 0;
    return Math.min(1, Math.max(0, scrollY / windowHeight));
  }, [scrollY]);

  // Inject Copy Code Buttons (Logic kept as it modifies DOM post-render, useful for markdown code blocks)
  useEffect(() => {
    if (!insight) return;
    
    // Add small delay to ensure DOM is rendered
    const timer = setTimeout(() => {
      // Target the wrapper created by MarkdownRenderer
      const article = document.querySelector('.article-wrapper');
      if (!article) return;

      const preTags = article.querySelectorAll('pre');
      preTags.forEach(pre => {
        if (pre.parentNode && (pre.parentNode as HTMLElement).classList.contains('code-wrapper')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'code-wrapper relative group mb-8 rounded-2xl overflow-hidden shadow-xl';
        
        pre.parentNode?.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
        
        pre.style.margin = '0';

        const btn = document.createElement('button');
        btn.className = 'absolute top-3 right-3 p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 z-10';
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
        btn.setAttribute('aria-label', 'Copy code');
        
        btn.addEventListener('click', () => {
            navigator.clipboard.writeText(pre.innerText);
            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
            setTimeout(() => {
                btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
            }, 2000);
        });

        wrapper.appendChild(btn);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [insight]);

  const handleShare = async () => {
    const shareData = {
      title: insight?.title || `Insight from ${CONTACT_INFO.name}`,
      text: insight?.summary,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        logger.log("Share cancelled or failed", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
      } catch (err) {
        logger.error("Clipboard write failed", err);
        alert('Unable to copy link to clipboard.');
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      logger.error('Failed to copy link', err);
    }
  };

  const handlePrint = () => window.print();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Get related insights
  const relatedInsights = useMemo(() => {
    if (!insight || insights.length === 0) return [];
    
    // Get insights in same category excluding current
    const sameCategory = insights
      .filter(i => i.category === insight.category && i.id !== insight.id)
      .slice(0, 3);
    
    // If not enough, fill with recent others
    if (sameCategory.length < 3) {
      const additional = insights
        .filter(i => i.id !== insight.id && i.category !== insight.category)
        .slice(0, 3 - sameCategory.length);
      return [...sameCategory, ...additional];
    }
    
    return sameCategory;
  }, [insight, insights]);

  // Render Logic
  if (loading) return <InsightDetailSkeleton />;
  if (!insight) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": insight.title,
    "description": insight.summary,
    "author": {
      "@type": "Person",
      "name": insight.author
    },
    "publisher": {
      "@type": "Organization",
      "name": CONTACT_INFO.name,
      "logo": {
        "@type": "ImageObject",
        "url": "https://casagar.co.in/logo.png"
      }
    },
    "datePublished": new Date(insight.date).toISOString(),
    "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://casagar.co.in/insights/${insight.slug}`
    }
  };

  const radius = 24; 
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - scrollProgress * circumference;

  return (
    <div className="bg-brand-surface min-h-screen relative selection:bg-brand-moss selection:text-white">
      <SEO 
        title={`${insight.title} | Insights`}
        description={insight.summary}
        ogType="article"
        schema={schema}
      />
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[800px] h-[800px] bg-brand-moss/5 rounded-full blur-[120px] -z-10"></div>
      </div>

      <div className="relative z-base pt-32 md:pt-48 pb-24 px-4 md:px-8 max-w-[1200px] mx-auto">
        
        {/* Editorial Header */}
        <header className="text-center max-w-4xl mx-auto mb-16 md:mb-24 animate-fade-in-up">
          <div className="flex justify-center mb-10">
            <Breadcrumbs 
              items={[
                { label: 'Insights', path: '/insights' },
                { label: insight.title }
              ]} 
              className="justify-center"
            />
          </div>
          
          <div className="mb-6">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-bg border border-brand-border text-[10px] font-bold uppercase tracking-widest text-brand-moss mb-4">
              {insight.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-brand-dark mb-8 leading-[1.15] tracking-tight">
            {insight.title}
          </h1>

          <div className="flex flex-wrap justify-center items-center gap-6 text-brand-stone text-sm font-medium border-t border-b border-brand-border/50 py-4 mx-auto max-w-2xl bg-white/50 backdrop-blur-sm rounded-full">
            <span className="flex items-center gap-2"><Calendar size={16} className="text-brand-moss"/> {insight.date}</span>
            <span className="w-1 h-1 bg-brand-border rounded-full"></span>
            <span className="flex items-center gap-2"><Clock size={16} className="text-brand-moss"/> {insight.readTime}</span>
            <span className="w-1 h-1 bg-brand-border rounded-full"></span>
            <span className="text-brand-dark font-bold">By {insight.author}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
            
            {/* Left Sidebar - Floating Actions (Desktop) */}
            <aside className="hidden lg:block lg:col-span-2 relative">
              <div className="sticky top-40 flex flex-col gap-6 items-center">
                 <div className="flex flex-col gap-3 p-2 bg-white/80 backdrop-blur-md border border-brand-border/50 rounded-2xl shadow-lg shadow-brand-dark/5">
                    {/* Share Button */}
                    <button 
                      onClick={handleShare}
                      aria-label="Share article"
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-brand-stone hover:text-brand-moss hover:bg-brand-bg transition-all relative group"
                    >
                      {shareCopied ? <Check size={20} className="text-green-600" /> : <Share2 size={20} />}
                      
                      <span className="absolute left-full ml-3 px-2 py-1 bg-brand-dark text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-tooltip">
                        {shareCopied ? 'Copied Link' : 'Share'}
                      </span>
                    </button>

                    <button 
                      onClick={handleCopyLink}
                      aria-label="Copy Link"
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-brand-stone hover:text-brand-moss hover:bg-brand-bg transition-all relative group"
                    >
                      {linkCopied ? <Check size={20} className="text-green-600" /> : <LinkIcon size={20} />}
                      
                      <span className="absolute left-full ml-3 px-2 py-1 bg-brand-dark text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-tooltip">
                        {linkCopied ? 'Link Copied!' : 'Copy Link'}
                      </span>
                    </button>

                    <button 
                      onClick={handlePrint}
                      aria-label="Print article"
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-brand-stone hover:text-brand-moss hover:bg-brand-bg transition-all relative group"
                    >
                      <Printer size={20} />
                      <span className="absolute left-full ml-3 px-2 py-1 bg-brand-dark text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-tooltip">
                        Print
                      </span>
                    </button>
                    
                    <div className="w-full h-[1px] bg-brand-border/50 my-1"></div>
                    
                    <a 
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(insight.title)}&url=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Share on Twitter"
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-brand-stone hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 transition-all"
                    >
                      <Twitter size={20} />
                    </a>
                    <a 
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Share on LinkedIn"
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-brand-stone hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-all"
                    >
                      <Linkedin size={20} />
                    </a>
                 </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-8">
              <article className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  {/* Using New Markdown Renderer */}
                  <MarkdownRenderer content={insight.content} />
              </article>

              {/* Footer Author Card */}
              <div className="mt-24 pt-12 border-t border-brand-border/60">
                  <div className="bg-brand-bg/50 p-8 md:p-10 rounded-[2rem] border border-brand-border/50 flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
                    <div className="w-20 h-20 bg-brand-dark text-white rounded-full flex items-center justify-center font-serif font-bold text-3xl shadow-xl shadow-brand-dark/20 shrink-0">
                        {insight.author.replace('CA ', '').charAt(0)}
                    </div>
                    <div className="flex-grow">
                        <p className="text-xs font-bold uppercase tracking-widest text-brand-moss mb-2">About the Author</p>
                        <h3 className="text-2xl font-heading font-bold text-brand-dark mb-3">{insight.author}</h3>
                        <p className="text-brand-stone text-base leading-relaxed mb-6">
                          Senior Partner at {CONTACT_INFO.name}, specializing in corporate taxation, audit assurance, and strategic business advisory with over a decade of experience.
                        </p>
                        <Link to="/contact" className="inline-block px-6 py-2 bg-white border border-brand-border text-brand-dark font-bold rounded-full hover:bg-brand-dark hover:text-white transition-all text-sm shadow-sm">
                          Book Consultation
                        </Link>
                    </div>
                  </div>
              </div>

              {/* Related Insights Section */}
              {relatedInsights.length > 0 && (
                <section className="mt-24 pt-16 border-t border-brand-border">
                   <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                      <div>
                        <span className="text-brand-moss font-bold tracking-widest uppercase text-xs mb-2 block">Further Reading</span>
                        <h3 className="text-3xl font-heading font-bold text-brand-dark">Related Insights</h3>
                      </div>
                      <Link to="/insights" className="text-sm font-bold uppercase tracking-wider text-brand-stone hover:text-brand-moss transition-colors flex items-center gap-2 group">
                         View All <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Link>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {relatedInsights.map(item => (
                        <Link 
                          to={`/insights/${item.slug}`} 
                          key={item.id}
                          className="group bg-brand-surface rounded-[1.5rem] p-6 border border-brand-border hover:border-brand-moss hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                        >
                           <span className="inline-block px-3 py-1 bg-brand-bg rounded-full text-brand-stone text-[10px] font-bold uppercase tracking-widest mb-4 w-fit group-hover:bg-brand-moss group-hover:text-white transition-colors">
                             {item.category}
                           </span>
                           <h4 className="text-lg font-heading font-bold text-brand-dark mb-3 group-hover:text-brand-moss transition-colors line-clamp-2">
                             {item.title}
                           </h4>
                           <div className="mt-auto flex items-center justify-between pt-4 border-t border-brand-border/50 text-xs font-bold text-brand-stone">
                              <span>{item.date}</span>
                              <div className="w-8 h-8 rounded-full bg-brand-bg flex items-center justify-center group-hover:bg-brand-moss group-hover:text-white transition-all">
                                 <ArrowUpRight size={14} />
                              </div>
                           </div>
                        </Link>
                      ))}
                   </div>
                </section>
              )}
            </main>

            <div className="hidden lg:block lg:col-span-2"></div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-fixed flex items-center gap-2 p-2 bg-brand-dark/90 backdrop-blur-lg rounded-full shadow-2xl shadow-brand-dark/30 border border-white/10">
        <button onClick={handleShare} aria-label="Share article" className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90 transition-transform">
            {shareCopied ? <Check size={20} className="text-green-400" /> : <Share2 size={20} />}
        </button>
        <button onClick={handleCopyLink} aria-label="Copy link" className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90 transition-transform">
            {linkCopied ? <Check size={20} className="text-green-400" /> : <LinkIcon size={20} />}
        </button>
        <div className="w-[1px] h-8 bg-white/20 mx-2"></div>
        <Link to="/contact" className="px-6 py-3 bg-brand-moss text-white rounded-full font-bold text-sm whitespace-nowrap active:scale-95 transition-transform">
            Consult Expert
        </Link>
      </div>
      
      {/* Scroll to Top Progress Ring */}
      <div 
         className={`fixed bottom-24 right-6 md:right-10 z-fixed transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${scrollProgress > 0.05 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
      >
         <button 
           onClick={scrollToTop}
           className="relative w-14 h-14 bg-brand-surface rounded-full shadow-xl flex items-center justify-center group hover:scale-110 transition-transform"
           aria-label="Scroll to top"
           title={`${Math.round(scrollProgress * 100)}% Read`}
         >
           <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle 
                cx="30" cy="30" r={radius} 
                fill="none" 
                stroke="#1A4D2E" 
                strokeWidth="3" 
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
                strokeLinecap="round"
                className="transition-all duration-100"
              />
           </svg>
           <ArrowUp size={20} className="absolute text-brand-dark group-hover:text-brand-moss transition-colors" />
         </button>
      </div>
    </div>
  );
};

export default InsightDetail;