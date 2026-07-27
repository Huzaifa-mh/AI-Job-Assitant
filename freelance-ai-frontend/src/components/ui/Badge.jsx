export default function Badge({ children, color = 'primary', size = 'md', dot = false }) {
  const colors = {
    primary: { bg:'rgba(99,102,241,0.15)',  text:'var(--badge-primary-text)', dot:'#6366F1' },
    success: { bg:'rgba(16,185,129,0.15)',  text:'var(--badge-success-text)', dot:'#10B981' },
    warning: { bg:'rgba(245,158,11,0.15)',  text:'var(--badge-warning-text)', dot:'#F59E0B' },
    danger:  { bg:'rgba(239,68,68,0.15)',   text:'var(--badge-danger-text)',  dot:'#EF4444' },
    purple:  { bg:'rgba(139,92,246,0.15)',  text:'var(--badge-purple-text)',  dot:'#8B5CF6' },
    gray:    { bg:'rgba(107,114,128,0.15)', text:'var(--badge-gray-text)',    dot:'#6B7280' },
    blue:    { bg:'rgba(59,130,246,0.15)',  text:'var(--badge-blue-text)',    dot:'#3B82F6' },
  };

  const sizes = {
    sm: { padding:'2px 8px',  fontSize:10, letterSpacing:'0.04em' },
    md: { padding:'3px 10px', fontSize:11, letterSpacing:'0.04em' },
    lg: { padding:'5px 14px', fontSize:12, letterSpacing:'0.03em' },
  };

  const c = colors[color] || colors.primary;
  const s = sizes[size]   || sizes.md;

  return (
    <span style={{
      display:     'inline-flex',
      alignItems:  'center',
      gap:         5,
      background:  c.bg,
      color:       c.text,
      borderRadius:20,
      fontWeight:  600,
      lineHeight:  1.4,
      ...s,
    }}>
      {dot && (
        <span style={{
          width:      5,
          height:     5,
          borderRadius:'50%',
          background: c.dot,
          flexShrink: 0,
          animation:  'pulseDot 2s ease infinite',
        }} />
      )}
      {children}
    </span>
  );
}