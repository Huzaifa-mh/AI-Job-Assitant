import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchAPI } from '../services/api';
import { parseMissingSkills, scoreColor } from '../utils/helpers';
import { TOKENS as T } from '../utils/designTokens';
import AppLayout   from '../components/layout/AppLayout';
import Card        from '../components/ui/Card';
import Badge       from '../components/ui/Badge';
import Button      from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import EmptyState  from '../components/ui/EmptyState';
import Spinner     from '../components/ui/Spinner';
import {
  TrendingUp, AlertCircle, CheckCircle,
  Sparkles, BookOpen, ArrowRight,
} from 'lucide-react';

/* ── Trending skills dataset ── */
const TRENDING = [
  { name:'TypeScript',   demand:94, growth:'+32%',  category:'Frontend',  color:'#3B82F6' },
  { name:'Next.js',      demand:88, growth:'+28%',  category:'Frontend',  color:'#6366F1' },
  { name:'Tailwind CSS', demand:87, growth:'+38%',  category:'Frontend',  color:'#06B6D4' },
  { name:'Docker',       demand:85, growth:'+21%',  category:'DevOps',    color:'#F59E0B' },
  { name:'OpenAI API',   demand:82, growth:'+65%',  category:'AI/ML',     color:'#10B981' },
  { name:'LangChain',    demand:78, growth:'+120%', category:'AI/ML',     color:'#10B981' },
  { name:'Kubernetes',   demand:75, growth:'+18%',  category:'DevOps',    color:'#F59E0B' },
  { name:'FastAPI',      demand:72, growth:'+44%',  category:'Backend',   color:'#8B5CF6' },
  { name:'PostgreSQL',   demand:70, growth:'+15%',  category:'Database',  color:'#EC4899' },
  { name:'Redis',        demand:65, growth:'+22%',  category:'Database',  color:'#EC4899' },
];

const RESOURCES = [
  { skill:'TypeScript',  platform:'freeCodeCamp',  url:'https://freecodecamp.org',          free:true },
  { skill:'Docker',      platform:'Docker Docs',   url:'https://docs.docker.com',           free:true },
  { skill:'Next.js',     platform:'Next.js Learn', url:'https://nextjs.org/learn',          free:true },
  { skill:'LangChain',   platform:'LangChain Docs',url:'https://python.langchain.com/docs', free:true },
  { skill:'OpenAI API',  platform:'OpenAI Docs',   url:'https://platform.openai.com/docs',  free:true },
];

const CAT_COLOR = {
  Frontend:'#6366F1', Backend:'#8B5CF6',
  'AI/ML':  '#10B981', DevOps:'#F59E0B', Database:'#EC4899',
};

/* ── Shared section heading style ── */
function SectionIcon({ icon: Icon, color = T.color.primary }) {
  return (
    <div style={{
      width:          T.icon.navBox,          // 25
      height:         T.icon.navBox,          // 25
      borderRadius:   T.radius.small,
      background:     `${color}18`,
      border:         `1px solid ${color}25`,
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      flexShrink:     0,
    }}>
      <Icon size={T.icon.nav} color={color} />  {/* 18px icon in 25px box */}
    </div>
  );
}

export default function Skills() {
  const navigate  = useNavigate();
  const [results,   setResults]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('gaps');

  useEffect(() => {
    matchAPI.getResults()
      .then(r => setResults(r.data?.results || []))
      .catch(()  => {})
      .finally(() => setLoading(false));
  }, []);

  /* ── Aggregate missing skills ── */
  const missingMap = {};
  results.forEach(r => {
    parseMissingSkills(r.missing_skills).forEach(s => {
      missingMap[s] = (missingMap[s] || 0) + 1;
    });
  });
  const topMissing = Object.entries(missingMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  /* ── Score distribution ── */
  const high   = results.filter(r => r.match_score >= 70).length;
  const medium = results.filter(r => r.match_score >= 50 && r.match_score < 70).length;
  const low    = results.filter(r => r.match_score <  50).length;
  const avg    = results.length
    ? Math.round(results.reduce((a, r) => a + r.match_score, 0) / results.length)
    : 0;

  const TABS = [
    { key:'gaps',      label:'Skill Gaps',      icon: AlertCircle },
    { key:'trending',  label:'Trending Skills', icon: TrendingUp  },
    { key:'resources', label:'Learning Path',   icon: BookOpen    },
  ];

  return (
    <AppLayout>
      <div style={{ display:'flex', flexDirection:'column', gap: T.space.sectionGap }}>

        {/* ── Page header ── */}
        <div className="anim-fadeInUp">
          <h1 style={{
            fontSize:     22,
            fontWeight:   700,
            color:        T.color.cardHeading,
            marginBottom: 4,
            letterSpacing:T.font.spacingNormal,
          }}>
            Skill Gap Analysis
          </h1>
          <p style={{
            fontSize:     13,
            color:        T.color.textSecondary,
            letterSpacing:T.font.spacingNormal,
            lineHeight:   1.6,
          }}>
            Identify missing skills and trending technologies to accelerate your career.
          </p>
        </div>

        {/* ── Overview KPI cards ── */}
        <div
          className="anim-fadeInUp delay-1"
          style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14 }}
        >
          {[
            {
              label: 'Avg Match Score',
              value: `${avg}%`,
              color:  scoreColor(avg),
              sub:   'across all jobs',
            },
            {
              label: 'Strong Matches',
              value:  high,
              color:  T.color.success,
              sub:   '≥70% compatibility',
            },
            {
              label: 'Moderate',
              value:  medium,
              color:  T.color.warning,
              sub:   '50–69% compatibility',
            },
            {
              label: 'Skills to Learn',
              value:  topMissing.length,
              color:  T.color.danger,
              sub:   'top missing skills',
            },
          ].map(({ label, value, color, sub }) => (
            <div
              key={label}
              style={{
                background:   'var(--bg-card)',
                border:       '1px solid var(--border)',
                borderRadius: T.radius.card,
                padding:      T.space.cardPadding,
              }}
            >
              {/* Label — same style as StatCard for consistency */}
              <p style={{
                fontSize:      T.font.statLabelSize,       // 11
                fontWeight:    T.font.statLabelWeight,     // 600
                color:         T.color.textLabel,          // #AEB1B9 ← your request
                textTransform: 'uppercase',
                letterSpacing: T.font.spacingWide,         // 0.07em
                marginBottom:  10,
                lineHeight:    1.4,
              }}>
                {label}
              </p>

              {/* Value — coloured */}
              <p style={{
                fontSize:     T.font.statValueSize,        // 28
                fontWeight:   T.font.statValueWeight,      // 800
                color,
                lineHeight:   1,
                letterSpacing:T.font.spacingTight,
                marginBottom: 6,
              }}>
                {value}
              </p>

              {/* Sub */}
              <p style={{
                fontSize:     T.font.statLabelSize,
                color:        T.color.cardValueSub,        // #9FA3AC
                letterSpacing:T.font.spacingNormal,
                lineHeight:   1.4,
              }}>
                {sub}
              </p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div
          className="anim-fadeInUp delay-2"
          style={{
            display:      'flex',
            gap:          4,
            background:   'var(--bg-card)',
            border:       '1px solid var(--border)',
            borderRadius: 12,
            padding:      4,
            width:        'fit-content',
          }}
        >
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        7,
                padding:    '8px 16px',
                borderRadius:9,
                border:     'none',
                cursor:     'pointer',
                fontSize:   13,
                fontWeight: activeTab === key ? 600 : 400,
                letterSpacing: T.font.spacingNormal,
                color:      activeTab === key ? 'white' : T.color.textSecondary,
                background: activeTab === key
                  ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                  : 'transparent',
                transition: 'all 0.18s ease',
              }}
            >
              <Icon size={T.icon.button} />
              {label}
            </button>
          ))}
        </div>

        {/* ══════════════ TAB: GAPS ══════════════ */}
        {activeTab === 'gaps' && (
          <div className="anim-fadeIn" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

            {/* ── Missing skills card ── */}
            <Card>
              {/* Card heading row */}
              <div style={{
                display:     'flex',
                alignItems:  'center',
                gap:         10,
                marginBottom:20,
              }}>
                {/* Icon — 25×25 as requested */}
                <SectionIcon icon={AlertCircle} color={T.color.danger} />

                <p style={{
                  fontWeight:   T.font.cardTitleWeight,   // 600
                  fontSize:     T.font.cardTitleSize,     // 15 ← increased
                  color:        T.color.cardHeading,      // #F9FAFB
                  letterSpacing:T.font.spacingNormal,
                  lineHeight:   1.3,
                }}>
                  Top Missing Skills
                </p>

                {topMissing.length > 0 && (
                  <Badge color="danger">{topMissing.length}</Badge>
                )}
              </div>

              {loading ? (
                <div style={{ display:'flex', justifyContent:'center', padding:32 }}>
                  <Spinner />
                </div>
              ) : topMissing.length === 0 ? (
                <EmptyState
                  icon="✅"
                  title="No gaps detected"
                  desc="Run job matching first to identify your skill gaps."
                  action={
                    <Button variant="primary" size="sm" onClick={() => navigate('/jobs')}>
                      Match Jobs
                    </Button>
                  }
                />
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  {topMissing.map(([skill, count], i) => {
                    const pct = Math.round((count / results.length) * 100);
                    return (
                      <div key={skill} className={`anim-fadeInUp delay-${Math.min(i+1,5)}`}>

                        {/* Skill name row */}
                        <div style={{
                          display:        'flex',
                          justifyContent: 'space-between',
                          alignItems:     'center',
                          marginBottom:   7,
                        }}>
                          {/* Skill name — font size increased */}
                          <span style={{
                            fontSize:     T.font.skillLabelSize,    // 13 ← increased
                            fontWeight:   T.font.skillLabelWeight,  // 600 ← increased
                            color:        T.color.textPrimary,
                            letterSpacing:T.font.spacingNormal,
                          }}>
                            {skill}
                          </span>

                          {/* Percentage — larger, red */}
                          <span style={{
                            fontSize:   14,                         // ← increased from 12
                            fontWeight: 700,
                            color:      T.color.danger,             // #EF4444 ← your request
                            letterSpacing:T.font.spacingTight,
                          }}>
                            {pct}%
                          </span>
                        </div>

                        {/* Progress bar */}
                        <ProgressBar
                          value={pct}
                          color={T.color.danger}
                          showValue={false}
                          height={7}                                // ← slightly taller bar
                        />

                        {/* Missing in X of Y jobs */}
                        <p style={{
                          fontSize:     12,                         // ← increased from 11
                          color:        T.color.textSecondary,
                          marginTop:    5,
                          letterSpacing:T.font.spacingNormal,
                          lineHeight:   1.5,
                        }}>
                          Missing in{' '}
                          <span style={{ color:T.color.danger, fontWeight:600 }}>
                            {count}
                          </span>
                          {' '}of {results.length} matched jobs
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* ── Match distribution card ── */}
            <Card>
              {/* Card heading row */}
              <div style={{
                display:     'flex',
                alignItems:  'center',
                gap:         10,
                marginBottom:20,
              }}>
                <SectionIcon icon={CheckCircle} color={T.color.success} />
                <p style={{
                  fontWeight:   T.font.cardTitleWeight,
                  fontSize:     T.font.cardTitleSize,
                  color:        T.color.cardHeading,
                  letterSpacing:T.font.spacingNormal,
                  lineHeight:   1.3,
                }}>
                  Match Distribution
                </p>
              </div>

              {/* Donut chart */}
              <div style={{ textAlign:'center', marginBottom:24 }}>
                <div style={{
                  width:          110,
                  height:         110,
                  borderRadius:   '50%',
                  margin:         '0 auto 14px',
                  background:     results.length
                    ? `conic-gradient(${scoreColor(avg)} ${avg * 3.6}deg, var(--border) 0deg)`
                    : 'var(--border)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                }}>
                  <div style={{
                    width:          84,
                    height:         84,
                    borderRadius:   '50%',
                    background:     'var(--bg-card)',
                    display:        'flex',
                    flexDirection:  'column',
                    alignItems:     'center',
                    justifyContent: 'center',
                    gap:            2,
                  }}>
                    <span style={{
                      fontSize:     22,
                      fontWeight:   800,
                      color:        scoreColor(avg),
                      lineHeight:   1,
                      letterSpacing:T.font.spacingTight,
                    }}>
                      {avg}%
                    </span>
                    <span style={{
                      fontSize:     10,
                      color:        T.color.textLabel,
                      letterSpacing:T.font.spacingNormal,
                    }}>
                      avg
                    </span>
                  </div>
                </div>
                <p style={{
                  fontSize:     12,
                  color:        T.color.textSecondary,
                  letterSpacing:T.font.spacingNormal,
                }}>
                  Based on {results.length} job matches
                </p>
              </div>

              {/* Distribution bars */}
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {[
                  { label:'Strong Match ≥70%',  value:high,   color:T.color.success },
                  { label:'Moderate 50–69%',     value:medium, color:T.color.warning },
                  { label:'Weak Match <50%',     value:low,    color:T.color.danger  },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div style={{
                      display:        'flex',
                      justifyContent: 'space-between',
                      alignItems:     'center',
                      marginBottom:   6,
                    }}>
                      <span style={{
                        fontSize:     12,
                        color:        T.color.textSecondary,
                        letterSpacing:T.font.spacingNormal,
                      }}>
                        {label}
                      </span>
                      <span style={{
                        fontSize:   13,
                        fontWeight: 700,
                        color,
                        letterSpacing:T.font.spacingTight,
                      }}>
                        {value} jobs
                      </span>
                    </div>
                    <ProgressBar
                      value={results.length ? Math.round((value / results.length) * 100) : 0}
                      color={color}
                      showValue={false}
                      height={6}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ══════════════ TAB: TRENDING ══════════════ */}
        {activeTab === 'trending' && (
          <Card className="anim-fadeIn">
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
              <SectionIcon icon={TrendingUp} color={T.color.primary} />
              <p style={{
                fontWeight:   T.font.cardTitleWeight,
                fontSize:     T.font.cardTitleSize,
                color:        T.color.cardHeading,
                letterSpacing:T.font.spacingNormal,
              }}>
                Trending Skills in 2025
              </p>
              <Badge color="primary">Market data</Badge>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
              {TRENDING.map(({ name, demand, growth, category, color }, i) => (
                <div
                  key={name}
                  className={`anim-fadeInUp delay-${Math.min(i+1,5)}`}
                  style={{
                    background:   'var(--bg-elevated)',
                    border:       '1px solid var(--border)',
                    borderRadius: T.radius.inner,
                    padding:      '14px 16px',
                    transition:   'all 0.18s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${color}50`;
                    e.currentTarget.style.transform   = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform   = 'translateY(0)';
                  }}
                >
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <p style={{
                        fontSize:     T.font.skillLabelSize,
                        fontWeight:   T.font.skillLabelWeight,
                        color:        T.color.textPrimary,
                        letterSpacing:T.font.spacingNormal,
                      }}>
                        {name}
                      </p>
                      <Badge color="gray" size="sm">{category}</Badge>
                    </div>
                    <span style={{
                      fontSize:   11,
                      fontWeight: 700,
                      color:      T.color.success,
                      letterSpacing:T.font.spacingNormal,
                    }}>
                      {growth}
                    </span>
                  </div>
                  <ProgressBar
                    value={demand}
                    color={CAT_COLOR[category] || T.color.primary}
                    showValue={false}
                    height={5}
                  />
                  <p style={{
                    fontSize:     11,
                    color:        T.color.textLabel,
                    marginTop:    5,
                    letterSpacing:T.font.spacingNormal,
                  }}>
                    {demand}% market demand
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ══════════════ TAB: RESOURCES ══════════════ */}
        {activeTab === 'resources' && (
          <div className="anim-fadeIn" style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <Card>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                <SectionIcon icon={BookOpen} color={T.color.primary} />
                <p style={{
                  fontWeight:   T.font.cardTitleWeight,
                  fontSize:     T.font.cardTitleSize,
                  color:        T.color.cardHeading,
                  letterSpacing:T.font.spacingNormal,
                }}>
                  Recommended Learning Path
                </p>
                <Badge color="success">Free resources</Badge>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {RESOURCES.map(({ skill, platform, url, free }, i) => (
                  <div
                    key={skill}
                    className={`anim-fadeInUp delay-${i+1}`}
                    style={{
                      display:      'flex',
                      alignItems:   'center',
                      gap:          14,
                      background:   'var(--bg-elevated)',
                      border:       '1px solid var(--border)',
                      borderRadius: T.radius.inner,
                      padding:      '14px 16px',
                    }}
                  >
                    <div style={{
                      width:          36,
                      height:         36,
                      borderRadius:   9,
                      background:     'rgba(99,102,241,0.1)',
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      fontSize:       16,
                      flexShrink:     0,
                    }}>
                      📚
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:2 }}>
                        <p style={{
                          fontSize:     T.font.skillLabelSize,
                          fontWeight:   T.font.skillLabelWeight,
                          color:        T.color.textPrimary,
                          letterSpacing:T.font.spacingNormal,
                        }}>
                          {skill}
                        </p>
                        {free && <Badge color="success" size="sm">Free</Badge>}
                      </div>
                      <p style={{
                        fontSize:     11,
                        color:        T.color.textSecondary,
                        letterSpacing:T.font.spacingNormal,
                      }}>
                        {platform}
                      </p>
                    </div>
                    <a href={url} target="_blank" rel="noreferrer">
                      <Button variant="secondary" size="sm" icon={<ArrowRight size={T.icon.button} />}>
                        Learn
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            </Card>

            {/* Personalized tip */}
            {topMissing.length > 0 && (
              <Card style={{ background:'rgba(99,102,241,0.05)', borderColor:'rgba(99,102,241,0.2)' }}>
                <div style={{ display:'flex', gap:10 }}>
                  <Sparkles size={16} color={T.color.primary} style={{ flexShrink:0, marginTop:1 }} />
                  <div>
                    <p style={{
                      fontSize:     13,
                      fontWeight:   600,
                      color:        T.color.primary,
                      marginBottom: 5,
                      letterSpacing:T.font.spacingNormal,
                    }}>
                      Personalized Recommendation
                    </p>
                    <p style={{
                      fontSize:     13,
                      color:        T.color.textSecondary,
                      lineHeight:   1.7,
                      letterSpacing:T.font.spacingNormal,
                    }}>
                      Based on your job matches, focus on{' '}
                      <strong style={{ color:T.color.textPrimary }}>
                        {topMissing.slice(0,3).map(([s]) => s).join(', ')}
                      </strong>.
                      {' '}These appear in {topMissing[0]?.[1]} of your matched job descriptions.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}