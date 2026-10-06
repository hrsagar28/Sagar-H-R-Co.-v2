import React, { useEffect, useState } from 'react';
import FormField from '../../components/redesign/FormField';
import { cleanAmount, grouped, rupees, toAmount } from '../../utils/resources/format';

// Inputs for the Resources calculators, in the redesigned form style (a label
// over a single rule; see .fld in redesign.css).

interface MoneyFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** A short line under the label, when the label alone is not enough. */
  note?: string;
  /** Shown under the input, such as a checkbox that changes what the amount means. */
  after?: React.ReactNode;
}

/** A rupee amount: typed as plain digits, shown in the Indian grouping once you move on. */
export const MoneyField: React.FC<MoneyFieldProps> = ({ id, label, value, onChange, note, after }) => {
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(false);
  const noteId = note ? `${id}-note` : undefined;

  return (
    <FormField id={id} label={label}>
      {note && (
        <p className="fnote" id={noteId}>
          {note}
        </p>
      )}
      <div className="money">
        <span aria-hidden="true">₹</span>
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          aria-describedby={noteId}
          value={editing ? text : value ? grouped(value) : ''}
          onFocus={() => {
            setText(value ? String(value) : '');
            setEditing(true);
          }}
          onBlur={() => setEditing(false)}
          onChange={(event) => {
            const next = cleanAmount(event.target.value);
            setText(next);
            onChange(toAmount(next));
          }}
        />
      </div>
      {after}
    </FormField>
  );
};

interface ChoiceFieldProps<T extends string> {
  name: string;
  legend: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

/** One choice from a few, as the chips the Contact form uses. */
export const ChoiceField = <T extends string>({ name, legend, value, options, onChange }: ChoiceFieldProps<T>) => (
  <fieldset className="fld">
    <legend>{legend}</legend>
    <div className="chips">
      {options.map((option) => (
        <label className="chip" key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  </fieldset>
);

interface ResultProps {
  children: React.ReactNode;
  /** What was entered, as [label, value]. Printed above the result in place of the form. */
  entries: [string, string][];
}

/**
 * The result column of a calculator. On a wide screen its content stays in
 * view while a long form scrolls past (.cstick in redesign.css). Printed, the
 * form is left out and the figures entered are listed here instead (.psum).
 */
export const Result: React.FC<ResultProps> = ({ children, entries }) => (
  <div className="cout">
    <div className="cstick">
      {entries.length > 0 && (
        <div className="psum">
          <p className="lbl">The figures entered</p>
          <dl className="brk">
            {entries.map(([label, value]) => (
              <Row key={label} label={label} value={value} />
            ))}
          </dl>
        </div>
      )}
      {children}
      {entries.length > 0 && (
        <p className="printest">
          <button type="button" className="link-btn" onClick={() => window.print()}>
            Print this estimate
          </button>
        </p>
      )}
    </div>
  </div>
);

/** A non-zero amount as a printed entry; nothing for zero. */
export const amountEntry = (label: string, value: number): [string, string][] =>
  value > 0 ? [[label, rupees(value)]] : [];

/** A labelled row in a result breakdown. */
export const Row: React.FC<{ label: React.ReactNode; value: React.ReactNode; className?: string }> = ({
  label,
  value,
  className,
}) => (
  <div className={className}>
    <dt>{label}</dt>
    <dd className="tnum">{value}</dd>
  </div>
);

/**
 * The result in words for screen readers, announced once typing pauses
 * rather than on every keystroke.
 */
export const Announce: React.FC<{ text: string }> = ({ text }) => {
  const [spoken, setSpoken] = useState('');
  useEffect(() => {
    const timer = window.setTimeout(() => setSpoken(text), 900);
    return () => window.clearTimeout(timer);
  }, [text]);
  return (
    <p className="vh" role="status" aria-live="polite">
      {spoken}
    </p>
  );
};
