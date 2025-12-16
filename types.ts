export type JobStatus = 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Accepted';

export type JobOrigin = 'application' | 'offer';

export interface Job {
  id: string;
  company: string;
  role: string;
  status: JobStatus;
  salary: string;
  location: string;
  dateApplied: string;
  description: string;
  coverLetter: string; // AI Generated
  origin: JobOrigin;
  interviewGuide?: string; // AI Generated for offers/interviews
}

export interface ResumeExperience {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface ResumeEducation {
  id: string;
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
}

export interface ResumeProject {
  id: string;
  name: string;
  description: string;
  techStack: string;
}

export interface Resume {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  skills: string; 
  avatar?: string; // Base64
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
}

export interface ChartData {
  date: string;
  applications: number;
}