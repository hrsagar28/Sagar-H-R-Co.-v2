import { afterEach, describe, expect, it } from 'vitest';
import { cursorModeFor } from './cursorMode';

const at = (markup: string, selector: string) => {
  document.body.innerHTML = markup;
  return document.querySelector(selector);
};

describe('cursorModeFor', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('gives links and buttons the link look, including what is inside them', () => {
    expect(cursorModeFor(at('<a href="/x"><span>Go</span></a>', 'span'))).toBe('link');
    expect(cursorModeFor(at('<button type="button">Send</button>', 'button'))).toBe('link');
  });

  it('does not give it to a control that cannot be used', () => {
    expect(cursorModeFor(at('<button type="button" disabled>Sending</button>', 'button'))).toBe('default');
    expect(cursorModeFor(at('<a aria-disabled="true">Next</a>', 'a'))).toBe('default');
  });

  it('gives text and form fields the text cursor', () => {
    expect(cursorModeFor(at('<p>Returns and notices</p>', 'p'))).toBe('text');
    expect(cursorModeFor(at('<input type="text" />', 'input'))).toBe('text');
  });

  it('steps aside over maps', () => {
    expect(cursorModeFor(at('<div data-hide-cursor="true"><iframe title="Map"></iframe></div>', 'iframe'))).toBe(
      'hide',
    );
  });

  it('shows the dot anywhere else', () => {
    expect(cursorModeFor(at('<div><section></section></div>', 'section'))).toBe('default');
    expect(cursorModeFor(null)).toBe('default');
  });
});
