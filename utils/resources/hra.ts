import { HRA_RATES } from '../../constants/resources/hra';

export interface HraInput {
  /** Monthly amounts. */
  basic: number;
  /** Dearness allowance, where the terms of employment count it as salary. */
  da: number;
  hraReceived: number;
  rentPaid: number;
  /** Months in the year the rented home was occupied (the relevant period). */
  months: number;
  /** The home is in one of the eight cities at 50%. */
  listedCity: boolean;
}

export type HraLimit = 'received' | 'rent' | 'salary';

export interface HraResult {
  salary: number;
  received: number;
  rent: number;
  limits: Record<HraLimit, number>;
  /** The limit that decides the exemption. */
  least: HraLimit;
  exempt: number;
  taxable: number;
}

/** Rule 279(1): the exemption is the least of the three limits, for the relevant period. */
export const calculateHra = (input: HraInput): HraResult => {
  const months = Math.min(12, Math.max(0, Math.round(input.months)));
  const salary = (input.basic + input.da) * months;
  const received = input.hraReceived * months;
  const rent = input.rentPaid * months;
  const limits: Record<HraLimit, number> = {
    received,
    rent: Math.max(0, rent - HRA_RATES.rentAboveSalaryShare * salary),
    salary: (input.listedCity ? HRA_RATES.listedCity : HRA_RATES.elsewhere) * salary,
  };
  const order: HraLimit[] = ['received', 'rent', 'salary'];
  const least = order.reduce<HraLimit>((best, key) => (limits[key] < limits[best] ? key : best), 'received');
  const exempt = Math.round(limits[least]);
  return { salary, received, rent, limits, least, exempt, taxable: Math.max(0, Math.round(received - exempt)) };
};
