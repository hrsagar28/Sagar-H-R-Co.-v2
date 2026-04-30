import React, { useEffect, useMemo } from 'react';
import SEO from '../components/SEO';
import { PageHero } from '../components/hero';
import { CONTACT_INFO } from '../constants';
import { Cta } from './about/Cta';
import { HowWeWork } from './about/HowWeWork';
import { Principal } from './about/Principal';
import { Snapshot } from './about/Snapshot';
import { Values } from './about/Values';
import { ABOUT_OG_IMAGE, aboutBreadcrumbs, buildAboutSchema } from './about/schema';
import { warmContactRoute } from './about/warmContact';

const ordinalSuffix = (value: number) => {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return 'th';

  switch (value % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

const About: React.FC = () => {
  const schema = useMemo(() => buildAboutSchema(CONTACT_INFO), []);
  const heroBlurb = useMemo(() => {
    const establishedYear = Number(CONTACT_INFO.stats.established);
    const yearsInPractice = Number.isFinite(establishedYear)
      ? Math.max(new Date().getFullYear() - establishedYear + 1, 1)
      : 1;

    return `Sagar H R practises as the sole proprietor of the firm. ACA member of the ICAI; ${yearsInPractice}${ordinalSuffix(yearsInPractice)} year of practice.`;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const warmCommonChunks = () => {
      if (cancelled) return;

      warmContactRoute();
    };

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(warmCommonChunks, { timeout: 2000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = window.setTimeout(warmCommonChunks, 1500);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div data-zone="editorial" className="zone-bg min-h-screen">
      <SEO
        title={`${CONTACT_INFO.name} - Chartered Accountants in Mysuru | About the Firm & Principal`}
        description={`${CONTACT_INFO.founder.name}, ACA, leads ${CONTACT_INFO.name} from Mysuru - a small practice in audit, tax, GST and ROC compliance. Read about how we work.`}
        ogType="profile"
        ogImage={ABOUT_OG_IMAGE}
        schema={schema}
        breadcrumbs={aboutBreadcrumbs}
      />

      <PageHero
        variant="directory"
        eyebrow="About"
        title={<>On the principal, <em>briefly</em>.</>}
        blurb={heroBlurb}
        coordinates="Mysuru - Est. MMXXIII"
        ghostWord="Firm."
        contacts={[
          { label: 'Principal', value: CONTACT_INFO.founder.name },
          { label: 'Credential', value: 'ACA' },
          { label: 'Office', value: CONTACT_INFO.address.city },
        ]}
        accentTone="brass"
      />

      <Snapshot />
      <HowWeWork />
      <Values />
      <Principal />
      <Cta />
    </div>
  );
};

export default About;
