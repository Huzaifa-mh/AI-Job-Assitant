export default function ProgressBar({
  value        = 0,
  color        = 'var(--primary)',
  label,
  showValue    = true,
  height       = 6,
  animated     = true,
  style        = {},
}) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  const barColor =
    color === 'auto'
      ? clampedValue >= 70 ? '#10B981'
      : clampedValue >= 50 ? '#F59E0B'
      : '#EF4444'
      : color;

  return (
    <div style={{ width:'100%', ...style }}>
      {(label || showValue) && (
        <div style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          marginBottom:   6,
        }}>
          {label && (
            <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{label}</span>
          )}
          {showValue && (
            <span style={{
              fontSize:   12,
              fontWeight: 600,
              color:      barColor,
            }}>
              {clampedValue}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div style={{
        height,
        background:   'var(--border)',
        borderRadius: height,
        overflow:     'hidden',
      }}>
        {/* Fill */}
        <div style={{
          height:     '100%',
          width:      `${clampedValue}%`,
          background: barColor,
          borderRadius: height,
          transition: animated ? 'width 0.8s cubic-bezier(0.4,0,0.2,1)' : 'none',
          position:   'relative',
          overflow:   'hidden',
        }}>
          {/* Shimmer effect on fill */}
          {animated && (
            <div style={{
              position:   'absolute',
              top: 0, left: '-100%',
              width:      '100%',
              height:     '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
              animation:  'shimmer 2s infinite',
            }} />
          )}
        </div>
      </div>
    </div>
  );
}