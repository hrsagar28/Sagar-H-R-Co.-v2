import React from 'react';
import SEO from '../components/SEO';
import LegalPage, { type LegalSection } from '../components/redesign/LegalPage';
import { CONTACT_INFO } from '../constants';

// 2026 redesign of /disclaimer. Rendered inside RedesignLayout, which supplies
// the top bar, footer and stylesheet.

const SECTIONS: LegalSection[] = [
  {
    id: 'general-information',
    title: 'General information, not advice',
    content: (
      <p>
        The articles, FAQs, checklists, compliance calendar and calculators on this website explain the law in general
        terms. Your facts can change the answer, sometimes completely. Before acting on anything here, speak to us or
        another Chartered Accountant about your situation.
      </p>
    ),
  },
  {
    id: 'changes-in-the-law',
    title: 'Changes in the law',
    content: (
      <>
        <p>
          Tax and compliance rules change often, sometimes overnight through a notification or circular. Each article
          shows the date it was published and reflects the law as we understood it then.
        </p>
        <p>
          The government can extend the due dates shown in our compliance calendar. Check the official portal before
          relying on a date.
        </p>
      </>
    ),
  },
  {
    id: 'calculators',
    title: 'Calculators',
    content: (
      <p>
        Calculator results are estimates, based on what you enter and the assumptions stated on each calculator. They
        aren’t a computation of your tax and shouldn’t be used to file a return.
      </p>
    ),
  },
  {
    id: 'no-client-relationship',
    title: 'No client relationship',
    content: (
      <p>
        Reading this website or getting in touch with us doesn’t make you our client. That begins only when we agree the
        scope and fee of the work in an engagement letter.
      </p>
    ),
  },
  {
    id: 'icai-rules',
    title: 'The ICAI’s rules',
    content: (
      <p>
        This website gives factual information about the firm and its services, as the Institute of Chartered
        Accountants of India permits. It isn’t an advertisement or an attempt to solicit work, and the information is
        here for people who look for it.
      </p>
    ),
  },
  {
    id: 'other-websites',
    title: 'Other websites',
    content: (
      <p>
        Links to government portals and other websites are given for convenience. We don’t control those websites and
        aren’t responsible for what they say.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Liability',
    content: (
      <p>
        As far as the law allows, {CONTACT_INFO.name} isn’t responsible for any loss arising from a decision made on the
        strength of the general information on this website.
      </p>
    ),
  },
];

const Disclaimer: React.FC = () => (
  <>
    {/* SEO-3: legal pages previously rendered no metadata despite being in
        the sitemap. */}
    <SEO
      title="Disclaimer | Sagar H R & Co."
      description="What the information on the Sagar H R & Co. website is and isn't: general information on tax and compliance, not advice on your situation."
      canonicalUrl="https://casagar.co.in/disclaimer"
      breadcrumbs={[
        { name: 'Home', url: '/' },
        { name: 'Disclaimer', url: '/disclaimer' },
      ]}
    />
    <LegalPage
      title="Disclaimer"
      intro="What the information on this website is, and what it isn’t."
      sections={SECTIONS}
    />
  </>
);

export default Disclaimer;
