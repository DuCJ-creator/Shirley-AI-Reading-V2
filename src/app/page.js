'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Sparkles, User, ArrowLeft, RefreshCw, ArrowUp } from 'lucide-react';
import { THEMES } from '@/utils/constants';
import { getTreeLayout, generateContent } from '@/utils/mockService';
import { ChristmasTree, Snowfall, TreeStar } from '@/components/ChristmasElements';
import LightBulb from '@/components/LightBulb';
import LevelSelector from '@/components/LevelSelector';
import ReadingArticle from '@/components/ReadingArticle';
import VocabSection from '@/components/VocabSection';
import QuizSection from '@/components/QuizSection';
import Portfolio from '@/components/Portfolio';

/** ✅ Error Boundary：避免 portfolio 爆掉就整頁白屏 */
class PortfolioBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, err: null };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, err };
  }
  componentDidCatch(err, info) {
    console.error('[PortfolioBoundary] crash:', err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-3xl mx-auto mt-10 bg-rose-900/30 border border-rose-400/30 rounded-3xl p-8 text-rose-100 shadow-xl">
          <h3 className="text-2xl font-black mb-2">Portfolio Render Failed</h3>
          <p className="text-sm opacity-80 mb-4">
            Portfolio 元件渲染時發生錯誤，請打開 Console 看真正炸在哪一行。
          </p>
          <pre className="text-xs whitespace-pre-wrap bg-black/40 p-4 rounded-xl overflow-auto">
            {String(this.state.err)}
          </pre>
          <div className="mt-6 flex gap-3">
            <button
              onClick={this.props.onBack}
              className="px-5 py-2 rounded-full bg-white text-slate-900 font-bold"
            >
              Back
            </button>
            <button
              onClick={this.props.onHome}
              className="px-5 py-2 rounded-full bg-white/10 border border-white/10 text-white font-bold"
            >
              Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Home() {
  const [stage, setStage] = useState('home');
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [generatedData, setGeneratedData] = useState(null);

  const [studentInfo, setStudentInfo] = useState({ name: '', className: '', seatNo: '' });
  const [quizResults, setQuizResults] = useState({ answers: {}, score: 0 });

  // ✅ 全英/全繁中切換（預設英）
  const [isZh, setIsZh] = useState(false);
  const toggleLang = () => setIsZh(v => !v);

  const treeLayout = getTreeLayout(THEMES);
  const isLoading = stage === 'loading';

  // ✅ 月光任務連線中 Badge（新增）
  const [lunarLinked, setLunarLinked] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasOpener = !!window.opener;
    const hasParent = window.parent && window.parent !== window;
    const linked = hasOpener || hasParent;

    if (linked) {
      setLunarLinked(true);
      try {
        const target = hasOpener ? window.opener : window.parent;
        target?.postMessage(
          { type: "LUNAR_MISSION_READY", mission: "topic-reading" },
          "*"
        );
      } catch (e) {
        console.warn("[LUNAR_READY] postMessage failed:", e);
      }
    }
  }, []);

  const handleThemeClick = (theme) => {
    setSelectedTheme(theme);
    setStage('level');
    window.scrollTo(0, 0);
  };

  const handleLevelSelect = async (level) => {
    setSelectedLevel(level);
    setStage('loading');

    const themeId = selectedTheme?.id;
    if (!themeId) {
      console.error("[page] selectedTheme missing");
      alert("請先選擇主題 / Please select a topic first.");
      setStage('home');
      return;
    }

    try {
      const data = await generateContent(themeId, level);
      console.log("[page] generateContent meta:", data?.meta);

      setGeneratedData(data);
      setStage('reading');
    } catch (err) {
      console.error("[page] generateContent error:", err);
      alert("AI 生成失敗，請稍後再試 / Generation failed, please retry.");
      setStage('level');
      setGeneratedData(null);
      setSelectedLevel(null);
    }

    window.scrollTo(0, 0);
  };

  // ✅ 同主題同難度重新生成
  const handleRegenerateSame = async () => {
    const themeId = selectedTheme?.id;
    const level = selectedLevel;

    if (!themeId || !level) {
      alert("缺少主題或難度，請重新選擇 / Missing theme or level.");
      setStage("level");
      return;
    }

    setStage("loading");
    window.scrollTo(0, 0);

    try {
      const data = await generateContent(themeId, level);
      console.log("[page] regenerate meta:", data?.meta);
      setGeneratedData(data);
      setStage("reading");
    } catch (err) {
      console.error("[page] regenerate error:", err);
      alert("重新生成失敗，請再試一次 / Regeneration failed, please retry.");
      setStage("reading");
    }
  };

  const handleBackToLevel = () => {
    setStage('level');
    setGeneratedData(null);
    setSelectedLevel(null);
    setQuizResults({ answers: {}, score: 0 });
    setIsZh(false);
    window.scrollTo(0, 0);
  };

  const handleBackToHome = () => {
    resetApp();
    window.scrollTo(0, 0);
  };

  const handleQuizComplete = (answers, score) => {
    setQuizResults({ answers, score });
    setStage('info');
    window.scrollTo(0, 0);
  };

  const handleInfoSubmit = (e) => {
    e.preventDefault();
    if (!studentInfo.name) {
      alert("Please enter your name (請輸入您的姓名)");
      return;
    }
    setStage('portfolio');
    window.scrollTo(0, 0);
  };

  const resetApp = () => {
    setStage('home');
    setSelectedTheme(null);
    setSelectedLevel(null);
    setGeneratedData(null);
    setStudentInfo({ name: '', className: '', seatNo: '' });
    setQuizResults({ answers: {}, score: 0 });
    setIsZh(false);
    window.scrollTo(0, 0);
  };

  // ✅ provider badge
  const MetaBadge = ({ meta }) => {
    if (!meta) return null;
    const provider = meta.provider || "unknown";
    const reason = meta.reason ? ` • ${meta.reason}` : "";
    const version = meta.version ? ` • ${meta.version}` : "";
    const isMock = provider === "mock";

    return (
      <div className="mb-6 flex justify-center">
        <div
          className={`text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full border backdrop-blur
            ${isMock
              ? "bg-rose-900/40 border-rose-400/30 text-rose-200"
              : "bg-emerald-900/40 border-emerald-400/30 text-emerald-200"
            }`}
          title="content provider"
        >
          provider: {provider}{reason}{version}
        </div>
      </div>
    );
  };

  // ✅ 高級 Regenerate 按鈕
  const RegenerateButton = () => {
    const disabled = isLoading || !selectedTheme || !selectedLevel;

    return (
      <div className="flex justify-center mb-10 no-print">
        <div className="relative">
          <div
            className="absolute -inset-1 rounded-full blur-xl opacity-60
                       bg-gradient-to-r from-yellow-400/40 via-amber-300/30 to-pink-400/40
                       animate-pulse"
          />
          <button
            onClick={handleRegenerateSame}
            disabled={disabled}
            aria-label="Regenerate with same topic and level"
            className={`
              relative group flex items-center gap-3 px-7 py-3.5 rounded-full
              border border-white/10 backdrop-blur-2xl
              shadow-[0_0_35px_rgba(250,204,21,0.20)]
              transition-all duration-400
              ${disabled
                ? "bg-slate-900/60 text-slate-500 cursor-not-allowed opacity-60"
                : "bg-gradient-to-b from-white/10 to-white/5 text-yellow-100 hover:text-white hover:border-yellow-300/50 hover:bg-white/10"
              }
            `}
          >
            <span className={`
              grid place-items-center w-9 h-9 rounded-full
              bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-white/5
              border border-white/10
              shadow-inner shadow-yellow-300/10
              ${disabled ? "" : "group-hover:shadow-yellow-200/30"}
              transition-all duration-300
            `}>
              <RefreshCw
                size={18}
                className={disabled ? "" : "group-hover:rotate-180 transition-transform duration-500"}
              />
            </span>

            <span className="flex flex-col items-start leading-tight">
              <span className="text-sm font-black tracking-[0.22em] uppercase">
                Regenerate
              </span>
              <span className="text-[11px] opacity-80 tracking-wider">
                同主題・同難度重新生成
              </span>
            </span>

            {!disabled && (
              <span className="ml-1 text-yellow-300/80 text-xs font-bold tracking-widest animate-fadeIn">
                ✦
              </span>
            )}
          </button>

          {!disabled && (
            <div className="mt-2 text-center text-[11px] text-slate-400/80 tracking-wider">
              Not satisfied? Try another AI take ✨
            </div>
          )}
        </div>
      </div>
    );
  };

  // ✅ quiz 左欄文章頂端 ref（回到文章頂用）
  const articleTopRef = useRef(null);
  const scrollToArticleTop = () => {
    articleTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-yellow-500/50 selection:text-white pb-20 overflow-x-hidden relative flex flex-col">

      {/* ✅ 月光任務連線中 badge（新增） */}
      {lunarLinked && (
        <div className="no-print fixed top-4 right-4 z-[9999] px-4 py-2 rounded-full
                        bg-slate-900/70 border border-yellow-300/40 text-yellow-200
                        text-xs font-black tracking-widest backdrop-blur-xl shadow-xl">
          🌙 月光任務連線中
        </div>
      )}

      <ChristmasTree />
      <Snowfall />

      <header className="py-14 px-4 text-center relative no-print z-10">
        <h1 className="text-5xl md:text-7xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-300 to-yellow-600 animate-float mb-4 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] tracking-tight">
          Shirley's AI Reading Coach
        </h1>
        <p className="text-indigo-200/80 text-lg md:text-xl tracking-[0.3em] uppercase font-bold drop-shadow-md">
          <span className="text-yellow-400">★</span> Explore • Learn • Grow • 全球素養閱讀 <span className="text-yellow-400">★</span>
        </p>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
      </header>

      <main className="container mx-auto px-4 relative z-10 flex-grow flex flex-col items-center justify-center">

        {stage === 'home' && (
          <div className="py-8 animate-fadeIn flex flex-col items-center w-full">
            <div className="text-center mb-16 text-yellow-100/90 font-light tracking-wide text-lg max-w-2xl bg-white/5 backdrop-blur-md px-8 py-4 rounded-full border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
              <p>點擊一顆<span className="text-yellow-400 font-bold mx-1">金屬質感彩球</span>，開啟您的雙語閱讀之旅。<br /><span className="text-sm opacity-70">Click a metallic ornament to begin your bilingual reading journey.</span></p>
            </div>

            <div className="flex flex-col items-center gap-1 relative mt-4">
              <TreeStar />
              <div className="flex flex-col items-center space-y-6 relative z-10">
                {treeLayout.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex justify-center gap-6 md:gap-10 px-4">
                    {row.map((theme) => (
                      <LightBulb
                        key={theme.id}
                        theme={theme}
                        onClick={handleThemeClick}
                        isSelected={false}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {stage === 'level' && selectedTheme && (
          <div className="flex flex-col items-center justify-center w-full my-10">
            <div className="mb-16 scale-[2.2] transform-gpu filter drop-shadow-[0_0_60px_rgba(255,255,255,0.2)] animate-float">
              <LightBulb theme={selectedTheme} onClick={() => {}} isSelected isLarge />
            </div>
            <LevelSelector onSelect={handleLevelSelect} selectedTheme={selectedTheme} onBack={handleBackToHome} />
          </div>
        )}

        {stage === 'loading' && (
          <div className="flex flex-col items-center justify-center animate-fadeIn my-20 p-12 bg-slate-900/50 backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(79,70,229,0.2)]">
            <div className="relative w-40 h-40 mb-10">
              <div className="absolute inset-0 border-2 border-slate-500/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
              <div className="absolute inset-2 border-2 border-t-yellow-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-[spin_1.5s_linear_infinite] shadow-[0_0_15px_rgba(250,204,21,0.5)]"></div>
              <div className="absolute inset-6 border-2 border-r-red-500 border-t-transparent border-b-transparent border-l-transparent rounded-full animate-[spin_2s_linear_reverse_infinite] shadow-[0_0_15px_rgba(236,72,153,0.5)]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="text-white animate-pulse" size={48} />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-6 text-center">
              AI is Crafting Your Lesson
            </h2>
            <div className="flex flex-col items-center space-y-2">
              <span className="text-slate-400 text-lg uppercase tracking-widest">Generating Content For</span>
              <span className="text-2xl font-bold text-yellow-300">{selectedTheme?.labelEn}</span>
              <span className="text-slate-400 font-serif">{selectedTheme?.labelZh}</span>
            </div>
          </div>
        )}

        {/* ✅ reading：恢復 Finish Reading → 進 quiz */}
        {stage === 'reading' && generatedData && (
          <div className="py-12 w-full px-4">
            <MetaBadge meta={generatedData.meta} />
            <RegenerateButton />

            <ReadingArticle
              data={generatedData}
              isZh={isZh}
              onToggleLang={toggleLang}
              onFinish={() => {
                setStage('quiz');
                window.scrollTo(0, 0);
              }}
            />

            <VocabSection vocab={generatedData.vocabulary || []} />

            {!generatedData.quiz?.length && (
              <div className="mt-10 text-center text-amber-200/80 text-sm">
                目前沒有測驗題目（quiz 為空），你可以先閱讀文章或重新生成一次。
              </div>
            )}
          </div>
        )}

        {/* ✅ quiz：同頁文章 + Quiz + 回到文章頂 */}
        {stage === 'quiz' && generatedData && (
          <div className="py-12 w-full px-4">
            <MetaBadge meta={generatedData.meta} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

              {/* 左：文章區（可捲動） */}
              <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-5 lg:sticky lg:top-6 max-h-[80vh] overflow-auto relative">
                
                {/* 回到文章頂 anchor */}
                <div ref={articleTopRef} />

                {/* ✅ 回到文章頂按鈕（sticky 在左欄上方） */}
                <div className="sticky top-0 z-20 mb-4 flex justify-end">
                  <button
                    onClick={scrollToArticleTop}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase
                               bg-slate-950/70 border border-white/10 text-yellow-200
                               hover:bg-slate-900/80 hover:text-yellow-100 transition shadow"
                    title="Back to top of article"
                  >
                    <ArrowUp size={14} />
                    回到文章頂
                  </button>
                </div>

                <ReadingArticle
                  data={generatedData}
                  isZh={isZh}
                  onToggleLang={toggleLang}
                  onFinish={() => {}}
                  hideFinish
                />
              </div>

              {/* 右：測驗區 */}
              <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-5 max-h-[80vh] overflow-auto">
                <QuizSection
                  data={generatedData}
                  isZh={isZh}
                  onToggleLang={toggleLang}
                  onComplete={handleQuizComplete}
                />
              </div>

            </div>
          </div>
        )}

        {stage === 'info' && (
          <div className="flex items-center justify-center animate-fadeIn w-full my-16 px-4">
            <form onSubmit={handleInfoSubmit} className="bg-slate-900/60 backdrop-blur-2xl p-12 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] max-w-xl w-full border border-white/10">
              <div className="text-center mb-12">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center mx-auto mb-6">
                  <User size={40} className="text-white" />
                </div>
                <h2 className="text-4xl font-bold text-white mb-2">Great Job!</h2>
                <p className="text-slate-400 font-serif">Enter your details to finalize your portfolio.</p>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-bold text-yellow-500 mb-2 uppercase tracking-widest pl-1">Class</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., 901"
                    className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl p-4 text-white"
                    value={studentInfo.className}
                    onChange={e => setStudentInfo({ ...studentInfo, className: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-yellow-500 mb-2 uppercase tracking-widest pl-1">Seat No.</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., 15"
                    className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl p-4 text-white"
                    value={studentInfo.seatNo}
                    onChange={e => setStudentInfo({ ...studentInfo, seatNo: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-yellow-500 mb-2 uppercase tracking-widest pl-1">Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Your Full Name"
                    className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl p-4 text-white"
                    value={studentInfo.name}
                    onChange={e => setStudentInfo({ ...studentInfo, name: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="w-full mt-12 bg-white text-slate-900 font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2">
                <span>View Portfolio</span> <ArrowLeft className="rotate-180" size={18} />
              </button>
            </form>
          </div>
        )}

        {stage === 'portfolio' && generatedData && (
          <PortfolioBoundary onBack={handleBackToLevel} onHome={resetApp}>
            <Portfolio
              data={generatedData}
              studentInfo={studentInfo}
              quizScore={quizResults.score}
              answers={quizResults.answers}
              onReset={resetApp}
              onSameTopic={handleRegenerateSame}
            />
          </PortfolioBoundary>
        )}

      </main>

      <footer className="mt-auto py-10 text-center text-slate-500 text-xs no-print relative z-10 border-t border-white/5 bg-slate-900/40 backdrop-blur-md px-4">
        <div className="max-w-4xl mx-auto mb-6 text-slate-400 font-light leading-relaxed opacity-80">
          <p className="mb-2"><strong className="text-yellow-500/80">Disclaimer:</strong> Kindly note that the reading materials are thoughtfully crafted by AI—and while every effort is made for accuracy, occasional slips may still occur.</p>
          <p><strong className="text-yellow-500/80">敬請留意：</strong> 本閱讀材料由人工智慧精心生成，雖力求準確，偶有疏漏仍在所難免。</p>
        </div>
        <p className="font-medium tracking-widest uppercase mb-2">Designed for Global Education</p>
        <p className="opacity-50">&copy; 2025 Shirley's AI Reading Coach</p>
      </footer>
    </div>
  );
}
