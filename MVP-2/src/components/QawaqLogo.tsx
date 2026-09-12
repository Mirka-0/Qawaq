import React from 'react';

interface QawaqLogoProps {
  className?: string;
  size?: number;
  showGlow?: boolean;
}

export const QawaqLogo: React.FC<QawaqLogoProps> = ({
  className = 'w-9 h-9',
  size = 40,
  showGlow = true,
}) => {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Qawaq Logo"
    >
      <defs>
        {/* Background gradient */}
        <linearGradient id="qawaq-bg" x1="64" y1="32" x2="448" y2="480" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#141d2e" />
          <stop offset="50%" stopColor="#0d1424" />
          <stop offset="100%" stopColor="#080c16" />
        </linearGradient>

        {/* Orange glow gradient for Q tail & visor */}
        <linearGradient id="qawaq-orange" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>

        <linearGradient id="qawaq-eye-pupil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffc043" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>

        {/* Reticle slate metallic ring */}
        <linearGradient id="qawaq-reticle" x1="120" y1="120" x2="392" y2="392" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3d4d68" />
          <stop offset="100%" stopColor="#253246" />
        </linearGradient>

        {/* Soft amber glow filter */}
        {showGlow && (
          <filter id="qawaq-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="10" floodColor="#f59e0b" floodOpacity="0.45" />
          </filter>
        )}

        <filter id="qawaq-inner-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* 1. Rounded Dark Navy Squircle Container */}
      <rect
        x="16"
        y="16"
        width="480"
        height="480"
        rx="115"
        fill="url(#qawaq-bg)"
        stroke="#27354d"
        strokeWidth="6"
      />

      {/* Inner subtle rim */}
      <rect
        x="24"
        y="24"
        width="464"
        height="464"
        rx="107"
        fill="none"
        stroke="#1a2538"
        strokeWidth="2"
      />

      {/* 2. Crosshair Guidelines (Dashed Reticle Axis) */}
      <g stroke="#3a4964" strokeWidth="3" strokeDasharray="8 8" opacity="0.75">
        <line x1="256" y1="90" x2="256" y2="422" />
        <line x1="90" y1="256" x2="422" y2="256" />
      </g>

      {/* 3. Reticle Base Ring (Forming the circular body of the 'Q') */}
      <circle
        cx="256"
        cy="256"
        r="140"
        stroke="url(#qawaq-reticle)"
        strokeWidth="34"
        fill="none"
      />

      {/* Tick markers at cardinal points */}
      <g stroke="#4f6385" strokeWidth="4">
        <line x1="256" y1="84" x2="256" y2="104" />
        <line x1="256" y1="408" x2="256" y2="428" />
        <line x1="84" y1="256" x2="104" y2="256" />
        <line x1="408" y1="256" x2="428" y2="256" />
      </g>

      {/* 4. Orange Arched Safety Visor (Top arc of Q) */}
      <path
        d="M 148 168 A 140 140 0 0 1 364 168"
        fill="none"
        stroke="url(#qawaq-orange)"
        strokeWidth="38"
        strokeLinecap="round"
        filter={showGlow ? 'url(#qawaq-glow)' : undefined}
      />

      {/* Green Status Beacon Dot on the right side of the visor */}
      <g transform="translate(352, 142)">
        <circle cx="0" cy="0" r="17" fill="none" stroke="#10b981" strokeWidth="2.5" opacity="0.6" />
        <circle cx="0" cy="0" r="11" fill="#10b981" />
        <circle cx="-3" cy="-3" r="3" fill="#6ee7b7" />
      </g>

      {/* 5. Glowing Orange Diagonal Tab (Tail of the 'Q' at 5 o'clock) */}
      <g filter={showGlow ? 'url(#qawaq-glow)' : undefined}>
        <rect
          x="306"
          y="306"
          width="40"
          height="108"
          rx="12"
          transform="rotate(-45 306 306)"
          fill="url(#qawaq-orange)"
        />
      </g>

      {/* 6. Central Cybernetic Safety Eye */}
      <g filter="url(#qawaq-inner-shadow)">
        {/* Eye outer contour */}
        <path
          d="M 152 256 C 184 190 328 190 360 256 C 328 322 184 322 152 256 Z"
          fill="#060b14"
          stroke="url(#qawaq-orange)"
          strokeWidth="11"
          strokeLinejoin="round"
        />

        {/* Outer amber iris ring */}
        <circle
          cx="256"
          cy="256"
          r="38"
          fill="url(#qawaq-eye-pupil)"
        />

        {/* Dark pupil center */}
        <circle
          cx="256"
          cy="256"
          r="20"
          fill="#0a0a0c"
        />

        {/* White catchlight reflection dot */}
        <circle
          cx="264"
          cy="246"
          r="8"
          fill="#ffffff"
        />
        <circle
          cx="248"
          cy="264"
          r="3.5"
          fill="#ffedd5"
          opacity="0.8"
        />
      </g>
    </svg>
  );
};
