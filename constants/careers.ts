export interface JobPosting {
  id: string;
  role: string;
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

export const CAREERS_RESPONSE_SLA_DAYS = 5;
export const CAREERS_CONTACT_EMAIL = 'careers@casagar.co.in';
export const CAREERS_APPLY_URL = 'https://casagar.co.in/careers#apply';

// Keep these arrays present for every role; an empty list means the detailed JD is still being finalized.
export const OPEN_ROLES: JobPosting[] = [
  {
    id: 'audit-associate-1',
    role: 'Audit Associate',
    type: 'Full Time',
    experience: '1-2 years',
    location: 'Mysuru, Karnataka',
    description: 'Join our Mysuru office as an Audit Associate and work closely with promoters, finance teams, and senior chartered accountants on statutory audits, tax reviews, and compliance engagements. This role is suited to someone who is comfortable taking ownership of fieldwork, preparing documentation with care, and communicating clearly with clients throughout the engagement cycle. You will help convert audit observations into actionable next steps while building depth across accounting, reporting, and advisory assignments.',
    responsibilities: [
      'Execute statutory and internal audit fieldwork for client engagements across the Mysuru region.',
      'Prepare working papers, reconciliations, schedules, and audit observations with clear documentation.',
      'Coordinate with client teams on books of account, supporting evidence, and follow-up queries.',
      'Assist seniors in drafting reports, management comments, and compliance summaries.'
    ],
    skills: [
      'Working knowledge of accounting standards, audit procedures, and financial statement review.',
      'Comfort with Excel, Tally, and cloud accounting workflows.',
      'Strong written communication and client follow-up discipline.',
      'CA Inter, B.Com, M.Com, or equivalent commerce background preferred.'
    ],
    datePosted: '2026-04-22T00:00:00+05:30',
    applicationDeadline: '2026-05-31T23:59:59+05:30',
    workMode: 'On-site'
  },
  {
    id: 'articled-assistant-1',
    role: 'Articled Assistant',
    type: 'Internship',
    experience: 'Fresher',
    location: 'Mysuru, Karnataka (Mysuru residence required)',
    description: 'Train as an Articled Assistant in a practice environment that gives you direct exposure to audit, taxation, compliance, and day-to-day client coordination. This internship is designed for commerce students and CA aspirants who want disciplined hands-on learning rather than observation from the sidelines. You will work from our Mysuru office, shadow live assignments, and build the habits needed for dependable professional practice from the start of your articleship.',
    responsibilities: [
      'Support audit and tax assignments through data collection, vouching, and documentation.',
      'Assist with GST, income tax, and ROC compliance preparation under supervision.',
      'Maintain engagement files, checklists, and follow-up trackers accurately and on time.',
      'Attend client meetings and learn practical office workflows across recurring assignments.'
    ],
    skills: [
      'Commerce background with interest in CA training and professional services.',
      'Attention to detail, willingness to learn, and comfort with process-oriented work.',
      'Basic spreadsheet skills and familiarity with business documents.',
      'Clear communication and the ability to work on-site from Mysuru.'
    ],
    datePosted: '2026-04-22T00:00:00+05:30',
    applicationDeadline: '2026-05-31T23:59:59+05:30',
    workMode: 'On-site',
    applicantLocationType: 'City',
    applicantLocationName: 'Mysuru',
    residenceRequirement: 'Applicants for this internship must currently reside in Mysuru and be available to work on-site from our Mysuru office.'
  }
];
