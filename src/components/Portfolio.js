'use client';

import React, { useMemo } from "react";
import { RefreshCw, Home, Award, CheckCircle2, XCircle } from "lucide-react";

const Portfolio = ({
  data,
  studentInfo,
  quizScore = 0,
  answers = {},
  onReset,
  onSameTopic,
}) => {
  const article = data?.article || {};
  const quiz = Array.isArray(data?.quiz) ? data.quiz : [];
  const vocab = Array.isArray(data?.vocabulary) ? data.vocabulary : [];

  // ✅ 兼容舊欄位（避免 undefined）
  const titleEn =
    article.titleEn || article.title || data?.titleEn || data?.title || "Topic";
  const titleZh =
    article.titleZh || article.title_zh || data?.titleZh || data?.title_zh || "";

  const paragraphsEn =
    article.paragraphsEn ||
    article.paragraphs ||
    data?.content?.split(/\n\s*\n/).filter(Boolean) ||
    [];

  const paragraphsZh =
    article.paragraphsZh ||
    [];

  const level = data?.meta?.level || data?.level || "Easy";
  const provider = data?.meta?.provider || "unknown";
  const version = data?.meta?.version || "";

  const abc = ["A", "B", "C", "D"];

  // ✅ quiz 正解 index（ABCD -> 0..3）
  const correctIndexOf = (q) => {
    const ans = String(q.answer || "A").trim().toUpperCase();
    const map = { A: 0, B: 1, C: 2, D: 3 };
    return map[ans] ?? 0;
  };

  // ✅ 取 option array（兼容新舊）
  const getOptionsEn = (q) =>
    Array.isArray(q.optionsEn)
      ? q.optionsEn
      : Array.isArray(q.options)
      ? q.options
      : [];

  // ✅ 取 question（兼容新舊）
  const getQuestionEn = (q) =>
    q.questionEn || q.question || q.q || "";

  const reportRows = useMemo(() => {
    return quiz.map((q, idx) => {
      const opts = getOptionsEn(q);
      const correctIdx = correctIndexOf(q);
      const userIdx = answers?.[idx];

      const correctLetter = abc[correctIdx] || "A";
      const userLetter =
        typeof userIdx === "number" ? abc[userIdx] : "-";

      const correctText = opts?.[correctIdx] || "";
      const userText =
        typeof userIdx === "number" ? (opts?.[userIdx] || "") : "";

      const isCorrect = typeof userIdx === "number" && userIdx === correctIdx;

      return {
        idx,
        question: getQuestionEn(q),
        opts,
        correctIdx,
        userIdx,
        correctLetter,
        userLetter,
        correctText,
        userText,
        isCorrect,
      };
    });
  }, [quiz, answers]);

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4 animate-fadeIn">
      {/* ===== Header ===== */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-yellow-500/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full" />

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
              Learning Portfolio
            </h1>
            <p className="mt-2 text-slate-400 tracking-wider">
              Topic: <span className="text-yellow-300 font-bold">{titleEn}</span>
              {titleZh && <span className="text-slate-500"> ｜{titleZh}</span>}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Level: {level} • Provider: {provider} {version && `• ${version}`}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end">
            <div className="text-slate-400 text-sm tracking-widest uppercase">
              Student
            </div>
            <div className="text-xl font-bold text-white">
              {studentInfo?.name || "—"}
            </div>
            <div className="text-slate-300 text-sm">
              Class {studentInfo?.className || "—"} • Seat {studentInfo?.seatNo || "—"}
            </div>
          </div>
        </div>

        {/* Score */}
        <div className="mt-8 flex items-center justify-center bg-black/30 rounded-2xl p-6 border border-white/5">
          <Award className="text-yellow-400 mr-3" size={28} />
          <div className="text-center">
            <div className="text-slate-400 text-xs tracking-[0.2em] uppercase">
              Quiz Score
            </div>
            <div className="text-4xl font-black text-yellow-300">
              {quizScore}
              <span className="text-slate-500 text-2xl"> / {quiz.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Article (EN) ===== */}
      <div className="mt-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-4 tracking-widest uppercase">
          Article (EN)
        </h2>
        <div className="space-y-4 text-slate-200 leading-relaxed">
          {paragraphsEn.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {!paragraphsEn.length && (
            <p className="text-slate-500">No English article content.</p>
          )}
        </div>

        {/* Optional: ZH summary under fold */}
        {paragraphsZh.length > 0 && (
          <details className="mt-6">
            <summary className="cursor-pointer text-yellow-300 text-sm font-bold tracking-widest uppercase">
              展開繁中版本
            </summary>
            <div className="mt-4 space-y-3 text-slate-300 leading-relaxed">
              {paragraphsZh.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* ===== Vocabulary ===== */}
      <div className="mt-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-4 tracking-widest uppercase">
          Vocabulary
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {vocab.map((v, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center justify-between">
                <div className="text-lg font-black text-white">
                  {v.word}
                  {v.pos && <span className="ml-2 text-sm text-slate-400">{v.pos}</span>}
                </div>
              </div>
              {v.meaningZh && (
                <div className="mt-1 text-slate-200">{v.meaningZh}</div>
              )}
              {v.exampleEn && (
                <div className="mt-2 text-slate-300 text-sm">{v.exampleEn}</div>
              )}
              {v.exampleZh && (
                <div className="mt-1 text-slate-400 text-sm">{v.exampleZh}</div>
              )}
            </div>
          ))}

          {!vocab.length && (
            <div className="text-slate-500">No vocabulary returned.</div>
          )}
        </div>
      </div>

      {/* ===== Quiz Review ===== */}
      <div className="mt-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6 tracking-widest uppercase">
          Quiz Review (EN)
        </h2>

        <div className="space-y-6">
          {reportRows.map((r) => (
            <div
              key={r.idx}
              className={`p-6 rounded-2xl border ${
                r.isCorrect
                  ? "border-green-500/30 bg-green-900/10"
                  : "border-red-500/30 bg-red-900/10"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-lg text-white font-semibold">
                  <span className="text-yellow-400 font-black mr-2">
                    {String(r.idx + 1).padStart(2, "0")}
                  </span>
                  {r.question || "(No question text)"}
                </div>

                {r.isCorrect ? (
                  <CheckCircle2 className="text-green-400 shrink-0" />
                ) : (
                  <XCircle className="text-red-400 shrink-0" />
                )}
              </div>

              <div className="mt-4 space-y-2 text-slate-200">
                {r.opts.map((opt, i) => {
                  const isCorrectOpt = i === r.correctIdx;
                  const isUserOpt = i === r.userIdx;

                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-3 p-3 rounded-xl ${
                        isCorrectOpt
                          ? "bg-green-900/20 border border-green-500/30"
                          : isUserOpt
                          ? "bg-red-900/20 border border-red-500/30"
                          : "bg-white/5 border border-white/5"
                      }`}
                    >
                      <div className="font-black text-slate-300">
                        {abc[i]}.
                      </div>
                      <div className="flex-1">{opt}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 text-sm text-slate-300">
                Your Answer:{" "}
                <span className="font-bold text-white">
                  {r.userLetter}
                </span>
                {"  "}• Correct:{" "}
                <span className="font-bold text-green-300">
                  {r.correctLetter}
                </span>
              </div>
            </div>
          ))}

          {!reportRows.length && (
            <div className="text-slate-500">No quiz returned.</div>
          )}
        </div>
      </div>

      {/* ===== Actions ===== */}
      <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center no-print">
        <button
          onClick={onSameTopic}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold tracking-widest uppercase transition"
        >
          <RefreshCw size={16} />
          Same Topic
        </button>

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-slate-900 hover:bg-yellow-50 font-bold tracking-widest uppercase transition"
        >
          <Home size={16} />
          Home
        </button>
      </div>
    </div>
  );
};

export default Portfolio;
