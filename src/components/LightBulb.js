// src/components/LightBulb.js
'use client';

import React from 'react';
import { Snowflake } from 'lucide-react';
import { METALLIC_STYLES } from '@/utils/constants';
import { BlingStar, TextureOverlay } from './ChristmasElements';

const LightBulb = ({ theme, onClick, isSelected, isLarge = false }) => {
  const swayDelay = `${Math.random() * -3}s`;
  const style = METALLIC_STYLES[theme.style];

  return (
    <button
      onClick={() => onClick(theme)}
      className={`group relative flex flex-col items-center justify-center transition-all duration-500 outline-none
        ${isSelected ? 'scale-125 z-20' : 'hover:scale-110 hover:z-10'}
        ${isLarge ? 'p-8 cursor-default' : 'p-2 cursor-pointer'}
        ${!isSelected && !isLarge ? 'animate-sway origin-top' : ''}
      `}
      style={{ animationDelay: swayDelay }}
    >
      {/* Hanging Thread */}
      {!isLarge && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 -z-10 w-4 h-8 overflow-hidden">
          <div className="w-1 h-10 bg-gradient-to-b from-amber-900 to-yellow-700 rounded-full origin-bottom -rotate-12 translate-x-1"></div>
        </div>
      )}
      
      {/* METAL CAP */}
      <div className="relative z-0 flex flex-col items-center">
        <div className={`w-2 h-2 rounded-full border-2 border-yellow-400 ${isLarge ? 'mb-0.5' : 'mb-[1px]'} bg-yellow-500/50`}></div>
        <div className={`
          ${isLarge ? 'w-10 h-5' : 'w-5 h-3'}
          bg-gradient-to-r from-yellow-700 via-yellow-300 to-yellow-700
          rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.4)] border border-yellow-800/50
          flex flex-row justify-center items-center overflow-hidden
        `}>
          <div className="w-[1px] h-full bg-yellow-900/30 mx-[2px]"></div>
          <div className="w-[1px] h-full bg-yellow-900/30 mx-[2px]"></div>
        </div>
      </div>

      {/* THE TEXTURED METALLIC BALL */}
      <div className={`relative ${isLarge ? '-mt-1' : '-mt-[2px]'} z-10`}>
        <div
          className={`relative overflow-hidden
            ${style.bg}
            rounded-full
            ${isLarge ? 'w-40 h-40' : 'w-16 h-16'}
            transition-all duration-300
            shadow-xl
            ${isSelected
              ? `${style.glow} ring-2 ring-white/50 brightness-110`
              : 'brightness-95 hover:brightness-105'}
          `}
        >
          <TextureOverlay />
          
          {/* Engraved Snowflake Patterns */}
          <div className={`absolute inset-0 pointer-events-none ${style.snowflakeColor} mix-blend-multiply`}>
            <Snowflake className="absolute top-[15%] right-[15%] w-[40%] h-[40%] opacity-50 rotate-12 drop-shadow-[1px_1px_2px_rgba(255,255,255,0.1)]" strokeWidth={2} />
            <Snowflake className="absolute bottom-[10%] left-[10%] w-[30%] h-[30%] opacity-40 -rotate-12 drop-shadow-[1px_1px_2px_rgba(255,255,255,0.1)]" strokeWidth={2} />
            <Snowflake className="absolute top-[40%] left-[15%] w-[15%] h-[15%] opacity-30 rotate-45 drop-shadow-[1px_1px_2px_rgba(255,255,255,0.1)]" strokeWidth={1.5} />
          </div>
          <div className={`absolute inset-0 pointer-events-none ${style.snowflakeHighlight} mix-blend-screen translate-x-[1px] translate-y-[1px]`}>
            <Snowflake className="absolute top-[15%] right-[15%] w-[40%] h-[40%] opacity-30 rotate-12" strokeWidth={1} />
            <Snowflake className="absolute bottom-[10%] left-[10%] w-[30%] h-[30%] opacity-20 -rotate-12" strokeWidth={1} />
            <Snowflake className="absolute top-[40%] left-[15%] w-[15%] h-[15%] opacity-15 rotate-45" strokeWidth={0.5} />
          </div>

          {/* Shading Layers */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15)_0%,rgba(0,0,0,0.4)_60%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
          
          {/* Specular Highlight */}
          <div className="absolute top-[15%] left-[25%] w-[35%] h-[20%] bg-white/60 rounded-[50%] blur-[6px] rotate-[-45deg] mix-blend-overlay" />
          <div className="absolute top-[18%] left-[28%] w-[10%] h-[5%] bg-white rounded-full blur-[1px] rotate-[-45deg]" />
          
          {/* Internal Pulse */}
          <div className={`absolute inset-0 bg-white/10 rounded-full animate-pulse-slow ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
          
          {/* Bling */}
          {(isSelected || isLarge) && (
            <>
              <BlingStar className="top-[20%] right-[20%] w-5 h-5" delay="0s" />
              <BlingStar className="bottom-[25%] left-[25%] w-3 h-3" delay="0.5s" />
            </>
          )}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <BlingStar className="top-[40%] right-[10%] w-4 h-4" delay="0.2s" />
          </div>
        </div>
      </div>
      
      {/* Labels */}
      {!isLarge && (
        <div className={`mt-2 text-center transition-all duration-300 ${isSelected ? 'scale-110' : ''} bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full`}>
          <div className={`font-bold tracking-tight text-[10px] md:text-xs text-white drop-shadow-[0_2px_2px_rgba(0,0,0,1)]`}>{theme.labelEn}</div>
          <div className={`font-medium ${style.textColor} text-[9px] md:text-[10px] drop-shadow-[0_2px_2px_rgba(0,0,0,1)] opacity-90`}>{theme.labelZh}</div>
        </div>
      )}
    </button>
  );
};

export default LightBulb;
