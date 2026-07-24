export default function EmptyState({
  icon,
  title,
  desc,
  action,
  compact = false,
}) {
  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      textAlign:      'center',
      padding:        compact ? '24px 16px' : '48px 24px',
      gap:            compact ? 8 : 12,
    }}>
      {/* Icon */}
      {typeof icon === 'string' ? (
        <span style={{ fontSize: compact ? 32 : 48, lineHeight: 1 }}>{icon}</span>
      ) : (
        <div style={{
          width:          compact ? 44 : 56,
          height:         compact ? 44 : 56,
          borderRadius:   14,
          background:     'rgba(99,102,241,0.08)',
          border:         '1px solid rgba(99,102,241,0.15)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          color:          'var(--text-muted)',
        }}>
          {icon}
        </div>
      )}

      <p style={{
        fontWeight: 600,
        fontSize:   compact ? 13 : 15,
        color:      'var(--text-primary)',
        marginTop:  4,
      }}>
        {title}
      </p>

      {desc && (
        <p style={{
          fontSize:  compact ? 12 : 13,
          color:     'var(--text-secondary)',
          maxWidth:  280,
          lineHeight:1.6,
        }}>
          {desc}
        </p>
      )}

      {action && (
        <div style={{ marginTop: compact ? 8 : 16 }}>{action}</div>
      )}
    </div>
  );
}