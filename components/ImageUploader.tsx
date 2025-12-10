import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Check } from 'lucide-react';
import { StockItem } from '../types';

interface ImageUploaderProps {
  title: string;
  stockItems: StockItem[];
  selectedPreview: string | null;
  onSelect: (file: File | null, url: string | null, isStock: boolean) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ title, stockItems, selectedPreview, onSelect }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'stock'>('upload');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onSelect(file, url, false);
    }
  };

  const handleStockSelect = (item: StockItem) => {
    // For stock items, we pass null as file, but pass the URL
    // The service will fetch and convert the URL to base64
    onSelect(null, item.url, true);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h2 className="font-serif text-lg font-bold text-gray-800">{title}</h2>
        <div className="flex bg-gray-200 rounded-lg p-1 text-xs font-medium">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'upload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Upload
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'stock' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Library
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto min-h-[300px]">
        {selectedPreview && (
          <div className="mb-6 relative group rounded-lg overflow-hidden shadow-md aspect-[3/4] max-h-64 mx-auto w-auto">
            <img 
              src={selectedPreview} 
              alt="Selected" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-sm font-medium">Selected Image</span>
            </div>
            <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
              <Check size={14} />
            </div>
          </div>
        )}

        {activeTab === 'upload' ? (
          <div className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-accent hover:text-accent transition-colors cursor-pointer relative bg-gray-50">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload size={32} className="mb-2" />
            <span className="text-sm font-medium">Click to upload image</span>
            <span className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {stockItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleStockSelect(item)}
                className={`relative aspect-[3/4] rounded-lg overflow-hidden group border-2 transition-all ${
                  selectedPreview === item.url ? 'border-accent ring-2 ring-accent/20' : 'border-transparent hover:border-gray-200'
                }`}
              >
                <img 
                  src={item.url} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <span className="text-white text-xs font-medium truncate block">{item.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
