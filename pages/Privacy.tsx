import React from 'react';
import SEO from '../components/SEO';
import LegalPage, { ContactCard, LegalTable, type LegalSection } from '../components/redesign/LegalPage';
import { CONTACT_INFO } from '../constants';
import { PAGE_META } from '../constants/pageMeta';

// 2026 redesign of /privacy. Rendered inside RedesignLayout, which supplies the
// top bar, footer and stylesheet. Written to meet the IT Act, 2000 and its 2011
// SPDI Rules (in force until 13 May 2027) and the DPDP Act, 2023, whose main
// provisions apply from that date.

const email = <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>;
const address = CONTACT_INFO.address.lines.join(', ');
const phone = <span className="tnum">{CONTACT_INFO.phone.display}</span>;

const SECTIONS: LegalSection[] = [
  {
    id: 'who-we-are',
    title: 'Who we are',
    content: (
      <>
        <p>
          {CONTACT_INFO.name} is a firm of Chartered Accountants in Mysuru, registered with the Institute of Chartered
          Accountants of India (firm registration no. {CONTACT_INFO.firmRegistrationNo}). CA Sagar H R runs it as
          proprietor.
        </p>
        <p>
          In this policy, “we” means the firm. “You” means anyone whose details we receive: visitors to casagar.co.in,
          people who get in touch, job applicants and clients.
        </p>
        <p>
          The policy is written to meet the Information Technology Act, 2000 and its 2011 rules on sensitive personal
          information, and the Digital Personal Data Protection Act, 2023, whose main provisions apply from 13 May 2027.
        </p>
      </>
    ),
  },
  {
    id: 'what-we-collect',
    title: 'What we collect',
    content: (
      <>
        <LegalTable
          rows={[
            [
              'Contact form',
              'Your name, mobile number and email address, your business or firm name if you give it, the topic you pick and your message.',
            ],
            [
              'Careers form',
              'Your name, father’s name, date of birth, mobile number, email address, qualifications, work experience, previous employers, the role you’re applying for and why you want to join.',
            ],
            ['Email, phone and WhatsApp', 'Whatever you choose to send or tell us.'],
            [
              'Client work',
              'What the work needs. Depending on the engagement this can include PAN and Aadhaar details, bank statements, books of account, income and investment details, and passwords for tax and government portals if you choose to share them with us.',
            ],
            [
              'Visiting the website',
              'Your IP address, browser and device type, and the pages you request. Our hosting provider records these to deliver and protect the site.',
            ],
          ]}
        />
        <p>
          Please don’t send PAN, Aadhaar, bank details or passwords through the contact form. We’ll ask for what we need
          once we’ve agreed to work together.
        </p>
      </>
    ),
  },
  {
    id: 'why-we-use-it',
    title: 'Why we use it',
    content: (
      <>
        <ul>
          <li>To reply to your enquiry and discuss the work you need.</li>
          <li>To consider your application for a job or internship.</li>
          <li>
            To do the work you engage us for: preparing and filing returns, audits, registrations, replies to notices
            and the like.
          </li>
          <li>
            To meet our own legal and professional duties, including keeping records as tax law and the ICAI’s rules
            require.
          </li>
          <li>To keep the website working and secure.</li>
        </ul>
        <p>
          When you send us a message, you agree to our using your details to reply. For client work, the engagement
          letter records your agreement to our using the information the work needs. We don’t send marketing emails or
          newsletters.
        </p>
      </>
    ),
  },
  {
    id: 'cookies-and-your-browser',
    title: 'Cookies and your browser',
    content: (
      <>
        <p>
          This website sets no cookies of its own and runs no analytics, advertising or tracking tools. It does keep a
          few small items in your browser. They stay on your device and are never sent to us.
        </p>
        <ul>
          <li>When you last sent a form, so that one browser can’t send dozens in a row.</li>
          <li>
            An unfinished contact or careers form, encrypted, so that reloading the page doesn’t lose it. It is deleted
            when you close the browser tab.
          </li>
          <li>
            Where you were on each page, so that the back button returns you there. It is deleted when you close the
            browser tab.
          </li>
        </ul>
        <p>
          The map of our office, on the home page and the Contact page, comes from Google. When it loads, Google
          receives your IP address and may set its own cookies under Google’s privacy policy.
        </p>
        <p>Clearing your browser’s data for this site removes everything listed above.</p>
      </>
    ),
  },
  {
    id: 'who-else-sees-it',
    title: 'Who else sees it',
    content: (
      <>
        <LegalTable
          rows={[
            ['Netlify', 'Hosts this website.'],
            ['FormSubmit', 'Delivers contact and careers form messages to our email inbox.'],
            ['Google', 'Runs our email (Google Workspace) and the map on the home page and the Contact page.'],
            [
              'Government departments',
              'When the work requires it, for example filing returns with the Income Tax Department or on the GST and MCA portals.',
            ],
            [
              'The ICAI',
              'When our work is checked under the ICAI’s peer review or quality review, under its confidentiality rules.',
            ],
            ['Courts, regulators and police', 'Only when the law requires us to disclose information.'],
          ]}
        />
        <p>
          Some of these providers store data on servers outside India. Apart from the above, we share your information
          only with your permission.
        </p>
      </>
    ),
  },
  {
    id: 'how-long-we-keep-it',
    title: 'How long we keep it',
    content: (
      <>
        <LegalTable
          rows={[
            ['Enquiries that don’t lead to work', 'Up to two years after our last contact.'],
            ['Job and internship applications', 'Up to one year after we decide on the application.'],
            [
              'Client records and working papers',
              'As long as tax, GST and company law and the ICAI’s rules require, and after that for as long as a claim or proceeding about the work could still arise.',
            ],
            ['Website logs', 'For the short period our hosting provider keeps them.'],
            ['Form drafts in your browser', 'Until you close the browser tab.'],
          ]}
        />
        <p>After that, we delete the information.</p>
      </>
    ),
  },
  {
    id: 'how-we-protect-it',
    title: 'How we protect it',
    content: (
      <>
        <p>
          The website uses an encrypted connection (HTTPS), and form messages reach our inbox over encrypted
          connections. Inside the firm, only the people working on your matter see your information, and all of us are
          bound by the confidentiality rules of the ICAI Code of Ethics. Client files are kept in systems with access
          controls.
        </p>
        <p>If a breach exposes your information, we will tell you and report it as the law requires.</p>
      </>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    content: (
      <>
        <p>You can ask us to:</p>
        <ul>
          <li>tell you what personal information we hold about you, with a summary of it;</li>
          <li>correct or update it;</li>
          <li>delete it, unless the law requires us to keep it;</li>
          <li>
            stop using it, by withdrawing your consent. If you’re a client, this may mean we can’t continue the work.
          </li>
        </ul>
        <p>
          From 13 May 2027 you can also nominate someone to use these rights for you if you die or can’t act yourself.
        </p>
        <p>
          Write to {email} from the email address you used with us. We reply within one month. If you aren’t satisfied
          with our reply, write to our grievance officer (section 10). From 13 May 2027 you can also complain to the
          Data Protection Board of India.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    title: 'Children',
    content: (
      <p>
        This website isn’t meant for children, and we don’t knowingly collect children’s details through it. When client
        work involves a child, such as a minor’s income or investments, we take instructions from the parent or
        guardian.
      </p>
    ),
  },
  {
    id: 'grievance-officer',
    title: 'Grievance officer',
    content: (
      <>
        <ContactCard
          name="CA Sagar H R"
          position="Proprietor and grievance officer"
          lines={[
            ['Email', email],
            ['Phone', phone],
            ['Address', `${CONTACT_INFO.name}, ${address}`],
          ]}
        />
        <p>We respond to complaints within one month of receiving them.</p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    content: (
      <p>When we change this policy, we’ll post the new version here and update the date at the top of the page.</p>
    ),
  },
];

const Privacy: React.FC = () => (
  <>
    {/* SEO-3: legal pages previously rendered no metadata despite being in
        the sitemap. */}
    <SEO
      title={PAGE_META.privacy.title}
      description={PAGE_META.privacy.description}
      canonicalUrl="https://casagar.co.in/privacy"
      breadcrumbs={[
        { name: 'Home', url: '/' },
        { name: 'Privacy Policy', url: '/privacy' },
      ]}
    />
    <LegalPage title="Privacy policy" sections={SECTIONS} />
  </>
);

export default Privacy;
