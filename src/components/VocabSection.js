// src/components/VocabSection.js
'use client';

import React from 'react';
import { Feather } from 'lucide-react';

const VocabSection = ({ vocab }) => (
  <div className="w-full max-w-6xl mx-auto mt-16 animate-fadeIn px-6">
    <div className="flex items-center justify-center mb-10">
      <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-yellow-500/50"></div>
      <h3 className="text-3xl mx-6 text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 to-yellow-600 font-serif font-bold flex items-center">
        <Feather className="mr-3 text-yellow-500" size={24}/> Vocabulary Bank
      </h3>
      <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-yellow-500/50"></div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vocab.map((v, idx) => (
        <div key={idx} className="group relative bg-slate-800/40 backdrop-blur-md border border-white/5 hover:border-yellow-500/30 p-8 rounded-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="flex justify-between items-baseline mb-4 relative z-10">
            <h4 className="text-3xl font-bold text-white group-hover:text-yellow-300 transition-colors drop-shadow-md">{v.word}</h4>
            <span className="text-xs font-bold text-slate-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">{v.pos}</span>
          </div>
          <p className="text-lg text-slate-200 font-medium mb-6 pb-4 border-b border-white/10 relative z-10">{v.zh}</p>
          <div className="relative z-10 pl-4 border-l-2 border-yellow-500/50 space-y-2">
            <p className="text-slate-300 italic font-serif leading-relaxed">"{v.en_ex}"</p>
            <p className="text-slate-500 text-sm">{v.zh_ex}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default VocabSection;
