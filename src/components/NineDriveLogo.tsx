import React from 'react';

interface NineDriveLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const NineDriveLogo: React.FC<NineDriveLogoProps> = ({
  className = 'h-8 w-auto',
  size = 32,
  showText = true,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* SVG Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="nineDriveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2997FF" />
            <stop offset="50%" stopColor="#BF5AF2" />
            <stop offset="100%" stopColor="#CCFF00" />
          </linearGradient>

          <linearGradient id="nineDriveGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2997FF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#BF5AF2" stopOpacity="0.3" />
          </linearGradient>

          <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Shield Glow */}
        <path
          d="M20 4L32 9V19C32 27.5 26.5 34.5 20 37C13.5 34.5 8 27.5 8 19V9L20 4Z"
          fill="url(#nineDriveGlow)"
          opacity="0.15"
        />

        {/* Outer Shield Border */}
        <path
          d="M20 5L31 9.5V18.5C31 26 26.2 32.5 20 35C13.8 32.5 9 26 9 18.5V9.5L20 5Z"
          stroke="url(#nineDriveGrad1)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.4"
        />

        {/* Core Stylized '9' Loop */}
        <path
          d="M23 13C20.2386 13 18 15.2386 18 18C18 20.7614 20.2386 23 23 23C25.7614 23 28 20.7614 28 18C28 15.2386 25.7614 13 23 13ZM23 13V27C23 29 21.5 30.5 19.5 30.5"
          stroke="url(#nineDriveGrad1)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#logoGlow)"
        />

        {/* Central Cloud Node Dot */}
        <circle cx="23" cy="18" r="2.5" fill="#2997FF" />
        <circle cx="14" cy="15" r="1.5" fill="#BF5AF2" />
        <circle cx="14" cy="23" r="1.5" fill="#CCFF00" />
      </svg>

      {/* Brand Text */}
      {showText && (
        <span className="font-extrabold tracking-tight text-white flex items-center text-lg">
          <span className="text-gradient-apple">9DRIVE</span>
          <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded-md bg-white/10 text-[--accent-blue] font-mono border border-white/10 font-medium">
            VAULT
          </span>
        </span>
      )}
    </div>
  );
};
