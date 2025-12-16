import React, { useState } from 'react';
import { useJobContext } from '../context/JobContext';
import { Job, JobOrigin } from '../types';
import { Plus, MapPin, DollarSign, Calendar, Bot, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { JobModal } from './JobModal';
import { AIInterviewModal } from './AIInterviewModal';

interface Props {
  origin: JobOrigin;
  title: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    'Applied': 'bg-blue-50 text-blue-700 border-blue-100',
    'Interview': 'bg-amber-50 text-amber-700 border-amber-100',
    'Offer': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Accepted': 'bg-purple-50 text-purple-700 border-purple-100',
    'Rejected': 'bg-red-50 text-red-700 border-red-100',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
};

export const JobBoard: React.FC<Props> = ({ origin, title }) => {
  const { getJobsByOrigin, deleteJob } = useJobContext();
  const jobs = getJobsByOrigin(origin);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [guideJob, setGuideJob] = useState<Job | null>(null);

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 mt-1">Manage your {title.toLowerCase()} pipeline.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
        >
          <Plus size={18} />
          Add {origin === 'offer' ? 'Offer' : 'Job'}
        </button>
      </div>

      <div className="grid gap-4">
        {jobs.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-500">No {title.toLowerCase()} found. Start by adding one!</p>
           </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                     <div>
                        <h3 className="font-bold text-lg text-slate-900">{job.role}</h3>
                        <p className="text-slate-500 font-medium">{job.company}</p>
                     </div>
                     <StatusBadge status={job.status} />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mt-3">
                    {job.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        <span>{job.location}</span>
                      </div>
                    )}
                    {job.salary && (
                      <div className="flex items-center gap-1.5">
                        <DollarSign size={14} />
                        <span>{job.salary}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>Applied {job.dateApplied}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 mt-4 md:mt-0 justify-end">
                   {/* Specific Action for Offers/Interviews */}
                   {(origin === 'offer' || job.status === 'Interview' || job.status === 'Offer') && (
                     <button 
                        onClick={() => setGuideJob(job)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                        title="AI Interview Coach"
                     >
                       <Bot size={18} />
                       <span className="hidden sm:inline">Coach</span>
                     </button>
                   )}
                   
                   <button onClick={() => handleEdit(job)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                     <Edit2 size={18} />
                   </button>
                   <button onClick={() => deleteJob(job.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                     <Trash2 size={18} />
                   </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      <JobModal
        isOpen={isModalOpen}
        onClose={handleClose}
        initialData={editingJob}
        defaultOrigin={origin}
      />
      
      {guideJob && (
        <AIInterviewModal 
            job={guideJob}
            onClose={() => setGuideJob(null)}
        />
      )}
    </div>
  );
};