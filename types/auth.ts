export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  // Candidate fields
  resume_url?: string;
  skills?: string[];
  // Recruiter fields
  company_name?: string;
  company_logo?: string;
  company_website?: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  cv_url: string;
  cover_letter?: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  applied_at: string;
  // Joined fields
  job_title?: string;
  company_name?: string;
  candidate_name?: string;
  candidate_email?: string;
}
