import React from 'react';

interface HoneypotProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * A field visitors never see and spam bots fill in; a form whose honeypot has a
 * value is not sent.
 *
 * Hidden with `hidden` (display: none), the way FormSubmit's own docs hide
 * `_honey`, rather than moved off-screen. Browsers don't autofill a field that
 * isn't rendered, but they can autofill one that is merely off-screen, and that
 * stopped real visitors' messages: the Send button seemed to do nothing. The
 * off-screen Tailwind class was also missing from the redesigned pages' CSS
 * (the purge footgun in CLAUDE.md), which left the field inside the form.
 */
const Honeypot: React.FC<HoneypotProps> = ({ name, value, onChange }) => (
  <div hidden aria-hidden="true">
    <input
      type="text"
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      tabIndex={-1}
      autoComplete="off"
    />
  </div>
);

export default Honeypot;
