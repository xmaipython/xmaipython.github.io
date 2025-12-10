import React, { useState } from 'react';
import { Sparkles, Shirt, User, Menu } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import ResultGallery from './components/ResultGallery';
import { ImageSelection, GenerationResult, ViewAngle } from './types';
import { STOCK_PEOPLE, STOCK_CLOTHES, INITIAL_RESULTS } from './constants';
import { generateTryOnImage, urlToBase64 } from './services/geminiService';

const App: React.FC = () => {
  const [personSelection, setPersonSelection] = useState<ImageSelection>({ file: null, previewUrl: null, isStock: false });
  const [clothSelection, setClothSelection] = useState<ImageSelection>({ file: null, previewUrl: null, isStock: false });
  const [results, setResults] = useState<GenerationResult[]>(INITIAL_RESULTS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handlePersonSelect = (file: File | null, url: string | null, isStock: boolean) => {
    setPersonSelection({ file, previewUrl: url, isStock });
  };

  const handleClothSelect = (file: File | null, url: string | null, isStock: boolean) => {
    setClothSelection({ file, previewUrl: url, isStock });
  };

  const handleGenerate = async () => {
    if (!personSelection.previewUrl || !clothSelection.previewUrl) {
      setGlobalError("Please select both a person and clothing item.");
      return;
    }
    setGlobalError(null);
    setIsGenerating(true);

    // Reset results to loading state
    setResults(prev => prev.map(r => ({ ...r, loading: true, error: null, imageUrl: null })));

    try {
      // Convert inputs to base64
      const personBase64 = personSelection.file 
        ? await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string); // already data url
            reader.readAsDataURL(personSelection.file!);
          }).then(res => res.split(',')[1])
        : await urlToBase64(personSelection.previewUrl);

      const clothBase64 = clothSelection.file
        ? await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(clothSelection.file!);
          }).then(res => res.split(',')[1])
        : await urlToBase64(clothSelection.previewUrl);

      // Launch parallel requests for each angle
      const anglePromises = results.map(async (resultItem, index) => {
        try {
          const generatedImage = await generateTryOnImage(personBase64, clothBase64, resultItem.angle);
          setResults(prev => {
            const newResults = [...prev];
            newResults[index] = { ...newResults[index], loading: false, imageUrl: generatedImage };
            return newResults;
          });
        } catch (error: any) {
          setResults(prev => {
            const newResults = [...prev];
            newResults[index] = { ...newResults[index], loading: false, error: error.message || "Failed" };
            return newResults;
          });
        }
      });

      await Promise.all(anglePromises);

    } catch (error: any) {
      setGlobalError("Failed to process images. " + error.message);
      setResults(prev => prev.map(r => ({ ...r, loading: false })));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <h1 className="font-serif text-xl font-bold tracking-tight">VirtuStyle AI</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
            <a href="#" className="text-primary">Studio</a>
            <a href="#" className="hover:text-primary transition-colors">Showcase</a>
            <a href="#" className="hover:text-primary transition-colors">Pricing</a>
          </nav>
          <div className="md:hidden">
             <Menu className="text-gray-600" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full p-4 sm:p-6 lg:p-8">
        
        {/* Error Alert */}
        {globalError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
            <span className="font-bold">Error:</span> {globalError}
            <button onClick={() => setGlobalError(null)} className="ml-auto text-red-400 hover:text-red-700">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[800px]">
          
          {/* Left: Person Selection */}
          <div className="lg:col-span-3 h-full">
            <ImageUploader 
              title="Select Model" 
              stockItems={STOCK_PEOPLE}
              selectedPreview={personSelection.previewUrl}
              onSelect={handlePersonSelect}
            />
          </div>

          {/* Middle: Cloth Selection & Action */}
          <div className="lg:col-span-4 h-full flex flex-col gap-6">
            <div className="flex-1">
              <ImageUploader 
                title="Select Clothing" 
                stockItems={STOCK_CLOTHES}
                selectedPreview={clothSelection.previewUrl}
                onSelect={handleClothSelect}
              />
            </div>
            
            {/* Action Area */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
              <h3 className="font-serif text-xl font-bold mb-2">Ready to Transform?</h3>
              <p className="text-gray-500 text-sm mb-4">
                Our AI will generate 4 unique angles of the model wearing the selected outfit.
              </p>
              
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !personSelection.previewUrl || !clothSelection.previewUrl}
                className={`
                  w-full py-4 rounded-lg font-bold text-sm uppercase tracking-wider transition-all transform flex items-center justify-center gap-2
                  ${isGenerating || !personSelection.previewUrl || !clothSelection.previewUrl 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-black text-white hover:bg-gray-800 hover:shadow-lg active:scale-[0.98]'
                  }
                `}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Try-On
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-5 h-full">
            <ResultGallery results={results} isGenerating={isGenerating} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
