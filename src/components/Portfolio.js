// src/components/Portfolio.js
'use client';

import React, { useRef } from 'react';
import { Printer, Award, RotateCcw, RefreshCw, Lightbulb } from 'lucide-react';

const Portfolio = ({ data, studentInfo, quizScore, answers, onReset, onSameTopic }) => {
  const componentRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fadeIn w-full max-w-5xl mx-auto pb-20 px-4">
      {/* Navigation and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 no-print bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl gap-4">
        <h2 className="text-2xl font-serif text-slate-200 pl-2 border-l-4 border-yellow-500">Your Learning Journey</h2>
        
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={handlePrint} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-xl flex items-center space-x-2 font-bold shadow-lg transition-transform hover:scale-105">
            <Printer size={18} /> <span>Save PDF</span>
          </button>
          
          <button onClick={onSameTopic} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl flex items-center space-x-2 font-bold shadow-lg transition-transform hover:scale-105">
            <RotateCcw size={18} /> <span>Same Topic, New Level</span>
          </button>

          <button onClick={onReset} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-xl flex items-center space-x-2 font-bold shadow-lg transition-transform hover:scale-105">
            <RefreshCw size={18} /> <span>New Topic</span>
          </button>
        </div>
      </div>

      <div id="printable-area" className="bg-white text-slate-900 p-12 md:p-16 rounded-xl shadow-2xl printable-content relative font-serif">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
          <Lightbulb size={400} />
        </div>

        <div className="flex justify-between items-end border-b-2 border-slate-900 pb-8 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">SHIRLEY'S AI READING COACH</h1>
            <p className="text-slate-500 text-sm tracking-[0.3em] uppercase">Bilingual Literacy Portfolio</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Student Profile</div>
            <div className="text-2xl font-bold text-slate-900">{studentInfo.name}</div>
            <div className="text-slate-600">{studentInfo.className} <span className="mx-2 text-slate-300">|</span> No. {studentInfo.seatNo}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="col-span-2 bg-slate-50 p-6 rounded-lg border border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Theme (主題)</h3>
            <p className="text-xl font-bold text-indigo-900 leading-tight mb-4">{data.themeEn} <span className="text-base text-slate-500 font-medium">| {data.themeZh}</span></p>
            
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Article Title</h3>
            <p className="text-lg font-bold text-slate-800 leading-tight">{data.title}</p>
            
            <div className="mt-4 inline-block bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{data.level} Level</div>
          </div>
          
          <div className="bg-slate-900 text-white p-6 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600 to-slate-900 opacity-50"></div>
            <h3 className="relative z-10 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Assessment</h3>
            <div className="relative z-10 text-5xl font-black text-white">{quizScore}<span className="text-2xl text-slate-500">/5</span></div>
          </div>
        </div>

        <div className="mb-12">
          <h3 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-widest">01. Reading Material</h3>
          <div className="text-slate-700 leading-loose text-justify text-lg columns-1 md:columns-2 gap-8">
            {data.content}
          </div>
        </div>

        <div className="mb-12 break-inside-avoid">
          <h3 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-widest">02. Vocabulary Acquisition</h3>
          <div className="grid grid-cols-1 gap-0 border border-slate-200 rounded-lg overflow-hidden">
            {data.vocabulary.map((v, i) => (
              <div key={i} className={`flex p-4 ${i !== data.vocabulary.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <div className="w-1/4 pr-4">
                  <div className="font-bold text-lg text-slate-900">{v.word}</div>
                  <div className="text-xs text-slate-400 italic font-serif">{v.pos}</div>
                </div>
                <div className="w-1/4 border-l border-slate-100 px-4 flex items-center">
                  <div className="font-bold text-slate-700">{v.zh}</div>
                </div>
                <div className="w-1/2 border-l border-slate-100 pl-4 text-sm">
                  <div className="text-slate-600 italic mb-1">"{v.en_ex}"</div>
                  <div className="text-slate-400">{v.zh_ex}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="break-inside-avoid">
          <h3 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-widest">03. Comprehension Review</h3>
          <div className="space-y-4">
            {data.quiz.map((q, i) => (
              <div key={i} className="flex items-start">
                <div className={`mt-1 mr-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${answers[i] === q.answer ? 'bg-green-600' : 'bg-red-600'}`}>
                  {answers[i] === q.answer ? '✓' : '✕'}
                </div>
                <div className="text-sm w-full">
                  <p className="font-bold text-slate-800 mb-1">Q{i+1}: {q.q}</p>
                  <div className="flex justify-between text-slate-500 bg-slate-50 p-2 rounded">
                    <span>Your Ans: <span className={answers[i] === q.answer ? 'text-green-700 font-bold' : 'text-red-600 font-bold'}>{q.options[answers[i] || 0]}</span></span>
                    {answers[i] !== q.answer && <span className="text-green-700">Correct: {q.options[q.answer]}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-medium uppercase tracking-widest">
          <div>Empowering Global Citizens</div>
          <div>{new Date().getFullYear()} © Shirley's AI Reading Coach</div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
