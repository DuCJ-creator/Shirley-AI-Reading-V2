// src/components/QuizSection.js
'use client';

import React, { useState } from 'react';
import { Lightbulb, CheckCircle, Award } from 'lucide-react';

const QuizSection = ({ questions, onComplete }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) score++;
    });
    return score;
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions first! (請先回答所有問題!)");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10 bg-slate-900/60 p-10 md:p-14 rounded-3xl backdrop-blur-xl border border-white/10 animate-fadeIn relative shadow-2xl">
      <div className="text-center mb-12">
        <h3 className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 font-bold mb-2 flex items-center justify-center">
          <Lightbulb className="mr-4 text-yellow-400 fill-yellow-400/20" size={36}/> Knowledge Check
        </h3>
        <p className="text-slate-400 uppercase tracking-[0.2em] text-sm">閱讀測驗</p>
      </div>
      
      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={idx} className={`p-8 rounded-2xl border transition-all duration-500 ${submitted ? (answers[idx] === q.answer ? 'border-green-500/30 bg-green-900/10' : 'border-red-500/30 bg-red-900/10') : 'border-white/5 bg-slate-800/40 hover:bg-slate-800/60'}`}>
            <p className="text-xl text-slate-200 mb-6 font-medium"><span className="text-yellow-500 font-bold mr-3 text-2xl opacity-80">0{idx + 1}</span> {q.q}</p>
            <div className="grid gap-3">
              {q.options.map((opt, optIdx) => (
                <button
                  key={optIdx}
                  onClick={() => handleSelect(idx, optIdx)}
                  disabled={submitted}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center justify-between font-medium border relative overflow-hidden group
                    ${answers[idx] === optIdx
                      ? 'bg-gradient-to-r from-yellow-600 to-yellow-800 text-white border-yellow-500/50 shadow-lg'
                      : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10 hover:text-slate-200'}
                    ${submitted ? 'cursor-default' : ''}
                  `}
                >
                  <span className="relative z-10">{opt}</span>
                  {answers[idx] === optIdx && !submitted && <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-yellow-800 -z-0" />}
                  
                  {submitted && q.answer === optIdx && <CheckCircle size={24} className="text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]"/>}
                  {submitted && answers[idx] === optIdx && answers[idx] !== q.answer && <div className="text-red-400 font-bold text-2xl drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]">✗</div>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="mt-12 w-full bg-gradient-to-r from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 text-white font-bold text-xl py-5 rounded-2xl shadow-[0_10px_40px_-10px_rgba(22,163,74,0.5)] transform hover:-translate-y-1 transition-all duration-300 tracking-wider uppercase border border-green-500/30"
        >
          Submit Answers
        </button>
      ) : (
        <div className="mt-12 text-center animate-bounceIn bg-gradient-to-br from-slate-800 to-slate-900 p-10 rounded-3xl border border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.15)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
          <p className="text-slate-400 uppercase tracking-widest text-sm mb-4">Final Result</p>
          <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 mb-8 drop-shadow-sm font-serif">
            {calculateScore()} <span className="text-4xl text-slate-600">/ {questions.length}</span>
          </div>
          <button
            onClick={() => onComplete(answers, calculateScore())}
            className="group bg-white text-slate-900 hover:bg-yellow-50 px-10 py-4 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center mx-auto space-x-3 transition-all duration-300 hover:scale-105"
          >
            <span>Create Portfolio</span>
            <Award size={20} className="text-yellow-600 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizSection;
