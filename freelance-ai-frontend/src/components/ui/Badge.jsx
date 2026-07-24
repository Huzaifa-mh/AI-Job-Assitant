export default function Badge({ children, color = 'primary', size = 'md', dot = false }) {
  const colors = {
    primary: { bg: 'rgba(99,102,241,0.15)',  text: '#A5B4FC',  dot: '#6366F1' },
    success: { bg: 'rgba(16,185,129,0.15)',  text: '#6EE7B7',  dot: '#10B981' },
    warning: { bg: 'rgba(245,158,11,0.15)',  text: '#FCD34D',  dot: '#F59E0B' },
    danger:  { bg: 'rgba(239,68,68,0.15)',   text: '#FCA5A5',  dot: '#EF4444' },
    purple:  { bg: 'rgba(139,92,246,0.15)',  text: '#C4B5FD',  dot: '#8B5CF6' },
    gray:    { bg: 'rgba(107,114,128,0.15)', text: '#9CA3AF',  dot: '#6B7280' },
    blue:    { bg: 'rgba(59,130,246,0.15)',  text: '#93C5FD',  dot: '#3B82F6' },
  };

  const sizes = {
    sm: { padding: '2px 8px',  fontSize: 10 },
    md: { padding: '3px 10px', fontSize: 11 },
    lg: { padding: '5px 14px', fontSize: 12 },
  };

  const c = colors[color] || colors.primary;
  const s = sizes[size]   || sizes.md;

  return (
    <span style={{
      display:      'inline-flex',
      alignItems:   'center',
      gap:          5,
      background:   c.bg,
      color:        c.text,
      borderRadius: 20,
      fontWeight:   600,
      letterSpacing:'0.02em',
      ...s,
    }}>
      {dot && (
        <span style={{
          width: 5, height: 5, borderRadius: '50%',
          background: c.dot, flexShrink: 0,
          animation: 'pulseDot 2s ease infinite',
        }} />
      )}
      {children}
    </span>
  );
}