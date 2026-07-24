import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  icon,
  fullWidth = false,
  className = '',
  style     = {},
  ...props
}) {
  const base = {
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            8,
    fontFamily:     'var(--font)',
    fontWeight:     500,
    borderRadius:   10,
    border:         'none',
    cursor:         loading || props.disabled ? 'not-allowed' : 'pointer',
    opacity:        props.disabled ? 0.5 : 1,
    transition:     'all 0.18s ease',
    whiteSpace:     'nowrap',
    width:          fullWidth ? '100%' : 'auto',
    position:       'relative',
    overflow:       'hidden',
  };

  const variants = {
    primary: {
      background:  'linear-gradient(135deg, #6366F1, #4f52d9)',
      color:       '#ffffff',
      boxShadow:   '0 4px 20px rgba(99,102,241,0.3)',
    },
    secondary: {
      background:  'var(--bg-elevated)',
      color:       'var(--text-primary)',
      border:      '1px solid var(--border-light)',
    },
    ghost: {
      background:  'transparent',
      color:       'var(--text-secondary)',
    },
    danger: {
      background:  'linear-gradient(135deg, #EF4444, #dc2626)',
      color:       '#ffffff',
      boxShadow:   '0 4px 16px rgba(239,68,68,0.25)',
    },
    success: {
      background:  'linear-gradient(135deg, #10B981, #059669)',
      color:       '#ffffff',
      boxShadow:   '0 4px 16px rgba(16,185,129,0.25)',
    },
    outline: {
      background:  'transparent',
      color:       'var(--primary)',
      border:      '1px solid var(--primary)',
    },
    glass: {
      background:  'rgba(99,102,241,0.1)',
      color:       '#A5B4FC',
      border:      '1px solid rgba(99,102,241,0.25)',
      backdropFilter: 'blur(8px)',
    },
  };

  const sizes = {
    xs: { padding: '4px 10px',  fontSize: 11 },
    sm: { padding: '6px 14px',  fontSize: 12 },
    md: { padding: '9px 18px',  fontSize: 13 },
    lg: { padding: '12px 24px', fontSize: 14 },
    xl: { padding: '14px 32px', fontSize: 15 },
  };

  const handleMouseEnter = (e) => {
    if (props.disabled || loading) return;
    if (variant === 'primary')    e.currentTarget.style.transform = 'translateY(-1px)';
    if (variant === 'secondary')  e.currentTarget.style.background = 'var(--border)';
    if (variant === 'ghost')      e.currentTarget.style.background = 'var(--bg-elevated)';
    if (variant === 'outline')    e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
    if (variant === 'glass')      e.currentTarget.style.background = 'rgba(99,102,241,0.18)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform  = 'translateY(0)';
    e.currentTarget.style.background = variants[variant]?.background || '';
  };

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ ...base, ...variants[variant], ...sizes[size], ...style }}
    >
      {loading
        ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />
        : icon && <span style={{ display:'flex', alignItems:'center' }}>{icon}</span>
      }
      {children}
    </button>
  );
}