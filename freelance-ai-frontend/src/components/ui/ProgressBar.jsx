import { TOKENS as T } from '../../utils/designTokens';

export default function ProgressBar({
  value        = 0,
  color        = T.color.primary,
  label,
  showValue    = true,
  height       = 6,
  animated     = true,
  style        = {},
}) {
  const clamped = Math.min(Math.max(value, 0), 100);

  const barColor = color === 'auto'
    ? clamped >= 70 ? T.color.success
    : clamped >= 50 ? T.color.warning
    : T.color.danger
    : color;

  return (
    <div style={{ width:'100%', ...style }}>
      {(label || showValue) && (
        <div style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          marginBottom:   7,
        }}>
          {label && (
            <span style={{
              fontSize:     T.font.progressLabelSize,   // 13
              fontWeight:   500,
              color:        T.color.textSecondary,
              letterSpacing:T.font.spacingNormal,
              lineHeight:   1.4,
            }}>
              {label}
            </span>
          )}
          {showValue && (
            <span style={{
              fontSize:     13,
              fontWeight:   700,
              color:        barColor,
              letterSpacing:T.font.spacingTight,
            }}>
              {clamped}%
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
          width:      `${clamped}%`,
          background: barColor,
          borderRadius: height,
          transition: animated ? 'width 0.8s cubic-bezier(0.4,0,0.2,1)' : 'none',
          position:   'relative',
          overflow:   'hidden',
        }}>
          {animated && (
            <div style={{
              position:   'absolute',
              top:        0,
              left:       '-100%',
              width:      '100%',
              height:     '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
              animation:  'shimmer 2s infinite',
            }} />
          )}
        </div>
      </div>
    </div>
  );
}