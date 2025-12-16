import React, { useState, useRef } from 'react';
import { Upload, Wand2, Download, Save, Image as ImageIcon, RefreshCcw, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useJobContext } from '../context/JobContext';
import { generateProfessionalAvatar } from '../services/geminiService';

const DEFAULT_PROMPT = "Transform this person into a high-quality professional corporate headshot. Studio lighting, neutral grey gradient background, professional business attire, sharp focus, confident smile.";

export const AvatarBuilder: React.FC = () => {
  const { resume, updateResume } = useJobContext();
  const [originalImage, setOriginalImage] = useState<string | null>(resume.avatar || null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setOriginalImage(reader.result as string);
      setGeneratedImage(null); // Reset generated on new upload
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!originalImage) return;

    setIsGenerating(true);
    setError('');
    setGeneratedImage(null);

    try {
      // Remove data URL prefix for API call
      const base64Data = originalImage.split(',')[1];
      const resultBase64 = await generateProfessionalAvatar(base64Data, prompt);
      setGeneratedImage(`data:image/jpeg;base64,${resultBase64}`);
    } catch (err) {
      console.error(err);
      setError('Failed to generate avatar. Please ensure your image is clear and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToResume = () => {
    if (generatedImage) {
      updateResume({ ...resume, avatar: generatedImage });
      alert('Avatar saved to your resume profile!');
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'professional-headshot.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Avatar Studio</h1>
          <p className="text-slate-500">Transform casual selfies into professional corporate headshots.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input */}
        <div className="space-y-6">
          
          {/* Upload Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Upload size={20} className="text-emerald-600" />
              1. Upload Original
            </h2>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all ${
                originalImage ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/jpeg,image/png,image/webp"
              />
              
              {originalImage ? (
                <div className="relative w-full h-full p-2">
                  <img 
                    src={originalImage} 
                    alt="Original" 
                    className="w-full h-full object-contain rounded-lg" 
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center group">
                    <div className="opacity-0 group-hover:opacity-100 bg-white/90 px-4 py-2 rounded-lg font-medium text-sm shadow-sm transition-opacity">
                      Click to Change
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <ImageIcon size={32} />
                  </div>
                  <p className="font-medium text-slate-900">Click to upload a selfie</p>
                  <p className="text-sm text-slate-500 mt-1">JPG or PNG. Clear face visibility recommended.</p>
                </div>
              )}
            </div>
          </div>

          {/* Prompt Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-emerald-600" />
              2. Style Prompt
            </h2>
            
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm leading-relaxed min-h-[100px] resize-y"
                placeholder="Describe the desired outcome..."
              />
              
              <div className="flex gap-2 text-xs overflow-x-auto pb-2 scrollbar-hide">
                 <button 
                   onClick={() => setPrompt("Professional corporate headshot, studio lighting, neutral grey background, navy suit.")}
                   className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap text-slate-700"
                 >
                   Corporate
                 </button>
                 <button 
                   onClick={() => setPrompt("Friendly creative professional, warm lighting, blurred office background, smart casual attire.")}
                   className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap text-slate-700"
                 >
                   Creative
                 </button>
                 <button 
                   onClick={() => setPrompt("High contrast black and white professional portrait, dramatic lighting, sharp focus.")}
                   className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap text-slate-700"
                 >
                   B&W Dramatic
                 </button>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!originalImage || isGenerating}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Wand2 size={18} />
                    Generate Headshot
                  </>
                )}
              </button>
              
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Result */}
        <div className="bg-slate-900 rounded-2xl p-6 lg:p-8 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden shadow-xl">
           {/* Background decoration */}
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-10 right-10 w-64 h-64 bg-emerald-500 rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
           </div>

           <h2 className="text-white/90 font-bold mb-6 flex items-center gap-2 z-10">
              <Sparkles size={20} className="text-emerald-400" />
              AI Result
           </h2>

           {generatedImage ? (
             <div className="flex flex-col items-center w-full z-10 animate-scaleIn">
               <div className="bg-white p-2 rounded-2xl shadow-2xl mb-8 transform transition-transform hover:scale-[1.02] duration-300">
                 <img 
                   src={generatedImage} 
                   alt="AI Generated" 
                   className="rounded-xl max-h-[400px] object-cover" 
                 />
               </div>
               
               <div className="flex gap-4 w-full max-w-md">
                 <button 
                   onClick={handleSaveToResume}
                   className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                 >
                   <Save size={18} />
                   Save to Resume
                 </button>
                 <button 
                   onClick={handleDownload}
                   className="flex-1 py-3 bg-white/10 text-white backdrop-blur-sm rounded-xl font-bold text-sm hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                 >
                   <Download size={18} />
                   Download
                 </button>
               </div>
             </div>
           ) : (
             <div className="text-center z-10 opacity-40">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Wand2 size={40} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Ready to Transform</h3>
                <p className="text-white/70 max-w-xs mx-auto">
                  Upload a photo and click generate to see the professional result here.
                </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};