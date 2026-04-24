import React from 'react';

interface HoneypotProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

const Honeypot: React.FC<HoneypotProps> = ({
  name,
  value,
  onChange
}) => (
  <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
    <input
      type="text"
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      tabIndex={-1}
      autoComplete="off"
      inputMode="none"
      aria-hidden="true"
    />
  </div>
);

export default Honeypot;
