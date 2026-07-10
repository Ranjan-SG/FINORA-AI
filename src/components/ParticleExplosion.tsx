import React from 'react';

interface ParticleExplosionProps {
  active: boolean;
}

export default function ParticleExplosion({ active }: ParticleExplosionProps) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 bg-[#090d1a]/20 backdrop-blur-xs transition-all duration-500 animate-fade-in">
      <style>{`
        @keyframes scale-up {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up {
          animation: scale-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
      <div className="p-6 rounded-[20px] bg-[#111827] border border-emerald-500/30 flex flex-col items-center gap-3 shadow-[0_0_50px_rgba(16,185,129,0.15)] animate-scale-up">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 font-sans">Statement Processed</span>
      </div>
    </div>
  );
}
