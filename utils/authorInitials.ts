/**
 * Compute up-to-two-character initials for an author display name.
 *
 * Audit I-05: the home page used to inline
 * `author.split(' ').map(n => n[0]).join('')`, which produced "CSHR" for
 * "CA Sagar H R" — four glyphs that didn't fit the avatar circle — and
 * crashed on empty strings. This helper handles:
 *
 *   - Empty / whitespace-only input → "?"
 *   - The "CA " honorific prefix is stripped (lower- or upper-case)
 *   - Single-word names → first letter only ("Sagar" → "S")
 *   - Multi-word names → first letter of the FIRST and LAST word
 *     ("Sagar H R" → "SR", "Jane Quincy Doe" → "JD")
 *   - All output is upper-cased
 *
 * Returns a string of length 1 or 2; the "?" fallback is also length 1.
 *
 * @example
 * getAuthorInitials('CA Sagar H R')   // "SR"
 * getAuthorInitials('Jane Doe')        // "JD"
 * getAuthorInitials('Sagar')           // "S"
 * getAuthorInitials('')                // "?"
 */
export const getAuthorInitials = (name: string | null | undefined): string => {
  if (!name) return '?';

  // Strip the "CA " honorific that prefixes most authors in this codebase.
  // Anchored to the start so a middle initial that happens to be "Ca" is
  // not touched.
  const cleaned = name.replace(/^CA\s+/i, '').trim();
  if (!cleaned) return '?';

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';

  if (parts.length === 1) {
    return parts[0]!.charAt(0).toUpperCase();
  }

  const first = parts[0]!.charAt(0);
  const last = parts[parts.length - 1]!.charAt(0);
  return `${first}${last}`.toUpperCase();
};
