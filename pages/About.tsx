import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { CONTACT_INFO } from '../constants';
import { ABOUT_OG_IMAGE, aboutBreadcrumbs, buildAboutSchema } from './about/schema';
import { warmContactRoute } from './about/warmContact';

// How an engagement runs, from the accepted quote onwards. The Contact page's
// "After you get in touch" covers the steps before it.
const ENGAGEMENT_STEPS = [
  {
    heading: 'We agree the terms in writing',
    text: 'An engagement letter sets out the scope, the fee and the timeline. Work starts once you sign it. Before accepting an audit, we write to the previous auditor, as the ICAI requires.',
  },
  {
    heading: 'You send the records',
    text: 'You get a list of what the work needs. Send it by email, or bring it to the office.',
  },
  {
    heading: 'We prepare and check the work',
    text: 'The return, accounts or report is prepared from your records and checked against the law. Sagar reviews it before it reaches you.',
  },
  {
    heading: 'You approve, we file',
    text: 'Once you approve the draft, we file it and send you the acknowledgement or the signed report.',
  },
  {
    heading: 'We track what is due next',
    text: 'Your GST, TDS, income tax and ROC dates go into our calendar, and we remind you before each one falls due.',
  },
];

const PORTRAIT_SIZES = '(min-width: 901px) 200px, 96px';

/**
 * About page (2026 redesign). A light page: RedesignLayout gives /about the
 * light header (LIGHT_HEADER_ROUTES), so only the top bar is dark. Then the
 * principal's panel, how an engagement runs on a sand band, and a closing line.
 */
const About: React.FC = () => {
  const schema = useMemo(() => buildAboutSchema(CONTACT_INFO), []);
  const { founder } = CONTACT_INFO;

  // Fetch the Contact page's code while the reader is here, so the closing
  // link opens without a wait.
  useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(warmContactRoute, { timeout: 2000 });
      return () => window.cancelIdleCallback(idleId);
    }
    const timeoutId = window.setTimeout(warmContactRoute, 1500);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div className="rd-page about">
      <SEO
        title={`About | ${CONTACT_INFO.name}`}
        description={`${CONTACT_INFO.name} is a firm of Chartered Accountants in Mysuru, set up in 2023 by ${founder.name}. Tax, audit, company law and accounting work for individuals, businesses, institutions and trusts.`}
        ogImage={ABOUT_OG_IMAGE}
        schema={schema}
        breadcrumbs={aboutBreadcrumbs}
      />

      <div className="phead">
        <div className="hgrid solo pad">
          <div>
            <h1 className="rise">About the firm</h1>
            <p className="hsub rise d1">
              {CONTACT_INFO.name} is a firm of Chartered Accountants in Mysuru, set up in 2023. We handle tax, audit,
              company law and accounting work for individuals, businesses, institutions and trusts, in English, Kannada
              and Hindi.
            </p>
          </div>
        </div>
      </div>

      <div className="pad">
        <section className="seam panel principal" aria-labelledby="principal-heading">
          <figure className="portrait">
            <picture>
              <source
                type="image/avif"
                srcSet="/images/founder-400.avif 400w, /images/founder-800.avif 800w, /images/founder-1080.avif 1080w"
                sizes={PORTRAIT_SIZES}
              />
              <source
                type="image/webp"
                srcSet="/images/founder-400.webp 400w, /images/founder-800.webp 800w, /images/founder-1080.webp 1080w"
                sizes={PORTRAIT_SIZES}
              />
              <img
                src="/images/founder-400.jpg"
                srcSet="/images/founder-400.jpg 400w, /images/founder-800.jpg 800w, /images/founder-1080.jpg 1080w"
                sizes={PORTRAIT_SIZES}
                alt={`Portrait of ${founder.name}`}
                decoding="async"
                width="1080"
                height="1440"
              />
            </picture>
          </figure>
          <div className="pname">
            <p className="lbl">Founder and principal</p>
            <h2 id="principal-heading">{founder.name}</h2>
          </div>
          <dl className="pfacts">
            <div>
              <dt>ICAI membership</dt>
              <dd>
                ACA, no. <span className="tnum">{founder.icaiMembershipNo}</span>
              </dd>
            </div>
            <div>
              <dt>Qualified</dt>
              <dd className="tnum">2023</dd>
            </div>
          </dl>
          <div className="bio">
            <p>
              I had wanted to be a Chartered Accountant for most of my life. I qualified in 2023 and set up the firm the
              same year.
            </p>
            <p>
              Before I answer a question, I read the law on it. That takes longer, and the answer is less likely to be
              wrong. Every return and report the firm prepares comes to me before it goes out.
            </p>
            <p>Outside the office, I teach CA Foundation students and write on finance, fiction and cricket.</p>
          </div>
        </section>
      </div>

      <section className="next sand pad" aria-labelledby="engagement-heading">
        <div className="flow-head">
          <h2 className="next-h" id="engagement-heading">
            How an engagement runs
          </h2>
          <p>Once you accept our quote, the work follows the same steps each time.</p>
        </div>
        <ol className="flow">
          {ENGAGEMENT_STEPS.map((step, index) => (
            <li key={step.heading}>
              <span className="sn" aria-hidden="true">
                {index + 1}
              </span>
              <h3>{step.heading}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="aclose pad">
        <p className="cta">
          To discuss your work, <Link to="/contact">send us a message</Link> or call{' '}
          <a className="tnum nowrap" href={`tel:${CONTACT_INFO.phone.value}`}>
            {CONTACT_INFO.phone.display}
          </a>
          . You can also read about <Link to="/services">our services</Link>.
        </p>
        <p className="anote">
          What you tell us stays within the firm. Under the ICAI’s rules on publicity, this website names no clients and
          shows no fees or testimonials.
        </p>
      </div>
    </div>
  );
};

export default About;
