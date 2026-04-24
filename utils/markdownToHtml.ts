const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeAttribute = (value: string) => escapeHtml(value).replace(/`/g, '&#96;');

const sanitizeUrl = (value: string) => {
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();

  if (!trimmed) {
    return '#';
  }

  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return '#';
  }

  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('mailto:') ||
    lower.startsWith('tel:') ||
    lower.startsWith('/') ||
    lower.startsWith('#')
  ) {
    return trimmed;
  }

  return '#';
};

const formatInlineMarkdown = (value: string) => {
  let html = escapeHtml(value);

  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label: string, url: string) => {
    const safeUrl = escapeAttribute(sanitizeUrl(url));
    return `<a href="${safeUrl}">${label}</a>`;
  });
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  html = html.replace(/(^|[^\w])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  html = html.replace(/(^|[^\w])_([^_\n]+)_(?!_)/g, '$1<em>$2</em>');

  return html;
};

const renderBlock = (block: string) => {
  const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) {
    return '';
  }

  const orderedItems = lines.every((line) => /^\d+\.\s+/.test(line));
  if (orderedItems) {
    const items = lines
      .map((line) => line.replace(/^\d+\.\s+/, ''))
      .map((line) => `<li>${formatInlineMarkdown(line)}</li>`)
      .join('');
    return `<ol>${items}</ol>`;
  }

  const unorderedItems = lines.every((line) => /^[-*+]\s+/.test(line));
  if (unorderedItems) {
    const items = lines
      .map((line) => line.replace(/^[-*+]\s+/, ''))
      .map((line) => `<li>${formatInlineMarkdown(line)}</li>`)
      .join('');
    return `<ul>${items}</ul>`;
  }

  const headingMatch = block.trim().match(/^(#{1,6})\s+(.+)$/);
  if (headingMatch) {
    const level = headingMatch[1].length;
    return `<h${level}>${formatInlineMarkdown(headingMatch[2].trim())}</h${level}>`;
  }

  const paragraph = lines.map((line) => formatInlineMarkdown(line)).join('<br>');
  return `<p>${paragraph}</p>`;
};

export const markdownToHtml = (markdown: string) => {
  if (!markdown.trim()) {
    return '';
  }

  return markdown
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((block) => renderBlock(block))
    .filter(Boolean)
    .join('');
};

export default markdownToHtml;
