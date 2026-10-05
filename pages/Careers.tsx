import React, { useState } from 'react';
import SEO from '../components/SEO';
import ApplicationForm, { ANY_ROLE } from '../components/redesign/ApplicationForm';
import { ArrowRight } from '../components/redesign/icons';
import { useReducedMotion } from '../hooks';
import { CONTACT_INFO } from '../constants';
import {
  CAREERS_APPLY_URL,
  CAREERS_CONTACT_EMAIL,
  CAREERS_RESPONSE_TIME,
  getOpenRoles,
  type JobPosting,
} from '../constants/careers';

// 2026 redesign of /careers. Rendered inside RedesignLayout, which supplies the
// top bar, footer and stylesheet.

const EMPLOYMENT_TYPE_MAP = {
  'Full Time': 'FULL_TIME',
  'Part Time': 'PART_TIME',
  Internship: 'INTERN',
  Contract: 'CONTRACTOR',
} as const;

const buildJobPostingDescription = (role: JobPosting) => {
  const responsibilities = role.responsibilities.map((item) => `<li>${item}</li>`).join('');
  const skills = role.skills.map((item) => `<li>${item}</li>`).join('');
  const residenceRequirement = role.residenceRequirement ? `<p>${role.residenceRequirement}</p>` : '';

  return [
    `<p>${role.description}</p>`,
    residenceRequirement,
    '<h4>What you’ll do</h4>',
    `<ul>${responsibilities}</ul>`,
    '<h4>What we look for</h4>',
    `<ul>${skills}</ul>`,
  ].join('');
};

const buildJobPostingSchema = (roles: JobPosting[]) =>
  roles.map((role) => ({
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: role.role,
    description: buildJobPostingDescription(role),
    datePosted: role.datePosted,
    validThrough: role.applicationDeadline,
    employmentType: EMPLOYMENT_TYPE_MAP[role.type],
    url: `https://casagar.co.in/careers#${role.id}`,
    directApply: true,
    applyUrl: CAREERS_APPLY_URL,
    hiringOrganization: {
      '@type': 'Organization',
      name: CONTACT_INFO.name,
      url: 'https://casagar.co.in',
      sameAs: 'https://casagar.co.in',
      logo: 'https://casagar.co.in/logo.png',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: CONTACT_INFO.address.street,
        addressLocality: CONTACT_INFO.address.city,
        addressRegion: CONTACT_INFO.address.state,
        postalCode: CONTACT_INFO.address.zip,
        addressCountry: 'IN',
      },
    },
    ...(role.workMode !== 'On-site' ? { jobLocationType: 'TELECOMMUTE' } : {}),
    applicantLocationRequirements:
      role.applicantLocationType === 'City'
        ? { '@type': 'City', name: role.applicantLocationName }
        : { '@type': 'Country', name: 'IN' },
  }));

const WORKING_HERE = [
  {
    heading: 'Every kind of file',
    text: 'Audits of companies, trusts, schools and colleges, GST and income tax, company and LLP filings. Most weeks bring more than one.',
  },
  {
    heading: 'Audit fieldwork',
    text: 'Audits take you to clients across Mysuru and the neighbouring districts, not just the office desk.',
  },
  {
    heading: 'Time for your exams',
    text: 'For articled assistants: study leave as the ICAI allows, with your exam dates kept in mind when work is planned.',
  },
];

const AFTER_YOU_APPLY = [
  {
    heading: 'We read your application',
    text: `If your background fits the role, we call you within ${CAREERS_RESPONSE_TIME}.`,
  },
  { heading: 'A conversation at the office', text: 'With CA Sagar H R, about your experience and the work.' },
  {
    heading: 'An offer in writing',
    text: 'With the role, start date and pay. For articleship, we then register the training with the ICAI.',
  },
];

const rolesSentence = (count: number) =>
  count === 1
    ? 'The role is at our office in Mysuru.'
    : `${count === 2 ? 'Both' : 'All'} roles are at our office in Mysuru.`;

const Careers: React.FC = () => {
  // Roles hide themselves once their closing date has passed (CT-8).
  const [openRoles] = useState(getOpenRoles);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(openRoles.map((role) => role.id)));
  const [chosenRole, setChosenRole] = useState(() => (openRoles.length ? '' : ANY_ROLE));
  const prefersReducedMotion = useReducedMotion();

  const toggleRole = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // "Apply for this role": choose it on the form and go there. On phones the
  // form sits below "After you apply", so go to the form itself.
  const applyFor = (role: string) => {
    setChosenRole(role);
    const narrow = window.matchMedia('(max-width: 900px)').matches;
    const target = document.getElementById(narrow ? 'apply-form' : 'apply');
    target?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    window.setTimeout(
      () => document.getElementById('apply-fullName')?.focus({ preventScroll: true }),
      prefersReducedMotion ? 0 : 600,
    );
  };

  return (
    <div className="rd-page">
      <SEO
        title={`Careers | ${CONTACT_INFO.name}`}
        description={
          openRoles.length
            ? `Open roles at ${CONTACT_INFO.name}, Chartered Accountants, Mysuru: ${openRoles.map((role) => role.role).join(' and ')}.`
            : `Careers at ${CONTACT_INFO.name}, Chartered Accountants, Mysuru. No roles are open right now; you can still send us your details.`
        }
        canonicalUrl="https://casagar.co.in/careers"
        ogImage="https://casagar.co.in/og-careers.png"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Careers', url: '/careers' },
        ]}
        schema={buildJobPostingSchema(openRoles)}
      />

      <div className="phead">
        <div className="grain" aria-hidden="true" />
        <div className="hgrid open solo pad">
          <div>
            <h1 className="rise">Careers</h1>
            <p className="hsub rise d1">
              We’re a small firm of Chartered Accountants on Thyagaraja Road, Mysuru. You’ll work on client files with
              CA Sagar H R, who reviews your work and explains the changes he makes.
            </p>
          </div>
        </div>
      </div>

      <div className="cdoc pad">
        <section className="sec" aria-labelledby="roles-heading">
          <div className="sec-h">
            <h2 id="roles-heading">Open roles</h2>
            <p className="desc">
              {openRoles.length ? rolesSentence(openRoles.length) : 'New roles are listed here when they open.'}
            </p>
          </div>
          <div className="qlist">
            {openRoles.map((role) => {
              const open = expanded.has(role.id);
              return (
                <div key={role.id} id={role.id} className={`qi role ${open ? 'open' : ''}`}>
                  <h3>
                    <button
                      className="qb"
                      type="button"
                      aria-expanded={open}
                      aria-controls={`${role.id}-details`}
                      onClick={() => toggleRole(role.id)}
                    >
                      <span className="q">
                        {role.role}
                        <span className="rmeta">
                          {role.meta.map((part, index) => (
                            <span key={part}>
                              {part}
                              {index < role.meta.length - 1 ? ' ·' : ''}
                            </span>
                          ))}
                        </span>
                      </span>
                      <span className="x" aria-hidden="true" />
                    </button>
                  </h3>
                  <div className="ans" id={`${role.id}-details`}>
                    <div>
                      <div className="rbody" inert={!open}>
                        <p>{role.description}</p>
                        <div className="rcols">
                          <div>
                            <h4>What you’ll do</h4>
                            <ul>
                              {role.responsibilities.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4>What we look for</h4>
                            <ul>
                              {role.skills.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <button className="btn" type="button" onClick={() => applyFor(role.role)}>
                          <span>Apply for this role</span>
                          <ArrowRight />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {openRoles.length === 0 && (
              <div className="closed">
                <h3>No roles are open right now</h3>
                <p>
                  We still read every application.{' '}
                  <a
                    href="#apply"
                    onClick={(event) => {
                      event.preventDefault();
                      applyFor(ANY_ROLE);
                    }}
                  >
                    Send us your details
                  </a>{' '}
                  and we’ll get in touch if a suitable role opens in the next year.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="next sand pad" aria-labelledby="working-here-heading">
        <h2 className="next-h" id="working-here-heading">
          Working here
        </h2>
        <ul className="steps">
          {WORKING_HERE.map((item) => (
            <li key={item.heading}>
              <h3>{item.heading}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="apply pad" id="apply">
        <div className="ainfo">
          <h2>After you apply</h2>
          <ol className="vsteps">
            {AFTER_YOU_APPLY.map((step, index) => (
              <li key={step.heading}>
                <span className="sn" aria-hidden="true">
                  {index + 1}
                </span>
                <div>
                  <h3>{step.heading}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mailto">
            Questions about a role? Email <a href={`mailto:${CAREERS_CONTACT_EMAIL}`}>{CAREERS_CONTACT_EMAIL}</a>
          </p>
        </div>

        <section className="panel fpanel" id="apply-form" aria-labelledby="apply-heading">
          <ApplicationForm roles={openRoles.map((role) => role.role)} role={chosenRole} onRoleChange={setChosenRole} />
        </section>
      </div>
    </div>
  );
};

export default Careers;
