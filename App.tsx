import React, { useState } from 'react';
import FireworksStage from './components/FireworksStage';
import { MousePointer2 } from 'lucide-react';

const App: React.FC = () => {
  const [started, setStarted] = useState(false);

  return (
    <div className="w-full h-screen bg-[#050510] relative overflow-hidden">
      {/* 3D Fireworks Canvas */}
      <FireworksStage />

      {/* Intro Overlay */}
      {!started && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-1000"
             style={{ opacity: started ? 0 : 1, pointerEvents: started ? 'none' : 'auto' }}>
            <div className="text-center animate-pulse cursor-pointer" onClick={() => setStarted(true)}>
                <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-pink-500 to-purple-600 mb-4 tracking-wider" style={{textShadow: '0 0 30px rgba(255,255,255,0.3)'}}>
                    孔焕焕
                </h1>
                <p className="text-gray-300 font-light text-lg tracking-[0.5em] uppercase">
                    3D Birthday Celebration
                </p>
                <div className="mt-12 flex flex-col items-center gap-2 text-white/50 text-sm">
                    <MousePointer2 className="w-6 h-6 animate-bounce" />
                    <span>点击屏幕开始 / Click to Start</span>
                </div>
            </div>
        </div>
      )}

      {/* Persistent UI Hints */}
      <div className={`absolute bottom-8 w-full text-center z-20 pointer-events-none transition-opacity duration-1000 ${started ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-white/30 text-xs tracking-widest uppercase">
             Move mouse to rotate view • Click to launch fireworks
          </p>
      </div>
    </div>
  );
};

export default App;
