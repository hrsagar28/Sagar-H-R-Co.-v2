import React from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { RD_HOURS_SUMMARY } from '../components/redesign/content';
import { ArrowLeft, ArrowRight } from '../components/redesign/icons';
import { CONTACT_INFO } from '../constants';
import { CHECKLISTS, getChecklist } from '../constants/resources';
import { SITE_URL } from '../config/site';
import NotFound from './NotFound';

// 2026 redesign of /resources/checklist/:slug: what to send us for one kind of
// work, as a list that prints cleanly. Rendered inside RedesignLayout.

const ChecklistDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const checklist = getChecklist(slug);

  if (!checklist) {
    return (
      <NotFound
        title="Checklist not found"
        intro="There is no checklist at this address. The checklists are listed on the Resources page."
        description="This checklist does not exist."
      />
    );
  }

  const others = CHECKLISTS.filter((other) => other.slug !== checklist.slug);
  const contact = checklist.subject ? `/contact?subject=${checklist.subject}#write` : '/contact#write';

  return (
    <div className="rd-page">
      <SEO
        title={`${checklist.title} checklist | ${CONTACT_INFO.name}`}
        description={`${checklist.summary} The documents to send us.`}
        canonicalUrl={`${SITE_URL}/resources/checklist/${checklist.slug}`}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Resources', url: '/resources' },
          { name: checklist.title, url: `/resources/checklist/${checklist.slug}` },
        ]}
      />

      <div className="phead">
        <div className="grain" aria-hidden="true" />
        <div className="hgrid open solo pad">
          <div>
            <Link className="crumb rise" to="/resources">
              <ArrowLeft />
              All resources
            </Link>
            <h1 className="rise">{checklist.title}</h1>
            <p className="hsub rise d1">{checklist.summary} The documents to send us.</p>
            <p className="often rise d2">
              <button type="button" className="link-btn print-btn" onClick={() => window.print()}>
                Print this list
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className="sdoc pad">
        {checklist.sections.map((section, index) => (
          <section key={section.title} className="sec" aria-labelledby={`checklist-section-${index}`}>
            <div className="sec-h">
              <h2 id={`checklist-section-${index}`}>{section.title}</h2>
            </div>
            <ul className="needs">
              {section.items.map((item) => (
                <li key={item.what}>
                  <b>{item.what}</b>
                  {item.detail && <>: {item.detail}</>}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <nav className="others" aria-labelledby="other-checklists-heading">
          <p className="lbl" id="other-checklists-heading">
            Other checklists
          </p>
          <ul>
            {others.map((other) => (
              <li key={other.slug}>
                <Link to={`/resources/checklist/${other.slug}`}>
                  <span>{other.title}</span>
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
            <h2 id="ask-heading">Ready to send these?</h2>
            <p>
              Send us a message and we will tell you the easiest way to share them, or call during office hours,{' '}
              {RD_HOURS_SUMMARY}.
            </p>
          </div>
          <div className="ask-acts">
            <Link className="btn btn-c" to={contact}>
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

export default ChecklistDetail;
