import { describe, expect, it } from 'vitest';
import { markdownToHtml } from './markdownToHtml';

describe('markdownToHtml', () => {
  it('renders inline markdown tags into HTML', () => {
    expect(markdownToHtml('Read **this** [guide](/resources) and _prepare_ carefully.')).toBe(
      '<p>Read <strong>this</strong> <a href="/resources">guide</a> and <em>prepare</em> carefully.</p>'
    );
  });

  it('renders list blocks and escapes unsafe HTML', () => {
    expect(markdownToHtml('- First item\n- Second <script>alert(1)</script> item')).toBe(
      '<ul><li>First item</li><li>Second &lt;script&gt;alert(1)&lt;/script&gt; item</li></ul>'
    );
  });

  it('neutralizes unsafe link protocols', () => {
    expect(markdownToHtml('[bad](javascript:evil) and [fine](/contact)')).toBe(
      '<p><a href="#">bad</a> and <a href="/contact">fine</a></p>'
    );
  });
});
