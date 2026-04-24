interface NormalizeInputOptions {
  preserveLineBreaks?: boolean;
}

/**
 * Normalize outbound form values for transport.
 *
 * React handles HTML escaping when values are rendered. For email/form
 * transport, keep user text readable and remove control characters only.
 */
export const normalizeInput = (
  input: string,
  options: NormalizeInputOptions = {}
): string => {
  if (typeof input !== 'string') return '';

  const controlChars = options.preserveLineBreaks
    ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]+/g
    : /[\u0000-\u001F\u007F]+/g;

  return input.replace(controlChars, options.preserveLineBreaks ? '' : ' ').trim();
};

export const headerSafe = (input: string, maxLength = 200): string =>
  normalizeInput(input)
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, maxLength)
    .trim();

export const sanitizeInput = normalizeInput;
