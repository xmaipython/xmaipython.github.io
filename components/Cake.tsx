import React, { useState } from 'react';
import { Zap, Power } from 'lucide-react';

interface CakeProps {
  onBlowout: () => void;
}

const Cake: React.FC<CakeProps> = ({ onBlowout }) => {
  const [candlesBlown, setCandlesBlown] = useState(false);

  const handleBlow = () => {
    if (!candlesBlown) {
      setCandlesBlown(true);
      onBlowout();
    }
  };

  return (
    <div className="relative group cursor-pointer perspective-[1000px]" onClick={handleBlow}>
      {/* Interaction Hint */}
      {!candlesBlown && (
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/60 backdrop-blur-md px-6 py-2 border border-cyan-400/50 text-cyan-400 text-sm font-mono tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
          <Zap className="inline-block w-4 h-4 mr-2 animate-pulse" />
          [点击熄灭能量核心]
        </div>
      )}

      {/* Hologram Base Plate */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-8 border-2 border-cyan-500/30 rounded-full bg-cyan-900/20 shadow-[0_0_20px_rgba(6,182,212,0.2)] transform rotate-x-12 animate-pulse" />

      {/* Base Layer (Tech Block) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-64 h-24 border border-cyan-400/50 bg-gradient-to-b from-cyan-900/10 to-transparent backdrop-blur-sm z-10 clip-path-hex">
         {/* Circuit Lines */}
         <div className="absolute inset-0 opacity-30 bg-[linear-gradient(45deg,transparent_25%,rgba(0,243,255,0.2)_50%,transparent_75%)] bg-[length:10px_10px]" />
         <div className="absolute bottom-0 w-full h-1 bg-cyan-400/50" />
         <div className="absolute top-2 left-2 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
         <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full animate-ping delay-75" />
      </div>

      {/* Top Layer */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-48 h-16 border border-pink-500/50 bg-gradient-to-b from-pink-900/10 to-transparent backdrop-blur-sm z-20">
         <div className="absolute inset-0 opacity-30 bg-[linear-gradient(-45deg,transparent_25%,rgba(255,0,255,0.2)_50%,transparent_75%)] bg-[length:8px_8px]" />
         <div className="absolute bottom-0 w-full h-1 bg-pink-500/50" />
      </div>

      {/* Energy Candles */}
      <div className="absolute bottom-44 left-1/2 -translate-x-1/2 flex space-x-8 z-30">
        {[-1, 0, 1].map((i) => (
          <div key={i} className="relative flex flex-col items-center">
            {/* Candle Stick (Data Column) */}
            <div className="w-2 h-14 border-x border-cyan-200/50 bg-cyan-400/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-cyan-400/20 animate-scan" />
            </div>
            
            {/* Plasma Flame */}
            <div 
              className={`absolute -top-8 left-1/2 -translate-x-1/2 w-4 bg-white rounded-full transition-all duration-300 
              ${candlesBlown 
                ? 'opacity-0 scale-0 h-0' 
                : 'holo-flame h-8 opacity-100 shadow-[0_0_15px_#00f3ff]'
              }`} 
            />
            
            {/* Halo Glow */}
            {!candlesBlown && (
                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-12 h-12 bg-cyan-400/20 rounded-full blur-xl animate-pulse" />
            )}

            {/* Shutdown Effect (Visible only after blowout) */}
            {candlesBlown && (
               <div className="absolute -top-10 text-xs font-mono text-red-500 animate-bounce">
                  OFFLINE
               </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Label */}
      <div className="absolute -bottom-12 w-full text-center">
         <div className="inline-block px-3 py-1 border border-white/10 rounded text-xs font-mono text-cyan-700 bg-black/50">
             MODEL: CAKE-X3000
         </div>
      </div>
    </div>
  );
};

export default Cake;