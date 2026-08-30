import React from 'react';

interface IntelligenzLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero' | 'watermark';
  className?: string;
  showText?: boolean;
  interactive?: boolean;
}

export const IntelligenzLogo: React.FC<IntelligenzLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  interactive = false,
}) => {
  const sizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    hero: 'w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56',
    watermark: 'w-96 h-96 opacity-5 pointer-events-none select-none',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        className={`relative flex items-center justify-center shrink-0 ${sizeMap[size]} ${
          interactive ? 'group cursor-pointer transition-transform duration-300 hover:scale-105' : ''
        }`}
      >
        {/* Ambient Glow */}
        {size !== 'watermark' && (
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-cyan-500/25 via-purple-500/25 to-pink-500/25 blur-md opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none" />
        )}

        {/* SVG Emblem */}
        <svg
          viewBox="0 0 400 400"
          className="relative w-full h-full drop-shadow-lg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Outer gradient border */}
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="30%" stopColor="#a855f7" />
              <stop offset="70%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            {/* Inner background */}
            <radialGradient id="badgeBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0f1a30" />
              <stop offset="75%" stopColor="#070c18" />
              <stop offset="100%" stopColor="#04070d" />
            </radialGradient>

            {/* Neural Brain Gradient (Left - Bio) */}
            <linearGradient id="bioBrainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="40%" stopColor="#f97316" />
              <stop offset="80%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>

            {/* Circuit Brain Gradient (Right - Tech) */}
            <linearGradient id="techBrainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="45%" stopColor="#06b6d4" />
              <stop offset="85%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>

            {/* Center Beam */}
            <linearGradient id="beamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>

            {/* Text paths */}
            <path id="topTextArc" d="M 55,200 A 145,145 0 0,1 345,200" fill="none" />
            <path id="bottomTextArc" d="M 335,225 A 145,145 0 0,1 65,225" fill="none" />
          </defs>

          {/* Outer Multi-color Ring */}
          <circle cx="200" cy="200" r="190" fill="none" stroke="url(#ringGrad)" strokeWidth="12" />
          <circle cx="200" cy="200" r="182" fill="none" stroke="#060913" strokeWidth="3" />

          {/* Main Dark Body */}
          <circle cx="200" cy="200" r="180" fill="url(#badgeBg)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />

          {/* Top Banner Text: DEPARTMENT OF CSE(AIML) & AI */}
          <text fill="#ffffff" fontSize="15" fontWeight="800" letterSpacing="2.5" fontFamily="'Outfit', sans-serif">
            <textPath href="#topTextArc" startOffset="50%" textAnchor="middle">
              • DEPARTMENT OF CSE(AIML) & AI •
            </textPath>
          </text>

          {/* Left computer icon */}
          <g transform="translate(28, 185) scale(0.65)" opacity="0.85">
            <rect x="0" y="5" width="28" height="18" rx="2" fill="none" stroke="#38bdf8" strokeWidth="2" />
            <line x1="-3" y1="23" x2="31" y2="23" stroke="#38bdf8" strokeWidth="2.5" />
            <text x="14" y="17" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">&lt;/&gt;</text>
          </g>

          {/* Right AI head icon */}
          <g transform="translate(335, 182) scale(0.7)" opacity="0.85">
            <path d="M 12,5 C 20,5 24,11 24,18 C 24,24 20,28 17,30 L 17,36 L 6,36 L 6,30 C 2,27 0,22 0,16 C 0,10 5,5 12,5 Z" fill="none" stroke="#c084fc" strokeWidth="2" />
            <circle cx="9" cy="15" r="2" fill="#ec4899" />
            <circle cx="17" cy="13" r="2" fill="#38bdf8" />
            <circle cx="13" cy="21" r="2" fill="#10b981" />
            <line x1="9" y1="15" x2="17" y2="13" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
            <line x1="9" y1="15" x2="13" y2="21" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
            <line x1="17" y1="13" x2="13" y2="21" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
          </g>

          {/* Inner Badge Separator Line */}
          <circle cx="200" cy="200" r="148" fill="none" stroke="rgba(56, 189, 248, 0.18)" strokeWidth="1" strokeDasharray="3,3" />

          {/* CENTER BRAIN GRAPHIC */}
          <g transform="translate(0, -10)">
            {/* Center Vertical Light Beam */}
            <rect x="198" y="70" width="4" height="140" fill="url(#beamGrad)" />
            <circle cx="200" cy="140" r="18" fill="#f59e0b" opacity="0.25" filter="blur(8px)" />

            {/* Left Brain - Bio Neural Organic Nodes */}
            <g stroke="url(#bioBrainGrad)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 190,82 C 165,75 140,88 135,108 C 122,112 118,128 123,142 C 115,152 118,168 130,178 C 138,188 152,192 165,190 C 176,188 185,195 190,198" />
              <path d="M 155,108 C 168,118 178,110 188,114" />
              <path d="M 140,135 C 152,130 162,142 175,138" />
              <path d="M 148,160 C 160,155 170,165 186,160" />
              <circle cx="155" cy="108" r="3.5" fill="#f97316" />
              <circle cx="188" cy="114" r="3" fill="#fbbf24" />
              <circle cx="140" cy="135" r="3.5" fill="#ec4899" />
              <circle cx="175" cy="138" r="3" fill="#f97316" />
              <circle cx="148" cy="160" r="3.5" fill="#ec4899" />
              <circle cx="186" cy="160" r="3" fill="#f97316" />
            </g>

            {/* Right Brain - Electronic Circuit Nodes */}
            <g stroke="url(#techBrainGrad)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 210,82 C 235,75 260,88 265,108 C 278,112 282,128 277,142 C 285,152 282,168 270,178 C 262,188 248,192 235,190 C 224,188 215,195 210,198" />
              <path d="M 212,105 H 240 L 255,115" />
              <path d="M 212,128 H 230 L 245,128 H 262" />
              <path d="M 212,150 H 235 L 250,162 H 265" />
              <path d="M 212,172 H 228 L 240,182" />
              <circle cx="255" cy="115" r="3.5" fill="#38bdf8" />
              <circle cx="262" cy="128" r="3.5" fill="#06b6d4" />
              <circle cx="265" cy="162" r="3.5" fill="#818cf8" />
              <circle cx="240" cy="182" r="3.5" fill="#c084fc" />
            </g>

            {/* Central Code Symbol: </> */}
            <g transform="translate(178, 116)">
              <rect x="0" y="2" width="44" height="42" rx="8" fill="#060913" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              <text x="22" y="29" fill="#ffffff" fontSize="22" fontWeight="900" textAnchor="middle" fontFamily="'JetBrains Mono', monospace">&lt;/&gt;</text>
            </g>
          </g>

          {/* MAIN BRAND TEXT: IntelliGenZ */}
          <text
            x="200"
            y="248"
            fill="#ffffff"
            fontSize="36"
            fontWeight="900"
            textAnchor="middle"
            fontFamily="'Outfit', sans-serif"
            letterSpacing="0.5"
          >
            IntelliGenZ
          </text>

          {/* SCRIPT TEXT: Club with underline */}
          <text
            x="200"
            y="282"
            fill="#f8fafc"
            fontSize="32"
            fontWeight="600"
            textAnchor="middle"
            fontFamily="'Caveat', cursive"
          >
            Club
          </text>
          {/* Orange Accent Underline under Club */}
          <path
            d="M 160,288 Q 200,295 240,288"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* LOWER TECH ICONS CONTAINER */}
          <g transform="translate(130, 302)">
            <rect x="0" y="0" width="140" height="28" rx="6" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1" />
            {/* AI Microchip */}
            <g transform="translate(16, 5)">
              <rect x="0" y="0" width="18" height="18" rx="3" fill="#0369a1" />
              <text x="9" y="13" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">AI</text>
            </g>
            <line x1="48" y1="4" x2="48" y2="24" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            {/* Robotic Arm */}
            <g transform="translate(56, 5)">
              <circle cx="5" cy="14" r="3" fill="#f59e0b" />
              <line x1="5" y1="14" x2="15" y2="7" stroke="#f59e0b" strokeWidth="2.5" />
              <circle cx="15" cy="7" r="2.5" fill="#f97316" />
              <line x1="15" y1="7" x2="22" y2="12" stroke="#f59e0b" strokeWidth="2" />
            </g>
            <line x1="90" y1="4" x2="90" y2="24" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            {/* Cloud Tech */}
            <g transform="translate(98, 5)">
              <path d="M 6,14 A 4,4 0 0,1 8,7 A 5,5 0 0,1 18,7 A 4,4 0 0,1 21,14 Z" fill="none" stroke="#38bdf8" strokeWidth="1.8" />
              <circle cx="13" cy="11" r="1.5" fill="#38bdf8" />
            </g>
          </g>

          {/* Bottom Banner Text: CODE • INNOVATE • INTELLIGENTLY */}
          <text fill="#ffffff" fontSize="13" fontWeight="800" letterSpacing="3.2" fontFamily="'Outfit', sans-serif">
            <textPath href="#bottomTextArc" startOffset="50%" textAnchor="middle">
              CODE • INNOVATE • INTELLIGENTLY
            </textPath>
          </text>
        </svg>
      </div>

      {/* Brand Text for Horizontal Layouts */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-white font-['Outfit'] text-lg sm:text-xl leading-none">
              INTELLIGENZ
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              CLUB
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-300 tracking-wide mt-1 leading-tight line-clamp-1">
            Dept. of CSE (AIML) &amp; AI
          </span>
          <span className="text-[9.5px] font-medium text-slate-400 tracking-tight leading-tight line-clamp-1 hidden sm:block">
            DR. K. V. SUBBA REDDY INSTITUTE OF TECHNOLOGY
          </span>
        </div>
      )}
    </div>
  );
};
