import React from 'react';
import { Link } from 'react-router-dom';
import { CONTACT_INFO } from '../../constants';
import { warmContactRoute } from './warmContact';

export const Locale: React.FC = () => {
  const languages = CONTACT_INFO.languages.join(', ');

  return (
    <section
      id="locale"
      aria-labelledby="locale-heading"
      className="py-12 md:py-16 px-4 md:px-6 zone-bg"
    >
      <div className="container mx-auto max-w-7xl">
        <h2 id="locale-heading" className="sr-only">Where we work from</h2>
        <p className="max-w-2xl text-base md:text-lg leading-relaxed text-zone-text-muted/90">
          Based in {CONTACT_INFO.address.city}. Meetings are by appointment.
          We work in {languages}.{' '}
          <Link
            to="/contact"
            onMouseEnter={warmContactRoute}
            onFocus={warmContactRoute}
            className="font-bold text-zone-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zone-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zone-bg"
          >
            View office details and map<span aria-hidden="true"> →</span>
          </Link>
        </p>
      </div>
    </section>
  );
};
