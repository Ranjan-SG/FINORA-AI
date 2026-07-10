import React, { useRef, useState, MouseEvent } from 'react';

interface GlowTiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  tiltActive?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function GlowTiltCard({
  children,
  className = '',
  glowColor = 'rgba(59, 130, 246, 0.15)',
  tiltActive = true,
  ...props
}: GlowTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Relative mouse coordinates
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setGlowPos({ x, y });

    if (tiltActive) {
      // Normalize values between -0.5 and 0.5
      const normX = x / rect.width - 0.5;
      const normY = y / rect.height - 0.5;
      
      // Calculate rotation angles (max 6 degrees rotation)
      setRotate({
        x: -normY * 12,
        y: normX * 12
      });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  const cardStyle: React.CSSProperties = {
    transform: isHovered && tiltActive
      ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.02, 1.02, 1.02)`
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1), border-color 250ms, box-shadow 250ms',
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={cardStyle}
      className={`relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#111827] hover:border-slate-700/80 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] transition-all duration-250 group ${className}`}
      {...props}
    >
      {/* Dynamic Cursor Glow/Halo background */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] transition-opacity duration-500 opacity-100"
          style={{
            left: `${glowPos.x}px`,
            top: `${glowPos.y}px`,
            width: '250px',
            height: '250px',
            background: glowColor,
          }}
        />
      )}

      {/* Dynamic Apple Vision Pro style glass shine border */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 mix-blend-screen transition-opacity duration-500"
          style={{
            left: `${glowPos.x}px`,
            top: `${glowPos.y}px`,
            width: '180px',
            height: '180px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
          }}
        />
      )}

      {/* Actual Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
