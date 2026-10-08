import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import LegalPage, { ContactCard, type LegalSection } from '../components/redesign/LegalPage';
import { CONTACT_INFO } from '../constants';
import { PAGE_META } from '../constants/pageMeta';

// 2026 redesign of /terms. Rendered inside RedesignLayout, which supplies the
// top bar, footer and stylesheet.

const email = <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>;
const phone = <span className="tnum">{CONTACT_INFO.phone.display}</span>;

const SECTIONS: LegalSection[] = [
  {
    id: 'these-terms',
    title: 'These terms',
    content: (
      <>
        <p>
          These terms apply when you use casagar.co.in, the website of {CONTACT_INFO.name}, Chartered Accountants. By
          using the website you accept them.
        </p>
        <p>
          If you’re a client, your engagement letter governs our work for you. Where it differs from these terms, the
          engagement letter applies.
        </p>
      </>
    ),
  },
  {
    id: 'the-information-here',
    title: 'The information here',
    content: (
      <p>
        Our articles, FAQs, checklists, compliance calendar and calculators explain tax and compliance in general terms.
        They aren’t advice on your situation, and the law may have changed since they were written. Our{' '}
        <Link to="/disclaimer">disclaimer</Link> says more.
      </p>
    ),
  },
  {
    id: 'becoming-a-client',
    title: 'Becoming a client',
    content: (
      <p>
        Sending us a message, calling or writing to us doesn’t make you our client. We take on responsibility for your
        work only once we’ve agreed the scope and fee in an engagement letter.
      </p>
    ),
  },
  {
    id: 'using-the-website',
    title: 'Using the website',
    content: (
      <>
        <p>You may:</p>
        <ul>
          <li>read and use the website for yourself or your business;</li>
          <li>share links to any page;</li>
          <li>quote short extracts, with credit to {CONTACT_INFO.name} and a link to the page.</li>
        </ul>
        <p>You may not:</p>
        <ul>
          <li>copy or republish our articles, checklists or tools in full;</li>
          <li>collect content in bulk using automated tools;</li>
          <li>try to break into, overload or interfere with the website;</li>
          <li>send spam, harmful code or false information through our forms, or pretend to be someone else.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'calculators',
    title: 'Calculators',
    content: (
      <p>
        Our calculators give estimates from the figures you enter and the rules stated on each one. They’re for
        illustration and don’t replace a full computation. What you enter stays in your browser; we don’t receive it.
      </p>
    ),
  },
  {
    id: 'copyright',
    title: 'Copyright',
    content: (
      <p>
        The text, articles, checklists and design of this website belong to {CONTACT_INFO.name} unless we say otherwise.
        Acts, notifications and government forms we quote belong to their publishers.
      </p>
    ),
  },
  {
    id: 'links-to-other-websites',
    title: 'Links to other websites',
    content: (
      <p>
        We link to government portals and other sources for convenience. We don’t control those websites and aren’t
        responsible for what they contain.
      </p>
    ),
  },
  {
    id: 'availability',
    title: 'Availability',
    content: (
      <p>
        We try to keep the website available and up to date, but we may change, suspend or remove any part of it without
        notice.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Liability',
    content: (
      <>
        <p>
          As far as the law allows, we aren’t liable for any loss caused by relying on the general information or
          calculators on this website, or by the website being unavailable.
        </p>
        <p>
          This doesn’t limit our responsibility for work done under an engagement letter, or any liability the law
          doesn’t allow us to exclude.
        </p>
      </>
    ),
  },
  {
    id: 'law-and-courts',
    title: 'Law and courts',
    content: (
      <p>
        These terms are governed by the laws of India. The courts at Mysuru, Karnataka have exclusive jurisdiction over
        any dispute about them.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    content: <p>We may update these terms by posting a new version here with a new date at the top of the page.</p>,
  },
  {
    id: 'contact',
    title: 'Contact',
    content: (
      <ContactCard
        name={CONTACT_INFO.name}
        position={`${CONTACT_INFO.tagline} · ICAI firm registration no. ${CONTACT_INFO.firmRegistrationNo}`}
        lines={[
          ['Email', email],
          ['Phone', phone],
          ['Address', CONTACT_INFO.address.lines.join(', ')],
        ]}
      />
    ),
  },
];

const Terms: React.FC = () => (
  <>
    {/* SEO-3: legal pages previously rendered no metadata despite being in
        the sitemap. */}
    <SEO
      title={PAGE_META.terms.title}
      description={PAGE_META.terms.description}
      canonicalUrl="https://casagar.co.in/terms"
      breadcrumbs={[
        { name: 'Home', url: '/' },
        { name: 'Terms of Service', url: '/terms' },
      ]}
    />
    <LegalPage title="Terms of service" sections={SECTIONS} />
  </>
);

export default Terms;
