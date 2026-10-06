// HRA exemption for tax year 2026-27: Schedule III (Table: Sl. No. 11) of the
// Income-tax Act, 2025, read with Rule 279 of the Income-tax Rules, 2026
// (official text read 6 October 2026). The exempt amount is the least of the
// HRA received, rent paid less 10% of salary, and 50% or 40% of salary,
// depending on where the rented home is. Salary is basic pay plus dearness
// allowance where the terms of employment provide for it.

export const HRA_FIFTY_PERCENT_CITIES = [
  'Mumbai',
  'Kolkata',
  'Delhi',
  'Chennai',
  'Hyderabad',
  'Pune',
  'Ahmedabad',
  'Bengaluru',
];

export const HRA_RATES = { listedCity: 0.5, elsewhere: 0.4, rentAboveSalaryShare: 0.1 };

/** Form 124 (formerly 12BB): the landlord's PAN is needed above this yearly rent. */
export const HRA_LANDLORD_PAN_RENT = 100000;
