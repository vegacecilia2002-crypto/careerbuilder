import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Job, Resume } from '../types';

interface JobContextType {
  jobs: Job[];
  resume: Resume;
  addJob: (job: Job) => void;
  updateJob: (id: string, updatedJob: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  updateResume: (resume: Resume) => void;
  getJobsByOrigin: (origin: 'application' | 'offer') => Job[];
}

const JobContext = createContext<JobContextType | undefined>(undefined);

const INITIAL_RESUME: Resume = {
  fullName: "Alex Developer",
  email: "alex.dev@example.com",
  phone: "(555) 123-4567",
  location: "San Francisco, CA",
  linkedin: "linkedin.com/in/alexdev",
  website: "alexdev.io",
  summary: "Senior Frontend Engineer with 5+ years of experience building scalable web applications using React and TypeScript. Proven track record of improving site performance and user engagement. Adept at collaborating with cross-functional teams to deliver high-quality products.",
  skills: "React, TypeScript, Tailwind CSS, Node.js, UI/UX Design, Next.js, GraphQL",
  experience: [
    {
      id: '1',
      role: 'Senior Frontend Engineer',
      company: 'TechCorp Inc.',
      location: 'Remote',
      startDate: '2022-03',
      endDate: '',
      current: true,
      description: '• Led the migration of legacy code to React 19, improving load times by 40%.\n• Mentored junior developers and established best practices for code reviews.\n• Collaborated with UX designers to implement a new design system.'
    },
    {
      id: '2',
      role: 'Frontend Developer',
      company: 'WebSolutions LLC',
      location: 'Austin, TX',
      startDate: '2019-06',
      endDate: '2022-02',
      current: false,
      description: '• Developed responsive websites for over 20 clients using React and Redux.\n• Integrated RESTful APIs and optimized frontend performance.\n• Participated in agile development cycles and daily stand-ups.'
    }
  ],
  education: [
    {
      id: '1',
      degree: 'B.S. Computer Science',
      school: 'University of Texas at Austin',
      location: 'Austin, TX',
      startDate: '2015-08',
      endDate: '2019-05'
    }
  ],
  projects: []
};

const INITIAL_JOBS: Job[] = [
  {
    id: '1',
    company: 'TechCorp Inc.',
    role: 'Senior Frontend Engineer',
    status: 'Interview',
    salary: '$140k - $160k',
    location: 'Remote',
    dateApplied: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    description: 'Looking for a React expert to lead our dashboard team.',
    coverLetter: '',
    origin: 'application',
  },
  {
    id: '2',
    company: 'GreenEnergy Co.',
    role: 'Full Stack Developer',
    status: 'Applied',
    salary: '$120k',
    location: 'Austin, TX',
    dateApplied: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    description: 'Renewable energy startup needs help scaling.',
    coverLetter: '',
    origin: 'application',
  },
  {
    id: '3',
    company: 'DataFlow Systems',
    role: 'UI Designer',
    status: 'Offer',
    salary: '$135k',
    location: 'New York, NY',
    dateApplied: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
    description: 'Design the next generation of data tools.',
    coverLetter: '',
    origin: 'offer',
    interviewGuide: '## Strategy\n\nFocus on your portfolio...',
  }
];

export const JobProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('jobflow_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  const [resume, setResume] = useState<Resume>(() => {
    const saved = localStorage.getItem('jobflow_resume');
    return saved ? JSON.parse(saved) : INITIAL_RESUME;
  });

  useEffect(() => {
    localStorage.setItem('jobflow_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('jobflow_resume', JSON.stringify(resume));
  }, [resume]);

  const addJob = (job: Job) => {
    setJobs((prev) => [job, ...prev]);
  };

  const updateJob = (id: string, updatedJob: Partial<Job>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updatedJob } : j)));
  };

  const deleteJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const updateResume = (newResume: Resume) => {
    setResume(newResume);
  };

  const getJobsByOrigin = (origin: 'application' | 'offer') => {
    if (origin === 'offer') {
       return jobs.filter(j => j.origin === 'offer' || j.status === 'Offer');
    }
    return jobs.filter(j => j.origin === 'application' && j.status !== 'Offer');
  };

  return (
    <JobContext.Provider value={{ jobs, resume, addJob, updateJob, deleteJob, updateResume, getJobsByOrigin }}>
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