import React from 'react';
import { CURSOR_VARIANTS, setCursorVariant, useCursorVariant } from '../CustomCursor';

/** PREVIEW ONLY: a small panel, bottom left on every page, to switch cursors. */
const CursorSwitcher: React.FC = () => {
  const variant = useCursorVariant();
  return (
    <div className="cur-switch" role="group" aria-label="Cursor to preview">
      <span>Cursor</span>
      {CURSOR_VARIANTS.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={variant === option.id}
          onClick={() => setCursorVariant(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default CursorSwitcher;
