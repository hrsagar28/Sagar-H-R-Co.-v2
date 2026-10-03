import React from 'react';
import { Link } from 'react-router-dom';
import { CONTACT_INFO } from '../../constants';
import { useReducedMotion } from '../../hooks';
import { toRomanNumeral } from '../../utils/toRomanNumeral';
import {
  RD_FOOTER_EXPLORE,
  RD_FOOTER_RESOURCES,
  RD_HOURS_SUMMARY,
  RD_LEGAL_LINKS,
  RD_STAFF_PORTAL_URL,
  type RdLink,
} from './content';
import { ArrowUp } from './icons';

// Read once at load rather than during render (React Compiler purity rule).
const YEAR = new Date().getFullYear();
const YEARS = YEAR <= 2023 ? 'MMXXIII' : `MMXXIII–${toRomanNumeral(YEAR)}`;

const LinkColumn: React.FC<{ id: string; title: string; links: RdLink[] }> = ({ id, title, links }) => (
  <nav className="fcol" aria-labelledby={id}>
    <p className="flbl" id={id}>
      {title}
    </p>
    <ul>
      {links.map((link) => (
        <li key={link.to}>
          <Link to={link.to}>{link.label}</Link>
        </li>
      ))}
    </ul>
  </nav>
);

/** Footer for the redesigned pages: four columns, then the firm name set large
 *  with the legal row running across it. */
const RdFooter: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [line1, line2] = CONTACT_INFO.address.lines;

  return (
    <footer className="foot">
      <div className="foot-in pad">
        <div className="fgrid">
          <div className="fbrand">
            <Link to="/" className="fword">
              Sagar H R &amp; Co.
            </Link>
            <p className="ftag">{CONTACT_INFO.tagline}</p>
            <address>
              {line1}
              <br />
              {line2}
              <br />
              {CONTACT_INFO.address.state}, {CONTACT_INFO.address.country}
            </address>
            <p className="freg">ICAI Firm Registration No. {CONTACT_INFO.firmRegistrationNo}</p>
          </div>
          <LinkColumn id="rd-foot-explore" title="Explore" links={RD_FOOTER_EXPLORE} />
          <LinkColumn id="rd-foot-resources" title="Resources" links={RD_FOOTER_RESOURCES} />
          <div className="fcol touch">
            <p className="flbl">Contact</p>
            <a href={`tel:${CONTACT_INFO.phone.value}`} className="tnum">
              {CONTACT_INFO.phone.display}
            </a>
            <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>
            <p>{RD_HOURS_SUMMARY}</p>
          </div>
        </div>
      </div>

      <div className="fbase">
        <p className="bigmark" aria-hidden="true">
          Sagar H R &amp; Co.
        </p>
        <div className="frow pad">
          <span>© {YEARS} Sagar H R &amp; Co.</span>
          <nav aria-label="Legal">
            <ul>
              {RD_LEGAL_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
              <li>
                <a href={RD_STAFF_PORTAL_URL} target="_blank" rel="noopener noreferrer">
                  Staff portal<span className="vh"> (opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </nav>
          <button
            type="button"
            className="top"
            onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })}
          >
            Back to top <ArrowUp />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default RdFooter;
