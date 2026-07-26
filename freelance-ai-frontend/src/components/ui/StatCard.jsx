import Card from './Card';
import { TOKENS as T } from '../../utils/designTokens';

export default function StatCard({
  label,
  value,
  sub,
  icon,
  trend,
  trendUp,
  color = T.color.primary,
  style = {},
}) {
  return (
    <Card hover style={{ padding: T.space.cardPadding, ...style }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>

        {/* ── Left: text ── */}
        <div style={{ flex:1, minWidth:0 }}>

          {/* Eyebrow label */}
          <p style={{
            fontSize:      T.font.statLabelSize,
            fontWeight:    T.font.statLabelWeight,
            color:         T.color.textLabel,         // #AEB1B9
            textTransform: 'uppercase',
            letterSpacing: T.font.spacingWide,        // 0.07em
            marginBottom:  10,
            lineHeight:    1.4,
          }}>
            {label}
          </p>

          {/* Main value */}
          <p style={{
            fontSize:     T.font.statValueSize,       // 28
            fontWeight:   T.font.statValueWeight,     // 800
            color:        T.color.cardValue,          // #F9FAFB
            lineHeight:   1,
            letterSpacing:T.font.spacingTight,
            marginBottom: sub ? 6 : 0,
          }}>
            {value}
          </p>

          {/* Sub text */}
          {sub && (
            <p style={{
              fontSize:     T.font.statLabelSize,
              color:        T.color.cardValueSub,     // #9FA3AC
              marginTop:    5,
              letterSpacing:T.font.spacingNormal,
              lineHeight:   1.4,
            }}>
              {sub}
            </p>
          )}

          {/* Trend */}
          {trend && (
            <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:7 }}>
              <span style={{
                fontSize:     11,
                fontWeight:   600,
                color:        trendUp ? T.color.success : T.color.danger,
                letterSpacing:T.font.spacingNormal,
              }}>
                {trendUp ? '↑' : '↓'} {trend}
              </span>
              <span style={{
                fontSize:     11,
                color:        T.color.textLabel,
                letterSpacing:T.font.spacingTight,
              }}>
                vs last month
              </span>
            </div>
          )}
        </div>

        {/* ── Right: icon box — 25×25 ── */}
        {icon && (
          <div style={{
            width:          T.icon.cardBox,           // 25
            height:         T.icon.cardBox,           // 25
            borderRadius:   T.radius.small,
            background:     `${color}18`,
            border:         `1px solid ${color}25`,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            color,
            flexShrink:     0,
          }}>
            {/* Clone icon with correct size */}
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}