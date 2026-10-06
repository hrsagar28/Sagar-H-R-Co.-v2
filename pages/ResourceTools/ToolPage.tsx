import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import { RD_HOURS_SUMMARY } from '../../components/redesign/content';
import { ArrowLeft, ArrowRight } from '../../components/redesign/icons';
import { CONTACT_INFO } from '../../constants';
import { RESOURCES_LAW_AS_AT, type ResourceTool } from '../../constants/resources';
import { SITE_URL } from '../../config/site';
import { formatLongDate } from '../../utils/insightDates';

// The frame of every Resources tool page (2026 redesign): the dark header with
// a back link, the tool itself sitting on the seam, the notes below it, and
// the dark-green "ask us" band. Rendered inside RedesignLayout.

interface ToolPageProps {
  tool: ResourceTool;
  /** The line under the summary: which year and which law the tool follows. */
  law: string;
  children: React.ReactNode;
}

const ToolPage: React.FC<ToolPageProps> = ({ tool, law, children }) => {
  const url = `${SITE_URL}/resources/${tool.slug}`;
  const contact = tool.subject ? `/contact?subject=${tool.subject}#write` : '/contact#write';

  return (
    <div className="rd-page">
      <SEO
        title={`${tool.name} | ${CONTACT_INFO.name}`}
        description={tool.summary}
        canonicalUrl={url}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Resources', url: '/resources' },
          { name: tool.name, url: `/resources/${tool.slug}` },
        ]}
        schema={{
          '@context': 'https://schema.org',
          '@type': tool.group === 'calculators' ? 'WebApplication' : 'WebPage',
          name: tool.name,
          description: tool.summary,
          url,
          ...(tool.group === 'calculators' && {
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Any',
            isAccessibleForFree: true,
          }),
          publisher: { '@type': 'AccountingService', name: CONTACT_INFO.name, url: SITE_URL },
        }}
      />

      <div className="phead">
        <div className="grain" aria-hidden="true" />
        <div className="hgrid solo pad">
          <div>
            <Link className="crumb rise" to="/resources">
              <ArrowLeft />
              All resources
            </Link>
            <h1 className="rise">{tool.name}</h1>
            <p className="hsub rise d1">{tool.summary}</p>
            <p className="often rise d2">{law}</p>
          </div>
        </div>
      </div>

      <div className={`tool pad ${tool.group === 'calculators' ? 'is-calc' : ''}`}>
        {children}
        <p className="asof">
          Figures as at {formatLongDate(RESOURCES_LAW_AS_AT)}. General information, not advice on any particular case.
        </p>
      </div>

      <section className="ask pad" aria-labelledby="ask-heading">
        <div className="ask-in">
          <div>
            <h2 id="ask-heading">Ask us about {tool.ask}</h2>
            <p>Send us a message with your figures, or call during office hours, {RD_HOURS_SUMMARY}.</p>
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

export default ToolPage;
