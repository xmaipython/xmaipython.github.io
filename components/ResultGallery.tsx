import React from 'react';
import { Download, Maximize2, RefreshCw } from 'lucide-react';
import { GeneratedResult } from '../types';

interface ResultGalleryProps {
  results: GeneratedResult[];
  onDownload: (url: string, filename: string) => void;
  isGenerating: boolean;
}

const ResultGallery: React.FC<ResultGalleryProps> = ({ results, onDownload, isGenerating }) => {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg flex flex-col h-full">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <h3 className="font-semibold text-slate-100 flex items-center gap-2">
          <span className="bg-indigo-500 w-2 h-6 rounded-sm"></span>
          Generated Results
        </h3>
        {isGenerating && (
          <div className="flex items-center gap-2 text-indigo-400 text-sm animate-pulse">
            <RefreshCw size={14} className="animate-spin" />
            Processing...
          </div>
        )}
      </div>

      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-min overflow-y-auto">
        {results.map((res, idx) => (
          <div key={res.angle} className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden flex flex-col group relative aspect-[3/4]">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-3 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-black/60 to-transparent">
               <span className="text-xs font-bold text-white bg-black/40 px-2 py-1 rounded backdrop-blur-md">
                 {res.angle}
               </span>
               <div className="flex gap-1">
                 {!res.loading && !res.error && res.imageUrl && (
                    <button
                      onClick={() => onDownload(res.imageUrl, `try-on-${res.angle}.png`)}
                      className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-md backdrop-blur-md transition-colors"
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                 )}
               </div>
            </div>

            {/* Content */}
            <div className="flex-1 relative w-full h-full flex items-center justify-center">
              {res.loading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                  <p className="text-xs text-indigo-300 font-medium">Rendering...</p>
                </div>
              ) : res.error ? (
                <div className="p-4 text-center">
                  <p className="text-red-400 text-sm font-medium mb-1">Generation Failed</p>
                  <p className="text-xs text-slate-500">{res.error}</p>
                </div>
              ) : res.imageUrl ? (
                <img
                  src={res.imageUrl}
                  alt={`Result ${res.angle}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-600 flex flex-col items-center">
                   <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-2">
                      <Maximize2 size={24} className="opacity-20" />
                   </div>
                   <span className="text-sm">Waiting for generation</span>
                </div>
              )}
            </div>
            
            {/* Footer Label for non-hover state visibility */}
            <div className="absolute bottom-3 left-3 md:hidden">
               <span className="text-xs font-bold text-white bg-black/40 px-2 py-1 rounded backdrop-blur-md">
                 {res.angle}
               </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultGallery;
