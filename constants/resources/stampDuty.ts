// Stamp duty on a lease (rent agreement) of immovable property in Karnataka:
// Article 30(1) of the Schedule to the Karnataka Stamp Act, 1957, as
// substituted by the Karnataka Stamp (Second Amendment) Act, 2010 (in force
// 1 April 2010), with the family-member proviso as amended up to 2017. The
// Karnataka Stamp (Amendment) Act, 2023 (in force 3 February 2024) amends
// other Articles but not Article 30 or 32-A; the Karnataka Stamp (Amendment)
// Act, 2025 (digital e-stamp) amends sections 2, 10 and 10-A, not the
// Schedule. Read 23 November 2026; reviewed the same day against the India
// Code consolidation of the Act.
//
// The duty is charged on the total of the average annual rent, premium, fine
// and money advanced. The Explanation to Article 30 says money advanced
// "means and includes the security deposit whether refundable or adjustable
// towards the rent", so the deposit is counted (applied in S. Velu v. Mahesh,
// Karnataka High Court, 2017). Rates are per ₹100 "or part thereof".

/** The date these figures were last checked against the Act. */
export const STAMP_DUTY_LAW_AS_AT = '2026-11-23';

export type LeaseSlab = 'upto-1' | 'upto-10' | 'upto-20' | 'upto-30';

/** Article 30(1)(i) to (v): the term in months up to which each slab runs, and its rate in per cent. */
export const LEASE_SLABS: { slab: LeaseSlab; upToMonths: number; rate: number; label: string }[] = [
  { slab: 'upto-1', upToMonths: 12, rate: 0.5, label: 'Up to 1 year' },
  { slab: 'upto-10', upToMonths: 120, rate: 1, label: 'Over 1 year, up to 10 years' },
  { slab: 'upto-20', upToMonths: 240, rate: 2, label: 'Over 10 years, up to 20 years' },
  { slab: 'upto-30', upToMonths: 360, rate: 3, label: 'Over 20 years, up to 30 years' },
];

/** Article 30(1)(i): a residential lease up to one year pays at most this. Commercial (ii) has no cap. */
export const RESIDENTIAL_SHORT_LEASE_CAP = 500;

/**
 * Article 30(1), second proviso: a lease in favour of the wife, husband,
 * father, mother, son, daughter, brother or sister pays a fixed duty, by
 * where the property is. Where it falls in more than one, the highest applies.
 */
export type FamilyArea = 'city' | 'town' | 'other';
export const FAMILY_LEASE_DUTY: Record<FamilyArea, number> = {
  city: 5000,
  town: 3000,
  other: 1000,
};
export const FAMILY_AREA_LABEL: Record<FamilyArea, string> = {
  city: 'A City Corporation (Bengaluru, Mysuru and others) or the BMRDA area',
  town: 'A City or Town Municipal Council, or a Town Panchayat',
  other: 'Anywhere else',
};

/**
 * Article 32-A (leave and licence): the same rates, with a minimum duty
 * (commercial up to 1 year ₹50; then ₹100, ₹200, ₹300) and no slab beyond 30 years.
 */
export const LICENCE_MINIMUM: Record<LeaseSlab, { residential: number; commercial: number }> = {
  'upto-1': { residential: 0, commercial: 50 },
  'upto-10': { residential: 100, commercial: 100 },
  'upto-20': { residential: 200, commercial: 200 },
  'upto-30': { residential: 300, commercial: 300 },
};

/** The calculator stops here: beyond 30 years the duty is as on a conveyance (Article 30(1)(vi)). */
export const LEASE_MAX_MONTHS = 360;

/** The highest yearly rent increase the calculator takes, in per cent, to keep the figures within reason. */
export const MAX_YEARLY_INCREASE = 25;
