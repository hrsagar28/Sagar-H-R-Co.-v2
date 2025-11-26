import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CONTACT_INFO } from '../config/contact';

const Privacy: React.FC = () => {
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
            Privacy Policy
          </h1>
          <p className="text-lg text-brand-stone font-medium">
            Your privacy is important to us. Here's how we handle your data in compliance with the DPDP Act, 2023.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-brand-surface p-8 md:p-12 rounded-[2.5rem] border border-brand-border shadow-sm">
          <p className="text-brand-stone font-bold text-sm uppercase tracking-wider mb-8">Effective Date: 26 August 2025</p>

          <div className="space-y-10 text-brand-stone font-medium leading-relaxed text-lg">
            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">1. Introduction and scope</h2>
              <p>
                {CONTACT_INFO.name}, Chartered Accountants (“the Firm”, “we”, “us”, “our”), acting as a Data Fiduciary, is committed to protecting Personal Data. This Privacy Policy explains how we collect, use, store, disclose and protect Personal Data via our website www.casagar.co.in (the “Site”) and related services, in accordance with the Digital Personal Data Protection Act, 2023 (“DPDP Act”) and other applicable law. By using the Site you accept the terms of this Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">2. Definitions</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Personal Data:</strong> information relating to an identified or identifiable natural person.</li>
                <li><strong>Data Principal:</strong> the person to whom Personal Data relates.</li>
                <li><strong>Data Fiduciary:</strong> the entity that determines the purpose and means of Processing (the Firm).</li>
                <li><strong>Data Processor:</strong> a third party that Processes Personal Data on behalf of the Data Fiduciary.</li>
                <li><strong>Processing:</strong> any operation or set of operations performed on Personal Data, whether or not by automated means.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">3. Categories of Personal Data collected</h2>
              <p className="mb-4">We limit collection to what is necessary. Categories include:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Data you provide:</strong> name; e-mail address; telephone number; company/organisation; communications and any other data you submit via contact forms, e-mail or recruitment applications.</li>
                <li><strong>Technical/usage data:</strong> IP address; browser and device information; operating system; pages visited and timestamps; server logs.</li>
                <li><strong>Sensitive data:</strong> We do not intentionally collect sensitive personal data (e.g., financial account credentials, health data) via the Site except where voluntarily provided pursuant to a formal engagement and only to the extent necessary for that engagement.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">4. Lawful basis and purposes for Processing</h2>
              <p className="mb-4">We Process Personal Data on lawful bases under the DPDP Act, including:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Consent:</strong> where you have provided free, specific, informed, unconditional and unambiguous consent (s 6(1), DPDP Act).</li>
                <li><strong>Legitimate use — performance of contract:</strong> processing necessary for performance of any contract with the Data Principal or to take pre-contractual steps at the Data Principal’s request.</li>
                <li><strong>Compliance with law:</strong> processing required to comply with legal or regulatory obligations.</li>
                <li><strong>Permitted legitimate uses:</strong> fraud prevention, security, internal administration and comparable operational purposes permitted by law.</li>
              </ul>
              <p className="mt-4">The Firm does not presently qualify as a “Significant Data Fiduciary.” If our status changes, we will comply with any additional statutory obligations.</p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">5. Purpose limitation and data minimisation</h2>
              <p>
                Personal Data is processed only for the specified, explicit and legitimate purposes and only to the extent necessary. We will not process Personal Data for incompatible purposes without additional lawful basis and notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">6. Retention of Personal Data</h2>
              <p className="mb-4">
                We retain Personal Data no longer than necessary and, in any event, for the later of: (a) completion of the purpose for which it was collected; (b) expiry of applicable statutory limitation periods; or (c) the period required for the exercise or defence of legal, tax or regulatory claims.
              </p>
              <p className="mb-2 text-brand-dark font-bold">Indicative retention schedule:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Contact form / general enquiries: up to 2 years from last contact, or until consent is withdrawn, whichever is earlier.</li>
                <li>Marketing / newsletter lists: until you withdraw consent.</li>
                <li>Prospective client records (no engagement): up to 5 years for risk management.</li>
                <li>Client engagement files and audit working papers: not less than 7 years from completion of the engagement.</li>
                <li>Books of account and statutory records: not less than 8 years from the end of the relevant financial year, or longer where statute requires.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">7. Cookies and similar technologies</h2>
              <p className="mb-4">
                <strong>Status:</strong> We do not presently use third-party analytics or marketing cookies on the Site. The Site may use strictly necessary, first-party cookies to enable technical functionality and to remember your consent choice.
              </p>
              <p className="mb-4">
                Examples of first-party cookies: cookie_terms_accepted, cookie_warning_dismissed. If we introduce non-essential tracking, we will implement a granular consent mechanism.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">8. Data Processors, transfers and safeguards</h2>
              <p>
                We engage Data Processors (hosting providers, email providers, cloud vendors) under written Data Processing Agreements. We will transfer Personal Data outside India only to jurisdictions not notified as restricted under s 16 DPDP Act, or pursuant to an exemption or lawful mechanism.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">9. Disclosure and lawful disclosure</h2>
              <p>
                We do not sell Personal Data. We may disclose Personal Data to: authorised Data Processors; professional advisers and auditors; courts, regulators or law enforcement where required by law; and other parties with your explicit consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">10. Security and Personal Data breach notification</h2>
              <p>
                We maintain reasonable technical, administrative and physical safeguards to protect Personal Data. In the event of a Personal Data breach affecting data within our control, we will activate our incident response procedure and notify the competent authority and affected Data Principals without undue delay.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">11. Rights of Data Principals</h2>
              <p className="mb-4">
                Subject to applicable law, Data Principals have the right to: confirmation of processing; access; correction; erasure where lawful; grievance redressal; and nomination of a representative.
              </p>
              <p>
                To exercise your rights, contact the Grievance Officer. We will acknowledge valid requests promptly and endeavour to respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">12. Children’s data</h2>
              <p>
                The Site is not directed to persons under 18. We do not knowingly process Personal Data of children under 18 without verifiable parental consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">13. Grievance Officer / Contact details</h2>
              <div className="bg-brand-bg p-6 rounded-xl border border-brand-border">
                <p className="font-bold text-brand-dark">CA Sagar H R (Proprietor)</p>
                <p>{CONTACT_INFO.name}, Chartered Accountants</p>
                <p>{CONTACT_INFO.address.full}</p>
                <p className="mt-2"><strong>Email:</strong> {CONTACT_INFO.email}</p>
                <p><strong>Phone:</strong> {CONTACT_INFO.phone.display}</p>
                <p className="text-sm mt-2 text-brand-stone">Office hours: Mon–Sat, 10:00 AM – 2:00 PM & 4:00 PM – 8:00 PM IST</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-4">14. Changes to this Policy</h2>
              <p>
                We may update this Policy from time to time. Material changes will be posted on the Site with a revised Effective Date. Continued use after posting constitutes acceptance.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;