import React from 'react';

interface ThreeBackgroundProps {
  theme: 'dark' | 'light';
  bgStyle?: 'cosmic' | 'aurora' | 'cyberpunk' | 'minimal';
}

export default function ThreeBackground({ theme }: ThreeBackgroundProps) {
  const isDark = theme === 'dark';

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none" style={{ zIndex: 0 }}>
      <style>{`
        @keyframes drift {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes drift-reverse {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-40px, 40px) scale(0.9); }
          66% { transform: translate(30px, -20px) scale(1.1); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes grid-scroll {
          from { background-position: 0 0; }
          to { background-position: 60px 60px; }
        }
        @keyframes glow-line-horizontal {
          0% { transform: translateX(-100%); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { transform: translateX(100vw); opacity: 0; }
        }
        @keyframes float-particle {
          0% { transform: translateY(100vh) translateX(0); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.4; }
          100% { transform: translateY(-10vh) translateX(20px); opacity: 0; }
        }
      `}</style>

      {isDark ? (
        // Cosmic / Dark Mode Background
        <div className="absolute inset-0 bg-[#0B1120] overflow-hidden transition-colors duration-300">
          {/* Animated Moving Soft Radial Gradients */}
          <div 
            className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full mix-blend-screen filter blur-[120px] opacity-[0.12]"
            style={{
              background: 'radial-gradient(circle, #4F7CFF 0%, rgba(79, 124, 255, 0) 70%)',
              animation: 'drift 25s infinite ease-in-out'
            }}
          />
          <div 
            className="absolute top-1/3 -right-20 w-[500px] h-[500px] rounded-full mix-blend-screen filter blur-[100px] opacity-[0.08]"
            style={{
              background: 'radial-gradient(circle, #7C4DFF 0%, rgba(124, 77, 255, 0) 70%)',
              animation: 'drift-reverse 30s infinite ease-in-out'
            }}
          />
          <div 
            className="absolute bottom-10 left-10 w-[450px] h-[450px] rounded-full mix-blend-screen filter blur-[110px] opacity-[0.05]"
            style={{
              background: 'radial-gradient(circle, #00D084 0%, rgba(0, 208, 132, 0) 70%)',
              animation: 'drift 20s infinite ease-in-out'
            }}
          />

          {/* Animated Line Grid */}
          <div 
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              animation: 'grid-scroll 40s linear infinite'
            }}
          />

          {/* Glowing line animations */}
          <div 
            className="absolute top-1/4 left-0 w-80 h-[1px] opacity-10"
            style={{
              background: 'linear-gradient(90deg, transparent, #4F7CFF, transparent)',
              animation: 'glow-line-horizontal 12s infinite linear'
            }}
          />
          <div 
            className="absolute top-2/3 left-0 w-96 h-[1px] opacity-10"
            style={{
              background: 'linear-gradient(90deg, transparent, #7C4DFF, transparent)',
              animation: 'glow-line-horizontal 18s infinite linear',
              animationDelay: '4s'
            }}
          />

          {/* Light drift particles */}
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white opacity-20"
                style={{
                  width: `${Math.random() * 2 + 1}px`,
                  height: `${Math.random() * 2 + 1}px`,
                  left: `${Math.random() * 100}%`,
                  bottom: `-${Math.random() * 20}px`,
                  animation: `float-particle ${15 + Math.random() * 20}s infinite linear`,
                  animationDelay: `${Math.random() * 15}s`
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        // Light Mode Background (F7F8FA background, cards remain dark as requested in Apple/Linear styles)
        <div className="absolute inset-0 bg-[#F7F8FA] overflow-hidden transition-colors duration-300">
          {/* Very soft light gradients to give a premium depth */}
          <div 
            className="absolute top-[-200px] left-[10%] w-[800px] h-[800px] rounded-full opacity-[0.4] filter blur-[130px]"
            style={{
              background: 'radial-gradient(circle, #E0E7FF 0%, rgba(224, 231, 255, 0) 70%)',
              animation: 'drift 35s infinite ease-in-out'
            }}
          />
          <div 
            className="absolute bottom-[-100px] right-[10%] w-[600px] h-[600px] rounded-full opacity-[0.3] filter blur-[100px]"
            style={{
              background: 'radial-gradient(circle, #F3E8FF 0%, rgba(243, 232, 255, 0) 70%)',
              animation: 'drift-reverse 40s infinite ease-in-out'
            }}
          />

          {/* Soft Grid for Light Mode */}
          <div 
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
              backgroundSize: '80px 80px',
              animation: 'grid-scroll 60s linear infinite'
            }}
          />
        </div>
      )}
    </div>
  );
}
