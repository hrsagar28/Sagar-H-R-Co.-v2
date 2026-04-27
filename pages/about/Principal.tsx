import React from 'react';
import { ExternalLink } from 'lucide-react';
import OptimizedImage from '../../components/OptimizedImage';
import { CONTACT_INFO } from '../../constants';

export const Principal: React.FC = () => {
  const { founder } = CONTACT_INFO;

  return (
    <section id="principal" aria-labelledby="principal-heading" className="py-24 px-4 md:px-6 zone-bg">
      <div className="container mx-auto max-w-7xl">
        <div className="zone-surface rounded-bento border zone-border overflow-hidden flex flex-col lg:flex-row">
          <div className="lg:w-2/5 p-10 flex items-center justify-center border-b lg:border-b-0 lg:border-r zone-border">
            <div className="w-32 h-40 relative rounded-card border zone-border shadow-sm overflow-hidden zone-bg">
              <OptimizedImage
                src="/images/founder/founder-480.jpg"
                srcWebp="/images/founder/founder-480.webp"
                srcWebpSet="/images/founder/founder-320.webp 320w, /images/founder/founder-480.webp 480w, /images/founder/founder-640.webp 640w"
                srcAvif="/images/founder/founder-480.avif"
                srcAvifSet="/images/founder/founder-320.avif 320w, /images/founder/founder-480.avif 480w, /images/founder/founder-640.avif 640w"
                srcSet="/images/founder/founder-320.jpg 320w, /images/founder/founder-480.jpg 480w, /images/founder/founder-640.jpg 640w"
                sizes="(min-width: 1024px) 240px, (min-width: 640px) 200px, 160px"
                alt="Portrait of CA Sagar H R, Principal Partner."
                width={480}
                height={600}
                aspectRatio="4/5"
                priority
                className="w-full h-full"
                imgClassName="object-cover"
              />
            </div>
          </div>

          <div className="lg:w-3/5 p-10 md:p-16 flex flex-col justify-center">
            <span className="text-zone-accent font-bold tracking-widest uppercase text-xs mb-4 block">Principal Partner</span>
            <h2 id="principal-heading" className="text-4xl md:text-6xl font-heading font-bold zone-text mb-2">{founder.name}</h2>
            <p className="text-zone-text-muted font-bold text-sm uppercase tracking-widest mb-8">ACA</p>

            <div className="space-y-6 text-lg text-zone-text-muted/90 font-medium leading-relaxed max-w-prose">
              <p>{founder.bio}</p>
              <blockquote className="border-l-2 zone-border pl-6 italic text-zone-text">
                <p>{founder.quote}</p>
                <footer className="mt-2 not-italic text-sm text-zone-text-muted">
                  - {founder.name}, {founder.title}
                </footer>
              </blockquote>
            </div>

            <div className="mt-12 pt-10 border-t zone-border grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold zone-text mb-3">Expertise</h3>
                <ul className="text-sm text-zone-text-muted/90 space-y-2 list-disc pl-5">
                  {founder.specializations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold zone-text mb-3">Credentials</h3>
                <dl className="text-sm text-zone-text-muted/90 space-y-3">
                  <div>
                    <dt className="font-bold text-zone-text">ICAI M.No.</dt>
                    <dd>{founder.icaiMembershipNo}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-zone-text">Affiliation</dt>
                    <dd>Associate Member, ICAI</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-zone-text">Branch</dt>
                    <dd>Mysuru Branch, SIRC</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-zone-text">LinkedIn</dt>
                    <dd>
                      <a
                        href={CONTACT_INFO.social.linkedin}
                        target="_blank"
                        rel="me noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-zone-accent hover:text-zone-text transition-colors"
                      >
                        View profile
                        <ExternalLink size={13} aria-hidden="true" focusable="false" />
                        <span className="sr-only"> (opens in new tab)</span>
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
