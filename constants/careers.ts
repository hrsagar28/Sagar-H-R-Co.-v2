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
  applicationDeadline?: string;
  stipendOrSalary?: string;
  workMode: 'On-site' | 'Hybrid' | 'Remote';
}

export const OPEN_ROLES: JobPosting[] = [
  {
    id: 'audit-associate-1',
    role: 'Audit Associate',
    type: 'Full Time',
    experience: '1-2 years',
    location: 'Mysuru, Karnataka',
    description: 'We are looking for an Audit Associate to join our team.',
    responsibilities: [],
    skills: [],
    datePosted: new Date().toISOString(),
    workMode: 'On-site'
  },
  {
    id: 'articled-assistant-1',
    role: 'Articled Assistant',
    type: 'Internship',
    experience: 'Fresher',
    location: 'Mysuru, Karnataka',
    description: 'We are looking for an Articled Assistant to join our team.',
    responsibilities: [],
    skills: [],
    datePosted: new Date().toISOString(),
    workMode: 'On-site'
  }
];
