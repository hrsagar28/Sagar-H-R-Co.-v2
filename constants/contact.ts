
// Helper to safely get environment variables
const getEnv = (key: string, required = false): string => {
  let val = '';
  
  // Try import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    val = (import.meta as any).env[key];
  } 
  // Try process.env (Node/Webpack/Polyfill)
  else if (typeof process !== 'undefined' && process.env) {
    val = process.env[key] as string;
  }

  if (required && !val) {
     console.warn(`Missing required environment variable: ${key}`);
  }
  return val || '';
};

export const CONTACT_INFO = {
  name: "Sagar H R & Co.",
  phone: {
    display: "+91 94823 59455",
    value: "+919482359455"
  },
  email: "mail@casagar.co.in",
  address: {
    street: "1479, 2nd Floor, Thyagaraja Road, KR Mohalla",
    city: "Mysuru",
    state: "Karnataka",
    zip: "570004",
    country: "India",
    full: "1479, 2nd Floor, Thyagaraja Road, KR Mohalla, Mysuru - 570004"
  },
  social: {
    linkedin: "https://www.linkedin.com/in/sagar-h-r-507495261/",
    whatsapp: "https://wa.me/919482359455?text=Hi,%20I%20would%20like%20to%20book%20a%20consultation."
  },
  geo: {
    latitude: 12.3051,
    longitude: 76.6551,
    mapEmbedUrl: "https://maps.google.com/maps?q=12.300430367886586,76.65174852128196&t=&z=15&ie=UTF8&iwloc=&output=embed"
  },
  tagline: "Chartered Accountants",
  assessmentYear: "AY 2026-27",
  financialYear: "FY 2025-26",
  formEndpoint: getEnv('VITE_FORM_ENDPOINT') || "https://formsubmit.co/ajax/mail@casagar.co.in"
};
