export const sanitizeJsonLd = (value: unknown): unknown => {
  if (typeof value === 'function' || value instanceof Date) return undefined;
  if (Array.isArray(value)) return value.map(sanitizeJsonLd);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, entry]) => [key, sanitizeJsonLd(entry)] as const)
        .filter(([, entry]) => entry !== undefined)
    );
  }
  return value;
};

export const stringifyJsonLd = (data: object) => (
  JSON.stringify(sanitizeJsonLd(data)).replace(/</g, '\\u003c')
);
