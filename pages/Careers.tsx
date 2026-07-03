import React, { useState } from 'react';
import { Briefcase, ArrowRight } from 'lucide-react';
import CareerForm from '../components/forms/CareerForm';
import SEO from '../components/SEO';
import Reveal from '../components/Reveal';
import { PageHero } from '../components/hero';
import { CONTACT_INFO } from '../constants';
import { CAREERS_APPLY_URL, OPEN_ROLES } from '../constants/careers';
import { useAnnounce } from '../hooks';
import { staggerDelay } from '../utils/stagger';
import './route-styles.css';
import '../components/hero/PageHero.css';

const EMPLOYMENT_TYPE_MAP = {
  'Full Time': 'FULL_TIME',
  'Part Time': 'PART_TIME',
  Internship: 'INTERN',
  Contract: 'CONTRACTOR',
} as const;

const buildJobPostingDescription = (role: (typeof OPEN_ROLES)[number]) => {
  const responsibilities = role.responsibilities.map((item) => `<li>${item}</li>`).join('');
  const skills = role.skills.map((item) => `<li>${item}</li>`).join('');
  const residenceRequirement = role.residenceRequirement ? `<p>${role.residenceRequirement}</p>` : '';

  return [
    `<p>${role.description}</p>`,
    residenceRequirement,
    '<h4>Responsibilities</h4>',
    `<ul>${responsibilities}</ul>`,
    '<h4>Skills</h4>',
    `<ul>${skills}</ul>`,
  ].join('');
};

const Careers = (): React.JSX.Element => {
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const { announce } = useAnnounce();
  const careersMetaDescription = `${OPEN_ROLES.length} open roles - Audit Associate (full-time) and Articled Assistant (internship) at a Mysuru-based CA firm.`;

  const handleApplyClick = (role: string) => {
    setSelectedPosition(role);
    announce(`Application form opened for ${role}`);
    document.getElementById('form-heading')?.focus();
  };

  return (
    <div className="min-h-screen bg-brand-bg selection:bg-brand-moss selection:text-white">
      <SEO
        title="Careers | Join Sagar H R & Co."
        description={careersMetaDescription}
        canonicalUrl="https://casagar.co.in/careers"
        ogImage="https://casagar.co.in/og-careers.png"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Careers', url: '/careers' },
        ]}
        schema={OPEN_ROLES.map((r) => ({
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: r.role,
          description: buildJobPostingDescription(r),
          datePosted: r.datePosted,
          validThrough: r.applicationDeadline,
          employmentType: EMPLOYMENT_TYPE_MAP[r.type],
          url: `https://casagar.co.in/careers#${r.id}`,
          directApply: true,
          applyUrl: CAREERS_APPLY_URL,
          hiringOrganization: {
            '@type': 'Organization',
            name: 'Sagar H R & Co.',
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
          ...(r.workMode !== 'On-site' ? { jobLocationType: 'TELECOMMUTE' } : {}),
          applicantLocationRequirements:
            r.applicantLocationType === 'City'
              ? {
                  '@type': 'City',
                  name: r.applicantLocationName,
                }
              : {
                  '@type': 'Country',
                  name: 'IN',
                },
        }))}
      />

      {/* UNIFIED HERO SECTION */}
      <PageHero
        tag="Careers"
        title={
          <>
            Work With <em>Us.</em>
          </>
        }
        description="We are looking for dedicated professionals passionate about finance and accounting."
        className="z-base"
      />

      <div className="px-4 py-20 md:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-32 grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Left Column: Jobs & Application Form */}
            <div className="space-y-12 lg:col-span-2">
              <div className="space-y-6">
                <Reveal width="100%">
                  <div className="mb-10 flex items-center gap-3">
                    <div className="rounded-lg bg-brand-moss/10 p-2">
                      <Briefcase className="text-brand-moss" size={24} />
                    </div>
                    <h2 id="open-positions-heading" className="font-heading text-3xl font-bold text-brand-dark">
                      Open Positions
                    </h2>
                  </div>
                </Reveal>

                <ul aria-labelledby="open-positions-heading" className="space-y-6">
                  {OPEN_ROLES.map((job, i) => (
                    <Reveal key={job.id} width="100%" delay={staggerDelay(i)}>
                      <li
                        id={job.id}
                        className="group relative overflow-hidden rounded-[2rem] border border-brand-border bg-brand-surface p-10 transition-[border-color,box-shadow] duration-300 focus-within:border-brand-moss focus-within:shadow-xl hover:border-brand-moss hover:shadow-xl"
                      >
                        <div className="relative z-10 mb-4 flex items-start justify-between">
                          <h3 className="font-heading text-2xl font-bold text-brand-dark transition-colors group-focus-within:text-brand-moss group-hover:text-brand-moss">
                            {job.role}
                          </h3>
                          <span className="rounded-full border border-brand-border bg-brand-bg px-4 py-1 text-[0.8rem] font-bold uppercase tracking-widest text-brand-stone transition-colors group-focus-within:bg-brand-moss group-focus-within:text-white group-hover:bg-brand-moss group-hover:text-white">
                            {job.type}
                          </span>
                        </div>
                        <p className="relative z-10 mb-8 text-base font-medium text-brand-stone">
                          {job.location} •{' '}
                          {job.experience.toLowerCase() === 'fresher' ? 'Fresher' : `${job.experience} of experience`}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleApplyClick(job.role)}
                          className="relative z-10 flex items-center gap-2 rounded-md text-sm font-bold text-brand-dark transition-[color,gap] hover:text-brand-moss focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-moss focus-visible:ring-offset-4 focus-visible:ring-offset-brand-bg group-hover:gap-4 group-focus-visible:gap-4"
                        >
                          Apply Now <ArrowRight size={16} />
                        </button>
                      </li>
                    </Reveal>
                  ))}
                </ul>
              </div>

              {/* APPLICATION FORM SECTION */}
              <div id="apply" className="scroll-mt-[var(--sticky-offset)] pt-10 outline-none">
                <CareerForm initialPosition={selectedPosition} />
              </div>
            </div>

            <div className="z-base lg:col-span-1">
              <div className="relative sticky top-[var(--sticky-offset)] overflow-hidden rounded-[2rem] bg-brand-dark p-10 text-brand-surface shadow-xl">
                <div className="pointer-events-none absolute right-0 top-0 h-full w-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-moss/20 via-transparent to-transparent"></div>
                <div className="relative z-10">
                  <h2 className="mb-8 font-heading text-2xl font-bold">Why Join Us?</h2>
                  <ul className="space-y-6 text-lg font-medium text-brand-surface/90">
                    <li className="flex items-center gap-4">
                      <span className="shadow-glow h-2 w-2 rounded-full bg-brand-moss"></span>Mentorship
                    </li>
                    <li className="flex items-center gap-4">
                      <span className="shadow-glow h-2 w-2 rounded-full bg-brand-moss"></span>Corporate Exposure
                    </li>
                    <li className="flex items-center gap-4">
                      <span className="shadow-glow h-2 w-2 rounded-full bg-brand-moss"></span>Continuous Learning
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Careers;
