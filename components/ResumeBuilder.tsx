import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useJobContext } from '../context/JobContext';
import { Resume, ResumeExperience, ResumeEducation, ResumeProject } from '../types';
import { Plus, Trash2, Wand2, Download, User, Mail, Phone, MapPin, Linkedin, Globe, Loader2, Briefcase, GraduationCap, FileText, FolderGit2, Upload, Camera, ArrowUp, ArrowDown, Cpu, Sparkles, Eye, Edit3, ChevronRight } from 'lucide-react';
import { generateResumeSummary, analyzeResumeImage, enhanceResumeDescription } from '../services/geminiService';

export const ResumeBuilder: React.FC = () => {
  const { resume, updateResume } = useJobContext();
  const [activeTab, setActiveTab] = useState<'details' | 'skills' | 'summary' | 'experience' | 'education' | 'projects'>('details');
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState<string | null>(null); // Stores ID of item being enhanced
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = (field: keyof Resume, value: any) => {
    updateResume({ ...resume, [field]: value });
  };

  const handlePrint = () => {
    window.print();
  };

  const switchToEditor = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setMobileView('editor');
  };

  // --- AI Features ---

  const handleImportResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const base64 = await fileToBase64(file);
      const data = base64.split(',')[1];
      const mimeType = file.type;
      const extractedData = await analyzeResumeImage(data, mimeType);
      
      const newResume = { ...resume, ...extractedData };
      // Ensure IDs
      newResume.experience = newResume.experience?.map((e: any) => ({ ...e, id: e.id || crypto.randomUUID() })) || [];
      newResume.education = newResume.education?.map((e: any) => ({ ...e, id: e.id || crypto.randomUUID() })) || [];
      newResume.projects = newResume.projects?.map((e: any) => ({ ...e, id: e.id || crypto.randomUUID() })) || [];
      
      updateResume(newResume);
      alert("Resume imported successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to analyze resume.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
     const base64 = await fileToBase64(file);
     handleUpdate('avatar', base64);
  };

  const generateSummary = async () => {
    setIsGenerating(true);
    try {
      const experienceContext = resume.experience.map(e => `${e.role} at ${e.company}: ${e.description}`).join('\n');
      const currentRole = resume.experience[0]?.role || "Professional";
      const newSummary = await generateResumeSummary(currentRole, resume.skills, experienceContext);
      handleUpdate('summary', newSummary);
    } catch (e) {
      console.error(e);
      alert("Failed to generate summary.");
    } finally {
      setIsGenerating(false);
    }
  };

  const enhanceDescription = async (id: string, text: string, type: 'experience' | 'project') => {
    if (!text) return;
    setIsEnhancing(id);
    try {
      const enhancedText = await enhanceResumeDescription(text);
      if (type === 'experience') {
        updateExperience(id, 'description', enhancedText);
      } else {
        updateProject(id, 'description', enhancedText);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to enhance text.");
    } finally {
      setIsEnhancing(null);
    }
  };

  // --- CRUD Handlers ---

  const addExperience = () => {
    handleUpdate('experience', [{
      id: crypto.randomUUID(), role: '', company: '', location: '', startDate: '', endDate: '', current: false, description: ''
    }, ...resume.experience]);
  };
  const updateExperience = (id: string, field: keyof ResumeExperience, value: any) => {
    handleUpdate('experience', resume.experience.map(e => e.id === id ? { ...e, [field]: value } : e));
  };
  const removeExperience = (id: string) => handleUpdate('experience', resume.experience.filter(e => e.id !== id));
  const moveExperience = (index: number, direction: 'up' | 'down') => {
    const newExp = [...resume.experience];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newExp.length) {
      [newExp[index], newExp[targetIndex]] = [newExp[targetIndex], newExp[index]];
      handleUpdate('experience', newExp);
    }
  };

  const addEducation = () => {
    handleUpdate('education', [{
      id: crypto.randomUUID(), degree: '', school: '', location: '', startDate: '', endDate: ''
    }, ...resume.education]);
  };
  const updateEducation = (id: string, field: keyof ResumeEducation, value: any) => {
    handleUpdate('education', resume.education.map(e => e.id === id ? { ...e, [field]: value } : e));
  };
  const removeEducation = (id: string) => handleUpdate('education', resume.education.filter(e => e.id !== id));
  const moveEducation = (index: number, direction: 'up' | 'down') => {
    const newEdu = [...resume.education];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newEdu.length) {
      [newEdu[index], newEdu[targetIndex]] = [newEdu[targetIndex], newEdu[index]];
      handleUpdate('education', newEdu);
    }
  };

  const addProject = () => {
    handleUpdate('projects', [{
      id: crypto.randomUUID(), name: '', description: '', techStack: ''
    }, ...resume.projects]);
  };
  const updateProject = (id: string, field: keyof ResumeProject, value: any) => {
    handleUpdate('projects', resume.projects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };
  const removeProject = (id: string) => handleUpdate('projects', resume.projects.filter(p => p.id !== id));

  const tabs = [
    { id: 'details', label: 'Details', icon: User },
    { id: 'skills', label: 'Skills', icon: Cpu },
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
  ];

  return (
    <div className="flex flex-col h-full space-y-4">
       {/* Top Bar */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Resume Editor</h1>
            <p className="text-sm text-slate-500 hidden md:block">Build your professional profile step-by-step.</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
             <input type="file" ref={fileInputRef} onChange={handleImportResume} className="hidden" accept="image/*,application/pdf" />
             <button onClick={() => fileInputRef.current?.click()} disabled={isImporting} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50">
               {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
               <span className="inline">{isImporting ? 'Importing...' : 'Import'}</span>
             </button>
             <button onClick={handlePrint} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-100">
                <Download size={16} /> <span className="inline">Export PDF</span>
              </button>
          </div>
       </div>

       {/* Mobile View Toggle */}
       <div className="xl:hidden flex bg-slate-200 p-1 rounded-xl shrink-0">
          <button 
            onClick={() => setMobileView('editor')} 
            className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mobileView === 'editor' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
          >
            <Edit3 size={16} /> Editor
          </button>
          <button 
            onClick={() => setMobileView('preview')} 
            className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mobileView === 'preview' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
          >
            <Eye size={16} /> Preview
          </button>
       </div>

      <div className="flex flex-col xl:flex-row gap-6 h-[calc(100dvh-14rem)] xl:h-[calc(100vh-12rem)]">
        
        {/* --- EDITOR PANEL --- */}
        <div className={`w-full xl:w-5/12 flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:hidden h-full ${mobileView === 'editor' ? 'flex' : 'hidden xl:flex'}`}>
          {/* Tabs */}
          <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-hide bg-white z-10 shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id 
                    ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={16} />
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50">
            
            {/* 1. DETAILS TAB */}
            {activeTab === 'details' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Avatar */}
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                   <div className="relative w-20 h-20 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-md">
                      {resume.avatar ? <img src={resume.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={32} /></div>}
                   </div>
                   <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                        <button onClick={() => avatarInputRef.current?.click()} className="text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors">Upload</button>
                        <Link to="/avatar" className="text-xs px-3 py-1.5 bg-indigo-600 text-white border border-transparent rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-1.5 transition-colors shadow-sm shadow-indigo-200">
                           <Camera size={12} /> AI Studio
                        </Link>
                      </div>
                   </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Personal Information</h3>
                  <Input label="Full Name" value={resume.fullName} onChange={(v) => handleUpdate('fullName', v)} placeholder="Jane Doe" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Input label="Email" value={resume.email} onChange={(v) => handleUpdate('email', v)} placeholder="jane@example.com" />
                     <Input label="Phone" value={resume.phone} onChange={(v) => handleUpdate('phone', v)} placeholder="(555) 123-4567" />
                  </div>
                  <Input label="Location" value={resume.location} onChange={(v) => handleUpdate('location', v)} placeholder="San Francisco, CA" />
                  <Input label="LinkedIn" value={resume.linkedin} onChange={(v) => handleUpdate('linkedin', v)} placeholder="linkedin.com/in/jane" />
                  <Input label="Website" value={resume.website} onChange={(v) => handleUpdate('website', v)} placeholder="janedoe.com" />
                </div>
              </div>
            )}

            {/* 2. SKILLS TAB */}
            {activeTab === 'skills' && (
               <div className="space-y-4 animate-fadeIn">
                 <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Key Skills</h3>
                    <p className="text-sm text-slate-500 mb-4">List your technical and soft skills, separated by commas. These are crucial for AI optimization.</p>
                    <textarea 
                        value={resume.skills}
                        onChange={(e) => handleUpdate('skills', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 outline-none text-sm h-48 resize-none placeholder:text-slate-300 transition-all focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                        placeholder="e.g. React, TypeScript, Project Management, Public Speaking, Node.js..."
                    />
                 </div>
               </div>
            )}

            {/* 3. SUMMARY TAB */}
            {activeTab === 'summary' && (
              <div className="space-y-4 animate-fadeIn h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Professional Summary</h3>
                  <button 
                    onClick={generateSummary} 
                    disabled={isGenerating || (!resume.skills && resume.experience.length === 0)} 
                    className="text-xs flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                    title={(!resume.skills && resume.experience.length === 0) ? "Add skills or experience first" : "Generate summary based on your profile"}
                  >
                    {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {isGenerating ? 'Generating...' : 'Auto-Generate'}
                  </button>
                </div>
                <div className="flex-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                   <textarea
                    value={resume.summary}
                    onChange={(e) => handleUpdate('summary', e.target.value)}
                    className="w-full h-full p-4 rounded-lg outline-none text-sm leading-relaxed resize-none text-slate-700"
                    placeholder="Briefly describe your professional background and key achievements..."
                  />
                </div>
              </div>
            )}

            {/* 4. EXPERIENCE TAB */}
            {activeTab === 'experience' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Work Experience</h3>
                  <button onClick={addExperience} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"><Plus size={14} /> Add Role</button>
                </div>
                
                {resume.experience.length === 0 && <EmptyState icon={Briefcase} text="No experience listed yet." />}

                {resume.experience.map((exp, index) => (
                  <div key={exp.id} className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-4 transition-all hover:shadow-md group">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                         <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-bold text-slate-500">{index + 1}</span>
                         <span className="text-sm font-semibold text-slate-400">Position</span>
                      </div>
                      <div className="flex gap-1">
                         <button onClick={() => moveExperience(index, 'up')} disabled={index === 0} className="p-1 text-slate-300 hover:text-slate-600 disabled:opacity-30"><ArrowUp size={14} /></button>
                         <button onClick={() => moveExperience(index, 'down')} disabled={index === resume.experience.length - 1} className="p-1 text-slate-300 hover:text-slate-600 disabled:opacity-30"><ArrowDown size={14} /></button>
                         <button onClick={() => removeExperience(exp.id)} className="p-1 text-slate-300 hover:text-red-500 ml-2"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="Role Title" value={exp.role} onChange={(v) => updateExperience(exp.id, 'role', v)} placeholder="Senior Engineer" />
                      <Input label="Company" value={exp.company} onChange={(v) => updateExperience(exp.id, 'company', v)} placeholder="Acme Corp" />
                    </div>
                    <Input label="Location" value={exp.location} onChange={(v) => updateExperience(exp.id, 'location', v)} placeholder="Remote / City" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <Input label="Start Date" type="month" value={exp.startDate} onChange={(v) => updateExperience(exp.id, 'startDate', v)} />
                       <div className="flex flex-col justify-end">
                         {!exp.current && <Input label="End Date" type="month" value={exp.endDate} onChange={(v) => updateExperience(exp.id, 'endDate', v)} /> }
                         <div className="flex items-center gap-2 mt-3 ml-1">
                            <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)} className="rounded text-emerald-600" />
                            <label className="text-xs text-slate-600 font-medium">I currently work here</label>
                         </div>
                       </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                           <label className="text-xs font-medium text-slate-500">Description</label>
                           <button 
                             onClick={() => enhanceDescription(exp.id, exp.description, 'experience')}
                             disabled={isEnhancing === exp.id || !exp.description}
                             className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold hover:text-emerald-700 disabled:opacity-50"
                           >
                             {isEnhancing === exp.id ? <Loader2 size={10} className="animate-spin" /> : <Wand2 size={10} />}
                             AI Enhance
                           </button>
                        </div>
                        <textarea 
                            value={exp.description} 
                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)} 
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 outline-none text-sm h-32 resize-none placeholder:text-slate-300 transition-all focus:ring-1 focus:ring-emerald-500" 
                            placeholder="• Led a team of 5 developers..." 
                        />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 5. EDUCATION TAB */}
            {activeTab === 'education' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Education</h3>
                  <button onClick={addEducation} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"><Plus size={14} /> Add School</button>
                </div>

                {resume.education.length === 0 && <EmptyState icon={GraduationCap} text="No education listed yet." />}

                {resume.education.map((edu, index) => (
                  <div key={edu.id} className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-4 transition-all hover:shadow-md">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                         <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-bold text-slate-500">{index + 1}</span>
                         <span className="text-sm font-semibold text-slate-400">School</span>
                      </div>
                      <div className="flex gap-1">
                         <button onClick={() => moveEducation(index, 'up')} disabled={index === 0} className="p-1 text-slate-300 hover:text-slate-600 disabled:opacity-30"><ArrowUp size={14} /></button>
                         <button onClick={() => moveEducation(index, 'down')} disabled={index === resume.education.length - 1} className="p-1 text-slate-300 hover:text-slate-600 disabled:opacity-30"><ArrowDown size={14} /></button>
                         <button onClick={() => removeEducation(edu.id)} className="p-1 text-slate-300 hover:text-red-500 ml-2"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <Input label="Degree / Certificate" value={edu.degree} onChange={(v) => updateEducation(edu.id, 'degree', v)} placeholder="BS Computer Science" />
                    <Input label="School / University" value={edu.school} onChange={(v) => updateEducation(edu.id, 'school', v)} placeholder="University of Technology" />
                    <Input label="Location" value={edu.location} onChange={(v) => updateEducation(edu.id, 'location', v)} placeholder="City, State" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="Start Date" type="month" value={edu.startDate} onChange={(v) => updateEducation(edu.id, 'startDate', v)} />
                      <Input label="End Date" type="month" value={edu.endDate} onChange={(v) => updateEducation(edu.id, 'endDate', v)} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 6. PROJECTS TAB */}
            {activeTab === 'projects' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Projects</h3>
                  <button onClick={addProject} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"><Plus size={14} /> Add Project</button>
                </div>

                {resume.projects.length === 0 && <EmptyState icon={FolderGit2} text="No projects listed yet." />}

                {resume.projects.map((proj, index) => (
                  <div key={proj.id} className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-4 transition-all hover:shadow-md">
                     <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                         <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-bold text-slate-500">{index + 1}</span>
                         <span className="text-sm font-semibold text-slate-400">Project</span>
                      </div>
                      <button onClick={() => removeProject(proj.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"><Trash2 size={14} /></button>
                    </div>
                    <Input label="Project Name" value={proj.name} onChange={(v) => updateProject(proj.id, 'name', v)} placeholder="E-commerce Platform" />
                    <Input label="Tech Stack" value={proj.techStack} onChange={(v) => updateProject(proj.id, 'techStack', v)} placeholder="React, Node.js, AWS" />
                    <div>
                        <div className="flex justify-between items-center mb-1">
                           <label className="text-xs font-medium text-slate-500">Description</label>
                           <button 
                             onClick={() => enhanceDescription(proj.id, proj.description, 'project')}
                             disabled={isEnhancing === proj.id || !proj.description}
                             className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold hover:text-emerald-700 disabled:opacity-50"
                           >
                             {isEnhancing === proj.id ? <Loader2 size={10} className="animate-spin" /> : <Wand2 size={10} />}
                             AI Enhance
                           </button>
                        </div>
                        <textarea 
                            value={proj.description} 
                            onChange={(e) => updateProject(proj.id, 'description', e.target.value)} 
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 outline-none text-sm h-24 resize-none placeholder:text-slate-300 transition-all focus:ring-1 focus:ring-emerald-500" 
                            placeholder="Built a scalable platform serving 10k users..." 
                        />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- PREVIEW PANEL --- */}
        <div className={`w-full xl:w-7/12 flex-col h-full print:w-full print:absolute print:top-0 print:left-0 print:h-auto print:z-[100] print:bg-white ${mobileView === 'preview' ? 'flex' : 'hidden xl:flex'}`}>
          <div className="flex-1 bg-slate-100 rounded-2xl overflow-y-auto p-4 md:p-8 print:p-0 print:bg-white print:overflow-visible border border-slate-200 shadow-inner scrollbar-thin scrollbar-thumb-slate-300">
            <div className="bg-white shadow-xl mx-auto max-w-[210mm] min-h-[297mm] p-[10mm] md:p-[15mm] text-slate-900 print:shadow-none print:w-full print:max-w-none origin-top transition-transform">
              
              {/* Header with Avatar Layout */}
              <div onClick={() => switchToEditor('details')} className="cursor-pointer border-b-2 border-slate-900 pb-6 mb-6 flex gap-6 items-start hover:bg-slate-50 transition-colors p-2 -m-2 rounded-lg group relative">
                <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
                   <Edit3 size={12} /> <span className="hidden sm:inline">Edit Details</span>
                </div>
                {resume.avatar && (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm flex-shrink-0">
                    <img src={resume.avatar} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-3 text-slate-900 break-words">{resume.fullName || 'Your Name'}</h1>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                    {resume.email && <div className="flex items-center gap-1.5"><Mail size={14} className="text-emerald-600 shrink-0" /> <span className="break-all">{resume.email}</span></div>}
                    {resume.phone && <div className="flex items-center gap-1.5"><Phone size={14} className="text-emerald-600 shrink-0" /> {resume.phone}</div>}
                    {resume.location && <div className="flex items-center gap-1.5"><MapPin size={14} className="text-emerald-600 shrink-0" /> {resume.location}</div>}
                    {resume.linkedin && <div className="flex items-center gap-1.5"><Linkedin size={14} className="text-emerald-600 shrink-0" /> <span className="break-all">{resume.linkedin.replace(/^https?:\/\//, '')}</span></div>}
                    {resume.website && <div className="flex items-center gap-1.5"><Globe size={14} className="text-emerald-600 shrink-0" /> <span className="break-all">{resume.website.replace(/^https?:\/\//, '')}</span></div>}
                  </div>
                </div>
              </div>

              {resume.summary && (
                <div onClick={() => switchToEditor('summary')} className="cursor-pointer mb-8 hover:bg-slate-50 transition-colors p-2 -m-2 rounded-lg group relative">
                  <div className="absolute top-0 right-2 flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
                     <Edit3 size={12} /> <span className="hidden sm:inline">Edit Summary</span>
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1 mb-3">Professional Summary</h2>
                  <p className="text-sm leading-relaxed text-slate-800 text-justify whitespace-pre-line">{resume.summary}</p>
                </div>
              )}

              {resume.skills && (
                <div onClick={() => switchToEditor('skills')} className="cursor-pointer mb-8 hover:bg-slate-50 transition-colors p-2 -m-2 rounded-lg group relative">
                  <div className="absolute top-0 right-2 flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
                     <Edit3 size={12} /> <span className="hidden sm:inline">Edit Skills</span>
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1 mb-2">Skills</h2>
                  <p className="text-sm leading-relaxed text-slate-800">{resume.skills}</p>
                </div>
              )}

              {resume.experience.length > 0 && (
                <div onClick={() => switchToEditor('experience')} className="cursor-pointer mb-8 hover:bg-slate-50 transition-colors p-2 -m-2 rounded-lg group relative">
                  <div className="absolute top-0 right-2 flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
                     <Edit3 size={12} /> <span className="hidden sm:inline">Edit Experience</span>
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1 mb-4">Work Experience</h2>
                  <div className="space-y-6">
                    {resume.experience.map(exp => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-base text-slate-900">{exp.role}</h3>
                          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap bg-slate-100 px-2 py-0.5 rounded">
                            {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-emerald-700">{exp.company}</span>
                          <span className="text-xs text-slate-500 italic">{exp.location}</span>
                        </div>
                        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{exp.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resume.projects.length > 0 && (
                <div onClick={() => switchToEditor('projects')} className="cursor-pointer mb-8 hover:bg-slate-50 transition-colors p-2 -m-2 rounded-lg group relative">
                   <div className="absolute top-0 right-2 flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
                     <Edit3 size={12} /> <span className="hidden sm:inline">Edit Projects</span>
                   </div>
                   <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1 mb-4">Projects</h2>
                   <div className="space-y-4">
                     {resume.projects.map(proj => (
                       <div key={proj.id}>
                         <div className="flex justify-between items-baseline mb-1">
                           <h3 className="font-bold text-base text-slate-900">{proj.name}</h3>
                           <span className="text-xs text-emerald-600 font-medium">{proj.techStack}</span>
                         </div>
                         <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{proj.description}</div>
                       </div>
                     ))}
                   </div>
                </div>
              )}

              {resume.education.length > 0 && (
                <div onClick={() => switchToEditor('education')} className="cursor-pointer mb-8 hover:bg-slate-50 transition-colors p-2 -m-2 rounded-lg group relative">
                  <div className="absolute top-0 right-2 flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
                     <Edit3 size={12} /> <span className="hidden sm:inline">Edit Education</span>
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1 mb-3">Education</h2>
                  <div className="space-y-4">
                    {resume.education.map(edu => (
                      <div key={edu.id}>
                         <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-sm text-slate-900">{edu.school}</h3>
                          <span className="text-xs text-slate-500">{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</span>
                        </div>
                        <div className="text-sm text-slate-700">{edu.degree}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Typed Input Props
interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}

const Input: React.FC<InputProps> = ({ label, value, onChange, type = "text", placeholder }) => (
  <div>
    <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      placeholder={placeholder} 
      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 outline-none text-sm bg-white placeholder:text-slate-300 transition-all focus:ring-1 focus:ring-emerald-500" 
    />
  </div>
);

const EmptyState = ({ icon: Icon, text }: any) => (
  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
     <Icon className="mx-auto text-slate-300 mb-2" size={32} />
     <p className="text-slate-500 text-sm">{text}</p>
  </div>
);

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString + '-01');
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};