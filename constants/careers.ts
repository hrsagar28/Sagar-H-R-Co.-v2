export interface JobPosting {
  id: string;
  role: string;
  /** The short line under the role name, as separate parts. */
  meta: string[];
  type: 'Full Time' | 'Part Time' | 'Internship' | 'Contract';
  experience: string;
  location: string;
  description: string;
  responsibilities: string[];
  skills: string[];
  datePosted: string;
  applicationDeadline: string;
  stipendOrSalary?: string;
  workMode: 'On-site' | 'Hybrid' | 'Remote';
  applicantLocationType?: 'Country' | 'City';
  applicantLocationName?: string;
  residenceRequirement?: string;
}

/** How soon we reply to an application whose background fits the role. */
export const CAREERS_RESPONSE_TIME = 'five working days';
export const CAREERS_CONTACT_EMAIL = 'careers@casagar.co.in';
export const CAREERS_APPLY_URL = 'https://casagar.co.in/careers#apply';

export const OPEN_ROLES: JobPosting[] = [
  {
    id: 'audit-associate',
    role: 'Audit Associate',
    meta: ['Full time', '1 to 2 years’ experience'],
    type: 'Full Time',
    experience: '1-2 years',
    location: 'Mysuru, Karnataka',
    description:
      'You’ll run audits from fieldwork to the draft report, and handle the income tax and GST work for the same clients.',
    responsibilities: [
      'Plan and carry out statutory audits of companies, tax audits, internal audits, and audits of trusts, societies and institutions.',
      'Prepare and review working papers, reconciliations and financial statements.',
      'Prepare income tax returns, tax audit reports and GST annual returns for the clients you audit.',
      'Draft replies to income tax and GST notices, and research the law behind them.',
      'Guide and review the work of articled assistants on your engagements.',
      'Be the day-to-day contact for your clients’ owners and accounts teams.',
    ],
    skills: [
      'One to two years of audit experience.',
      'Working knowledge of accounting standards and audit procedure.',
      'Comfortable with Excel and Tally.',
      'Clear written English and prompt follow-up with clients.',
      'CA Intermediate, B.Com or M.Com.',
    ],
    datePosted: '2026-10-05T00:00:00+05:30',
    applicationDeadline: '2026-12-31T23:59:59+05:30',
    workMode: 'On-site',
  },
  {
    id: 'articled-assistant',
    role: 'Articled assistant',
    meta: ['Articleship', 'For CA students'],
    type: 'Internship',
    experience: 'Fresher',
    location: 'Mysuru, Karnataka',
    description:
      'This is your two-year articleship, covering audits, income tax, GST, TDS, and company and LLP filings.',
    responsibilities: [
      'Work on statutory audits of companies, tax audits, internal audits, and audits of trusts, societies and institutions, including vouching, verification and working papers.',
      'Prepare GST and TDS returns, GSTR-2B reconciliations and income tax returns.',
      'Prepare ROC and LLP filings, and help with registrations and incorporations.',
      'Draft replies to notices, and research questions of tax law for the team.',
      'Prepare financial statements, project reports and CMA data from clients’ books.',
    ],
    skills: [
      'A CA student ready to begin practical training.',
      'Careful with detail and keen to learn.',
      'Basic spreadsheet skills.',
      'You live in Mysuru.',
    ],
    datePosted: '2026-10-05T00:00:00+05:30',
    applicationDeadline: '2026-12-31T23:59:59+05:30',
    workMode: 'On-site',
    applicantLocationType: 'City',
    applicantLocationName: 'Mysuru',
    residenceRequirement: 'Applicants must live in Mysuru and be able to work from our office.',
  },
];

// CT-8 / feature 10.8: a posting is "open" only until its application deadline.
// Filtering by this means expired roles auto-hide from the careers page, the
// JobPosting schema, and the application dropdown — so listings can never be
// perpetually open (and stale `validThrough` dates stop inviting applications
// to a closed window). Evaluated per call, so a normal page load re-checks.
export const isRoleOpen = (role: JobPosting, now: Date = new Date()): boolean =>
  new Date(role.applicationDeadline).getTime() >= now.getTime();

export const getOpenRoles = (now: Date = new Date()): JobPosting[] =>
  OPEN_ROLES.filter((role) => isRoleOpen(role, now));
