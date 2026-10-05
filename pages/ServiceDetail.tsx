import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import NotFound from './NotFound';
import { RD_HOURS_SUMMARY } from '../components/redesign/content';
import { ArrowLeft, ArrowRight } from '../components/redesign/icons';
import { CONTACT_INFO, FAQS, LEGACY_SERVICE_SLUGS, SERVICE_PAGES, getServicePage } from '../constants';

// 2026 redesign of /services/:slug. Rendered inside RedesignLayout, which
// supplies the top bar, footer and stylesheet.

const FAQ_QUESTIONS = new Map(FAQS.map((faq) => [faq.id, faq.question]));
const SERVICE_LINK = /\{([a-z-]+)\|([^}]+)\}/g;

/** Turns `{slug|label}` in the service text into a link to that service. */
const withServiceLinks = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(SERVICE_LINK)) {
    const [whole, slug, label] = match;
    const at = match.index ?? 0;
    if (at > last) {
      parts.push(text.slice(last, at));
    }
    parts.push(
      <Link key={`${slug}-${at}`} to={`/services/${slug}`}>
        {label}
      </Link>,
    );
    last = at + whole.length;
  }
  if (last < text.length) {
    parts.push(text.slice(last));
  }
  return parts;
};

const ServiceDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const renamed = slug ? LEGACY_SERVICE_SLUGS[slug] : undefined;
  if (renamed) {
    return <Navigate to={`/services/${renamed}`} replace />;
  }

  const page = getServicePage(slug);
  if (!page) {
    return (
      <NotFound
        title="Service not found"
        intro="This page is not one of our services. The full list is on the Services page."
        description="This service page does not exist."
      />
    );
  }

  const questions = page.faqIds.flatMap((id) => {
    const question = FAQ_QUESTIONS.get(id);
    return question ? [{ id, question }] : [];
  });
  const others = SERVICE_PAGES.filter((other) => other.slug !== page.slug);

  return (
    <div className="rd-page">
      <SEO
        title={`${page.name} | ${CONTACT_INFO.name}`}
        description={page.intro}
        canonicalUrl={`https://casagar.co.in/services/${page.slug}`}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Services', url: '/services' },
          { name: page.name, url: `/services/${page.slug}` },
        ]}
        service={{ name: page.name, description: page.intro, areaServed: 'Mysuru, Karnataka' }}
      />

      <div className="phead">
        <div className="grain" aria-hidden="true" />
        <div className={`hgrid open pad ${questions.length ? '' : 'solo'}`}>
          <div>
            <Link className="crumb rise" to="/services">
              <ArrowLeft />
              All services
            </Link>
            <h1 className="rise">{page.name}</h1>
            <p className="hsub rise d1">{page.intro}</p>
            <p className="often rise d2">
              Frequency: <b>{page.frequency}</b>
            </p>
          </div>
          {questions.length > 0 && (
            <div className="rise d2">
              <p className="lbl" id="service-faq-heading">
                Common questions
              </p>
              <ul className="most" aria-labelledby="service-faq-heading">
                {questions.map(({ id, question }) => (
                  <li key={id}>
                    <Link to={`/faqs#${id}`}>
                      <span>{question}</span>
                      <ArrowRight size={18} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="sdoc pad">
        <section className="sec" aria-labelledby="scope-heading">
          <div className="sec-h">
            <h2 id="scope-heading">Scope of work</h2>
            <p className="desc">{withServiceLinks(page.incdesc)}</p>
          </div>
          <ul className="inc">
            {page.inc.map(([heading, text]) => (
              <li key={heading}>
                <h3>{heading}</h3>
                <p>{withServiceLinks(text)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="sec" aria-labelledby="documents-heading">
          <div className="sec-h">
            <h2 id="documents-heading">Documents and information</h2>
            <p className="desc">
              Usually required at the start. We will request anything further as the work proceeds.
            </p>
          </div>
          <ul className="needs">
            {page.needs.map((need) => (
              <li key={need}>{withServiceLinks(need)}</li>
            ))}
          </ul>
        </section>

        <nav className="others" aria-labelledby="other-services-heading">
          <p className="lbl" id="other-services-heading">
            Other services
          </p>
          <ul>
            {others.map((other) => (
              <li key={other.slug}>
                <Link to={`/services/${other.slug}`}>
                  <span>{other.name}</span>
                  <ArrowRight />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <section className="ask pad" aria-labelledby="ask-heading">
        <div className="ask-in">
          <div>
            <h2 id="ask-heading">Ask us about {page.ask}</h2>
            <p>Send us a message describing your requirement, or call during office hours, {RD_HOURS_SUMMARY}.</p>
          </div>
          <div className="ask-acts">
            <Link className="btn btn-c" to={`/contact?subject=${page.slug}#write`}>
              <span>Send us a message</span>
              <ArrowRight />
            </Link>
            <a className="tel" href={`tel:${CONTACT_INFO.phone.value}`}>
              {CONTACT_INFO.phone.display}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceDetail;
