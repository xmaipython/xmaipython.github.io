import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { TemplateImage } from '../types';

interface UploadZoneProps {
  title: string;
  image: string | null;
  onImageSelect: (file: File | string) => void;
  templates: TemplateImage[];
  id: string;
}

const UploadZone: React.FC<UploadZoneProps> = ({ title, image, onImageSelect, templates, id }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'template'>('upload');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
      <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
        <h3 className="font-semibold text-slate-100 flex items-center gap-2">
          <ImageIcon size={18} className="text-indigo-400" />
          {title}
        </h3>
        <div className="flex bg-slate-900 rounded-lg p-1 text-xs font-medium">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'upload' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload
          </button>
          <button
            onClick={() => setActiveTab('template')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'template' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Library
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 relative min-h-[300px]">
        {image ? (
          <div className="relative h-full w-full group rounded-lg overflow-hidden border border-slate-600 bg-slate-900">
             <img src={image} alt="Selected" className="w-full h-full object-contain" />
             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
               <button 
                onClick={() => {
                   if (activeTab === 'upload') fileInputRef.current?.click();
                   else setActiveTab('template');
                }}
                className="bg-white text-slate-900 px-4 py-2 rounded-full font-medium hover:bg-slate-100 transition-colors"
               >
                 Change
               </button>
             </div>
             <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                <CheckCircle size={16} />
             </div>
          </div>
        ) : (
          activeTab === 'upload' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`h-full w-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/30'
              }`}
            >
              <div className="bg-slate-700 p-4 rounded-full mb-4 text-indigo-400">
                <Upload size={32} />
              </div>
              <p className="text-slate-200 font-medium mb-1">Click to upload or drag & drop</p>
              <p className="text-slate-400 text-sm">JPG, PNG, WEBP up to 5MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="h-full overflow-y-auto pr-1 grid grid-cols-2 gap-3 content-start">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => onImageSelect(tpl.url)}
                  className="relative group aspect-[3/4] rounded-lg overflow-hidden border border-slate-700 hover:border-indigo-500 transition-all"
                >
                  <img src={tpl.url} alt={tpl.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <span className="text-xs text-white font-medium truncate block">{tpl.label}</span>
                  </div>
                </button>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default UploadZone;
