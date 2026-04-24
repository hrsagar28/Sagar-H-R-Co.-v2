import { headerSafe } from './sanitize';

export const buildCareerSubject = (fullName: string, position: string) =>
  `Job Application: ${headerSafe(fullName)} - ${headerSafe(position)}`;
