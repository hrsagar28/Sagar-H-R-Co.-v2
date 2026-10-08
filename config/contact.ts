const getEnv = (key: string): string => {
  if (import.meta.env) {
    return String(import.meta.env[key] || '');
  }

  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }

  return '';
};

// The contact and careers forms post straight from the browser to FormSubmit,
// which emails each submission to the firm (see utils/formSubmit.ts). The
// address was activated with FormSubmit once; VITE_FORM_ENDPOINT can point the
// forms at a different FormSubmit address, such as its private random alias.
const DEFAULT_FORM_ENDPOINT = 'https://formsubmit.co/ajax/mail@casagar.co.in';

export const CONTACT_INFO = {
  name: 'Sagar H R & Co.',
  phone: {
    display: '+91 94823 59455',
    value: '+919482359455',
  },
  email: 'mail@casagar.co.in',
  address: {
    street: '1479, 2nd Floor, Thyagaraja Road, KR Mohalla',
    city: 'Mysuru',
    state: 'Karnataka',
    zip: '570004',
    country: 'India',
    // Postal form shown on the pages and in the footer, one entry per line.
    lines: ['No. 1479, 2nd Floor, Thyagaraja Road', 'K.R. Mohalla, Mysuru – 570004'],
  },
  social: {
    whatsapp: 'https://wa.me/919482359455?text=Hi,%20I%20would%20like%20to%20book%20a%20consultation.',
  },
  // The office's exact position, as given by CA Sagar (October 2026). The
  // search data, the embedded map and the directions link all use it.
  geo: {
    latitude: 12.300441780819392,
    longitude: 76.65174665460887,
    mapEmbedUrl:
      'https://maps.google.com/maps?q=12.300441780819392,76.65174665460887&t=&z=15&ie=UTF8&iwloc=&output=embed',
    mapShareUrl: 'https://www.google.com/maps?q=12.300441780819392,76.65174665460887',
  },
  tagline: 'Chartered Accountants',
  firmRegistrationNo: '026642S',
  languages: ['English', 'Kannada', 'Hindi'],
  formEndpoint: getEnv('VITE_FORM_ENDPOINT') || DEFAULT_FORM_ENDPOINT,
  stats: {
    established: '2023',
  },
  founder: {
    name: 'CA Sagar H R',
    icaiMembershipNo: '273511',
  },
};
