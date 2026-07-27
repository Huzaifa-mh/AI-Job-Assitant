export default function Card({
  children,
  hover    = false,
  glow     = false,
  glass    = false,
  padding  = 24,
  style    = {},
  onClick,
}) {
  const base = {
    background:     glass ? 'var(--glass-bg)' : 'var(--bg-card)',
    border:         '1px solid var(--border)',
    borderRadius:   'var(--radius)',
    padding,
    transition:     'all 0.2s ease',
    cursor:         onClick ? 'pointer' : 'default',
    backdropFilter: glass ? 'blur(12px)' : 'none',
    boxShadow:      glow ? '0 0 40px rgba(99,102,241,0.12)' : 'none',
    position:       'relative',
    overflow:       'hidden',
    letterSpacing:  '0.03em',   // ← consistent spacing
    lineHeight:     1.6,        // ← consistent line height
    ...style,
  };

  const handleEnter = (e) => {
    if (!hover && !onClick) return;
    e.currentTarget.style.borderColor = 'var(--border-light)';
    e.currentTarget.style.transform   = 'translateY(-3px)';
    e.currentTarget.style.boxShadow   = '0 12px 40px rgba(0,0,0,0.25)';
  };

  const handleLeave = (e) => {
    e.currentTarget.style.borderColor = 'var(--border)';
    e.currentTarget.style.transform   = 'translateY(0)';
    e.currentTarget.style.boxShadow   = glow ? '0 0 40px rgba(99,102,241,0.12)' : 'none';
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={base}
    >
      {children}
    </div>
  );
}