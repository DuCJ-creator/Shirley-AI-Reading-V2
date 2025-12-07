// src/components/ChristmasElements.js
import { Snowflake, Star } from 'lucide-react';

export const TextureOverlay = () => (
  <div
    className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none rounded-full"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
      backgroundSize: '150px 150px'
    }}
  />
);

export const BlingStar = ({ className, delay }) => (
  <div className={`absolute pointer-events-none animate-twinkle ${className}`} style={{ animationDelay: delay }}>
    <svg viewBox="0 0 24 24" fill="white" className="w-full h-full drop-shadow-[0_0_2px_rgba(255,255,255,0.9)]">
      <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
    </svg>
  </div>
);

export const ChristmasTree = () => (
  <div className="absolute inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544967082-d9d3f4766a1c?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center opacity-40 blur-[2px] mix-blend-screen"></div>
    <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/80 via-[#1e293b]/60 to-[#020617]/80 mix-blend-multiply"></div>
  </div>
);

export const Snowfall = () => {
  const flakes = Array.from({ length: 40 });
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {flakes.map((_, i) => {
        const style = {
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${Math.random() * 10 + 15}s`,
          opacity: Math.random() * 0.4 + 0.1,
          transform: `scale(${Math.random() * 0.6 + 0.2})`,
        };
        return (
          <div key={i} className="absolute top-[-10%] animate-snowfall text-white" style={style}>
            <Snowflake size={Math.random() * 15 + 8} />
          </div>
        );
      })}
    </div>
  );
};

export const TreeStar = () => (
  <div className="text-yellow-300 relative z-20 mb-[-10px]">
    <Star size={72} fill="url(#star-gradient)" className="filter drop-shadow-[0_0_30px_rgba(253,224,71,0.9)] animate-pulse" />
    <svg width="0" height="0">
      <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop stopColor="#fef08a" offset="0%" />
        <stop stopColor="#eab308" offset="100%" />
      </linearGradient>
    </svg>
  </div>
);
