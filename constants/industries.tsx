import type { IndustryItem } from '../types';
import { Factory, ShoppingCart, Stethoscope, Cpu, Home, Utensils, GraduationCap, Sprout } from 'lucide-react';

// Audit S-05: see comment on SERVICES — same component-reference shape.
export const INDUSTRIES: IndustryItem[] = [
  {
    title: 'Manufacturing',
    description: 'Production units, textile mills, automotive components, and industrial manufacturing.',
    Icon: Factory,
  },
  {
    title: 'Retail & E-commerce',
    description: 'Online stores, retail chains, wholesale distribution, and marketplace sellers.',
    Icon: ShoppingCart,
  },
  {
    title: 'Healthcare',
    description: 'Hospitals, clinics, diagnostic centers, pharmaceutical companies, and medical practices.',
    Icon: Stethoscope,
  },
  {
    title: 'Technology',
    description: 'Software companies, IT services, startups, and digital agencies.',
    Icon: Cpu,
  },
  {
    title: 'Real Estate',
    description: 'Property developers, real estate agencies, construction companies, and property management.',
    Icon: Home,
  },
  {
    title: 'Hospitality',
    description: 'Hotels, restaurants, travel agencies, event management, and tourism businesses.',
    Icon: Utensils,
  },
  {
    title: 'Professional Services',
    description: 'Consulting firms, law firms, educational institutions, and service providers.',
    Icon: GraduationCap,
  },
  {
    title: 'Agriculture & Food',
    description: 'Food processing, agricultural businesses, dairy farms, and agribusiness ventures.',
    Icon: Sprout,
  },
];
