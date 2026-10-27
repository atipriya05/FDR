import React from 'react';

interface BankLogoBadgeProps {
  bankName: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const BankLogoBadge: React.FC<BankLogoBadgeProps> = ({
  bankName,
  size = 'sm',
  showLabel = false,
  className = '',
}) => {
  const norm = bankName.toLowerCase();

  const dims = size === 'xs' ? 'h-4 w-4' : size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6';
  const textClass = size === 'xs' ? 'text-[11px]' : size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm font-semibold' : 'text-xs font-medium';

  // Bank visual configurations
  let bg = '#0284c7';
  let shortCode = 'BK';
  let badgeColor = 'bg-sky-50 text-sky-800 border-sky-200';
  let logoSvg = null;

  if (norm.includes('state bank') || norm.includes('sbi')) {
    shortCode = 'SBI';
    badgeColor = 'bg-sky-50 text-sky-900 border-sky-200';
    logoSvg = (
      <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
        <circle cx="20" cy="20" r="19" fill="#007db8" />
        <circle cx="20" cy="20" r="8" fill="#ffffff" />
        <rect x="17.5" y="20" width="5" height="18" fill="#007db8" />
      </svg>
    );
  } else if (norm.includes('punjab') || norm.includes('pnb')) {
    shortCode = 'PNB';
    badgeColor = 'bg-amber-50 text-amber-950 border-amber-200';
    logoSvg = (
      <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
        <rect width="40" height="40" rx="8" fill="#a21d22" />
        {/* PNB Gurmukhi/geometric curve emblem */}
        <path
          d="M10 28 L10 12 L20 12 C24 12 27 15 27 19 C27 23 24 26 20 26 L16 26 L16 28 Z"
          fill="#ffcc00"
        />
        <circle cx="20" cy="19" r="3.5" fill="#a21d22" />
      </svg>
    );
  } else if (norm.includes('canara')) {
    shortCode = 'CNB';
    badgeColor = 'bg-blue-50 text-blue-900 border-blue-200';
    logoSvg = (
      <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
        <rect width="40" height="40" rx="8" fill="#0083ca" />
        {/* Interlocking triangles */}
        <polygon points="12,28 20,12 28,28" fill="#ffcc00" />
        <polygon points="20,16 28,32 12,32" fill="#004c8f" opacity="0.85" />
      </svg>
    );
  } else if (norm.includes('baroda') || norm.includes('bob')) {
    shortCode = 'BOB';
    badgeColor = 'bg-orange-50 text-orange-950 border-orange-200';
    logoSvg = (
      <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
        <rect width="40" height="40" rx="8" fill="#f26522" />
        {/* Baroda vermilion rays motif */}
        <circle cx="20" cy="20" r="10" stroke="#ffffff" strokeWidth="2.5" fill="none" />
        <circle cx="20" cy="20" r="5" fill="#ffffff" />
        <line x1="20" y1="5" x2="20" y2="9" stroke="#ffffff" strokeWidth="2" />
        <line x1="20" y1="31" x2="20" y2="35" stroke="#ffffff" strokeWidth="2" />
        <line x1="5" y1="20" x2="9" y2="20" stroke="#ffffff" strokeWidth="2" />
        <line x1="31" y1="20" x2="35" y2="20" stroke="#ffffff" strokeWidth="2" />
      </svg>
    );
  } else if (norm.includes('hdfc')) {
    shortCode = 'HDFC';
    badgeColor = 'bg-blue-50 text-blue-950 border-blue-200';
    logoSvg = (
      <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
        <rect width="40" height="40" rx="8" fill="#004c8f" />
        <rect x="15" y="15" width="10" height="10" fill="#ed1c24" />
        <rect x="8" y="15" width="5" height="10" fill="#ffffff" />
        <rect x="27" y="15" width="5" height="10" fill="#ffffff" />
        <rect x="15" y="8" width="10" height="5" fill="#ffffff" />
        <rect x="15" y="27" width="10" height="5" fill="#ffffff" />
      </svg>
    );
  } else if (norm.includes('icici')) {
    shortCode = 'ICICI';
    badgeColor = 'bg-orange-50 text-orange-950 border-orange-200';
    logoSvg = (
      <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
        <rect width="40" height="40" rx="8" fill="#a41d23" />
        <circle cx="20" cy="20" r="11" stroke="#f58220" strokeWidth="3" fill="none" />
        <path d="M15 15 L25 25 M25 15 L15 25" stroke="#ffffff" strokeWidth="2.5" />
      </svg>
    );
  } else if (norm.includes('indian bank')) {
    shortCode = 'IDB';
    badgeColor = 'bg-indigo-50 text-indigo-950 border-indigo-200';
    logoSvg = (
      <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
        <rect width="40" height="40" rx="8" fill="#1e3a8a" />
        <circle cx="20" cy="20" r="10" fill="#ea580c" />
        <polygon points="20,12 26,24 14,24" fill="#ffffff" />
      </svg>
    );
  } else {
    shortCode = bankName.slice(0, 3).toUpperCase();
    logoSvg = (
      <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
        <rect width="40" height="40" rx="8" fill="#0f172a" />
        <text
          x="20"
          y="25"
          fill="#ffffff"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="monospace"
        >
          {shortCode}
        </text>
      </svg>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className={`${dims} rounded-md overflow-hidden shrink-0 shadow-2xs border border-stone-200/60`}
        title={bankName}
      >
        {logoSvg}
      </div>
      {showLabel && (
        <span className={`text-slate-900 ${textClass}`}>
          {bankName}
        </span>
      )}
    </div>
  );
};
