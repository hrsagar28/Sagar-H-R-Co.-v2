import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { ArrowRight } from '../components/redesign/icons';
import { CLIENT_SECTORS, CONTACT_INFO, SERVICE_GROUPS, getServicePage } from '../constants';
import { buildServicesSchema } from '../constants/servicesSchema';
import type { ServicePage } from '../types';

// 2026 redesign of /services. Rendered inside RedesignLayout, which supplies the
// top bar, footer and stylesheet. The services are listed in four groups, in
// the FAQ page's frame: the group heading on the left, one row per service on
// the right.

const GROUPS = SERVICE_GROUPS.map((group) => ({
  ...group,
  pages: group.slugs.map(getServicePage).filter((page): page is ServicePage => Boolean(page)),
}));

const SCHEMA = buildServicesSchema();

const Services: React.FC = () => (
  <div className="rd-page">
    <SEO
      title={`Services | ${CONTACT_INFO.name}`}
      description="GST, income tax, TDS, NRI taxation, notices and appeals, audits, certificates, company and LLP filings, trusts, bank loans and bookkeeping, from Sagar H R & Co., Chartered Accountants, Mysuru."
      canonicalUrl="https://casagar.co.in/services"
      ogImage="https://casagar.co.in/og-services.png"
      schema={SCHEMA}
      breadcrumbs={[
        { name: 'Home', url: '/' },
        { name: 'Services', url: '/services' },
      ]}
    />

    <div className="phead">
      <div className="grain" aria-hidden="true" />
      <div className="hgrid open solo pad">
        <div>
          <h1 className="rise">Services</h1>
          <p className="hsub rise d1">
            Tax, audit, company law and accounting services for individuals, businesses, institutions and trusts, on a
            yearly retainer or as a single assignment.
          </p>
        </div>
      </div>
    </div>

    <div className="svclist pad">
      {GROUPS.map((group, index) => (
        <section key={group.name} className="sec" aria-labelledby={`service-group-${index}`}>
          <div className="sec-h">
            <h2 id={`service-group-${index}`}>{group.name}</h2>
            <p className="desc">{group.description}</p>
          </div>
          <ul className="srows">
            {group.pages.map((page) => (
              <li key={page.slug}>
                <Link to={`/services/${page.slug}`}>
                  <span>
                    <span className="t">{page.name}</span>
                    <span className="d">{page.who}</span>
                    <span className="i">
                      {page.tags.map((tag, tagIndex) => (
                        <React.Fragment key={tag}>
                          {tagIndex > 0 && (
                            <>
                              <span aria-hidden="true"> · </span>
                              <span className="vh">, </span>
                            </>
                          )}
                          {tag}
                        </React.Fragment>
                      ))}
                    </span>
                  </span>
                  <span className="go">
                    <ArrowRight size={18} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div className="tail">
        <span />
        <p className="still">
          If you are unsure which service applies, <Link to="/contact#write">send us a message</Link> or call{' '}
          <a href={`tel:${CONTACT_INFO.phone.value}`}>{CONTACT_INFO.phone.display}</a>.
        </p>
      </div>

      <section className="sec who" aria-labelledby="client-sectors-heading">
        <div className="sec-h">
          <h2 id="client-sectors-heading">Who we work with</h2>
          <p className="desc">Our clients include:</p>
        </div>
        <ul className="sectors">
          {CLIENT_SECTORS.map((sector) => (
            <li key={sector}>{sector}</li>
          ))}
          <li className="more">and many more</li>
        </ul>
      </section>
    </div>
  </div>
);

export default Services;
