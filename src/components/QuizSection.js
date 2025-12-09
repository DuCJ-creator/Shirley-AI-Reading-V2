// src/components/QuizSection.js
'use client';

import React, { useState, useMemo } from 'react';
import { Lightbulb, CheckCircle, Award, Languages } from 'lucide-react';

const QuizSection = ({ data, onComplete, isZh, onToggleLang }) => {
  const questions = Array.isArray(data?.quiz) ? data.quiz : [];
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  // ✅ ABCD -> correct option index（前端以 index 判定）
  const correctIndexOf = (q) => {
    const ans = String(q.answer || "A").toUpperCase().trim();
    const map = { A: 0, B: 1, C: 2, D: 3 };
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

  // ✅ 判斷選項是否已經自帶 ABCD 標號（A. / A) / A：）
  const hasLeadingLabel = (text) =>
    /^[\s]*[ABCD][\.\)\:：]\s+/i.test(String(text || ""));

  // ✅ 連續剝掉所有重複標號（處理像 "A. A. xxx"）
  const stripLeadingLabels = (text) => {
    let t = String(text || "");
    while (hasLeadingLabel(t)) {
      t = t.replace(/^[\s]*[ABCD][\.\)\:：]\s+/i, '');
    }
    return t;
  };

  // ✅ 同時兼容 optionsEn/options 舊欄位
  const getOptionsEn = (q) =>
    Array.isArray(q.optionsEn)
      ? q.optionsEn
      : Array.isArray(q.options)
      ? q.options
      : [];

  const getOptionsZh = (q) =>
    Array.isArray(q.optionsZh) ? q.optionsZh : [];

  const getQuestionEn = (q) =>
    q.questionEn || q.question || q.q || "";

  const getQuestionZh = (q) =>
    q.questionZh || q.question_zh || "";

  // ============================
  // ✅ NEW: 回報月光任務結果
  // ============================
  const postMissionResult = (correctCount) => {
    const payload = {
      type: "LUNAR_MISSION_RESULT",
      correct: correctCount,
      // 你要帶更多資訊也可以：
      // total: questions.length,
      // topic: data?.article?.titleEn || data?.meta?.themeEn,
    };

    try {
      // 主要給 window.open 的月光寶盒
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(payload, "*");
      }

      // 若未來改成 iframe 也會收到
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(payload, "*");
      }
    } catch (err) {
      console.warn("[QuizSection] postMessage failed:", err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10 bg-slate-900/60 p-10 md:p-14 rounded-3xl backdrop-blur-xl border border-white/10 animate-fadeIn relative shadow-2xl">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h3 className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 font-bold flex items-center justify-center">
            <Lightbulb className="mr-4 text-yellow-400 fill-yellow-400/20" size={36}/>
            Knowledge Check
          </h3>

          {/* ✅ 語言切換（全英 / 全繁中） */}
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
          const qText = isZh ? getQuestionZh(q) : getQuestionEn(q);

          // ✅ 中文模式：若 optionsZh 沒回，就 fallback 英文
          const options = (isZh && getOptionsZh(q).length)
            ? getOptionsZh(q)
            : getOptionsEn(q);

          const correctIdx = correctIdxList[idx];

          return (
            <div
              key={idx}
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
                  {String(idx + 1).padStart(2, "0")}
                </span>
                {qText || "(No question text)"}
              </p>

              <div className="grid gap-3">
                {(options || []).map((opt, optIdx) => {
                  const isSelected = answers[idx] === optIdx;
                  const isCorrect = submitted && optIdx === correctIdx;
                  const isWrongSelected = submitted && isSelected && optIdx !== correctIdx;

                  const labeled = hasLeadingLabel(opt);
                  const cleanOpt = stripLeadingLabels(opt);

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
                        {!labeled && (
                          <span className="mr-2 font-bold">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                        )}
                        {cleanOpt}
                      </span>

                      {isCorrect && (
                        <CheckCircle
                          size={24}
                          className="text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                        />
                      )}
                      {isWrongSelected && (
                        <div className="text-red-400 font-bold text-2xl drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]">
                          ✗
                        </div>
                      )}
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
        <div className="mt-12 text-center animate-bounceIn bg-gradient-to-br from-slate-800 to-slate-900 p-10 rounded-3xl border border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.15)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
          <p className="text-slate-400 uppercase tracking-widest text-sm mb-4">Final Result</p>

          <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 mb-8 drop-shadow-sm font-serif">
            {calculateScore()} <span className="text-4xl text-slate-600">/ {questions.length}</span>
          </div>

          <button
            onClick={() => {
              const score = calculateScore();
              // ✅ 先回報月光寶盒
              postMissionResult(score);
              // ✅ 再走原本流程
              onComplete(answers, score);
            }}
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
