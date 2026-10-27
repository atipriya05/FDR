import React from 'react';

interface GovernmentSealProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const GovernmentSeal: React.FC<GovernmentSealProps> = ({
  className = '',
  size = 'md',
}) => {
  const dimension = size === 'sm' ? 28 : size === 'lg' ? 48 : 36;

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: dimension, height: dimension }}
      aria-label="Emblem of National Technical Education Council"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs"
      >
        {/* Outer Circular Ring with Beaded Border */}
        <circle
          cx="50"
          cy="50"
          r="47"
          stroke="#0f172a"
          strokeWidth="2.5"
          className="text-slate-900"
        />
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="#0d9488"
          strokeWidth="1"
          strokeDasharray="2 2"
          className="text-teal-600"
        />
        <circle
          cx="50"
          cy="50"
          r="41"
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth="1"
        />

        {/* Ashoka Lion Capital / Technical Gear Motif */}
        <g transform="translate(50, 48) scale(0.72)">
          {/* Central Pillar Base */}
          <path
            d="M-22 28 L22 28 L18 20 L-18 20 Z"
            fill="#0f172a"
          />
          {/* Wheel / Dharmachakra at Base */}
          <circle cx="0" cy="24" r="5" stroke="#f8fafc" strokeWidth="1.2" fill="#0f172a" />
          <line x1="0" y1="19" x2="0" y2="29" stroke="#f8fafc" strokeWidth="0.8" />
          <line x1="-5" y1="24" x2="5" y2="24" stroke="#f8fafc" strokeWidth="0.8" />
          <line x1="-3.5" y1="20.5" x2="3.5" y2="27.5" stroke="#f8fafc" strokeWidth="0.8" />
          <line x1="-3.5" y1="27.5" x2="3.5" y2="20.5" stroke="#f8fafc" strokeWidth="0.8" />

          {/* Abacus platform */}
          <rect x="-24" y="16" width="48" height="4" rx="1" fill="#0d9488" />

          {/* Three Lions Silhouette Profile */}
          {/* Center Lion */}
          <path
            d="M-8 16 C-9 6 -11 -6 0 -18 C11 -6 9 6 8 16 Z"
            fill="#0f172a"
          />
          {/* Center Lion Mane Detail */}
          <path
            d="M-5 -2 C-3 -10 3 -10 5 -2 C3 4 -3 4 -5 -2 Z"
            fill="#0d9488"
          />
          <circle cx="-2.5" cy="-8" r="1" fill="#ffffff" />
          <circle cx="2.5" cy="-8" r="1" fill="#ffffff" />

          {/* Left Lion Profile */}
          <path
            d="M-7 16 C-13 14 -22 6 -18 -8 C-14 -14 -10 -8 -8 -2 Z"
            fill="#1e293b"
          />
          <circle cx="-14" cy="-7" r="0.8" fill="#ffffff" />

          {/* Right Lion Profile */}
          <path
            d="M7 16 C13 14 22 6 18 -8 C14 -14 10 -8 8 -2 Z"
            fill="#1e293b"
          />
          <circle cx="14" cy="-7" r="0.8" fill="#ffffff" />

          {/* Crown / Kalasha Motif */}
          <path
            d="M-3 -18 L0 -24 L3 -18 Z"
            fill="#0d9488"
          />
        </g>

        {/* Technical Gear Teeth Flanking Top Rim */}
        <g stroke="#0f172a" strokeWidth="1.2">
          <circle cx="50" cy="50" r="38" stroke="#e2e8f0" strokeWidth="1.5" />
        </g>

        {/* Micro Arch Text representation */}
        <path
          id="upperArch"
          d="M 20,50 A 30,30 0 1,1 80,50"
          fill="none"
        />
        <text
          fontSize="5.2"
          fontWeight="bold"
          fill="#0f172a"
          letterSpacing="1.2"
          textAnchor="middle"
        >
          <textPath href="#upperArch" startOffset="50%">
            AICTE • SATYAMEVA JAYATE
          </textPath>
        </text>

        {/* Lower Banner Ribbon */}
        <path
          d="M 24 82 Q 50 78 76 82 L 72 87 Q 50 83 28 87 Z"
          fill="#0d9488"
        />
        <text
          x="50"
          y="85.5"
          textAnchor="middle"
          fontSize="4"
          fontWeight="bold"
          fill="#ffffff"
          letterSpacing="0.8"
        >
          ESTD 1945 • STATUTORY
        </text>
      </svg>
    </div>
  );
};
