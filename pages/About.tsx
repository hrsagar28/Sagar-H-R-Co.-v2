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
import './route-styles.css';
import '../components/hero/PageHero.css';

const HERO_BLURB =
  'A Mysuru chartered-accountancy practice for owner-led businesses and professionals. Your compliance, owned end to end.';

const About: React.FC = () => {
  const schema = useMemo(() => buildAboutSchema(CONTACT_INFO), []);

  useEffect(() => {
    let cancelled = false;

    const warmCommonChunks = () => {
      if (cancelled) return;

      warmContactRoute();
    };

    if (typeof window.requestIdleCallback === 'function') {
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

  // Audit AB-22: the editorial colour zone and dark background are applied
  // by the main element in App.tsx, so this page wrapper no longer
  // re-declares them.
  return (
    <div className="min-h-screen">
      <SEO
        title={`About — ${CONTACT_INFO.name} | Chartered Accountants, Mysuru`}
        description={`${CONTACT_INFO.founder.name}, ACA, leads ${CONTACT_INFO.name} from Mysuru - a small practice in audit, tax, GST and ROC compliance. Read about how we work.`}
        ogImage={ABOUT_OG_IMAGE}
        schema={schema}
        breadcrumbs={aboutBreadcrumbs}
      />

      <PageHero
        variant="directory"
        eyebrow="About"
        title={
          <>
            On the principal, <em>briefly</em>.
          </>
        }
        blurb={HERO_BLURB}
        coordinates="Mysuru - Est. MMXXIII"
        ghostWord="Firm."
        contacts={[
          { label: 'Principal', value: CONTACT_INFO.founder.name },
          { label: 'Credential', value: 'ACA' },
          { label: 'Office', value: CONTACT_INFO.address.city },
        ]}
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
