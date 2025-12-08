// src/components/ReadingArticle.js
'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';

const ReadingArticle = ({ data, onFinish }) => {
  // ✅ 兼容新舊格式
  const article = data?.article || {};

  const level =
    data?.meta?.level ||
    data?.level ||
    "Easy";

  const titleEn =
    article?.titleEn ||
    data?.titleEn ||
    data?.title ||
    data?.themeEn ||
    "Topic";

  const titleZh =
    article?.titleZh ||
    data?.titleZh ||
    data?.themeZh ||
    "";

  // ✅ 段落來源：新格式 paragraphs / 舊格式 content
  let paragraphs = article?.paragraphs || data?.paragraphs || data?.content || [];
  if (typeof paragraphs === "string") {
    paragraphs = paragraphs.split(/\n\s*\n/).filter(Boolean);
  }
  if (!Array.isArray(paragraphs)) paragraphs = [];

  // （可選）中文段落如果有就顯示
  let paragraphsZh = article?.paragraphsZh || data?.paragraphsZh || [];
  if (typeof paragraphsZh === "string") {
    paragraphsZh = paragraphsZh.split(/\n\s*\n/).filter(Boolean);
  }
  if (!Array.isArray(paragraphsZh)) paragraphsZh = [];

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 text-slate-100 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] p-10 md:p-14 animate-slideUp relative overflow-hidden">
      {/* Elegant BG Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-green-900/10 rounded-full blur-[80px] -z-10" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-white/10 pb-8 mt-4 md:mt-0">
        <div className="max-w-2xl">
          <div className="text-yellow-400 text-sm font-bold tracking-widest uppercase mb-2">
            Current Topic: {titleEn}
            {titleZh ? `｜${titleZh}` : ""}
          </div>

          <h2 className="text-3xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-4 leading-tight">
            {titleEn}
            {titleZh && (
              <span className="block text-base md:text-xl font-semibold text-slate-300/80 mt-2">
                {titleZh}
              </span>
            )}
          </h2>
        </div>

        <span
          className="px-5 py-2 rounded-full text-xs font-bold tracking-[0.2em] uppercase shadow-inner border backdrop-blur-md bg-white/5 border-white/10 text-yellow-200"
        >
          {level} Reading
        </span>
      </div>

      {/* ✅ 段落逐段顯示（新格式） */}
      <div className="prose prose-xl prose-invert max-w-none mb-14 leading-loose font-serif text-slate-300/90 tracking-wide space-y-6">
        {paragraphs.map((p, i) => (
          <div key={i}>
            <p>{p}</p>
            {paragraphsZh[i] && (
              <p className="text-slate-400/90 text-lg mt-2">{paragraphsZh[i]}</p>
            )}
          </div>
        ))}

        {!paragraphs.length && (
          <p className="text-slate-400/80">
            No article content returned.
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onFinish}
          className="group relative px-12 py-4 bg-gradient-to-r from-red-700 to-red-900 rounded-full font-bold text-lg text-white shadow-[0_0_30px_rgba(185,28,28,0.4)] hover:shadow-[0_0_50px_rgba(185,28,28,0.6)] hover:scale-105 transition-all duration-300 overflow-hidden border border-red-500/30"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-full" />
          <span className="relative flex items-center gap-3">
            Finish Reading <span className="opacity-70 font-normal">| 完成閱讀</span> <CheckCircle size={20} />
          </span>
        </button>
      </div>
    </div>
  );
};

export default ReadingArticle;
