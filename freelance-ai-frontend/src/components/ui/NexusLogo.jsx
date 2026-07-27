export default function NexusLogo({ size = 36 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      style={{ flexShrink:0, display:'block' }}
    >
      <defs>
        <linearGradient id="nx-leftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#1B2D5B"/>
          <stop offset="100%" stopColor="#1E5FA8"/>
        </linearGradient>
        <linearGradient id="nx-rightGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#00AADD"/>
          <stop offset="100%" stopColor="#00D4FF"/>
        </linearGradient>
        <linearGradient id="nx-bridgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#1E5FA8"/>
          <stop offset="50%"  stopColor="#0088CC"/>
          <stop offset="100%" stopColor="#00BBEE"/>
        </linearGradient>
        <filter id="nx-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="4"
            floodColor="#00AADD" floodOpacity="0.28"/>
        </filter>
        <filter id="nx-glow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Ground shadow ellipse */}
      <ellipse cx="60" cy="108" rx="28" ry="5"
               fill="#00AADD" opacity="0.12"/>

      {/* ── Left leg (dark navy) ── */}
      <path
        d="M 24 94 L 24 26 Q 24 20 30 20 L 42 20 Q 48 20 48 26 L 48 62 L 38 74 L 38 94 Z"
        fill="url(#nx-leftGrad)"
        filter="url(#nx-shadow)"
      />
      {/* Left leg inner sheen */}
      <path
        d="M 28 26 L 28 70 L 38 58 L 38 26 Q 38 24 35 24 L 31 24 Q 28 24 28 26 Z"
        fill="white" opacity="0.1"
      />
      {/* Left leg bottom dark face */}
      <path d="M 24 94 L 38 94 L 38 88 L 24 88 Z"
            fill="#0A1628" opacity="0.35"/>

      {/* ── Diagonal bridge ── */}
      <path
        d="M 48 62 L 48 26 Q 48 20 54 18 L 66 18 Q 72 20 70 28 L 70 32 L 52 68 L 52 74 L 38 74 Z"
        fill="url(#nx-bridgeGrad)"
        filter="url(#nx-shadow)"
      />
      {/* Bridge sheen */}
      <path d="M 50 26 L 50 60 L 58 44 L 60 22 Z"
            fill="white" opacity="0.08"/>

      {/* ── Right leg top spike ── */}
      <path
        d="M 70 32 L 70 56 L 80 44 L 94 26 Q 96 20 90 18 L 78 18 Q 72 18 70 24 Z"
        fill="url(#nx-rightGrad)"
        filter="url(#nx-glow)"
      />

      {/* ── Right leg body ── */}
      <path d="M 70 56 L 70 94 L 84 94 L 84 42 Z"
            fill="url(#nx-rightGrad)"/>

      {/* Right leg bottom dark face */}
      <path d="M 70 94 L 84 94 L 84 88 L 70 88 Z"
            fill="#006699" opacity="0.5"/>

      {/* ── Bright cyan tip ── */}
      <path d="M 88 18 L 96 23 L 82 40 L 76 34 Z"
            fill="#00D4FF" opacity="0.9"/>
    </svg>
  );
}