import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Job, Resume } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface JobContextType {
  jobs: Job[];
  resume: Resume;
  addJob: (job: Job) => void;
  updateJob: (id: string, updatedJob: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  updateResume: (resume: Resume) => void;
  getJobsByOrigin: (origin: 'application' | 'offer') => Job[];
  isLoading: boolean;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

const INITIAL_RESUME: Resume = {
  fullName: "Alex Developer",
  email: "alex.dev@example.com",
  phone: "(555) 123-4567",
  location: "San Francisco, CA",
  linkedin: "linkedin.com/in/alexdev",
  website: "alexdev.io",
  summary: "Senior Frontend Engineer with 5+ years of experience...",
  skills: "React, TypeScript, Tailwind CSS, Node.js",
  experience: [],
  education: [],
  projects: []
};

// Helper to convert DB casing to CamelCase with safety checks
const mapJobFromDB = (j: any): Job => {
  if (!j) return {} as Job;
  return {
    id: j.id || '',
    company: j.company || '',
    role: j.role || '',
    status: j.status || 'Applied',
    salary: j.salary || '',
    location: j.location || '',
    dateApplied: j.date_applied || '',
    description: j.description || '',
    coverLetter: j.cover_letter || '',
    origin: j.origin || 'application',
    interviewGuide: j.interview_guide || ''
  };
};

// Helper to convert CamelCase to DB casing
const mapJobToDB = (j: Partial<Job>, userId: string) => ({
  user_id: userId,
  company: j.company,
  role: j.role,
  status: j.status,
  salary: j.salary,
  location: j.location,
  date_applied: j.dateApplied,
  description: j.description,
  cover_letter: j.coverLetter,
  origin: j.origin,
  interview_guide: j.interviewGuide
});

// Helper for Resume mapping with safety checks
const mapResumeFromDB = (r: any): Resume => {
  if (!r) return INITIAL_RESUME;
  return {
    fullName: r.full_name || '',
    email: r.email || '',
    phone: r.phone || '',
    location: r.location || '',
    linkedin: r.linkedin || '',
    website: r.website || '',
    summary: r.summary || '',
    skills: r.skills || '',
    avatar: r.avatar || undefined,
    experience: Array.isArray(r.experience) ? r.experience : [],
    education: Array.isArray(r.education) ? r.education : [],
    projects: Array.isArray(r.projects) ? r.projects : []
  };
};

const mapResumeToDB = (r: Resume, userId: string) => ({
  user_id: userId,
  full_name: r.fullName,
  email: r.email,
  phone: r.phone,
  location: r.location,
  linkedin: r.linkedin,
  website: r.website,
  summary: r.summary,
  skills: r.skills,
  avatar: r.avatar,
  experience: r.experience,
  education: r.education,
  projects: r.projects
});

export const JobProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resume, setResume] = useState<Resume>(INITIAL_RESUME);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Data
  useEffect(() => {
    if (!user) {
      setJobs([]);
      setResume(INITIAL_RESUME);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch Jobs
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('user_id', user.id)
          .order('date_applied', { ascending: false });

        if (jobsError) console.error('Error fetching jobs:', jobsError);
        if (jobsData) setJobs(jobsData.map(mapJobFromDB));

        // Fetch Resume
        const { data: resumeData, error: resumeError } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle to avoid 406 errors on empty results

        if (resumeError) {
          console.error('Error fetching resume:', resumeError);
        }
        
        if (resumeData) {
          setResume(mapResumeFromDB(resumeData));
        } else {
          // Initialize resume for new user
          const initialResume = { ...INITIAL_RESUME, fullName: user.name, email: user.email };
          setResume(initialResume);
        }

      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const addJob = async (job: Job) => {
    if (!user) return;
    setJobs((prev) => [job, ...prev]);

    const { data, error } = await supabase
      .from('jobs')
      .insert([mapJobToDB(job, user.id)])
      .select()
      .single();

    if (error) {
      console.error("Error adding job", error);
      return;
    }
    if (data) {
        setJobs(prev => prev.map(j => j.id === job.id ? mapJobFromDB(data) : j));
    }
  };

  const updateJob = async (id: string, updatedJob: Partial<Job>) => {
    if (!user) return;
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updatedJob } : j)));

    const dbPayload: any = {};
    if (updatedJob.company !== undefined) dbPayload.company = updatedJob.company;
    if (updatedJob.role !== undefined) dbPayload.role = updatedJob.role;
    if (updatedJob.status !== undefined) dbPayload.status = updatedJob.status;
    if (updatedJob.salary !== undefined) dbPayload.salary = updatedJob.salary;
    if (updatedJob.location !== undefined) dbPayload.location = updatedJob.location;
    if (updatedJob.dateApplied !== undefined) dbPayload.date_applied = updatedJob.dateApplied;
    if (updatedJob.description !== undefined) dbPayload.description = updatedJob.description;
    if (updatedJob.coverLetter !== undefined) dbPayload.cover_letter = updatedJob.coverLetter;
    if (updatedJob.origin !== undefined) dbPayload.origin = updatedJob.origin;
    if (updatedJob.interviewGuide !== undefined) dbPayload.interview_guide = updatedJob.interviewGuide;

    const { error } = await supabase
      .from('jobs')
      .update(dbPayload)
      .eq('id', id);

    if (error) console.error("Error updating job", error);
  };

  const deleteJob = async (id: string) => {
    if (!user) return;
    setJobs((prev) => prev.filter((j) => j.id !== id));

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);
    
    if (error) console.error("Error deleting job", error);
  };

  const updateResume = async (newResume: Resume) => {
    if (!user) return;
    setResume(newResume);

    const { error } = await supabase
      .from('resumes')
      .upsert(mapResumeToDB(newResume, user.id));

    if (error) console.error("Error updating resume", error);
  };

  const getJobsByOrigin = (origin: 'application' | 'offer') => {
    if (origin === 'offer') {
       return jobs.filter(j => j.origin === 'offer' || j.status === 'Offer');
    }
    return jobs.filter(j => j.origin === 'application' && j.status !== 'Offer');
  };

  return (
    <JobContext.Provider value={{ jobs, resume, addJob, updateJob, deleteJob, updateResume, getJobsByOrigin, isLoading }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobContext = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobContext must be used within a JobProvider');
  }
  return context;
};