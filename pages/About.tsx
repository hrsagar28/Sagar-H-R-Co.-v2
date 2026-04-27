import React, { useEffect, useMemo } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import SEO from '../components/SEO';
import { PageHero } from '../components/hero';
import { CONTACT_INFO } from '../constants';
import { Cta } from './about/Cta';
import { HowWeWork } from './about/HowWeWork';
import { Office } from './about/Office';
import { Principal } from './about/Principal';
import { Snapshot } from './about/Snapshot';
import { Values } from './about/Values';
import { ABOUT_OG_IMAGE, aboutBreadcrumbs, buildAboutSchema } from './about/schema';

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
      ? Math.max(new Date().getFullYear() - establishedYear, 1)
      : 1;

    return `Sagar H R practises as the sole proprietor of the firm. ACA member of the ICAI; ${yearsInPractice}${ordinalSuffix(yearsInPractice)} year of practice. He reads every working paper and signs every certificate.`;
  }, []);

  useEffect(() => {
    const existing = document.querySelector<HTMLLinkElement>('link[rel="prefetch"][href="/contact"]');
    if (existing) return undefined;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = '/contact';
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, []);

  return (
    <div className="min-h-screen zone-bg zone-text selection:bg-brand-moss selection:text-zone-text">
      <SEO
        title={`${CONTACT_INFO.name} - Chartered Accountants in Mysuru | About the Firm & Principal`}
        description={`${CONTACT_INFO.founder.name}, ACA, leads ${CONTACT_INFO.name} from Mysuru - a small practice in audit, tax, GST and ROC compliance. Read about how we work.`}
        ogType="profile"
        ogImage={ABOUT_OG_IMAGE}
        schema={schema}
        breadcrumbs={aboutBreadcrumbs}
      />

      <div className="container mx-auto max-w-7xl px-4 md:px-6 pt-28 md:pt-32">
        <Breadcrumbs items={[{ label: 'About' }]} />
      </div>

      <PageHero
        variant="folio"
        number="I."
        eyebrow="Principal / 01"
        title={<>On the principal, <em>briefly</em>.</>}
        blurb={heroBlurb}
        sideText="Mysuru - Est. MMXXIII"
        accentTone="brass"
      />

      <Snapshot />
      <HowWeWork />
      <Values />
      <Principal />
      <Office />
      <Cta />
    </div>
  );
};

export default About;
