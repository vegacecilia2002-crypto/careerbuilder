import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Save } from 'lucide-react';
import { Job, JobStatus, JobOrigin } from '../types';
import { useJobContext } from '../context/JobContext';
import { generateCoverLetter } from '../services/geminiService';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Job | null;
  defaultOrigin: JobOrigin;
}

export const JobModal: React.FC<JobModalProps> = ({ isOpen, onClose, initialData, defaultOrigin }) => {
  const { addJob, updateJob, resume } = useJobContext();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Partial<Job>>({
    company: '',
    role: '',
    status: 'Applied',
    salary: '',
    location: '',
    dateApplied: new Date().toISOString().split('T')[0],
    description: '',
    coverLetter: '',
    origin: defaultOrigin
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        company: '',
        role: '',
        status: 'Applied',
        salary: '',
        location: '',
        dateApplied: new Date().toISOString().split('T')[0],
        description: '',
        coverLetter: '',
        origin: defaultOrigin
      });
    }
    setError('');
  }, [initialData, isOpen, defaultOrigin]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.role) {
      setError('Company and Role are required.');
      return;
    }

    const jobData = {
        ...formData,
        id: initialData?.id || crypto.randomUUID(),
    } as Job;

    if (initialData) {
      updateJob(initialData.id, jobData);
    } else {
      addJob(jobData);
    }
    onClose();
  };

  const handleGenerateCoverLetter = async () => {
    if (!formData.role || !formData.company) {
      setError('Please enter a Role and Company first.');
      return;
    }
    
    setAiLoading(true);
    setError('');
    
    try {
      const letter = await generateCoverLetter(
        formData.role!,
        formData.company!,
        resume.skills,
        formData.description
      );
      setFormData(prev => ({ ...prev, coverLetter: letter }));
    } catch (err) {
      setError('Failed to generate cover letter. Check your API Key.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-900">
            {initialData ? 'Edit Job' : 'Add New Job'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                placeholder="Google"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Role</label>
              <input
                type="text"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                placeholder="Frontend Engineer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as JobStatus })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
             <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Date Applied</label>
              <input
                type="date"
                value={formData.dateApplied}
                onChange={e => setFormData({ ...formData, dateApplied: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
              />
            </div>
             <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Salary Range (Optional)</label>
              <input
                type="text"
                value={formData.salary}
                onChange={e => setFormData({ ...formData, salary: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                placeholder="$120k - $150k"
              />
            </div>
             <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                placeholder="Remote / NYC"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Job Description / Notes</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors h-24 resize-none"
              placeholder="Paste job description key points here to help the AI..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Cover Letter</label>
              <button
                type="button"
                onClick={handleGenerateCoverLetter}
                disabled={aiLoading}
                className="text-xs flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50"
              >
                {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {aiLoading ? 'Writing...' : 'Generate with AI'}
              </button>
            </div>
            <textarea
              value={formData.coverLetter}
              onChange={e => setFormData({ ...formData, coverLetter: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors h-48 font-mono text-sm"
              placeholder="AI generated cover letter will appear here..."
            />
          </div>
        </form>
        
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl sticky bottom-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm shadow-emerald-200"
          >
            <Save size={18} />
            Save Job
          </button>
        </div>
      </div>
    </div>
  );
};