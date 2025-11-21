import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
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
            Terms of Service
          </h1>
          <p className="text-lg text-brand-stone font-medium">
            Please read these terms carefully before using our website.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-brand-surface p-8 md:p-12 rounded-[2.5rem] border border-brand-border shadow-sm">
          <p className="text-brand-stone font-bold text-sm uppercase tracking-wider mb-8">Effective Date: 26 August 2025</p>

          <div className="space-y-10 text-brand-stone font-medium leading-relaxed text-lg">
            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">1. Acceptance and scope</h2>
              <p>
                These Terms of Service (“Terms”) govern your access to and use of the Firm’s website www.casagar.co.in (the “Site”). They apply only to the Site. Any professional engagement for accounting, audit, tax or advisory services is governed exclusively by a separate written engagement letter and these Terms do not amend or supersede such engagement letters.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">2. Permitted use and acceptable conduct</h2>
              <p>
                You may use the Site for lawful purposes only. Prohibited conduct includes: uploading unlawful, defamatory, obscene or infringing material; sending unsolicited commercial communications; transmitting malware; attempting unauthorised access; impersonation; or otherwise interfering with Site operations. We may report unlawful acts to appropriate authorities and will cooperate with lawful investigations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">3. Automated harvesting and scraping prohibited</h2>
              <p>
                You shall not use automated means (bots, scrapers, crawlers or similar tools) to harvest content or data from the Site without our prior written consent. We reserve the right to block, pursue remedies and report such activity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">4. No professional advice; no professional-client relationship</h2>
              <p>
                Content on the Site is for general information only and does not constitute professional advice. Submission of enquiries or materials via the Site does not create a professional-client relationship. Such relationship arises only upon execution of a formal written engagement letter signed by authorised representatives.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">5. Intellectual property</h2>
              <p>
                All Site content (text, graphics, logos, images) is owned by the Firm or licensed to the Firm and protected by IP laws. You are granted a limited licence to view Site content for personal or internal business purposes only. Reproduction or commercial use is prohibited without prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">6. User content; licence and warranty</h2>
              <p>
                By submitting User Content, you warrant you have the necessary rights and consents and that the content does not infringe third-party rights. You grant the Firm a perpetual, non-exclusive, royalty-free, worldwide licence to use, reproduce, adapt and publish such User Content for Site operation and lawful Firm purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">7. Indemnity</h2>
              <p>
                Subject to applicable law, you agree to indemnify, defend and hold the Firm, its partners, employees and agents harmless from liabilities, losses, damages, claims and expenses (including reasonable legal fees) arising from your breach of these Terms or User Content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">8. Limitation of liability; professional exceptions</h2>
              <p>
                To the maximum extent permitted by law, the Firm’s aggregate liability arising out of or in connection with these Terms or your use of the Site shall be limited to the aggregate amount, if any, you have paid the Firm for use of the Site in the twelve (12) months immediately preceding the event giving rise to liability. The Firm shall not be liable for indirect, incidental, consequential or punitive damages. Nothing in this clause limits liability which cannot be excluded by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">9. Suspension and termination</h2>
              <p>
                We may suspend, restrict or terminate access to the Site (wholly or partly) at our discretion for breach, suspected illegal activity, security reasons or maintenance. Termination will not affect accrued rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">10. Notices and electronic communications</h2>
              <p>
                By using the Site you consent to receiving electronic communications from the Firm. Notices may be provided by e-mail or by posting on the Site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">11. Entire agreement; severability</h2>
              <p>
                These Terms, together with the Privacy Policy and other incorporated documents, constitute the entire agreement regarding the Site. If a provision is held unenforceable, the remainder continues in force.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">12. Governing law and jurisdiction</h2>
              <p>
                These Terms are governed by the laws of India. Subject to mandatory consumer-protection or professional-regulatory forums, courts at Mysuru, Karnataka shall have exclusive jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">13. Changes to Terms</h2>
              <p>
                We may amend these Terms by posting revised Terms on the Site with an updated Effective Date. Changes will not retroactively affect services already performed under separate, executed engagement letters.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">14. Contact</h2>
              <div className="bg-brand-bg p-6 rounded-xl border border-brand-border">
                <p className="font-bold text-brand-dark">Sagar H R & Co., Chartered Accountants</p>
                <p>1479, 2nd Floor, Thyagaraja Road, KR Mohalla, Mysuru, Karnataka – 570004</p>
                <p className="mt-2"><strong>Email:</strong> mail@casagar.co.in</p>
                <p><strong>Phone:</strong> +91 94823 59455</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
