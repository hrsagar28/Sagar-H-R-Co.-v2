import React from 'react';
import { ArrowLeft } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { CONTACT_INFO } from '../constants';

const { Link } = ReactRouterDOM;

const Privacy: React.FC = () => {
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
            Privacy Policy
          </h1>
          <p className="text-lg font-medium text-brand-stone">
            Your privacy is important to us. Here's how we handle your data in compliance with the DPDP Act, 2023.
          </p>
        </div>

        {/* Content Card */}
        <div className="rounded-[2.5rem] border border-brand-border bg-brand-surface p-8 shadow-sm md:p-12">
          <p className="mb-8 text-sm font-bold uppercase tracking-wider text-brand-stone">
            Effective Date: 26 August 2025
          </p>

          <div className="space-y-10 text-lg font-medium leading-relaxed text-brand-stone">
            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">1. Introduction and scope</h2>
              <p>
                {CONTACT_INFO.name}, Chartered Accountants (“the Firm”, “we”, “us”, “our”), acting as a Data Fiduciary,
                is committed to protecting Personal Data. This Privacy Policy explains how we collect, use, store,
                disclose and protect Personal Data via our website www.casagar.co.in (the “Site”) and related services,
                in accordance with the Digital Personal Data Protection Act, 2023 (“DPDP Act”) and other applicable law.
                By using the Site you accept the terms of this Policy.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">2. Definitions</h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong>Personal Data:</strong> information relating to an identified or identifiable natural person.
                </li>
                <li>
                  <strong>Data Principal:</strong> the person to whom Personal Data relates.
                </li>
                <li>
                  <strong>Data Fiduciary:</strong> the entity that determines the purpose and means of Processing (the
                  Firm).
                </li>
                <li>
                  <strong>Data Processor:</strong> a third party that Processes Personal Data on behalf of the Data
                  Fiduciary.
                </li>
                <li>
                  <strong>Processing:</strong> any operation or set of operations performed on Personal Data, whether or
                  not by automated means.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">
                3. Categories of Personal Data collected
              </h2>
              <p className="mb-4">We limit collection to what is necessary. Categories include:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong>Data you provide:</strong> name; e-mail address; telephone number; company/organisation;
                  communications and any other data you submit via contact forms, e-mail or recruitment applications.
                </li>
                <li>
                  <strong>Technical/usage data:</strong> IP address; browser and device information; operating system;
                  pages visited and timestamps; server logs; and data collected via analytics tools.
                </li>
                <li>
                  <strong>Sensitive data:</strong> We do not intentionally collect sensitive personal data (e.g.,
                  financial account credentials, health data) via the Site except where voluntarily provided pursuant to
                  a formal engagement and only to the extent necessary for that engagement.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">
                4. Lawful basis and purposes for Processing
              </h2>
              <p className="mb-4">We Process Personal Data on lawful bases under the DPDP Act, including:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong>Consent:</strong> where you have provided free, specific, informed, unconditional and
                  unambiguous consent (s 6(1), DPDP Act).
                </li>
                <li>
                  <strong>Legitimate use — performance of contract:</strong> processing necessary for performance of any
                  contract with the Data Principal or to take pre-contractual steps at the Data Principal’s request.
                </li>
                <li>
                  <strong>Compliance with law:</strong> processing required to comply with legal or regulatory
                  obligations.
                </li>
                <li>
                  <strong>Permitted legitimate uses:</strong> fraud prevention, security, internal administration and
                  comparable operational purposes permitted by law.
                </li>
              </ul>
              <p className="mt-4">
                The Firm does not presently qualify as a “Significant Data Fiduciary.” If our status changes, we will
                comply with any additional statutory obligations.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">
                5. Purpose limitation and data minimisation
              </h2>
              <p>
                Personal Data is processed only for the specified, explicit and legitimate purposes and only to the
                extent necessary. We will not process Personal Data for incompatible purposes without additional lawful
                basis and notice.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">6. Retention of Personal Data</h2>
              <p className="mb-4">
                We retain Personal Data no longer than necessary and, in any event, for the later of: (a) completion of
                the purpose for which it was collected; (b) expiry of applicable statutory limitation periods; or (c)
                the period required for the exercise or defence of legal, tax or regulatory claims.
              </p>
              <p className="mb-2 font-bold text-brand-dark">Indicative retention schedule:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  Contact form / general enquiries: up to 2 years from last contact, or until consent is withdrawn,
                  whichever is earlier.
                </li>
                <li>Marketing / newsletter lists: until you withdraw consent.</li>
                <li>Prospective client records (no engagement): up to 5 years for risk management.</li>
                <li>
                  Client engagement files and audit working papers: not less than 7 years from completion of the
                  engagement.
                </li>
                <li>
                  Books of account and statutory records: not less than 8 years from the end of the relevant financial
                  year, or longer where statute requires.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">7. Cookies and Analytics</h2>
              <p className="mb-4">
                <strong>Google Analytics:</strong> We use Google Analytics to understand how visitors interact with our
                Site. This service uses third-party cookies to collect information such as your IP address, browser
                type, referring pages, and time spent on the Site. This data is aggregated and anonymized to help us
                improve user experience and site performance.
              </p>
              <p className="mb-4">
                <strong>First-party cookies:</strong> The Site uses strictly necessary first-party cookies to enable
                technical functionality (e.g., remembering your session state or consent choices).
              </p>
              <p className="mb-4">
                <strong>Local form drafts:</strong> If you accept optional cookies, contact and application forms may
                temporarily save encrypted draft details in your browser localStorage so you can resume an incomplete
                form during the same browser session. The encryption uses the browser WebCrypto API with a
                session-scoped salt; it is intended to reduce casual exposure from local browser storage, not to make
                data unreadable to code already running in your browser. Contact form drafts may include details such as
                name, email, phone number, company, and message content, and currently expire after 7 days. Careers
                application drafts may include details such as name, date of birth, phone number, email address,
                qualifications, prior employment details, and application responses, and currently expire after 14 days.
                If you decline optional cookies, we do not store these drafts and any unsaved draft data may be cleared
                when you leave the page.
              </p>
              <p className="mb-4">
                You can opt-out of Google Analytics tracking across all websites by installing the{' '}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Google Analytics Opt-out Browser Add-on (opens in new window)"
                  className="font-bold text-brand-moss hover:underline"
                >
                  Google Analytics Opt-out Browser Add-on
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">
                8. Data Processors, transfers and safeguards
              </h2>
              <p>
                We engage Data Processors including Google LLC (for Analytics), FormSubmit (for secure contact form
                processing), hosting providers, email providers, and cloud vendors under written Data Processing
                Agreements or standard contractual clauses. We will transfer Personal Data outside India only to
                jurisdictions not notified as restricted under s 16 DPDP Act, or pursuant to an exemption or lawful
                mechanism. Please note that Google Analytics and FormSubmit data may be processed on servers located
                outside of India, such as in the United States.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">
                9. Disclosure and lawful disclosure
              </h2>
              <p>
                We do not sell Personal Data. We may disclose Personal Data to: authorised Data Processors; professional
                advisers and auditors; courts, regulators or law enforcement where required by law; and other parties
                with your explicit consent.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">
                10. Security and Personal Data breach notification
              </h2>
              <p>
                We maintain reasonable technical, administrative and physical safeguards to protect Personal Data. In
                the event of a Personal Data breach affecting data within our control, we will activate our incident
                response procedure and notify the competent authority and affected Data Principals without undue delay.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">11. Rights of Data Principals</h2>
              <p className="mb-4">
                Subject to applicable law, Data Principals have the right to: confirmation of processing; access;
                correction; erasure where lawful; grievance redressal; and nomination of a representative.
              </p>
              <p>
                To exercise your rights, contact the Grievance Officer. We will acknowledge valid requests promptly and
                endeavour to respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">12. Children’s data</h2>
              <p>
                The Site is not directed to persons under 18. We do not knowingly process Personal Data of children
                under 18 without verifiable parental consent.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">
                13. Grievance Officer / Contact details
              </h2>
              <div className="rounded-xl border border-brand-border bg-brand-bg p-6">
                <p className="font-bold text-brand-dark">CA Sagar H R (Proprietor)</p>
                <p>{CONTACT_INFO.name}, Chartered Accountants</p>
                <p>{CONTACT_INFO.address.full}</p>
                <p className="mt-2">
                  <strong>Email:</strong> {CONTACT_INFO.email}
                </p>
                <p>
                  <strong>Phone:</strong> {CONTACT_INFO.phone.display}
                </p>
                <p className="mt-2 text-sm text-brand-stone">
                  Office hours: Mon–Sat, 10:00 AM – 2:00 PM & 4:00 PM – 8:00 PM IST
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-brand-dark">14. Changes to this Policy</h2>
              <p>
                We may update this Policy from time to time. Material changes will be posted on the Site with a revised
                Effective Date. Continued use after posting constitutes acceptance.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
