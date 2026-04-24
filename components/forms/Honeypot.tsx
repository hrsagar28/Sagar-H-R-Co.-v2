import React from 'react';

interface HoneypotProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const Honeypot: React.FC<HoneypotProps> = ({
  name,
  value,
  onChange,
  label = 'Leave this field empty'
}) => (
  <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
    <label>
      {label}
      <input
        type="text"
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        tabIndex={-1}
        autoComplete="off"
        inputMode="none"
      />
    </label>
  </div>
);

export default Honeypot;
