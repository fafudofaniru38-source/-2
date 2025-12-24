
import React, { useState, useRef, useEffect } from 'react';
import Experience from './components/Experience';
import { TreeState } from './types';
import { COLORS } from './constants';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.CHAOS);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 初始化音频对象
    const audio = new Audio('Christmas.mp3');
    audio.loop = true;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const toggleState = () => {
    setTreeState(prev => {
      const nextState = prev === TreeState.CHAOS ? TreeState.FORMED : TreeState.CHAOS;
      
      // 同步音频播放
      if (audioRef.current) {
        if (nextState === TreeState.FORMED) {
          audioRef.current.play().catch(err => {
            console.warn("浏览器拦截了自动播放，需用户交互：", err);
          });
        } else {
          audioRef.current.pause();
        }
      }
      
      return nextState;
    });
  };

  return (
    <div className="relative w-full h-screen bg-[#01120b] overflow-hidden">
      {/* 3D Experience */}
      <div className="absolute inset-0 z-0">
        <Experience treeState={treeState} />
      </div>

      {/* Luxury UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 sm:p-12">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-6xl font-serif italic tracking-tighter" style={{ color: COLORS.GOLD_METALLIC }}>
              Merry Christmas
            </h1>
            <p className="text-[10px] sm:text-xs uppercase tracking-wider opacity-80 leading-relaxed max-w-[180px] sm:max-w-[320px]" style={{ color: COLORS.GOLD_BRIGHT }}>
              Christmas Begins, Goodness Comes 2026
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-xs uppercase tracking-widest opacity-50" style={{ color: COLORS.GOLD_METALLIC }}>
              Status: {treeState}
            </p>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-end gap-8 pointer-events-auto">
          <div className="max-w-xs sm:max-w-sm space-y-4">
            <p className="text-xs sm:text-sm leading-relaxed opacity-70 italic" style={{ color: COLORS.WHITE_SOFT }}>
              Yes, VIRGINIA, there is a Santa Claus. He exists as certainly as love and generosity and devotion exist, and you know that they abound and give to your life its highest beauty and joy.
            </p>
            <div className="flex items-center gap-4">
               <div className="h-[1px] w-8 bg-emerald-800" />
               <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em]" style={{ color: COLORS.GOLD_METALLIC }}>
                 Francis Pharcellus Church
               </span>
            </div>
          </div>

          <button
            onClick={toggleState}
            className="group relative px-10 py-4 bg-emerald-950/40 border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-700 overflow-hidden"
          >
            <div className="absolute inset-0 w-1/2 h-full skew-x-[-30deg] bg-white/10 -translate-x-full group-hover:translate-x-[250%] transition-transform duration-1000 ease-in-out" />
            
            <span className="relative z-10 text-lg sm:text-xl font-medium tracking-widest uppercase transition-colors" 
                  style={{ color: COLORS.GOLD_METALLIC }}>
              {treeState === TreeState.CHAOS ? 'Assemble Tree' : 'Scatter Elements'}
            </span>
          </button>
        </div>
      </div>

      {/* Decorative Borders */}
      <div className="absolute inset-0 pointer-events-none border-[1px] border-[#D4AF37]/10 m-4" />
      <div className="absolute inset-0 pointer-events-none border-[1px] border-[#D4AF37]/5 m-6" />
      
      {/* Corner Ornaments */}
      <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[#D4AF37]/20 m-8" />
      <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-[#D4AF37]/20 m-8" />
    </div>
  );
};

export default App;
