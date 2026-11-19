import React from 'react';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showTagline = true,
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  const taglineSizes = {
    sm: 'text-[9px] tracking-wider',
    md: 'text-[10px] tracking-widest',
    lg: 'text-xs tracking-widest',
    xl: 'text-sm tracking-widest',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official VICTORIX Geometric Shield / V Monogram */}
      <div className={`relative flex-shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(139,69,255,0.6)]"
        >
          <defs>
            <linearGradient id="victorixPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B68AFF" />
              <stop offset="50%" stopColor="#8B45FF" />
              <stop offset="100%" stopColor="#4A148C" />
            </linearGradient>
            <linearGradient id="victorixSilverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#C0C0C0" />
              <stop offset="100%" stopColor="#757580" />
            </linearGradient>
            <linearGradient id="victorixDarkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E1E28" />
              <stop offset="100%" stopColor="#0B0B0F" />
            </linearGradient>
          </defs>

          {/* Outer Shield Hex Outline */}
          <polygon
            points="50,6 88,24 88,68 50,94 12,68 12,24"
            fill="url(#victorixDarkGrad)"
            stroke="url(#victorixSilverGrad)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Cybernetic Accent Line */}
          <polygon
            points="50,14 80,29 80,63 50,86 20,63 20,29"
            fill="none"
            stroke="rgba(139, 69, 255, 0.4)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />

          {/* Sharp Left Wing of the "V" */}
          <polygon
            points="24,28 38,28 50,66 42,66"
            fill="url(#victorixSilverGrad)"
          />

          {/* Bold Neon Purple Right Wing of the "V" */}
          <polygon
            points="50,66 42,66 62,28 76,28"
            fill="url(#victorixPurpleGrad)"
          />

          {/* Central Apex Core Crystal */}
          <polygon
            points="50,34 57,48 50,62 43,48"
            fill="#FFFFFF"
            className="animate-pulse"
          />

          {/* Futuristic horizontal wing blades */}
          <path
            d="M16 48 L28 48"
            stroke="#8B45FF"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M72 48 L84 48"
            stroke="#8B45FF"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col justify-center leading-none">
        <div className={`font-display font-bold tracking-tight text-white flex items-center ${textSizes[size]}`}>
          <span>VICTORI</span>
          <span className="text-[#8B45FF] drop-shadow-[0_0_8px_rgba(139,69,255,0.8)]">X</span>
        </div>
        {showTagline && (
          <span className={`font-medium uppercase text-[#C0C0C0] opacity-80 mt-1 ${taglineSizes[size]}`}>
            AI FOR A BETTER TOMORROW
          </span>
        )}
      </div>
    </div>
  );
};
