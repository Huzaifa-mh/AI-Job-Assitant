import { useState, useEffect } from 'react';
import { matchAPI, resumeAPI } from '../services/api';
import { scoreColor } from '../utils/helpers';
import { TOKENS as T } from '../utils/designTokens';
import AppLayout   from '../components/layout/AppLayout';
import Card        from '../components/ui/Card';
import Badge       from '../components/ui/Badge';
import Spinner     from '../components/ui/Spinner';
import EmptyState  from '../components/ui/EmptyState';
import ProgressBar from '../components/ui/ProgressBar';
import {
  BarChart3, TrendingUp, Briefcase,
  FileText, Sparkles, Award,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts';

/* ══════════════════════════════════════════
   CONSISTENT COLOR PALETTE
   No rainbow — two families only:
   Primary scale (indigo) for bar chart
   Semantic (green/amber/red) for pie
══════════════════════════════════════════ */
const BAR_COLOR        = '#6366F1';   // single consistent indigo for all bars
const BAR_COLOR_TOP    = '#8B5CF6';   // slightly lighter for top bar only
const LINE_COLOR       = '#6366F1';
const PIE_STRONG       = '#10B981';
const PIE_MODERATE     = '#F59E0B';
const PIE_WEAK         = '#EF4444';

/* ══════════════════════════════════════════
   CUSTOM TOOLTIP
══════════════════════════════════════════ */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:   '#111827',
      border:       '1px solid #2d3748',
      borderRadius: 10,
      padding:      '10px 14px',
      boxShadow:    '0 8px 24px rgba(0,0,0,0.4)',
    }}>
      {label && (
        <p style={{ fontSize:11, color:'#9CA3AF', marginBottom:6, letterSpacing:'0.04em' }}>
          {label}
        </p>
      )}
      {payload.map((p, i) => (
        <p key={i} style={{
          fontSize:   13,
          fontWeight: 700,
          color:      p.color || '#F9FAFB',
          letterSpacing:'0.03em',
        }}>
          {p.name}: {p.value}{p.name === 'Score' || p.name === 'Match Score' ? '%' : ''}
        </p>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════
   CUSTOM PIE LEGEND — large, readable
══════════════════════════════════════════ */
function PieLegend({ data }) {
  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      gap:           16,
      justifyContent:'center',
      paddingLeft:   8,
    }}>
      {data.map(({ name, value, color, pct }) => (
        <div key={name}>
          {/* Color dot + name */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <div style={{
              width:        12,
              height:       12,
              borderRadius: 3,
              background:   color,
              flexShrink:   0,
            }} />
            <span style={{
              fontSize:     13,
              fontWeight:   500,
              color:        '#9CA3AF',
              letterSpacing:'0.03em',
            }}>
              {name}
            </span>
          </div>
          {/* Value + percentage */}
          <div style={{ display:'flex', alignItems:'baseline', gap:8, paddingLeft:22 }}>
            <span style={{
              fontSize:     26,
              fontWeight:   800,
              color,
              lineHeight:   1,
              letterSpacing:'0.01em',
            }}>
              {value}
            </span>
            <span style={{
              fontSize:     13,
              fontWeight:   500,
              color:        '#6B7280',
              letterSpacing:'0.03em',
            }}>
              jobs · {pct}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function Analytics() {
  const [results,  setResults]  = useState([]);
  const [resumes,  setResumes]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      matchAPI.getResults().catch(() => ({ data:{ results:[] } })),
      resumeAPI.getMine().catch(()   => ({ data:[] })),
    ]).then(([m, r]) => {
      setResults(m.data?.results || []);
      setResumes(r.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AppLayout>
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}>
        <Spinner size={36} thickness={3} />
      </div>
    </AppLayout>
  );

  /* ── Derived metrics ── */
  const sorted = [...results].sort((a, b) => b.match_score - a.match_score);
  const avg    = results.length
    ? Math.round(results.reduce((a, r) => a + r.match_score, 0) / results.length)
    : 0;
  const top    = results.length ? Math.max(...results.map(r => r.match_score)) : 0;
  const high   = results.filter(r => r.match_score >= 70).length;
  const medium = results.filter(r => r.match_score >= 50 && r.match_score < 70).length;
  const low    = results.filter(r => r.match_score < 50).length;
  const total  = results.length;

  /* ── Bar chart data — top 8, consistent indigo ── */
  const barData = sorted.slice(0, 8).map((r, i) => ({
    name:  r.title?.length > 14 ? r.title.slice(0, 13) + '…' : (r.title || `Job ${r.job_id}`),
    score: r.match_score,
    fill:  i === 0 ? BAR_COLOR_TOP : BAR_COLOR,   // only top bar is lighter
  }));

  /* ── Pie chart data ── */
  const pieData = [
    { name:'Strong',   value:high,   color:PIE_STRONG,   pct: total ? Math.round((high   / total) * 100) : 0 },
    { name:'Moderate', value:medium, color:PIE_MODERATE, pct: total ? Math.round((medium / total) * 100) : 0 },
    { name:'Weak',     value:low,    color:PIE_WEAK,     pct: total ? Math.round((low    / total) * 100) : 0 },
  ].filter(d => d.value > 0);

  /* ── Line chart data — last 10 matches ── */
  const lineData = sorted.slice(0, 10).reverse().map((r, i) => ({
    name:  `#${i + 1}`,
    Score: r.match_score,
  }));

  /* ── KPI cards ── */
  const KPI_CARDS = [
    {
      label: 'Avg Match Score',
      value: `${avg}%`,
      sub:   'across all jobs',
      color: scoreColor(avg),
      icon:  <BarChart3 size={T.icon.card} />,
    },
    {
      label: 'Top Match',
      value: `${top}%`,
      sub:   'best compatibility',
      color: T.color.success,
      icon:  <Award size={T.icon.card} />,
    },
    {
      label: 'Strong Matches',
      value:  high,
      sub:   '≥70% score',
      color: T.color.success,
      icon:  <TrendingUp size={T.icon.card} />,
    },
    {
      label: 'Jobs Analyzed',
      value:  total,
      sub:   'total matches run',
      color: T.color.primary,
      icon:  <Briefcase size={T.icon.card} />,
    },
  ];

  return (
    <AppLayout>
      <div style={{ display:'flex', flexDirection:'column', gap:22 }}>

        {/* ── Header ── */}
        <div className="anim-fadeInUp">
          <h1 style={{
            fontSize:     22,
            fontWeight:   700,
            color:        T.color.cardHeading,
            marginBottom: 4,
            letterSpacing:T.font.spacingNormal,
          }}>
            Career Analytics
          </h1>
          <p style={{
            fontSize:     13,
            color:        T.color.textSecondary,
            letterSpacing:T.font.spacingNormal,
          }}>
            Track your job matching performance and career growth metrics.
          </p>
        </div>

        {/* ── KPI cards ── */}
        <div
          className="anim-fadeInUp delay-1"
          style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}
        >
          {KPI_CARDS.map(({ label, value, sub, color, icon }) => (
            <div
              key={label}
              style={{
                background:   'var(--bg-card)',
                border:       '1px solid var(--border)',
                borderRadius: T.radius.card,
                padding:      '20px 22px',
              }}
            >
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>

                {/* Text */}
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{
                    fontSize:      T.font.statLabelSize,
                    fontWeight:    T.font.statLabelWeight,
                    color:         T.color.textLabel,       // #AEB1B9
                    textTransform: 'uppercase',
                    letterSpacing: T.font.spacingWide,
                    marginBottom:  10,
                    lineHeight:    1.4,
                  }}>
                    {label}
                  </p>
                  <p style={{
                    fontSize:     T.font.statValueSize,
                    fontWeight:   T.font.statValueWeight,
                    color,
                    lineHeight:   1,
                    letterSpacing:T.font.spacingTight,
                    marginBottom: 5,
                  }}>
                    {value}
                  </p>
                  <p style={{
                    fontSize:     T.font.statLabelSize,
                    color:        T.color.cardValueSub,     // #9FA3AC
                    letterSpacing:T.font.spacingNormal,
                    lineHeight:   1.4,
                  }}>
                    {sub}
                  </p>
                </div>

                {/* Icon box — 25×25 */}
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
                  {icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── No data state ── */}
        {results.length === 0 ? (
          <Card>
            <EmptyState
              icon="📊"
              title="No data yet"
              desc="Run job matching to see your analytics dashboard populate with charts and insights."
            />
          </Card>
        ) : (
          <>
            {/* ── Charts row ── */}
            <div
              className="anim-fadeInUp delay-2"
              style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:18 }}
            >

              {/* ════ Bar chart — Top Job Match Scores ════ */}
              <Card>
                <div style={{ marginBottom:20 }}>
                  <p style={{
                    fontWeight:   T.font.cardTitleWeight,
                    fontSize:     T.font.cardTitleSize,
                    color:        T.color.cardHeading,
                    letterSpacing:T.font.spacingNormal,
                    marginBottom: 4,
                  }}>
                    Top Job Match Scores
                  </p>
                  <p style={{
                    fontSize:     11,
                    color:        T.color.textLabel,
                    letterSpacing:T.font.spacingNormal,
                  }}>
                    Top {Math.min(barData.length, 8)} jobs sorted by compatibility
                  </p>
                </div>

                <ResponsiveContainer width="100%" height={230}>
                  <BarChart
                    data={barData}
                    margin={{ top:8, right:8, left:-24, bottom:8 }}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1F2937"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{
                        fill:         '#6B7280',
                        fontSize:     10,
                        letterSpacing:'0.02em',
                      }}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{
                        fill:     '#6B7280',
                        fontSize: 10,
                      }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={v => `${v}%`}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill:'rgba(99,102,241,0.05)' }}
                    />
                    <Bar
                      dataKey="score"
                      name="Match Score"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    >
                      {barData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={i === 0 ? BAR_COLOR_TOP : BAR_COLOR}
                          fillOpacity={i === 0 ? 1 : 0.75}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:8, paddingLeft:8 }}>
                  <div style={{ width:10, height:10, borderRadius:3, background:BAR_COLOR_TOP }} />
                  <span style={{ fontSize:11, color:'#9CA3AF' }}>Top match</span>
                  <div style={{ width:10, height:10, borderRadius:3, background:BAR_COLOR, opacity:0.75, marginLeft:8 }} />
                  <span style={{ fontSize:11, color:'#9CA3AF' }}>Other matches</span>
                </div>
              </Card>

              {/* ════ Pie chart — Match Distribution ════ */}
              <Card>
                <div style={{ marginBottom:20 }}>
                  <p style={{
                    fontWeight:   T.font.cardTitleWeight,
                    fontSize:     T.font.cardTitleSize,
                    color:        T.color.cardHeading,
                    letterSpacing:T.font.spacingNormal,
                    marginBottom: 4,
                  }}>
                    Match Distribution
                  </p>
                  <p style={{
                    fontSize:     11,
                    color:        T.color.textLabel,
                    letterSpacing:T.font.spacingNormal,
                  }}>
                    {total} jobs total
                  </p>
                </div>

                <div style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        20,
                  minHeight:  200,
                }}>
                  {/* Donut */}
                  <div style={{ flexShrink:0 }}>
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={76}
                          paddingAngle={3}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Centre label */}
                    <div style={{
                      marginTop:  -96,
                      textAlign:  'center',
                      pointerEvents:'none',
                    }}>
                      <p style={{
                        fontSize:   22,
                        fontWeight: 800,
                        color:      scoreColor(avg),
                        lineHeight: 1,
                      }}>
                        {avg}%
                      </p>
                      <p style={{
                        fontSize:     10,
                        color:        T.color.textLabel,
                        letterSpacing:'0.04em',
                        marginTop:    3,
                      }}>
                        avg
                      </p>
                    </div>
                  </div>

                  {/* Large legend */}
                  <PieLegend data={pieData} />
                </div>
              </Card>
            </div>

            {/* ════ Line chart — Match Score Trend ════ */}
            <Card className="anim-fadeInUp delay-3">
              <div style={{ marginBottom:20 }}>
                <p style={{
                  fontWeight:   T.font.cardTitleWeight,
                  fontSize:     T.font.cardTitleSize,
                  color:        T.color.cardHeading,
                  letterSpacing:T.font.spacingNormal,
                  marginBottom: 4,
                }}>
                  Match Score Trend
                </p>
                <p style={{
                  fontSize:     11,
                  color:        T.color.textLabel,
                  letterSpacing:T.font.spacingNormal,
                }}>
                  Your last {lineData.length} matched jobs ordered by score
                </p>
              </div>

              <ResponsiveContainer width="100%" height={190}>
                <LineChart
                  data={lineData}
                  margin={{ top:8, right:16, left:-24, bottom:4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1F2937"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill:'#6B7280', fontSize:11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill:'#6B7280', fontSize:11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={v => `${v}%`}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke:'rgba(99,102,241,0.2)', strokeWidth:1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Score"
                    stroke={LINE_COLOR}
                    strokeWidth={2.5}
                    dot={{ fill:LINE_COLOR, r:4, strokeWidth:0 }}
                    activeDot={{
                      r:          6,
                      fill:       LINE_COLOR,
                      stroke:     '#0B1020',
                      strokeWidth:2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* ════ All matches table ════ */}
            <Card className="anim-fadeInUp delay-4">
              <div style={{ marginBottom:18 }}>
                <p style={{
                  fontWeight:   T.font.cardTitleWeight,
                  fontSize:     T.font.cardTitleSize,
                  color:        T.color.cardHeading,
                  letterSpacing:T.font.spacingNormal,
                  marginBottom: 4,
                }}>
                  All Job Matches — Ranked
                </p>
                <p style={{
                  fontSize:     11,
                  color:        T.color.textLabel,
                  letterSpacing:T.font.spacingNormal,
                }}>
                  {total} jobs sorted by compatibility score
                </p>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {sorted.map((r, i) => (
                  <div
                    key={r.job_id}
                    style={{
                      display:      'flex',
                      alignItems:   'center',
                      gap:          14,
                      background:   'var(--bg-elevated)',
                      border:       `1px solid ${i === 0 ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
                      borderRadius: 10,
                      padding:      '11px 14px',
                      transition:   'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = i === 0 ? 'rgba(99,102,241,0.3)' : 'var(--border)'; }}
                  >
                    {/* Rank */}
                    <div style={{
                      width:          28,
                      height:         28,
                      borderRadius:   8,
                      background:     i === 0 ? 'rgba(245,158,11,0.12)' : 'var(--border)',
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      fontSize:       11,
                      fontWeight:     700,
                      color:          i === 0 ? '#F59E0B' : T.color.textMuted,
                      flexShrink:     0,
                      letterSpacing:  '0.02em',
                    }}>
                      #{i + 1}
                    </div>

                    {/* Info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{
                        fontSize:     13,
                        fontWeight:   600,
                        color:        T.color.cardHeading,
                        whiteSpace:   'nowrap',
                        overflow:     'hidden',
                        textOverflow: 'ellipsis',
                        letterSpacing:T.font.spacingNormal,
                        marginBottom: 2,
                      }}>
                        {r.title || `Job #${r.job_id}`}
                      </p>
                      <p style={{
                        fontSize:     11,
                        color:        T.color.textSecondary,
                        letterSpacing:T.font.spacingNormal,
                      }}>
                        {r.company} · {r.location}
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div style={{ width:140, flexShrink:0 }}>
                      <ProgressBar
                        value={r.match_score}
                        color="auto"
                        showValue={false}
                        height={5}
                        animated={false}
                      />
                    </div>

                    {/* Badge */}
                    <Badge
                      color={
                        r.match_score >= 70 ? 'success' :
                        r.match_score >= 50 ? 'warning' : 'danger'
                      }
                      size="md"
                    >
                      {r.match_score}%
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}