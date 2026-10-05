import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { ArrowRight } from '../components/redesign/icons';
import { CONTACT_INFO } from '../constants';

// 2026 redesign of the "page not found" screen. Any address that matches no
// page renders inside RedesignLayout with the light header (routes.ts).

const PAGES = [
  { to: '/', name: 'Home' },
  { to: '/services', name: 'Services' },
  { to: '/insights', name: 'Insights' },
  { to: '/resources', name: 'Resources' },
  { to: '/contact', name: 'Contact' },
];

const NotFound: React.FC = () => (
  <div className="rd-page">
    <SEO title={`Page not found | ${CONTACT_INFO.name}`} description="The requested page could not be found." noindex />
    <div className="phead">
      <div className="hgrid lhero pad">
        <div>
          <h1 className="rise">Page not found</h1>
          <p className="hsub rise d1">
            There is no page at this address. The link may be old, or the address may have a typo.
          </p>
        </div>
      </div>
    </div>

    <div className="nfbody pad">
      <nav aria-label="Main pages">
        <ul className="srows">
          {PAGES.map((page) => (
            <li key={page.to}>
              <Link to={page.to}>
                <span className="t">{page.name}</span>
                <span className="go">
                  <ArrowRight size={18} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="still">
          Looking for something specific? Call{' '}
          <a href={`tel:${CONTACT_INFO.phone.value}`}>{CONTACT_INFO.phone.display}</a> or email{' '}
          <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>.
        </p>
      </nav>
    </div>
  </div>
);

export default NotFound;
