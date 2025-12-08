'use client';

import React, { useState, useMemo } from 'react';
import { Lightbulb, CheckCircle, Award, Languages } from 'lucide-react';

const QuizSection = ({ data, onComplete, isZh, onToggleLang }) => {
  const questions = data?.quiz || [];
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  // ✅ ABCD -> correct option index
  const correctIndexOf = (q) => {
    const ans = String(q.answer || "A").toUpperCase();
    const map = { A:0, B:1, C:2, D:3 };
    return map[ans] ?? 0;
  };

  const correctIdxList = useMemo(
    () => questions.map(q => correctIndexOf(q)),
    [questions]
  );

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === correctIdxList[idx]) score++;
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
        <div className="flex items-center justify-center gap-3 mb-2">
          <h3 className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 font-bold flex items-center justify-center">
            <Lightbulb className="mr-4 text-yellow-400 fill-yellow-400/20" size={36}/>
            Knowledge Check
          </h3>

          <button
            onClick={onToggleLang}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border border-white/10 bg-slate-900/60 hover:bg-slate-800/60 transition"
            title="Toggle language"
          >
            <Languages size={14}/>
            {isZh ? "English" : "繁體中文"}
          </button>
        </div>
        <p className="text-slate-400 uppercase tracking-[0.2em] text-sm">
          {isZh ? "閱讀測驗（繁中）" : "Reading Quiz (EN)"}
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => {
          const qText = isZh ? q.questionZh : q.questionEn;
          const options = isZh && q.optionsZh?.length ? q.optionsZh : q.optionsEn;
          const correctIdx = correctIdxList[idx];

          return (
            <div key={idx}
              className={`p-8 rounded-2xl border transition-all duration-500 ${
                submitted
                  ? (answers[idx] === correctIdx
                      ? 'border-green-500/30 bg-green-900/10'
                      : 'border-red-500/30 bg-red-900/10')
                  : 'border-white/5 bg-slate-800/40 hover:bg-slate-800/60'
              }`}
            >
              <p className="text-xl text-slate-200 mb-6 font-medium">
                <span className="text-yellow-500 font-bold mr-3 text-2xl opacity-80">
                  0{idx + 1}
                </span>
                {qText}
              </p>

              <div className="grid gap-3">
                {options.map((opt, optIdx) => {
                  const isSelected = answers[idx] === optIdx;
                  const isCorrect = submitted && optIdx === correctIdx;
                  const isWrongSelected = submitted && isSelected && optIdx !== correctIdx;

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(idx, optIdx)}
                      disabled={submitted}
                      className={`
                        w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center justify-between font-medium border relative overflow-hidden group
                        ${isSelected
                          ? 'bg-gradient-to-r from-yellow-600 to-yellow-800 text-white border-yellow-500/50 shadow-lg'
                          : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10 hover:text-slate-200'}
                      `}
                    >
                      <span className="relative z-10">
                        <span className="mr-2 font-bold">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        {opt}
                      </span>

                      {isCorrect && <CheckCircle size={24} className="text-green-400"/>}
                      {isWrongSelected && <div className="text-red-400 font-bold text-2xl">✗</div>}
                    </button>
                  );
                })}
              </div>

              {submitted && isZh && q.explanationZh && (
                <div className="mt-4 text-slate-300/80 text-sm leading-relaxed">
                  {q.explanationZh}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="mt-12 w-full bg-gradient-to-r from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 text-white font-bold text-xl py-5 rounded-2xl shadow-[0_10px_40px_-10px_rgba(22,163,74,0.5)] transform hover:-translate-y-1 transition-all duration-300 tracking-wider uppercase border border-green-500/30"
        >
          Submit Answers
        </button>
      ) : (
        <div className="mt-12 text-center bg-gradient-to-br from-slate-800 to-slate-900 p-10 rounded-3xl border border-yellow-500/30">
          <p className="text-slate-400 uppercase tracking-widest text-sm mb-4">Final Result</p>
          <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 mb-8 font-serif">
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
