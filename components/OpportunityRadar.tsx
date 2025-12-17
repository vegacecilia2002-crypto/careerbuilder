
import React, { useState } from 'react';
import { Radar, Search, Loader2, ExternalLink, BookmarkPlus, MapPin, Building2, CheckCircle2, Sparkles } from 'lucide-react';
import { findMatchingJobs } from '../services/geminiService';
import { useJobContext } from '../context/JobContext';
import { JobOpportunity } from '../types';

export const OpportunityRadar: React.FC = () => {
  const { resume, addJob } = useJobContext();
  const [opportunities, setOpportunities] = useState<JobOpportunity[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async () => {
    if (!resume.skills) {
      setError('Please add skills to your resume first to help the radar find matches.');
      return;
    }
    
    setIsScanning(true);
    setError('');
    try {
      const results = await findMatchingJobs(resume.skills, resume.location);
      setOpportunities(results);
    } catch (err) {
      setError('The radar encountered an atmospheric disturbance (API Error). Try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const trackOpportunity = (opp: JobOpportunity) => {
    addJob({
      id: crypto.randomUUID(),
      company: opp.company,
      role: opp.title,
      location: opp.location,
      status: 'Applied',
      dateApplied: new Date().toISOString().split('T')[0],
      salary: '',
      description: `Discovered via Opportunity Radar.\nSource: ${opp.source}\nAI Match Reason: ${opp.matchReason}`,
      coverLetter: '',
      origin: 'application'
    });
    setOpportunities(prev => prev.filter(o => o.url !== opp.url));
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden text-white shadow-2xl">
        {/* Background Pulse */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
           <div className={`w-64 h-64 border-2 border-emerald-500/30 rounded-full ${isScanning ? 'animate-ping' : ''}`}></div>
           <div className={`absolute inset-0 w-96 h-96 border-2 border-blue-500/10 rounded-full -m-16 ${isScanning ? 'animate-ping' : ''}`} style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight mb-4 flex items-center justify-center md:justify-start gap-3">
              <Radar className="text-emerald-400" size={32} />
              Opportunity Radar
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Leverage Gemini's live search capabilities to discover high-matching job openings across the web based on your unique profile.
            </p>
          </div>
          
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {isScanning ? <Loader2 className="animate-spin" /> : <Search />}
            {isScanning ? 'Scanning Web...' : 'Scan for Jobs'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opportunities.map((opp, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-emerald-50 transition-colors">
                  <Building2 className="text-slate-400 group-hover:text-emerald-500" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  <Sparkles size={10} /> AI Match
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1">{opp.title}</h3>
              <p className="text-slate-600 font-medium mb-3">{opp.company}</p>
              
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                <MapPin size={14} />
                <span>{opp.location}</span>
              </div>

              <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                <p className="text-xs text-slate-600 italic">"{opp.matchReason}"</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex gap-3">
              <a
                href={opp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink size={16} />
                View Post
              </a>
              <button
                onClick={() => trackOpportunity(opp)}
                className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <BookmarkPlus size={16} />
                Track
              </button>
            </div>
          </div>
        ))}

        {!isScanning && opportunities.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
               <Radar size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Radar Offline</h3>
            <p className="text-slate-500">Click "Scan for Jobs" to find your next breakthrough.</p>
          </div>
        )}
      </div>
    </div>
  );
};
