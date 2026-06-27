import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
}

export default function AppLogo({ className = '', size = 40 }: AppLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`${className} select-none`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      id="app-logo-svg"
    >
      <defs>
        {/* Core ocean & knowledge blue-indigo-cyan gradient */}
        <linearGradient id="sailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" /> {/* Blue 500 */}
          <stop offset="50%" stopColor="#4f46e5" /> {/* Indigo 600 */}
          <stop offset="100%" stopColor="#06b6d4" /> {/* Cyan 500 */}
        </linearGradient>
        
        {/* Golden light of knowledge & physics gradient */}
        <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" /> {/* Amber 400 */}
          <stop offset="100%" stopColor="#f59e0b" /> {/* Amber 500 */}
        </linearGradient>

        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Subtle background glow circle */}
      <circle cx="50" cy="50" r="46" className="fill-slate-100/10 dark:fill-slate-800/10 stroke-slate-200/20 dark:stroke-slate-800/20" strokeWidth="1" />

      {/* Physics Orbit 1 (Elegant tilted ellipse representing atomic structure) */}
      <ellipse
        cx="50"
        cy="46"
        rx="39"
        ry="13"
        fill="none"
        stroke="url(#orbitGradient)"
        strokeWidth="2"
        transform="rotate(-28, 50, 46)"
        strokeLinecap="round"
        className="drop-shadow-[0_1px_2px_rgba(245,158,11,0.2)]"
      />

      {/* Physics Orbit 2 (Complementary secondary orbit in emerald) */}
      <ellipse
        cx="50"
        cy="46"
        rx="35"
        ry="9"
        fill="none"
        stroke="#10b981" /* Emerald 500 */
        strokeWidth="1"
        strokeDasharray="4 3"
        transform="rotate(15, 50, 46)"
        className="opacity-70"
      />

      {/* Mast of the Sailboat */}
      <path
        d="M50 16 L50 72"
        stroke="#64748b"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Left Sail: Curving gracefully like an open book page */}
      <path
        d="M47 19 C34 32 25 49 25 66 C37 64 45 59 47 54 Z"
        fill="url(#sailGradient)"
        className="drop-shadow-md"
      />

      {/* Right Sail: Principal sail expanding with the winds of knowledge */}
      <path
        d="M53 16 C68 30 75 47 75 64 C61 62 55 56 53 49 Z"
        fill="url(#sailGradient)"
        className="drop-shadow-md"
      />

      {/* Sleek, futuristic hull of the boat */}
      <path
        d="M18 69 C34 77 66 77 82 69 C71 80 29 80 18 69 Z"
        fill="url(#sailGradient)"
        className="drop-shadow-lg"
      />

      {/* Glowing physical particle/star on Orbit 1 */}
      <circle cx="16" cy="31" r="4" fill="#fbbf24" filter="url(#glow)" />
      <circle cx="16" cy="31" r="1.5" fill="#ffffff" />

      {/* Glowing physical particle/star on Orbit 2 */}
      <circle cx="81" cy="62" r="3.5" fill="#10b981" filter="url(#glow)" />
      <circle cx="81" cy="62" r="1" fill="#ffffff" />

      {/* Star sparkle at the peak of the mast representing guidance */}
      <path
        d="M50 7 L51.5 11 L55 11 L52 12.5 L53 16 L50 13.5 L47 16 L48 12.5 L45 11 L48.5 11 Z"
        fill="#fbbf24"
      />
    </svg>
  );
}
