import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CONTACT_INFO } from '../constants';
import './route-styles.css';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg px-4 pb-20 pt-32 md:px-6 md:pt-40">
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
            Terms of Service
          </h1>
          <p className="text-lg font-medium text-brand-stone">
            Please read these terms carefully before using our website.
          </p>
        </div>

        {/* Content Card */}
        <div className="rounded-[2.5rem] border border-brand-border bg-brand-surface p-8 shadow-sm md:p-12">
          <p className="mb-8 text-sm font-bold uppercase tracking-wider text-brand-stone">
            Effective Date: 26 August 2025
          </p>

          <div className="space-y-10 text-lg font-medium leading-relaxed text-brand-stone">
            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">1. Acceptance and scope</h2>
              <p>
                These Terms of Service (“Terms”) govern your access to and use of the Firm’s website www.casagar.co.in
                (the “Site”). They apply only to the Site. Any professional engagement for accounting, audit, tax or
                advisory services is governed exclusively by a separate written engagement letter and these Terms do not
                amend or supersede such engagement letters.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">
                2. Permitted use and acceptable conduct
              </h2>
              <p>
                You may use the Site for lawful purposes only. Prohibited conduct includes: uploading unlawful,
                defamatory, obscene or infringing material; sending unsolicited commercial communications; transmitting
                malware; attempting unauthorised access; impersonation; or otherwise interfering with Site operations.
                We may report unlawful acts to appropriate authorities and will cooperate with lawful investigations.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">
                3. Automated harvesting and scraping prohibited
              </h2>
              <p>
                You shall not use automated means (bots, scrapers, crawlers or similar tools) to harvest content or data
                from the Site without our prior written consent. We reserve the right to block, pursue remedies and
                report such activity.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">
                4. No professional advice; no professional-client relationship
              </h2>
              <p>
                Content on the Site is for general information only and does not constitute professional advice.
                Submission of enquiries or materials via the Site does not create a professional-client relationship.
                Such relationship arises only upon execution of a formal written engagement letter signed by authorised
                representatives.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">5. Intellectual property</h2>
              <p>
                All Site content (text, graphics, logos, images) is owned by the Firm or licensed to the Firm and
                protected by IP laws. You are granted a limited licence to view Site content for personal or internal
                business purposes only. Reproduction or commercial use is prohibited without prior written consent.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">
                6. User content; licence and warranty
              </h2>
              <p>
                By submitting User Content, you warrant you have the necessary rights and consents and that the content
                does not infringe third-party rights. You grant the Firm a perpetual, non-exclusive, royalty-free,
                worldwide licence to use, reproduce, adapt and publish such User Content for Site operation and lawful
                Firm purposes.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">7. Indemnity</h2>
              <p>
                Subject to applicable law, you agree to indemnify, defend and hold the Firm, its partners, employees and
                agents harmless from liabilities, losses, damages, claims and expenses (including reasonable legal fees)
                arising from your breach of these Terms or User Content.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">
                8. Limitation of liability; professional exceptions
              </h2>
              <p>
                To the maximum extent permitted by law, the Firm’s aggregate liability arising out of or in connection
                with these Terms or your use of the Site shall be limited to the aggregate amount, if any, you have paid
                the Firm for use of the Site in the twelve (12) months immediately preceding the event giving rise to
                liability. The Firm shall not be liable for indirect, incidental, consequential or punitive damages.
                Nothing in this clause limits liability which cannot be excluded by law.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">9. Suspension and termination</h2>
              <p>
                We may suspend, restrict or terminate access to the Site (wholly or partly) at our discretion for
                breach, suspected illegal activity, security reasons or maintenance. Termination will not affect accrued
                rights.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">
                10. Notices and electronic communications
              </h2>
              <p>
                By using the Site you consent to receiving electronic communications from the Firm. Notices may be
                provided by e-mail or by posting on the Site.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">
                11. Entire agreement; severability
              </h2>
              <p>
                These Terms, together with the Privacy Policy and other incorporated documents, constitute the entire
                agreement regarding the Site. If a provision is held unenforceable, the remainder continues in force.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">
                12. Governing law and jurisdiction
              </h2>
              <p>
                These Terms are governed by the laws of India. Subject to mandatory consumer-protection or
                professional-regulatory forums, courts at Mysuru, Karnataka shall have exclusive jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">13. Changes to Terms</h2>
              <p>
                We may amend these Terms by posting revised Terms on the Site with an updated Effective Date. Changes
                will not retroactively affect services already performed under separate, executed engagement letters.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">14. Contact</h2>
              <div className="rounded-xl border border-brand-border bg-brand-bg p-6">
                <p className="font-bold text-brand-dark">{CONTACT_INFO.name}, Chartered Accountants</p>
                <p>{CONTACT_INFO.address.full}</p>
                <p className="mt-2">
                  <strong>Email:</strong> {CONTACT_INFO.email}
                </p>
                <p>
                  <strong>Phone:</strong> {CONTACT_INFO.phone.display}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
