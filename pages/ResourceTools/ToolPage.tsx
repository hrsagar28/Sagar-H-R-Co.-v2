import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import { ArrowLeft } from '../../components/redesign/icons';
import { CONTACT_INFO } from '../../constants';
import { RESOURCES_LAW_AS_AT, type ResourceTool } from '../../constants/resources';
import { SITE_URL } from '../../config/site';
import { formatLongDate } from '../../utils/insightDates';
import { todayIso } from '../../utils/resources/dates';

// The frame of every Resources tool page (2026 redesign): the dark header with
// a back link, the tool itself sitting on the seam, and the notes below it.
// No "ask us" band: the ICAI's Code of Ethics (2026, Vol. I, 2.14.1.6(iv)) bars
// anything that "could be interpreted as soliciting or offering to undertake
// professional work", so the tools carry no invitations; the contact details
// are in the footer. Rendered inside RedesignLayout.

interface ToolPageProps {
  tool: ResourceTool;
  /** The line under the summary: which year and which law the tool follows. */
  law: string;
  children: React.ReactNode;
}

const ToolPage: React.FC<ToolPageProps> = ({ tool, law, children }) => {
  const url = `${SITE_URL}/resources/${tool.slug}`;

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
          }),
          publisher: { '@type': 'AccountingService', name: CONTACT_INFO.name, url: SITE_URL },
        }}
      />

      {/* Printed only: a letterhead line, so a printed estimate says whose it
          is and when it was made. */}
      <p className="plh pad" aria-hidden="true">
        <span>
          <b>{CONTACT_INFO.name}</b> {CONTACT_INFO.tagline}, {CONTACT_INFO.address.city}
        </span>
        <span>
          {tool.group === 'calculators' ? 'Estimate printed on' : 'Printed on'} {formatLongDate(todayIso())}
        </span>
      </p>

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
    </div>
  );
};

export default ToolPage;
