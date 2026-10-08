// Old and new section numbers: the commonly used sections of the Income-tax
// Act, 1961 and the forms of the 1962 Rules, with their place in the
// Income-tax Act, 2025 and the Income-tax Rules, 2026.
//
// Sections: each new number read against the official text, "Income-tax Act,
// 2025 as amended by Finance Act, 2026" (incometaxindia.gov.in), in October
// 2026. The Finance Act, 2026 omitted s.443 and substituted s.446 from
// 1 April 2026, so the 271AAC and 271B rows point to where those defaults
// now sit (s.439(11)(g) and s.428(c)). Forms: the CBDT's form navigator
// (June 2026) and its transition FAQs (Q4.40). The TDS and TCS rows are taken
// from tds.ts, which carries its own sources.

export interface SectionRow {
  /** The 1961 Act section, or the 1962 Rules form. */
  old: string;
  /** Where it is now. */
  now: string;
  subject: string;
}

export interface SectionGroup {
  id: string;
  name: string;
  rows: SectionRow[];
}

export const SECTION_GROUPS: SectionGroup[] = [
  {
    id: 'basics',
    name: 'Basics and exempt income',
    rows: [
      { old: '2', now: '2', subject: 'Definitions' },
      { old: '3', now: '3', subject: 'Previous year, now "tax year"' },
      { old: '4', now: '4', subject: 'Charge of income-tax' },
      { old: '5', now: '5', subject: 'Scope of total income' },
      { old: '6', now: '6', subject: 'Residence in India' },
      { old: '9', now: '9', subject: 'Income deemed to accrue or arise in India' },
      { old: '10', now: '11', subject: 'Income not included in total income (Schedules II to VII)' },
      { old: '10(13A)', now: 'Schedule III (Sl. No. 11)', subject: 'House rent allowance' },
      { old: '14A', now: '14', subject: 'Expenditure on exempt income' },
      {
        old: '11, 12, 13',
        now: '332 to 355',
        subject: 'Charitable and religious trusts, now "registered non-profit organisations"',
      },
      { old: '12A, 12AB', now: '332', subject: 'Registration of a trust or institution' },
    ],
  },
  {
    id: 'salary-property',
    name: 'Salary and house property',
    rows: [
      { old: '15', now: '15', subject: 'Salaries' },
      { old: '17', now: '16, 17, 18', subject: 'Salary, perquisites and profits in lieu of salary' },
      { old: '16', now: '19', subject: 'Standard deduction and professional tax' },
      { old: '10(10)', now: '19', subject: 'Gratuity' },
      { old: '10(10AA)', now: '19', subject: 'Leave encashment' },
      { old: '22', now: '20', subject: 'Income from house property' },
      { old: '23', now: '21', subject: 'Annual value' },
      { old: '24', now: '22', subject: 'Deductions from house property: 30% and interest' },
    ],
  },
  {
    id: 'business',
    name: 'Business and profession',
    rows: [
      { old: '28', now: '26', subject: 'Profits and gains of business or profession' },
      { old: '30', now: '28', subject: 'Rent, rates, taxes, repairs and insurance' },
      { old: '32', now: '33', subject: 'Depreciation' },
      { old: '35', now: '45', subject: 'Scientific research' },
      { old: '36', now: '32', subject: 'Other deductions' },
      { old: '37', now: '34', subject: 'General deduction for business expenditure' },
      { old: '40', now: '35', subject: 'Amounts not deductible' },
      { old: '40A', now: '36', subject: 'Expenses not deductible in certain cases, including cash payments' },
      { old: '43B', now: '37', subject: 'Deductions only on actual payment' },
      { old: '44AA', now: '62', subject: 'Books of account' },
      { old: '44AB', now: '63', subject: 'Tax audit' },
      { old: '44AD, 44ADA, 44AE', now: '58', subject: 'Presumptive income' },
    ],
  },
  {
    id: 'capital-gains',
    name: 'Capital gains',
    rows: [
      { old: '45', now: '67', subject: 'Capital gains' },
      { old: '47', now: '70', subject: 'Transactions not regarded as transfer' },
      { old: '48', now: '72', subject: 'Computing the gain, and indexation' },
      { old: '49', now: '73', subject: 'Cost for certain modes of acquisition' },
      { old: '50', now: '74', subject: 'Depreciable assets' },
      { old: '50C', now: '78', subject: 'Stamp duty value as sale price' },
      { old: '54', now: '82', subject: 'Exemption on buying another house' },
      { old: '54B', now: '83', subject: 'Exemption on agricultural land' },
      { old: '54EC', now: '85', subject: 'Exemption on investing in bonds' },
      { old: '54F', now: '86', subject: 'Exemption on buying a house from other assets' },
      { old: '55', now: '90', subject: 'Cost of acquisition and of improvement' },
      { old: '111A', now: '196', subject: 'Short-term gains on listed equity' },
      { old: '112', now: '197', subject: 'Long-term gains' },
      { old: '112A', now: '198', subject: 'Long-term gains on listed equity' },
    ],
  },
  {
    id: 'other-income',
    name: 'Other income, losses and clubbing',
    rows: [
      { old: '56', now: '92', subject: 'Income from other sources' },
      { old: '57', now: '93', subject: 'Deductions from other sources' },
      { old: '64', now: '99', subject: 'Clubbing of income of spouse and minor child' },
      { old: '68', now: '102', subject: 'Unexplained credits' },
      { old: '69', now: '103', subject: 'Unexplained investments' },
      { old: '115BBE', now: '195', subject: 'Tax on unexplained income' },
      { old: '70', now: '108', subject: 'Set-off of losses under the same head' },
      { old: '71', now: '109', subject: 'Set-off of losses under other heads' },
      { old: '72', now: '112', subject: 'Carry forward of business loss' },
      { old: '74', now: '111', subject: 'Carry forward of capital loss' },
      { old: '80', now: '121', subject: 'Return needed to carry forward a loss' },
    ],
  },
  {
    id: 'deductions',
    name: 'Deductions, rebate and regimes',
    rows: [
      { old: '80C, 80CCC', now: '123', subject: 'PF, PPF, life insurance, ELSS, tuition fees and pension plans' },
      { old: '80CCD', now: '124', subject: 'NPS: your contribution and your employer’s' },
      { old: '80D', now: '126', subject: 'Health insurance' },
      { old: '80DD', now: '127', subject: 'Dependant with a disability' },
      { old: '80DDB', now: '128', subject: 'Medical treatment of specified diseases' },
      { old: '80E', now: '129', subject: 'Interest on an education loan' },
      { old: '80EEA', now: '131', subject: 'Interest on a loan for an affordable house' },
      { old: '80G', now: '133', subject: 'Donations' },
      { old: '80GG', now: '134', subject: 'Rent paid, with no HRA' },
      { old: '80TTA, 80TTB', now: '153', subject: 'Interest on deposits' },
      { old: '80U', now: '154', subject: 'Person with a disability' },
      { old: '87A', now: '156', subject: 'Rebate' },
      { old: '89', now: '157', subject: 'Relief for salary arrears' },
      { old: '90, 91', now: '159, 160', subject: 'Relief for tax paid abroad' },
      { old: '115BAA', now: '200', subject: 'Lower tax rate for domestic companies' },
      { old: '115BAB', now: '201', subject: 'Lower tax rate for new manufacturing companies' },
      { old: '115BAC', now: '202', subject: 'New tax regime' },
    ],
  },
  {
    id: 'returns',
    name: 'Returns, assessment and payment',
    rows: [
      { old: '139', now: '263', subject: 'Return of income' },
      { old: '140A', now: '266', subject: 'Self-assessment tax' },
      { old: '140B', now: '267', subject: 'Tax on an updated return' },
      { old: '143', now: '270', subject: 'Assessment' },
      { old: '144', now: '271', subject: 'Best judgment assessment' },
      { old: '147', now: '279', subject: 'Income escaping assessment' },
      { old: '148', now: '280', subject: 'Notice for reassessment' },
      { old: '148A', now: '281', subject: 'Procedure before a reassessment notice' },
      { old: '154', now: '287', subject: 'Rectification of mistakes' },
      { old: '156', now: '289', subject: 'Notice of demand' },
      { old: '197', now: '395', subject: 'Lower or nil TDS certificate' },
      { old: '203A, 206AA', now: '397', subject: 'TAN, and higher TDS where no PAN is given' },
      { old: '207, 208', now: '403, 404', subject: 'Advance tax: who pays' },
      { old: '211', now: '408', subject: 'Advance tax instalments and dates' },
      { old: '285BA', now: '508', subject: 'Statement of financial transactions' },
      { old: '288', now: '515', subject: 'Authorised representative' },
      { old: '288A, 288B', now: '516', subject: 'Rounding of income and tax' },
    ],
  },
  {
    id: 'interest',
    name: 'Interest, fees, penalties and appeals',
    rows: [
      { old: '234A', now: '423', subject: 'Interest for a late return' },
      { old: '234B', now: '424', subject: 'Interest for short advance tax' },
      { old: '234C', now: '425', subject: 'Interest for deferring advance tax' },
      { old: '234D', now: '426', subject: 'Interest on excess refund' },
      { old: '234E', now: '427', subject: 'Fee for late TDS and TCS statements' },
      { old: '234F', now: '428', subject: 'Fee for a late return' },
      { old: '244A', now: '437', subject: 'Interest on refunds' },
      { old: '270A', now: '439', subject: 'Penalty for under-reporting and misreporting' },
      { old: '271A', now: '441', subject: 'Penalty for not keeping books' },
      { old: '271AAC', now: '439', subject: 'Penalty on unexplained income, now counted as misreporting' },
      { old: '271B', now: '428', subject: 'Not getting accounts audited, now a fee' },
      { old: '246A', now: '357', subject: 'Appeal to the Commissioner (Appeals)' },
      { old: '253', now: '362', subject: 'Appeal to the Tribunal' },
      { old: '263', now: '377', subject: 'Revision of orders against revenue' },
      { old: '264', now: '378', subject: 'Revision of other orders' },
      { old: '276C', now: '478', subject: 'Wilful attempt to evade tax' },
    ],
  },
];

/** Forms of the 1962 Rules and their numbers in the 2026 Rules. */
export const FORM_ROWS: SectionRow[] = [
  { old: '16', now: '130', subject: 'TDS certificate for salary' },
  { old: '16A', now: '131', subject: 'TDS certificate for other payments' },
  { old: '27D', now: '133', subject: 'TCS certificate' },
  { old: '24Q', now: '138', subject: 'Quarterly TDS statement: salary' },
  { old: '26Q', now: '140', subject: 'Quarterly TDS statement: other payments to residents' },
  {
    old: '26QB, 26QC, 26QD, 26QE',
    now: '141',
    subject: 'Challan-cum-statement: property, rent, contracts, digital assets',
  },
  { old: '27Q', now: '144', subject: 'Quarterly TDS statement: payments to non-residents' },
  { old: '27EQ', now: '143', subject: 'Quarterly TCS statement' },
  { old: '26AS', now: '168', subject: 'Annual tax statement' },
  { old: '12BB', now: '124', subject: 'Employee’s claims to the employer (HRA, deductions)' },
  { old: '10E', now: '39', subject: 'Relief for salary arrears' },
  { old: '13', now: '128', subject: 'Application for a lower or nil TDS certificate' },
  { old: '15G, 15H', now: '121', subject: 'Declaration for no TDS' },
  { old: '27C', now: '127', subject: 'Buyer’s declaration for no TCS' },
  { old: '3CA, 3CB, 3CD', now: '26', subject: 'Tax audit report' },
  { old: '61A', now: '165', subject: 'Statement of financial transactions' },
  { old: '15CA', now: '145', subject: 'Information on a payment to a non-resident' },
  { old: '15CB', now: '146', subject: 'Accountant’s certificate for a payment to a non-resident' },
  { old: '10F', now: '41', subject: 'Information for treaty relief' },
  { old: '10FA', now: '42', subject: 'Application for a residence certificate' },
  { old: '10A', now: '104', subject: 'Provisional registration of a trust or institution' },
  { old: '10AB', now: '105', subject: 'Registration of a trust or institution' },
  { old: '10BD', now: '113', subject: 'Statement of donations received' },
  { old: '10BE', now: '114', subject: 'Donation certificate' },
  { old: '35', now: '99', subject: 'Appeal to the Commissioner (Appeals)' },
  { old: '49A', now: '93, 94', subject: 'PAN application: individual (93), others (94)' },
  { old: '49AA', now: '95, 96', subject: 'PAN application for foreigners: individual (95), others (96)' },
  { old: '49B', now: '134, 135', subject: 'TAN application: Government (134), others (135)' },
  { old: '60', now: '97', subject: 'Declaration where there is no PAN' },
];

/** A row of the section finder, marked when it is a form of the Rules rather than a section of the Act. */
export interface CommonSection extends SectionRow {
  form: boolean;
}

/**
 * What most people come looking for: the "Most looked up" list that opens
 * the section finder (pages/ResourceTools/SectionFinder.tsx), also offered on
 * the home page (pages/home/SectionNumbers.tsx). Each entry is a group above,
 * or 'forms', and the old number of a row in it.
 */
const COMMON_KEYS: [string, string][] = [
  ['deductions', '80C, 80CCC'],
  ['deductions', '80D'],
  ['deductions', '87A'],
  ['deductions', '115BAC'],
  ['salary-property', '16'],
  ['salary-property', '24'],
  ['business', '44AB'],
  ['business', '44AD, 44ADA, 44AE'],
  ['capital-gains', '54'],
  ['capital-gains', '54F'],
  ['capital-gains', '111A'],
  ['capital-gains', '112'],
  ['capital-gains', '112A'],
  ['returns', '139'],
  ['returns', '143'],
  ['returns', '148'],
  ['interest', '234B'],
  ['interest', '234F'],
  ['forms', '16'],
  ['forms', '26AS'],
  ['forms', '15G, 15H'],
  ['forms', '3CA, 3CB, 3CD'],
];

export const COMMON_SECTIONS: CommonSection[] = COMMON_KEYS.flatMap(([groupId, old]) => {
  const form = groupId === 'forms';
  const rows = form ? FORM_ROWS : SECTION_GROUPS.find((group) => group.id === groupId)?.rows;
  const row = rows?.find((item) => item.old === old);
  return row ? [{ ...row, form }] : [];
});
