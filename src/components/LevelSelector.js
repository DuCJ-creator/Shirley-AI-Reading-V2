// src/components/LevelSelector.js
'use client';

import React from 'react';
import { X } from 'lucide-react';
import { METALLIC_STYLES } from '@/utils/constants';

const LevelSelector = ({ onSelect, selectedTheme, onBack }) => {
  const style = METALLIC_STYLES[selectedTheme.style];
  
  return (
    <div className="flex flex-col items-center animate-fadeIn space-y-10 relative w-full max-w-5xl px-6">
      {/* X Button for Main Menu */}
      <button
        onClick={onBack}
        className="absolute -top-24 right-0 md:-right-4 flex items-center justify-center w-12 h-12 rounded-full bg-slate-800/50 hover:bg-red-500/80 text-white transition-all duration-300 border border-white/20 hover:rotate-90 shadow-lg group z-50"
        title="Return to Themes"
      >
        <X size={24} />
      </button>

      <div className="text-center mt-6">
        <h3 className="text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-300 to-yellow-600 font-serif font-bold mb-2 drop-shadow-lg">
          Choose Level
        </h3>
        <p className="text-slate-400 tracking-[0.3em] uppercase text-sm">選擇文章難度</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {['Easy', 'Medium', 'Hard'].map((lvl) => (
          <button
            key={lvl}
            onClick={() => onSelect(lvl)}
            className="relative overflow-hidden group rounded-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105"
          >
            {/* Glass Container */}
            <div className="absolute inset-0 bg-slate-800/60 backdrop-blur-xl border border-white/10 group-hover:border-white/30 transition-all duration-500 rounded-2xl shadow-xl" />
            
            {/* Metallic Glow Overlay */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-b ${style.bg.split(' ')[1]} to-transparent mix-blend-overlay`} />
            
            <div className="relative z-10 p-10 flex flex-col items-center justify-center h-full">
              <h4 className={`text-4xl font-black mb-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] tracking-wider`}>{lvl}</h4>
              <div className="w-12 h-0.5 bg-white/20 mb-4 group-hover:w-24 transition-all duration-500" />
              <p className="text-lg text-slate-200 font-medium mb-1">
                {lvl === 'Easy' ? '基礎 / Simple' : lvl === 'Medium' ? '進階 / Standard' : '高階 / Complex'}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LevelSelector;
