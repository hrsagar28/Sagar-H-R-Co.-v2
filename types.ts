import { ReactNode } from 'react';

export interface IconComponentProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export interface NavLink {
  name: string;
  path: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: ReactNode; // Expects a Lucide icon component
  link: string;
}

export interface IndustryItem {
  title: string;
  description: string;
  icon: ReactNode; // Expects a Lucide icon component
}

export interface InsightItem {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  slug: string;
  author: string;
  readTime: string;
  content: string; // HTML string for the article body
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export interface SubService {
  title: string;
  description: string;
}

export interface ServiceDetailContent {
  id: string;
  title: string;
  shortDescription: string; // For the hero section
  longDescription: string; // The "editorial" content
  features: SubService[]; // The list of specific services (e.g., ITR Filing)
}