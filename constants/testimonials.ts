
export interface Testimonial {
  id: string;
  name: string;
  company: string;
  industry: string;
  quote: string;
  rating: number;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    company: "Kumar Textiles",
    industry: "Manufacturing",
    quote: "Sagar H R & Co. transformed our compliance process. Their proactive approach to GST filings has saved us countless hours and penalties. Truly professional service.",
    rating: 5
  },
  {
    id: "2",
    name: "Priya Sharma",
    company: "Sharma Electronics",
    industry: "Retail",
    quote: "As a growing retail business, we needed a CA who understood our challenges. The team's expertise in inventory accounting and tax planning has been invaluable.",
    rating: 5
  },
  {
    id: "3",
    name: "Dr. Venkatesh Rao",
    company: "Rao Medical Centre",
    industry: "Healthcare",
    quote: "Exceptional attention to detail and always available when we need guidance. They handle our clinic's finances so we can focus on patient care.",
    rating: 5
  }
];
