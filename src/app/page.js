'use client';

import { useState } from 'react';
import { Sparkles, Star, User, ArrowLeft, RefreshCw } from 'lucide-react';
import { THEMES } from '@/utils/constants';
import { getTreeLayout, generateContent } from '@/utils/mockService';
import { ChristmasTree, Snowfall, TreeStar } from '@/components/ChristmasElements';
import LightBulb from '@/components/LightBulb';
import LevelSelector from '@/components/LevelSelector';
import ReadingArticle from '@/components/ReadingArticle';
import VocabSection from '@/components/VocabSection';
import QuizSection from '@/components/QuizSection';
import Portfolio from '@/components/Portfolio';

export default function Home() {
  const [stage, setStage] = useState('home');
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [generatedData, setGeneratedData] = useState(null);
  const [studentInfo, setStudentInfo] = useState({ name: '', className: '', seatNo: '' });
  const [quizResults, setQuizResults] = useState({ answers: {}, score: 0 });

  const treeLayout = getTreeLayout(THEMES);

  const handleThemeClick = (theme) => {
    setSelectedTheme(theme);
    setStage('level');
    window.scrollTo(0, 0);
  };

 const handleLevelSelect = async (level) => {
  setSelectedLevel(level);
  setStage('loading');

  try {
    const data = await generateContent(selectedTheme.id, level);
    setGeneratedData(data);
    setStage('reading');
  } catch (err) {
    console.error(err);
    alert("AI 生成失敗，請稍後再試 / Generation failed, please retry.");
    setStage('level');
    setGeneratedData(null);
    setSelectedLevel(null);
  }

  window.scrollTo(0, 0);
};


  const handleBackToLevel = () => {
    setStage('level');
    setGeneratedData(null);
    setSelectedLevel(null);
    setQuizResults({ answers: {}, score: 0 });
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
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-yellow-500/50 selection:text-white pb-20 overflow-x-hidden relative flex flex-col">
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
              <p>點擊一顆<span className="text-yellow-400 font-bold mx-1">金屬質感彩球</span>，開啟您的雙語閱讀之旅。<br/><span className="text-sm opacity-70">Click a metallic ornament to begin your bilingual reading journey.</span></p>
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
              <LightBulb theme={selectedTheme} onClick={()=>{}} isSelected={true} isLarge={true} />
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
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-6 text-center">AI is Crafting Your Lesson</h2>
            <div className="flex flex-col items-center space-y-2">
              <span className="text-slate-400 text-lg uppercase tracking-widest">Generating Content For</span>
              <span className="text-2xl font-bold text-yellow-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{selectedTheme.labelEn}</span>
              <span className="text-slate-400 font-serif">{selectedTheme.labelZh}</span>
            </div>
          </div>
        )}

        {stage === 'reading' && generatedData && (
          <div className="py-12 w-full px-4">
            <ReadingArticle data={generatedData} onFinish={() => setStage('quiz')} />
            <VocabSection vocab={generatedData.vocabulary} />
            <div className="text-center mt-20">
              <span className="text-slate-500 text-xs font-bold tracking-[0.2em] uppercase border border-white/10 px-6 py-3 rounded-full bg-slate-900/50 backdrop-blur">
                Step 1: Read & Learn • Step 2: Quiz & Review
              </span>
            </div>
          </div>
        )}

        {stage === 'quiz' && generatedData && (
          <div className="py-12 w-full px-4">
            <QuizSection questions={generatedData.quiz} onComplete={handleQuizComplete} />
          </div>
        )}

        {stage === 'info' && (
          <div className="flex items-center justify-center animate-fadeIn w-full my-16 px-4">
            <form onSubmit={handleInfoSubmit} className="bg-slate-900/60 backdrop-blur-2xl p-12 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] max-w-xl w-full border border-white/10 relative overflow-hidden group">
              <div className="text-center mb-12">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center mx-auto mb-6 shadow-[0_10px_30px_rgba(234,179,8,0.4)] rotate-3 hover:rotate-6 transition-transform">
                  <User size={40} className="text-white" />
                </div>
                <h2 className="text-4xl font-bold text-white mb-2">Great Job!</h2>
                <p className="text-slate-400 font-serif">Enter your details to finalize your portfolio.</p>
              </div>

              <div className="space-y-8">
                <div className="group/input">
                  <label className="block text-xs font-bold text-yellow-500 mb-2 uppercase tracking-widest pl-1">Class</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., 901"
                    className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl p-4 text-white placeholder-slate-600 focus:border-yellow-400 focus:bg-slate-800/80 focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-all text-lg"
                    value={studentInfo.className}
                    onChange={e => setStudentInfo({...studentInfo, className: e.target.value})}
                  />
                </div>
                <div className="group/input">
                  <label className="block text-xs font-bold text-yellow-500 mb-2 uppercase tracking-widest pl-1">Seat No.</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., 15"
                    className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl p-4 text-white placeholder-slate-600 focus:border-yellow-400 focus:bg-slate-800/80 focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-all text-lg"
                    value={studentInfo.seatNo}
                    onChange={e => setStudentInfo({...studentInfo, seatNo: e.target.value})}
                  />
                </div>
                <div className="group/input">
                  <label className="block text-xs font-bold text-yellow-500 mb-2 uppercase tracking-widest pl-1">Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Your Full Name"
                    className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl p-4 text-white placeholder-slate-600 focus:border-yellow-400 focus:bg-slate-800/80 focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-all text-lg"
                    value={studentInfo.name}
                    onChange={e => setStudentInfo({...studentInfo, name: e.target.value})}
                  />
                </div>
              </div>

              <button type="submit" className="w-full mt-12 bg-white text-slate-900 hover:bg-yellow-50 font-bold text-lg py-4 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.2)] transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                <span>View Portfolio</span> <ArrowLeft className="rotate-180" size={18} />
              </button>
            </form>
          </div>
        )}

        {stage === 'portfolio' && generatedData && (
          <Portfolio
            data={generatedData}
            studentInfo={studentInfo}
            quizScore={quizResults.score}
            answers={quizResults.answers}
            onReset={resetApp}
            onSameTopic={handleBackToLevel}
          />
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
