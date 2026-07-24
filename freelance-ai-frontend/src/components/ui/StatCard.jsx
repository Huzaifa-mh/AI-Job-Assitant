import Card from './Card';

export default function StatCard({
  label,
  value,
  sub,
  icon,
  trend,
  trendUp,
  color   = 'var(--primary)',
  style   = {},
}) {
  return (
    <Card hover style={{ padding: 20, ...style }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>

        {/* Left: text */}
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{
            fontSize:      11,
            fontWeight:    600,
            color:         'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginBottom:  8,
          }}>
            {label}
          </p>

          <p style={{
            fontSize:   28,
            fontWeight: 800,
            color:      'var(--text-primary)',
            lineHeight: 1,
            marginBottom: sub ? 6 : 0,
          }}>
            {value}
          </p>

          {sub && (
            <p style={{ fontSize:11, color:'var(--text-secondary)', marginTop:4 }}>{sub}</p>
          )}

          {trend && (
            <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:6 }}>
              <span style={{
                fontSize:   11,
                fontWeight: 600,
                color:      trendUp ? '#10B981' : '#EF4444',
              }}>
                {trendUp ? '↑' : '↓'} {trend}
              </span>
              <span style={{ fontSize:11, color:'var(--text-muted)' }}>vs last month</span>
            </div>
          )}
        </div>

        {/* Right: icon */}
        {icon && (
          <div style={{
            width:          40,
            height:         40,
            borderRadius:   10,
            background:     `color-mix(in srgb, ${color} 12%, transparent)`,
            border:         `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            color,
            flexShrink:     0,
            marginLeft:     12,
          }}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}