import {
  FAMILY_LEASE_DUTY,
  LEASE_MAX_MONTHS,
  LEASE_SLABS,
  LICENCE_MINIMUM,
  RESIDENTIAL_SHORT_LEASE_CAP,
  type FamilyArea,
  type LeaseSlab,
} from '../../constants/resources/stampDuty';

export type PropertyUse = 'residential' | 'commercial';
export type AgreementKind = 'lease' | 'licence';

export interface StampDutyInput {
  kind: AgreementKind;
  use: PropertyUse;
  /** The term of the agreement in months. */
  months: number;
  /** Rent for the first year, a month. */
  monthlyRent: number;
  /** Increase in the rent every 12 months, in per cent. */
  escalation: number;
  /** Security deposit, refundable or adjustable. */
  deposit: number;
  /** Premium, fine, or rent paid in advance. */
  otherAdvance: number;
  /** A lease to a spouse, parent, child, brother or sister: where the property is. Leases only. */
  family: FamilyArea | null;
}

export type StampDutyBasis = 'ad-valorem' | 'capped' | 'minimum' | 'family';

export interface StampDutyResult {
  /** False when the term is nil, or over 30 years outside the family proviso: no figure is given. */
  computed: boolean;
  slab: LeaseSlab | null;
  rate: number;
  totalRent: number;
  averageAnnualRent: number;
  /** Average annual rent, deposit and other advances. */
  base: number;
  /** The base rounded up to the next ₹100 ("or part thereof"). */
  chargeable: number;
  duty: number;
  basis: StampDutyBasis;
  /** Section 17(1)(d) of the Registration Act: a lease for more than a year. Not for a licence. */
  mustRegister: boolean;
}

/** Rent over the whole term, rising by `escalation` per cent at the start of each new year. */
export const totalRentForTerm = (monthlyRent: number, months: number, escalation: number) => {
  let total = 0;
  for (let month = 0; month < months; month += 1) {
    total += monthlyRent * (1 + escalation / 100) ** Math.floor(month / 12);
  }
  return total;
};

export const slabFor = (months: number) => LEASE_SLABS.find((slab) => months <= slab.upToMonths) ?? null;

/** Article 30(1) (lease) or Article 32-A (leave and licence) of the Karnataka Stamp Act, 1957. */
export const calculateRentStampDuty = (input: StampDutyInput): StampDutyResult => {
  const months = Math.max(0, Math.round(input.months));
  const mustRegister = input.kind === 'lease' && months > 12;
  const slab = months > 0 && months <= LEASE_MAX_MONTHS ? slabFor(months) : null;
  const totalRent = totalRentForTerm(input.monthlyRent, months, input.escalation);
  // Up to a year the rent for the term is taken as the average annual rent;
  // beyond it, the total spread over the years of the term.
  const averageAnnualRent = months === 0 ? 0 : months <= 12 ? totalRent : totalRent / (months / 12);
  const base = averageAnnualRent + input.deposit + input.otherAdvance;
  const chargeable = Math.ceil(Math.round(base * 100) / 100 / 100) * 100;

  // The family proviso sits under Article 30(1) as a whole, so it applies
  // whatever the term, beyond 30 years included.
  if (input.kind === 'lease' && input.family && months > 0) {
    return {
      computed: true,
      slab: slab?.slab ?? null,
      rate: 0,
      totalRent,
      averageAnnualRent,
      base,
      chargeable,
      duty: FAMILY_LEASE_DUTY[input.family],
      basis: 'family',
      mustRegister,
    };
  }

  if (!slab) {
    return {
      computed: false,
      slab: null,
      rate: 0,
      totalRent,
      averageAnnualRent,
      base,
      chargeable,
      duty: 0,
      basis: 'ad-valorem',
      mustRegister,
    };
  }

  let duty = (chargeable * slab.rate) / 100;
  let basis: StampDutyBasis = 'ad-valorem';
  if (input.use === 'residential' && slab.slab === 'upto-1' && duty > RESIDENTIAL_SHORT_LEASE_CAP) {
    duty = RESIDENTIAL_SHORT_LEASE_CAP;
    basis = 'capped';
  }
  const minimum = input.kind === 'licence' ? LICENCE_MINIMUM[slab.slab][input.use] : 0;
  if (duty < minimum) {
    duty = minimum;
    basis = 'minimum';
  }

  return {
    computed: true,
    slab: slab.slab,
    rate: slab.rate,
    totalRent,
    averageAnnualRent,
    base,
    chargeable,
    duty: Math.ceil(duty),
    basis,
    mustRegister,
  };
};
