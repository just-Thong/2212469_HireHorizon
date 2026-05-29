export type JobCategory = 'Engineering' | 'Design' | 'Marketing' | 'Sales' | 'Product' | 'Customer Support' | 'Other';
export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';

export interface Job {
  id: string;
  title: string;
  companyName: string;
  companyLogo: string;
  location: string;
  salary: string;
  type: JobType;
  category: JobCategory;
  description: string;
  requirements: string[];
  responsibilities: string[];
  postedAt: string;
  tags: string[];
  isFeatured?: boolean;
}

export interface JobFilters {
  query: string;
  location: string;
  type: JobType[];
  category: JobCategory[];
}
