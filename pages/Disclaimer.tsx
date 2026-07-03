import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import './route-styles.css';

const Disclaimer: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg px-4 pb-20 pt-32 md:px-6 md:pt-40">
      {/* SEO-3: legal pages previously rendered no metadata despite being in
          the sitemap. */}
      <SEO
        title="Disclaimer | Sagar H R & Co."
        description="Important disclaimers regarding the professional information published on the Sagar H R & Co. website. Content is general in nature and not a substitute for professional advice."
        canonicalUrl="https://casagar.co.in/disclaimer"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Disclaimer', url: '/disclaimer' },
        ]}
      />
      <div className="container mx-auto max-w-4xl">
        {/* Back Link */}
        <div className="mb-12">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-stone transition-colors hover:text-brand-dark"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="mb-16">
          <h1 className="mb-6 font-heading text-5xl font-bold tracking-tighter text-brand-dark md:text-7xl">
            Disclaimer
          </h1>
          <p className="text-lg font-medium text-brand-stone">
            Important information about the use of our website and services.
          </p>
        </div>

        {/* Content Card */}
        <div className="rounded-[2.5rem] border border-brand-border bg-brand-surface p-8 shadow-sm md:p-12">
          <p className="mb-8 text-sm font-bold uppercase tracking-wider text-brand-stone">
            Effective Date: 26 August 2025
          </p>

          <div className="space-y-10 text-lg font-medium leading-relaxed text-brand-stone">
            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">No Professional Advice</h2>
              <p>
                The content provided on this website is for general informational purposes only. It does not constitute
                professional accounting, tax, audit, or legal advice and should not be substituted for consultation with
                a qualified professional who can address your specific circumstances.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">
                No Professional-Client Relationship
              </h2>
              <p>
                Your use of this site, including submitting inquiries, does not create a professional-client
                relationship between you and Sagar H R & Co. Such a relationship can only be established through a
                formal, signed engagement letter.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">Information "As Is"</h2>
              <p>
                To the fullest extent permitted by law, this website and its content are provided "as is" and "as
                available" without any warranties, express or implied.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">Limitation of Liability</h2>
              <p>
                Sagar H R & Co. shall not be liable for any losses or damages arising from the use of, or reliance on,
                the information contained on this site, except where liability cannot be excluded under applicable law
                or professional standards.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">Professional Standards</h2>
              <p>
                The Firm adheres to the regulations and ethical guidelines set forth by The Institute of Chartered
                Accountants of India (ICAI), including the Chartered Accountants Act, 1949, the Chartered Accountants
                Regulations, 1988, and the ICAI Code of Ethics, which governs advertising and solicitation.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">Third-Party Links</h2>
              <p>
                Any links to external websites are provided for convenience only. We do not monitor, control, or endorse
                the content of third-party sites and are not responsible for their content or accuracy.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">Website Availability</h2>
              <p>
                We do not guarantee that access to the site will be uninterrupted or error-free. The site may be
                temporarily unavailable due to maintenance or other factors.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">Jurisdiction</h2>
              <p>
                Any disputes related to this Disclaimer shall be subject to the exclusive jurisdiction of the courts at
                Mysuru, Karnataka, unless mandatory regulatory or consumer tribunals apply.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
