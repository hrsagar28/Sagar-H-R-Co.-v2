import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { COMMON_SECTIONS, type CommonSection } from '../../constants/resources';

// Old and new section numbers on the home page: pick a section of the 1961
// Act, or a form of the 1962 Rules, and its present number shows in large
// type. The choices are COMMON_SECTIONS, the "Most looked up" list of the
// section finder (/resources/section-finder), so the two pages agree.

const keyOf = (row: CommonSection) => `${row.form ? 'form' : 'section'}:${row.old}`;

/** A size for a number, by its length: "24" is set larger than "44AD, 44ADA, 44AE". */
const sizeOf = (text: string) => {
  if (text.length <= 3) return 's1';
  if (text.length <= 6) return 's2';
  if (text.length <= 11) return 's3';
  return 's4';
};

const SECTIONS = COMMON_SECTIONS.filter((row) => !row.form);
const FORMS = COMMON_SECTIONS.filter((row) => row.form);

const SectionNumbers: React.FC = () => {
  const [picked, setPicked] = useState(() => (COMMON_SECTIONS[0] ? keyOf(COMMON_SECTIONS[0]) : ''));
  // Read out after a choice; empty until then, so nothing is said as the page loads.
  const [said, setSaid] = useState('');
  const row = COMMON_SECTIONS.find((item) => keyOf(item) === picked) ?? COMMON_SECTIONS[0];

  if (!row) return null;

  const chips = (rows: CommonSection[]) =>
    rows.map((item) => (
      <button
        key={keyOf(item)}
        type="button"
        className="hchip tnum"
        aria-pressed={keyOf(item) === keyOf(row)}
        onClick={() => {
          setPicked(keyOf(item));
          setSaid(
            item.form
              ? `Form ${item.old} of the 1962 Rules is Form ${item.now} of the 2026 Rules: ${item.subject}.`
              : `Section ${item.old} of the 1961 Act is section ${item.now} of the 2025 Act: ${item.subject}.`,
          );
        }}
      >
        {item.old}
      </button>
    ));

  return (
    <section className="hnum pad" aria-labelledby="home-sections-heading">
      <div className="hnum-h">
        <h2 className="hh" id="home-sections-heading">
          Section numbers under the Income-tax Act, 2025
        </h2>
        <p>
          The Income-tax Act, 2025 replaced the Income-tax Act, 1961 on 1 April 2026, and most provisions were
          renumbered. Select a section or form of the earlier law to see its present number.
        </p>
      </div>

      <p className="vh" role="status">
        {said}
      </p>
      <div className="hnum-r">
        <div>
          <p className="cap">{row.form ? 'Form under the 1962 Rules' : 'Section of the 1961 Act'}</p>
          <p className={`old ${sizeOf(row.old)}`}>{row.old}</p>
        </div>
        <div>
          <p className="cap">{row.form ? 'Form under the 2026 Rules' : 'Section of the 2025 Act'}</p>
          <p className={`now ${sizeOf(row.now)}`}>{row.now}</p>
        </div>
        <div className="what">
          <p>{row.subject}</p>
          <p className="hmore">
            <Link to="/resources/section-finder">All sections and forms</Link>
          </p>
        </div>
      </div>

      <div className="hnum-c">
        <div>
          <p className="lbl" id="home-sections-old">
            Commonly used sections of the 1961 Act
          </p>
          <div className="hchips" role="group" aria-labelledby="home-sections-old">
            {chips(SECTIONS)}
          </div>
        </div>
        <div>
          <p className="lbl" id="home-forms-old">
            Commonly used forms of the 1962 Rules
          </p>
          <div className="hchips" role="group" aria-labelledby="home-forms-old">
            {chips(FORMS)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionNumbers;
