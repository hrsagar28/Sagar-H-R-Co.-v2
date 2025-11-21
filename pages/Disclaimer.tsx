import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Disclaimer: React.FC = () => {
  return (
    <div className="pt-32 md:pt-40 pb-20 px-4 md:px-6 bg-brand-bg min-h-screen">
      <div className="container mx-auto max-w-4xl">
        {/* Back Link */}
        <div className="mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-brand-stone hover:text-brand-dark font-bold text-sm uppercase tracking-wider transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-brand-dark mb-6 tracking-tighter">
            Disclaimer
          </h1>
          <p className="text-lg text-brand-stone font-medium">
            Important information about the use of our website and services.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-brand-surface p-8 md:p-12 rounded-[2.5rem] border border-brand-border shadow-sm">
          <p className="text-brand-stone font-bold text-sm uppercase tracking-wider mb-8">Effective Date: 26 August 2025</p>

          <div className="space-y-10 text-brand-stone font-medium leading-relaxed text-lg">
            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">No Professional Advice</h2>
              <p>
                The content provided on this website is for general informational purposes only. It does not constitute professional accounting, tax, audit, or legal advice and should not be substituted for consultation with a qualified professional who can address your specific circumstances.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">No Professional-Client Relationship</h2>
              <p>
                Your use of this site, including submitting inquiries, does not create a professional-client relationship between you and Sagar H R & Co. Such a relationship can only be established through a formal, signed engagement letter.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">Information "As Is"</h2>
              <p>
                To the fullest extent permitted by law, this website and its content are provided "as is" and "as available" without any warranties, express or implied.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">Limitation of Liability</h2>
              <p>
                Sagar H R & Co. shall not be liable for any losses or damages arising from the use of, or reliance on, the information contained on this site, except where liability cannot be excluded under applicable law or professional standards.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">Professional Standards</h2>
              <p>
                The Firm adheres to the regulations and ethical guidelines set forth by The Institute of Chartered Accountants of India (ICAI), including the Chartered Accountants Act, 1949, the Chartered Accountants Regulations, 1988, and the ICAI Code of Ethics, which governs advertising and solicitation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">Third-Party Links</h2>
              <p>
                Any links to external websites are provided for convenience only. We do not monitor, control, or endorse the content of third-party sites and are not responsible for their content or accuracy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">Website Availability</h2>
              <p>
                We do not guarantee that access to the site will be uninterrupted or error-free. The site may be temporarily unavailable due to maintenance or other factors.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">Jurisdiction</h2>
              <p>
                Any disputes related to this Disclaimer shall be subject to the exclusive jurisdiction of the courts at Mysuru, Karnataka, unless mandatory regulatory or consumer tribunals apply.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
