import React, { useState } from 'react';
import SEO from '../components/SEO';
import ApplicationForm, { ANY_ROLE } from '../components/redesign/ApplicationForm';
import { ArrowRight } from '../components/redesign/icons';
import { useReducedMotion } from '../hooks';
import { CONTACT_INFO } from '../constants';
import { careersMeta } from '../constants/pageMeta';
import { CAREERS_APPLY_URL, CAREERS_RESPONSE_TIME, getOpenRoles, type JobPosting } from '../constants/careers';

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
    heading: 'Varied work',
    text: 'Our work includes audits, GST, income tax and company filings, so you’ll rarely do the same thing all week.',
  },
  {
    heading: 'Audit fieldwork',
    text: 'Audits may be done at the client’s office, so you’ll at times be out at clients in Mysuru and the nearby districts.',
  },
  {
    heading: 'Time for your exams',
    text: 'Articled assistants get study leave as the ICAI allows, and we keep your exam dates in mind when planning work.',
  },
];

const AFTER_YOU_APPLY = [
  {
    heading: 'We read your application',
    text: `If your background fits the role, we call you within ${CAREERS_RESPONSE_TIME}.`,
  },
  { heading: 'We meet at the office', text: 'You meet CA Sagar H R to talk about your experience and the work.' },
  {
    heading: 'You receive a written offer',
    text: 'It sets out the role, start date and pay. For articleship, we then register your training with the ICAI.',
  },
];

const Careers: React.FC = () => {
  // Roles hide themselves once their closing date has passed (CT-8).
  const [openRoles] = useState(getOpenRoles);
  const meta = careersMeta(openRoles.map((role) => role.role));
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
        title={meta.title}
        description={meta.description}
        canonicalUrl="https://casagar.co.in/careers"
        ogImage={meta.ogImage}
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
              We’re a firm of Chartered Accountants in Mysuru. You’ll work alongside CA Sagar H R on client files.
            </p>
          </div>
        </div>
      </div>

      <div className="cdoc pad">
        <section className="sec" aria-labelledby="roles-heading">
          <div className="sec-h">
            <h2 id="roles-heading">Open roles</h2>
            {openRoles.length === 0 && <p className="desc">New roles are listed here when they open.</p>}
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
                              {index < role.meta.length - 1 ? ' · ' : ''}
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
            Questions about a role? Email <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>
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
