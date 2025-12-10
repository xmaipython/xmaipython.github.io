import React from 'react';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { GenerationResult, ViewAngle } from '../types';
import JSZip from 'jszip';

interface ResultGalleryProps {
  results: GenerationResult[];
  isGenerating: boolean;
}

const ResultGallery: React.FC<ResultGalleryProps> = ({ results, isGenerating }) => {
  
  const saveAs = (blobOrUrl: Blob | string, filename: string) => {
    const link = document.createElement('a');
    if (typeof blobOrUrl === 'string') {
      link.href = blobOrUrl;
    } else {
      link.href = URL.createObjectURL(blobOrUrl);
    }
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (typeof blobOrUrl !== 'string') {
      setTimeout(() => URL.revokeObjectURL(link.href), 100);
    }
  };

  const handleDownload = (url: string | null, filename: string) => {
    if (url) {
      saveAs(url, filename);
    }
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    let hasContent = false;

    results.forEach((res) => {
      if (res.imageUrl) {
        hasContent = true;
        // Remove data:image/xxx;base64, prefix
        const base64Data = res.imageUrl.split(',')[1];
        zip.file(`try-on-${res.angle.replace(/\s+/g, '-').toLowerCase()}.png`, base64Data, { base64: true });
      }
    });

    if (hasContent) {
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'virtustyle-results.zip');
    }
  };

  const hasAnyResult = results.some(r => r.imageUrl !== null);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h2 className="font-serif text-lg font-bold text-gray-800">Generated Results</h2>
        {hasAnyResult && (
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            <Download size={14} />
            Download All
          </button>
        )}
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {results.map((result, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <div className="relative aspect-[3/4] bg-gray-50 rounded-lg border border-gray-100 overflow-hidden group">
                {result.loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-accent bg-gray-50/80 backdrop-blur-sm z-10">
                    <Loader2 size={32} className="animate-spin mb-2" />
                    <span className="text-xs font-medium tracking-wide">Generating {result.angle}...</span>
                  </div>
                ) : result.error ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 p-4 text-center">
                    <AlertCircle size={24} className="mb-2" />
                    <span className="text-xs">{result.error}</span>
                  </div>
                ) : result.imageUrl ? (
                  <>
                    <img 
                      src={result.imageUrl} 
                      alt={result.angle} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleDownload(result.imageUrl, `try-on-${result.angle}.png`)}
                        className="p-2 bg-white text-primary rounded-full hover:bg-gray-100 transition-colors"
                        title="Download"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                    <span className="text-xs uppercase tracking-wider font-medium">Waiting to generate</span>
                  </div>
                )}
                
                {/* Label */}
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-white text-[10px] uppercase font-bold tracking-wider">
                  {result.angle}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultGallery;