import React, { useState, useEffect } from 'react';
import { Sparkles, Layers, User, Shirt, Github, AlertCircle } from 'lucide-react';
import UploadZone from './components/UploadZone';
import ResultGallery from './components/ResultGallery';
import { PERSON_TEMPLATES, CLOTH_TEMPLATES } from './constants';
import { TryOnState, ViewAngle, GeneratedResult } from './types';
import { generateTryOnImage, urlToBase64 } from './services/geminiService';

const App: React.FC = () => {
  const [personImg, setPersonImg] = useState<string | null>(null);
  const [clothImg, setClothImg] = useState<string | null>(null);
  const [appState, setAppState] = useState<TryOnState>('idle');
  const [results, setResults] = useState<GeneratedResult[]>([
    { angle: ViewAngle.FRONT, imageUrl: '', loading: false },
    { angle: ViewAngle.SIDE_45, imageUrl: '', loading: false },
    { angle: ViewAngle.SIDE_90, imageUrl: '', loading: false },
    { angle: ViewAngle.BACK, imageUrl: '', loading: false },
  ]);
  const [selectedAngles, setSelectedAngles] = useState<ViewAngle[]>([ViewAngle.FRONT]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle image selection (File object or URL string)
  const handlePersonSelect = (input: File | string) => {
    handleImageInput(input, setPersonImg);
  };

  const handleClothSelect = (input: File | string) => {
    handleImageInput(input, setClothImg);
  };

  const handleImageInput = (input: File | string, setter: (val: string) => void) => {
    if (typeof input === 'string') {
      setter(input);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) setter(e.target.result as string);
      };
      reader.readAsDataURL(input);
    }
  };

  const toggleAngle = (angle: ViewAngle) => {
    setSelectedAngles(prev => 
      prev.includes(angle) ? prev.filter(a => a !== angle) : [...prev, angle]
    );
  };

  const handleGenerate = async () => {
    if (!personImg || !clothImg) {
      setErrorMsg("Please upload both a person image and a clothing image.");
      return;
    }
    if (selectedAngles.length === 0) {
      setErrorMsg("Please select at least one view angle.");
      return;
    }
    if (!process.env.API_KEY) {
      setErrorMsg("Missing Gemini API Key. Please check configuration.");
      return;
    }

    setAppState('generating');
    setErrorMsg(null);

    // Initialize results state for selected angles
    setResults(prev => prev.map(r => ({
      ...r,
      loading: selectedAngles.includes(r.angle as ViewAngle),
      error: undefined,
      // clear previous image if regenerating that angle
      imageUrl: selectedAngles.includes(r.angle as ViewAngle) ? '' : r.imageUrl 
    })));

    try {
      // Convert inputs to base64 if they are URLs (blob urls or external http urls)
      // If they are already data:image/..., urlToBase64 handles or we can check prefix.
      // The service helper handles standard fetchable URLs. For data URLs, we just strip prefix.
      
      let pBase64 = '';
      let cBase64 = '';

      if (personImg.startsWith('data:')) {
        pBase64 = personImg.split(',')[1];
      } else {
        pBase64 = await urlToBase64(personImg);
      }

      if (clothImg.startsWith('data:')) {
        cBase64 = clothImg.split(',')[1];
      } else {
        cBase64 = await urlToBase64(clothImg);
      }

      // Generate in parallel for selected angles
      // Note: In a real app, might want to queue these to avoid rate limits, but Gemini is fast.
      const promises = selectedAngles.map(async (angle) => {
        try {
          const generatedImageBase64 = await generateTryOnImage(pBase64, cBase64, angle);
          setResults(prev => prev.map(r => 
            r.angle === angle 
              ? { ...r, loading: false, imageUrl: generatedImageBase64 } 
              : r
          ));
        } catch (err: any) {
          console.error(`Error generating ${angle}:`, err);
          setResults(prev => prev.map(r => 
            r.angle === angle 
              ? { ...r, loading: false, error: err.message || "Generation failed" } 
              : r
          ));
        }
      });

      await Promise.all(promises);
      setAppState('complete');

    } catch (err: any) {
      console.error("Global generation error:", err);
      setErrorMsg(err.message || "An unexpected error occurred during the process.");
      setAppState('error');
      // Reset loading states
      setResults(prev => prev.map(r => ({ ...r, loading: false })));
    }
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-2 rounded-lg">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            NexusFit AI
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <span className="hover:text-white cursor-pointer transition-colors">How it Works</span>
          <span className="hover:text-white cursor-pointer transition-colors">Pricing</span>
          <span className="hover:text-white cursor-pointer transition-colors">API</span>
          <a href="#" className="text-slate-500 hover:text-white transition-colors">
            <Github size={20} />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8 max-w-[1600px]">
        
        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} className="text-red-500" />
            <p>{errorMsg}</p>
            <button onClick={() => setErrorMsg(null)} className="ml-auto text-sm hover:underline">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[800px]">
          
          {/* Left Column: Inputs (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto pr-1">
            <div className="flex-1 min-h-[300px]">
              <UploadZone 
                id="person-upload"
                title="Model / Person" 
                image={personImg} 
                onImageSelect={handlePersonSelect} 
                templates={PERSON_TEMPLATES}
              />
            </div>
            <div className="flex-1 min-h-[300px]">
               <UploadZone 
                id="cloth-upload"
                title="Garment / Style" 
                image={clothImg} 
                onImageSelect={handleClothSelect} 
                templates={CLOTH_TEMPLATES}
              />
            </div>
          </div>

          {/* Middle Column: Controls & Configuration (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4 bg-slate-900/50 rounded-xl p-4 border border-slate-800">
             <div className="space-y-4">
                <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                   <Layers size={18} className="text-purple-400" />
                   Configuration
                </h3>
                
                <div className="space-y-3">
                   <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Output Angles</p>
                   <div className="flex flex-col gap-2">
                      {Object.values(ViewAngle).map((angle) => (
                        <label key={angle} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 cursor-pointer transition-all">
                           <input 
                              type="checkbox" 
                              checked={selectedAngles.includes(angle)}
                              onChange={() => toggleAngle(angle)}
                              className="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                           />
                           <span className="text-sm font-medium text-slate-300">{angle}</span>
                        </label>
                      ))}
                   </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                   <button 
                      onClick={handleGenerate}
                      disabled={appState === 'generating' || !personImg || !clothImg}
                      className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95 ${
                        appState === 'generating' 
                          ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                          : (!personImg || !clothImg) 
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500'
                      }`}
                   >
                      {appState === 'generating' ? 'Generating...' : 'Generate Try-On'}
                   </button>
                   <p className="text-center text-xs text-slate-500 mt-3">
                      Powered by Gemini 2.5 Flash. <br/> GPU acceleration active.
                   </p>
                </div>
             </div>

             <div className="mt-auto bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-2">
                   <User size={16} className="text-indigo-400" />
                   <span className="text-xs text-slate-400">Identity Preservation</span>
                   <div className="ml-auto h-1.5 w-12 bg-green-500/20 rounded-full overflow-hidden">
                      <div className="h-full w-[95%] bg-green-500"></div>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <Shirt size={16} className="text-purple-400" />
                   <span className="text-xs text-slate-400">Texture Quality</span>
                   <div className="ml-auto h-1.5 w-12 bg-green-500/20 rounded-full overflow-hidden">
                      <div className="h-full w-[90%] bg-green-500"></div>
                   </div>
                </div>
             </div>
          </div>

          {/* Right Column: Results (6 cols) */}
          <div className="lg:col-span-6 h-full min-h-[400px]">
             <ResultGallery 
                results={results.filter(r => selectedAngles.includes(r.angle as ViewAngle) || r.imageUrl)} 
                onDownload={downloadImage}
                isGenerating={appState === 'generating'}
             />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
