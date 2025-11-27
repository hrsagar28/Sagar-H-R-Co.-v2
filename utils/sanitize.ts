/**
 * Basic HTML sanitizer for static content.
 * For user-generated content, use DOMPurify library instead.
 */
export const sanitizeStaticHTML = (html: string): string => {
  // For static content from our own codebase, we trust it
  // This function exists as a placeholder for future API-fetched content
  return html;
};

/**
 * Sanitize user input (form fields)
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};