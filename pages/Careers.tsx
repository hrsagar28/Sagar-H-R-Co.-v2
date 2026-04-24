
import React, { useState } from 'react';
import { Briefcase, ArrowRight } from 'lucide-react';
import CareerForm from '../components/forms/CareerForm';
import SEO from '../components/SEO';
import { PageHero } from '../components/hero';
import { CONTACT_INFO } from '../constants';
import { CAREERS_APPLY_URL, OPEN_ROLES } from '../constants/careers';
import { useAnnounce } from '../hooks';

const EMPLOYMENT_TYPE_MAP = {
  'Full Time': 'FULL_TIME',
  'Part Time': 'PART_TIME',
  Internship: 'INTERN',
  Contract: 'CONTRACTOR'
} as const;

const buildJobPostingDescription = (role: typeof OPEN_ROLES[number]) => {
  const responsibilities = role.responsibilities.map((item) => `<li>${item}</li>`).join('');
  const skills = role.skills.map((item) => `<li>${item}</li>`).join('');
  const residenceRequirement = role.residenceRequirement ? `<p>${role.residenceRequirement}</p>` : '';

  return [
    `<p>${role.description}</p>`,
    residenceRequirement,
    '<h4>Responsibilities</h4>',
    `<ul>${responsibilities}</ul>`,
    '<h4>Skills</h4>',
    `<ul>${skills}</ul>`
  ].join('');
};

const Careers = (): JSX.Element => {
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const { announce } = useAnnounce();
  const careersMetaDescription = `${OPEN_ROLES.length} open roles - Audit Associate (full-time) and Articled Assistant (internship) at a Mysuru-based CA firm.`;

  const handleApplyClick = (role: string) => {
    setSelectedPosition(role);
    announce(`Application form opened for ${role}`);
    document.getElementById('form-heading')?.focus();
  };

  return (
    <div className="bg-brand-bg min-h-screen selection:bg-brand-moss selection:text-white">
      <SEO 
        title="Careers | Join Sagar H R & Co."
        description={careersMetaDescription}
        canonicalUrl="https://casagar.co.in/careers"
        ogImage="https://casagar.co.in/og-careers.png"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Careers', url: '/careers' }
        ]}
        schema={OPEN_ROLES.map((r) => ({
          "@context": "https://schema.org",
          "@type": "JobPosting",
          "title": r.role,
          "description": buildJobPostingDescription(r),
          "datePosted": r.datePosted,
          "validThrough": r.applicationDeadline,
          "employmentType": EMPLOYMENT_TYPE_MAP[r.type],
          "url": `https://casagar.co.in/careers#${r.id}`,
          "directApply": true,
          "applyUrl": CAREERS_APPLY_URL,
          "hiringOrganization": {
            "@type": "Organization",
            "name": "Sagar H R & Co.",
            "url": "https://casagar.co.in",
            "sameAs": "https://casagar.co.in",
            "logo": "https://casagar.co.in/logo.png"
          },
          "jobLocation": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": CONTACT_INFO.address.street,
              "addressLocality": CONTACT_INFO.address.city,
              "addressRegion": CONTACT_INFO.address.state,
              "postalCode": CONTACT_INFO.address.zip,
              "addressCountry": "IN"
            }
          },
          ...(r.workMode !== 'On-site' ? { "jobLocationType": "TELECOMMUTE" } : {}),
          "applicantLocationRequirements": r.applicantLocationType === 'City'
            ? {
                "@type": "City",
                "name": r.applicantLocationName
              }
            : {
                "@type": "Country",
                "name": "IN"
              }
        }))}
      />

      {/* UNIFIED HERO SECTION */}
      <PageHero
        tag="Careers"
        title={<>Work With <em>Us.</em></>}
        description="We are looking for dedicated professionals passionate about finance and accounting."
        className="z-base"
      />

      <div className="py-20 px-4 md:px-6">
       <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-32">
             
             {/* Left Column: Jobs & Application Form */}
             <div className="lg:col-span-2 space-y-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-10">
                       <div className="p-2 bg-brand-moss/10 rounded-lg"><Briefcase className="text-brand-moss" size={24} /></div>
                       <h2 id="open-positions-heading" className="text-3xl font-heading font-bold text-brand-dark">Open Positions</h2>
                    </div>
                    
                    <ul aria-labelledby="open-positions-heading" className="space-y-6">
                      {OPEN_ROLES.map((job) => (
                        <li id={job.id} key={job.id} className="p-10 bg-brand-surface rounded-[2rem] border border-brand-border hover:border-brand-moss hover:shadow-xl focus-within:border-brand-moss focus-within:shadow-xl transition-all duration-300 group relative overflow-hidden">
                           <div className="flex justify-between items-start mb-4 relative z-10">
                              <h3 className="text-2xl text-brand-dark font-heading font-bold group-hover:text-brand-moss group-focus-within:text-brand-moss transition-colors">{job.role}</h3>
                              <span className="px-4 py-1 bg-brand-bg rounded-full text-brand-stone text-[0.8rem] font-bold uppercase tracking-widest border border-brand-border group-hover:bg-brand-moss group-hover:text-white group-focus-within:bg-brand-moss group-focus-within:text-white transition-colors">{job.type}</span>
                           </div>
                           <p className="text-brand-stone text-base mb-8 font-medium relative z-10">{job.location} • {job.experience.toLowerCase() === 'fresher' ? 'Fresher' : `${job.experience} of experience`}</p>
                            <button
                               type="button"
                               onClick={() => handleApplyClick(job.role)}
                               className="flex items-center gap-2 text-brand-dark font-bold text-sm group-hover:gap-4 group-focus-visible:gap-4 transition-all relative z-10 hover:text-brand-moss focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-moss focus-visible:ring-offset-4 focus-visible:ring-offset-brand-bg rounded-md"
                            >
                              Apply Now <ArrowRight size={16} />
                            </button>
                        </li>
                      ))}
                    </ul>
                </div>

                {/* APPLICATION FORM SECTION */}
                <div id="apply" className="pt-10 scroll-mt-[var(--sticky-offset)] outline-none">
                    <CareerForm initialPosition={selectedPosition} />
                </div>
             </div>
             
              <div className="lg:col-span-1 z-base">
                <div 
                  className="bg-brand-dark text-brand-surface p-10 rounded-[2rem] shadow-xl relative overflow-hidden sticky top-[var(--sticky-offset)]"
                >
                  <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-moss/20 via-transparent to-transparent pointer-events-none"></div>
                  <div className="relative z-10">
                    <h2 className="text-2xl font-heading font-bold mb-8">Why Join Us?</h2>
                    <ul className="space-y-6 text-brand-surface/90 text-lg font-medium">
                       <li className="flex gap-4 items-center"><span className="w-2 h-2 bg-brand-moss rounded-full shadow-glow"></span>Mentorship</li>
                       <li className="flex gap-4 items-center"><span className="w-2 h-2 bg-brand-moss rounded-full shadow-glow"></span>Corporate Exposure</li>
                       <li className="flex gap-4 items-center"><span className="w-2 h-2 bg-brand-moss rounded-full shadow-glow"></span>Continuous Learning</li>
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


