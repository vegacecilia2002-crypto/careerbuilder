
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Save, BarChart3, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Job, JobStatus, JobOrigin, MatchAnalysis } from '../types';
import { useJobContext } from '../context/JobContext';
import { generateCoverLetter, analyzeJobMatch } from '../services/geminiService';

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
  const [matchLoading, setMatchLoading] = useState(false);
  const [error, setError] = useState('');
  const [matchResult, setMatchResult] = useState<MatchAnalysis | null>(null);

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
      setMatchResult(initialData.matchAnalysis || null);
    } else {
      setFormData({
        company: '', role: '', status: 'Applied', salary: '', location: '',
        dateApplied: new Date().toISOString().split('T')[0],
        description: '', coverLetter: '', origin: defaultOrigin
      });
      setMatchResult(null);
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
    const jobData = { ...formData, matchAnalysis: matchResult, id: initialData?.id || crypto.randomUUID() } as Job;
    if (initialData) updateJob(initialData.id, jobData);
    else addJob(jobData);
    onClose();
  };

  const handleCheckMatch = async () => {
    if (!formData.description) {
      setError('Paste the Job Description first to analyze match.');
      return;
    }
    setMatchLoading(true);
    try {
      const result = await analyzeJobMatch(resume, formData.description);
      setMatchResult(result);
    } catch (err) {
      setError('Match analysis failed.');
    } finally {
      setMatchLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!formData.role || !formData.company) {
      setError('Please enter a Role and Company first.');
      return;
    }
    setAiLoading(true);
    setError('');
    try {
      const letter = await generateCoverLetter(formData.role!, formData.company!, resume.skills, formData.description);
      setFormData(prev => ({ ...prev, coverLetter: letter }));
    } catch (err) {
      setError('Failed to generate cover letter.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row">
        
        {/* Left Side: Form */}
        <div className="flex-1 flex flex-col border-r border-slate-100 overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold text-slate-900">{initialData ? 'Edit Job' : 'Add New Job'}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 md:hidden"><X size={24} /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Company</label>
                <input type="text" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" placeholder="Google" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Role</label>
                <input type="text" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" placeholder="Frontend Engineer" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Job Description</label>
                <button type="button" onClick={handleCheckMatch} disabled={matchLoading || !formData.description} className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:text-emerald-700 disabled:opacity-50">
                  {matchLoading ? <Loader2 size={12} className="animate-spin" /> : <BarChart3 size={12} />}
                  Check Match Score
                </button>
              </div>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 h-32 resize-none text-sm" placeholder="Paste job requirements here..." />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Cover Letter</label>
                <button type="button" onClick={handleGenerateCoverLetter} disabled={aiLoading} className="text-xs flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold disabled:opacity-50">
                  {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  {aiLoading ? 'Writing...' : 'AI Generate'}
                </button>
              </div>
              <textarea value={formData.coverLetter} onChange={e => setFormData({ ...formData, coverLetter: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 h-48 font-mono text-xs" placeholder="Personalized cover letter..." />
            </div>
          </form>
        </div>

        {/* Right Side: AI Match Analysis */}
        <div className="w-full md:w-80 bg-slate-50 p-6 overflow-y-auto shrink-0 flex flex-col">
          <div className="hidden md:flex justify-end mb-4">
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
          </div>

          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Match Intelligence</h3>

          {matchResult ? (
            <div className="space-y-6 animate-fadeIn">
               <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path className="text-slate-200" strokeDasharray="100, 100" strokeWidth="3" stroke="currentColor" fill="transparent" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-emerald-500" strokeDasharray={`${matchResult.score}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="transparent" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-900">{matchResult.score}%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Match</span>
                  </div>
               </div>

               <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-bold text-emerald-600 uppercase mb-2 flex items-center gap-1"><CheckCircle2 size={12}/> Key Strengths</h4>
                    <ul className="space-y-1">
                      {matchResult.strengths.slice(0, 3).map((s, i) => <li key={i} className="text-xs text-slate-600 bg-emerald-50 px-2 py-1 rounded-lg">• {s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-amber-600 uppercase mb-2 flex items-center gap-1"><AlertCircle size={12}/> Skill Gaps</h4>
                    <ul className="space-y-1">
                      {matchResult.gaps.slice(0, 3).map((g, i) => <li key={i} className="text-xs text-slate-600 bg-amber-50 px-2 py-1 rounded-lg">• {g}</li>)}
                    </ul>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">AI Coach Tip</p>
                    <p className="text-xs text-slate-600 italic">"{matchResult.advice}"</p>
                  </div>
               </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
               <BarChart3 size={48} className="mb-4 text-slate-300" />
               <p className="text-sm font-medium text-slate-500">Check your match score to unlock AI insights.</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-200">
             <button onClick={handleSubmit} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-200">
                <Save size={18} /> Save Entry
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
