import React, { useState } from 'react';
import { X, Bot, Loader2 } from 'lucide-react';
import { Job } from '../types';
import { generateInterviewGuide } from '../services/geminiService';
import { useJobContext } from '../context/JobContext';
import ReactMarkdown from 'react-markdown';

interface Props {
  job: Job;
  onClose: () => void;
}

export const AIInterviewModal: React.FC<Props> = ({ job, onClose }) => {
  const { updateJob } = useJobContext();
  const [loading, setLoading] = useState(false);
  const [guide, setGuide] = useState(job.interviewGuide || '');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await generateInterviewGuide(job.role, job.company, job.description);
      setGuide(result);
      updateJob(job.id, { interviewGuide: result });
    } catch (err) {
      setError('Failed to generate guide.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Bot size={24} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-900">AI Interview Coach</h2>
                <p className="text-sm text-slate-500">Strategy for {job.role} at {job.company}</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
          
          {!guide && !loading && (
             <div className="flex flex-col items-center justify-center h-48 text-center">
                <p className="text-slate-500 mb-4 max-w-sm">
                    Generate a personalized guide with potential questions, strategic answers, and negotiation tips.
                </p>
                <button 
                    onClick={handleGenerate}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-2"
                >
                    <Bot size={18} />
                    Generate Strategy Guide
                </button>
             </div>
          )}

          {loading && (
             <div className="flex flex-col items-center justify-center h-48">
                <Loader2 size={32} className="text-emerald-600 animate-spin mb-3" />
                <p className="text-slate-500 font-medium">Analyzing job details...</p>
             </div>
          )}

          {guide && (
              <div className="prose prose-slate prose-headings:text-slate-800 prose-p:text-slate-600 max-w-none bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                 <ReactMarkdown>{guide}</ReactMarkdown>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};