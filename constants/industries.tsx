import React from 'react';
import { IndustryItem } from '../types';
import { 
  Factory, ShoppingCart, Stethoscope, Cpu, 
  Home, Utensils, GraduationCap, Sprout 
} from 'lucide-react';

export const INDUSTRIES: IndustryItem[] = [
  {
    title: 'Manufacturing',
    description: 'Production units, textile mills, automotive components, and industrial manufacturing.',
    icon: <Factory className="w-6 h-6" />
  },
  {
    title: 'Retail & E-commerce',
    description: 'Online stores, retail chains, wholesale distribution, and marketplace sellers.',
    icon: <ShoppingCart className="w-6 h-6" />
  },
  {
    title: 'Healthcare',
    description: 'Hospitals, clinics, diagnostic centers, pharmaceutical companies, and medical practices.',
    icon: <Stethoscope className="w-6 h-6" />
  },
  {
    title: 'Technology',
    description: 'Software companies, IT services, startups, and digital agencies.',
    icon: <Cpu className="w-6 h-6" />
  },
  {
    title: 'Real Estate',
    description: 'Property developers, real estate agencies, construction companies, and property management.',
    icon: <Home className="w-6 h-6" />
  },
  {
    title: 'Hospitality',
    description: 'Hotels, restaurants, travel agencies, event management, and tourism businesses.',
    icon: <Utensils className="w-6 h-6" />
  },
  {
    title: 'Professional Services',
    description: 'Consulting firms, law firms, educational institutions, and service providers.',
    icon: <GraduationCap className="w-6 h-6" />
  },
  {
    title: 'Agriculture & Food',
    description: 'Food processing, agricultural businesses, dairy farms, and agribusiness ventures.',
    icon: <Sprout className="w-6 h-6" />
  }
];