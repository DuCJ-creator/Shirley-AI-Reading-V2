'use client';

import React from "react";
import { Volume2 } from "lucide-react";
import { speak } from "@/utils/useSpeech";

const VocabSection = ({ vocab = [] }) => {
  return (
    <div className="w-full max-w-5xl mx-auto mt-10 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-xl">
      <h3 className="text-2xl md:text-3xl font-bold text-yellow-200 mb-6 tracking-widest uppercase">
        Vocabulary • 單字學習
      </h3>

      <div className="grid gap-4">
        {vocab.map((v, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between">
              <div className="text-xl font-black text-white">
                {v.word}
                {v.pos && (
                  <span className="ml-2 text-sm text-slate-400 font-semibold">
                    {v.pos}
                  </span>
                )}
              </div>

              <button
                onClick={() => speak(v.word, "en-US")}
                className="text-yellow-300/80 hover:text-yellow-200 transition"
                title="Pronounce word"
              >
                <Volume2 size={18}/>
              </button>
            </div>

            {v.meaningZh && (
              <div className="mt-2 text-slate-200 text-base">
                {v.meaningZh}
              </div>
            )}

            {v.exampleEn && (
              <div className="mt-3 text-slate-300 text-sm leading-relaxed">
                <button
                  onClick={() => speak(v.exampleEn, "en-US")}
                  className="mr-2 inline-flex items-center text-yellow-300/70 hover:text-yellow-200 transition"
                  title="Pronounce example"
                >
                  <Volume2 size={14}/>
                </button>
                {v.exampleEn}
              </div>
            )}

            {v.exampleZh && (
              <div className="mt-1 text-slate-400 text-sm leading-relaxed">
                {v.exampleZh}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VocabSection;
