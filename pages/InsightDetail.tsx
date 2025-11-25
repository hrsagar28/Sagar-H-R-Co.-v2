import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { INSIGHTS_MOCK } from '../constants';
import { ArrowLeft, Calendar, Clock, Share2, Printer, Check, Twitter, Linkedin } from 'lucide-react';
import SEO from '../components/SEO';

const InsightDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const insight = INSIGHTS_MOCK.find(i => i.slug === slug);
  
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!insight) {
      navigate('/insights');
    }
    window.scrollTo(0, 0);
  }, [slug, insight, navigate]);

  // Reading progress bar logic
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight === 0) return;
      const scroll = totalScroll / windowHeight;
      setProgress(Number(scroll));
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Robust Share Functionality
  const handleShare = async () => {
    const shareData = {
      title: insight?.title || 'Insight from Sagar H R & Co.',
      text: insight?.summary,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share API error or cancelled', err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error('Clipboard copy failed', err);
        alert('Unable to copy link to clipboard.');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!insight) return null;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://casagar.co.in/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Insights",
            "item": "https://casagar.co.in/insights"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": insight.title
          }
        ]
      },
      {
        "@type": "Article",
        "headline": insight.title,
        "description": insight.summary,
        "author": {
          "@type": "Person",
          "name": insight.author
        },
        "publisher": {
          "@type": "Organization",
          "name": "Sagar H R & Co.",
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
      }
    ]
  };

  return (
    <div className="bg-brand-surface min-h-screen relative selection:bg-brand-moss selection:text-white">
      <SEO 
        title={`${insight.title} | Insights`}
        description={insight.summary}
        ogType="article"
        schema={schema}
      />
      
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 z-sticky bg-transparent">
        <div 
          className="h-full bg-gradient-to-r from-brand-moss to-green-600 transition-all duration-150 ease-out rounded-r-full shadow-[0_0_10px_rgba(26,77,46,0.5)]" 
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-moss/5 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute inset-0 bg-noise opacity-[0.4] mix-blend-soft-light z-0"></div>
      </div>

      <div className="relative z-base pt-32 md:pt-48 pb-24 px-4 md:px-8 max-w-[1200px] mx-auto">
        
        {/* Editorial Header */}
        <header className="text-center max-w-4xl mx-auto mb-16 md:mb-24 animate-fade-in-up">
          <Link 
            to="/insights" 
            className="inline-flex items-center gap-2 text-brand-stone hover:text-brand-moss font-bold text-xs uppercase tracking-[0.25em] transition-all mb-10 group border-b border-transparent hover:border-brand-moss pb-1"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Insights
          </Link>
          
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
                    <button 
                      onClick={handleShare}
                      aria-label="Share article"
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-brand-stone hover:text-brand-moss hover:bg-brand-bg transition-all relative group"
                      title="Share this article"
                    >
                      {copied ? <Check size={20} className="text-green-600" /> : <Share2 size={20} />}
                      
                      {/* Tooltip */}
                      <span className="absolute left-full ml-3 px-2 py-1 bg-brand-dark text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-tooltip">
                        {copied ? 'Copied!' : 'Share'}
                      </span>
                    </button>

                    <button 
                      onClick={handlePrint}
                      aria-label="Print article"
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-brand-stone hover:text-brand-moss hover:bg-brand-bg transition-all relative group"
                      title="Print this article"
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
                 <div className="text-[10px] uppercase tracking-widest text-brand-stone/50 font-bold rotate-180 [writing-mode:vertical-lr]">
                    Share Article
                 </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-8">
              <article className="prose prose-lg md:prose-xl max-w-none animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <div dangerouslySetInnerHTML={{ __html: insight.content }} className="article-content" />
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
                          Senior Partner at Sagar H R & Co., specializing in corporate taxation, audit assurance, and strategic business advisory with over a decade of experience.
                        </p>
                        <Link to="/contact" className="inline-block px-6 py-2 bg-white border border-brand-border text-brand-dark font-bold rounded-full hover:bg-brand-dark hover:text-white transition-all text-sm shadow-sm">
                          Book Consultation
                        </Link>
                    </div>
                  </div>
              </div>
            </main>

            {/* Right Sidebar - Table of Contents Placeholder (Optional) */}
            <div className="hidden lg:block lg:col-span-2">
               {/* Could add ToC here in future */}
            </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-fixed flex items-center gap-2 p-2 bg-brand-dark/90 backdrop-blur-lg rounded-full shadow-2xl shadow-brand-dark/30 border border-white/10">
        <button onClick={handleShare} aria-label="Share article" className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90 transition-transform">
            {copied ? <Check size={20} /> : <Share2 size={20} />}
        </button>
        <button onClick={handlePrint} aria-label="Print article" className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90 transition-transform">
            <Printer size={20} />
        </button>
        <div className="w-[1px] h-8 bg-white/20 mx-2"></div>
        <Link to="/contact" className="px-6 py-3 bg-brand-moss text-white rounded-full font-bold text-sm whitespace-nowrap active:scale-95 transition-transform">
            Consult Expert
        </Link>
      </div>

      <style>{`
        /* Modern Article Styling */
        .article-content {
          color: #27272a; /* Zinc-800 */
          font-family: 'Plus Jakarta Sans', sans-serif; /* Modern Sans for Body */
          line-height: 1.8;
          font-size: 1.125rem;
        }

        /* Initial Letter Drop Cap */
        .article-content > p:first-of-type::first-letter {
          float: left;
          font-family: 'Playfair Display', serif;
          font-size: 4.5rem;
          line-height: 0.8;
          font-weight: 700;
          margin-right: 0.75rem;
          margin-top: 0.25rem;
          color: #1A4D2E; /* brand-moss */
        }

        .article-content h2 {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 1.875rem;
          margin-top: 3.5rem;
          margin-bottom: 1.5rem;
          color: #111111;
          letter-spacing: -0.03em;
          line-height: 1.2;
          position: relative;
          padding-left: 1rem;
        }
        
        /* Heading Accent */
        .article-content h2::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.25em;
          bottom: 0.25em;
          width: 4px;
          background: #1A4D2E;
          border-radius: 4px;
        }

        .article-content p {
          margin-bottom: 1.75rem;
          font-weight: 400;
          color: #4a4a52; /* Slightly softer text for reading */
        }

        .article-content ul {
          list-style: none;
          padding-left: 0;
          margin-bottom: 2.5rem;
          display: grid;
          gap: 1rem;
        }

        .article-content li {
          position: relative;
          padding-left: 2rem;
          font-size: 1.05rem;
          color: #18181b;
          font-weight: 500;
        }

        .article-content li::before {
          content: '→';
          position: absolute;
          left: 0;
          top: 0;
          color: #1A4D2E; /* brand-moss */
          font-weight: 900;
        }
        
        .article-content strong {
          color: #111111;
          font-weight: 700;
        }

        .article-content a {
          color: #1A4D2E;
          text-decoration: none;
          border-bottom: 2px solid rgba(26, 77, 46, 0.2);
          transition: all 0.2s;
          font-weight: 600;
        }
        
        .article-content a:hover {
          background-color: rgba(26, 77, 46, 0.1);
          border-bottom-color: #1A4D2E;
        }

        /* Enhanced Summary Card - Glassmorphism */
        .article-content .summary-card {
          background: rgba(242, 242, 240, 0.6); /* brand-bg with opacity */
          backdrop-filter: blur(12px);
          border: 1px solid #D4D4D8;
          border-left: 6px solid #1A4D2E;
          padding: 2.5rem;
          border-radius: 0 1.5rem 1.5rem 0;
          margin: 3.5rem 0;
          box-shadow: 0 12px 40px rgba(0,0,0,0.06);
          position: relative;
          overflow: hidden;
        }
        
        /* Subtle texture on summary card */
        .article-content .summary-card::after {
           content: '';
           position: absolute;
           top: 0; right: 0; width: 150px; height: 150px;
           background: radial-gradient(circle, rgba(26,77,46,0.1) 0%, transparent 70%);
           pointer-events: none;
        }

        .article-content .summary-card h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 0.875rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: #1A4D2E;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-left: 0; /* Override heading padding */
        }
        
        .article-content .summary-card h3::before {
           display: none; /* Remove heading accent inside card */
        }
        
        /* Icon inside summary title */
        .article-content .summary-card h3::after {
          content: '';
          display: block;
          flex-grow: 1;
          height: 1px;
          background: #D4D4D8;
          opacity: 0.5;
        }

        /* Print Specific Styles */
        @media print {
          body { 
            background: white !important; 
            color: black !important; 
          }
          
          nav, footer, .fixed, button, .sticky, aside { 
            display: none !important; 
          }
          
          /* Reset layout for print */
          .pt-32, .pt-48, .pb-24 { padding: 0 !important; margin: 0 !important; }
          .min-h-screen { min-height: auto !important; }
          .absolute { display: none !important; } /* Hide backgrounds */
          
          .grid { display: block !important; }
          .lg\\:col-span-2 { display: none !important; }
          .lg\\:col-span-8 { width: 100% !important; max-width: 100% !important; }
          .container, .max-w-\\[1200px\\] { max-width: 100% !important; width: 100% !important; padding: 0 !important; }

          .article-content {
            font-size: 12pt !important;
            line-height: 1.5 !important;
            color: black !important;
            font-family: serif !important;
          }
          
          h1 {
            font-size: 24pt !important;
            margin-bottom: 0.5cm !important;
            color: black !important;
            text-align: left !important;
            font-family: sans-serif !important;
          }
          
          /* Header Info */
          header { margin-bottom: 1cm !important; text-align: left !important; }
          header a { display: none !important; }

          .article-content .summary-card {
            border: 2px solid #000 !important;
            border-left: 6px solid #000 !important;
            background: none !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }

          a[href]:after {
            content: " (" attr(href) ")";
            font-size: 0.8em;
          }
        }
      `}</style>
    </div>
  );
};

export default InsightDetail;