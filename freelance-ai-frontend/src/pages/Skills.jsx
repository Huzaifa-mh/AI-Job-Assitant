import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchAPI } from '../services/api';
import { parseMissingSkills, scoreColor } from '../utils/helpers';
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
  { name:'TypeScript',    demand:94, growth:'+32%', category:'Frontend',  color:'#3B82F6' },
  { name:'Next.js',       demand:88, growth:'+28%', category:'Frontend',  color:'#6366F1' },
  { name:'Tailwind CSS',  demand:87, growth:'+38%', category:'Frontend',  color:'#06B6D4' },
  { name:'Docker',        demand:85, growth:'+21%', category:'DevOps',    color:'#F59E0B' },
  { name:'OpenAI API',    demand:82, growth:'+65%', category:'AI/ML',     color:'#10B981' },
  { name:'LangChain',     demand:78, growth:'+120%',category:'AI/ML',     color:'#10B981' },
  { name:'Kubernetes',    demand:75, growth:'+18%', category:'DevOps',    color:'#F59E0B' },
  { name:'FastAPI',       demand:72, growth:'+44%', category:'Backend',   color:'#8B5CF6' },
  { name:'PostgreSQL',    demand:70, growth:'+15%', category:'Database',  color:'#EC4899' },
  { name:'Redis',         demand:65, growth:'+22%', category:'Database',  color:'#EC4899' },
];

/* ── Learning resources ── */
const RESOURCES = [
  { skill:'TypeScript',  platform:'freeCodeCamp', url:'https://freecodecamp.org', free:true  },
  { skill:'Docker',      platform:'Docker Docs',  url:'https://docs.docker.com',  free:true  },
  { skill:'Next.js',     platform:'Next.js Docs', url:'https://nextjs.org/learn', free:true  },
  { skill:'LangChain',   platform:'LangChain',    url:'https://langchain.com',    free:true  },
  { skill:'OpenAI API',  platform:'OpenAI Docs',  url:'https://platform.openai.com/docs', free:true },
];

const CAT_COLOR = {
  Frontend: '#6366F1',
  Backend:  '#8B5CF6',
  'AI/ML':  '#10B981',
  DevOps:   '#F59E0B',
  Database: '#EC4899',
};

export default function Skills() {
  const navigate = useNavigate();
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [activeTab,setActiveTab]= useState('gaps'); // 'gaps' | 'trending' | 'resources'

  useEffect(() => {
    matchAPI.getResults()
      .then(r => setResults(r.data?.results || []))
      .catch(() => {})
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
  const low    = results.filter(r => r.match_score < 50).length;
  const avg    = results.length
    ? Math.round(results.reduce((a, r) => a + r.match_score, 0) / results.length)
    : 0;

  /* ── Tabs ── */
  const TABS = [
    { key:'gaps',      label:'Skill Gaps',       icon: AlertCircle },
    { key:'trending',  label:'Trending Skills',  icon: TrendingUp  },
    { key:'resources', label:'Learning Path',    icon: BookOpen    },
  ];

  return (
    <AppLayout>
      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

        {/* ── Header ── */}
        <div className="anim-fadeInUp">
          <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>
            Skill Gap Analysis
          </h1>
          <p style={{ fontSize:13, color:'var(--text-secondary)' }}>
            Identify missing skills and trending technologies to accelerate your career.
          </p>
        </div>

        {/* ── Overview cards ── */}
        <div
          className="anim-fadeInUp delay-1"
          style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14 }}
        >
          {[
            { label:'Avg Match Score', value:`${avg}%`,     color: scoreColor(avg),  sub:'across all jobs'         },
            { label:'Strong Matches',  value:high,           color:'#10B981',          sub:'≥70% compatibility'      },
            { label:'Moderate',        value:medium,         color:'#F59E0B',          sub:'50–69% compatibility'    },
            { label:'Skills to Learn', value:topMissing.length, color:'#EF4444',      sub:'top missing skills'      },
          ].map(({ label, value, color, sub }) => (
            <div key={label} style={{
              background:   'var(--bg-card)',
              border:       '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding:      '18px 20px',
            }}>
              <p style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>
                {label}
              </p>
              <p style={{ fontSize:28, fontWeight:800, color, lineHeight:1, marginBottom:4 }}>{value}</p>
              <p style={{ fontSize:11, color:'var(--text-secondary)' }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div
          className="anim-fadeInUp delay-2"
          style={{ display:'flex', gap:4, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:4, width:'fit-content' }}
        >
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          7,
                padding:      '8px 16px',
                borderRadius: 9,
                border:       'none',
                cursor:       'pointer',
                fontSize:     13,
                fontWeight:   activeTab === key ? 600 : 400,
                color:        activeTab === key ? 'white' : 'var(--text-secondary)',
                background:   activeTab === key
                  ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                  : 'transparent',
                transition:   'all 0.18s ease',
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div className="anim-fadeIn">

          {/* GAPS TAB */}
          {activeTab === 'gaps' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

              {/* Missing skills */}
              <Card>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
                  <AlertCircle size={16} color="#EF4444" />
                  <p style={{ fontWeight:600, fontSize:15, color:'var(--text-primary)' }}>
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
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    {topMissing.map(([skill, count], i) => {
                      const pct = Math.round((count / results.length) * 100);
                      return (
                        <div key={skill} className={`anim-fadeInUp delay-${Math.min(i+1,5)}`}>
                          <ProgressBar
                            label={skill}
                            value={pct}
                            color="#EF4444"
                            height={6}
                          />
                          <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>
                            Missing in {count} of {results.length} matched jobs
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* Score distribution */}
              <Card>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
                  <CheckCircle size={16} color="#10B981" />
                  <p style={{ fontWeight:600, fontSize:15, color:'var(--text-primary)' }}>
                    Match Distribution
                  </p>
                </div>

                {/* Donut-style visual */}
                <div style={{ textAlign:'center', marginBottom:24 }}>
                  <div style={{
                    width:          110,
                    height:         110,
                    borderRadius:   '50%',
                    margin:         '0 auto 14px',
                    background:     results.length
                      ? `conic-gradient(
                          ${scoreColor(avg)} ${avg * 3.6}deg,
                          var(--border) 0deg
                        )`
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
                    }}>
                      <span style={{ fontSize:22, fontWeight:800, color:scoreColor(avg), lineHeight:1 }}>
                        {avg}%
                      </span>
                      <span style={{ fontSize:10, color:'var(--text-muted)' }}>avg</span>
                    </div>
                  </div>
                  <p style={{ fontSize:12, color:'var(--text-secondary)' }}>
                    Based on {results.length} job matches
                  </p>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {[
                    { label:'Strong Match ≥70%', value:high,   color:'#10B981', total:results.length },
                    { label:'Moderate 50–69%',   value:medium, color:'#F59E0B', total:results.length },
                    { label:'Weak Match <50%',   value:low,    color:'#EF4444', total:results.length },
                  ].map(({ label, value, color, total }) => (
                    <div key={label}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                        <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{label}</span>
                        <span style={{ fontSize:12, fontWeight:600, color }}>{value} jobs</span>
                      </div>
                      <ProgressBar
                        value={total ? Math.round((value / total) * 100) : 0}
                        color={color}
                        showValue={false}
                        height={5}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* TRENDING TAB */}
          {activeTab === 'trending' && (
            <Card>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
                <TrendingUp size={16} color="var(--primary)" />
                <p style={{ fontWeight:600, fontSize:15, color:'var(--text-primary)' }}>
                  Trending Skills in 2025
                </p>
                <Badge color="primary">Market data</Badge>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:12 }}>
                {TRENDING.map(({ name, demand, growth, category, color }, i) => (
                  <div
                    key={name}
                    className={`anim-fadeInUp delay-${Math.min(i+1,5)}`}
                    style={{
                      background:   'var(--bg-elevated)',
                      border:       '1px solid var(--border)',
                      borderRadius: 12,
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
                        <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{name}</p>
                        <Badge color="gray" size="sm">{category}</Badge>
                      </div>
                      <span style={{ fontSize:11, fontWeight:700, color:'#10B981' }}>{growth}</span>
                    </div>
                    <ProgressBar
                      value={demand}
                      color={CAT_COLOR[category] || 'var(--primary)'}
                      showValue={false}
                      height={5}
                    />
                    <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:5 }}>
                      {demand}% market demand
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* RESOURCES TAB */}
          {activeTab === 'resources' && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <Card>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
                  <BookOpen size={16} color="var(--primary)" />
                  <p style={{ fontWeight:600, fontSize:15, color:'var(--text-primary)' }}>
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
                        borderRadius: 12,
                        padding:      '14px 16px',
                      }}
                    >
                      <div style={{
                        width:          36,
                        height:         36,
                        borderRadius:   9,
                        background:     'rgba(99,102,241,0.12)',
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                        fontSize:       14,
                        flexShrink:     0,
                      }}>
                        📚
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:2 }}>
                          <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{skill}</p>
                          {free && <Badge color="success" size="sm">Free</Badge>}
                        </div>
                        <p style={{ fontSize:11, color:'var(--text-secondary)' }}>{platform}</p>
                      </div>
                      <a href={url} target="_blank" rel="noreferrer">
                        <Button variant="secondary" size="sm" icon={<ArrowRight size={12} />}>
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
                    <Sparkles size={16} color="var(--primary)" style={{ flexShrink:0, marginTop:1 }} />
                    <div>
                      <p style={{ fontSize:13, fontWeight:600, color:'var(--primary)', marginBottom:5 }}>
                        Personalized Recommendation
                      </p>
                      <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.7 }}>
                        Based on your job matches, focus on learning{' '}
                        <strong style={{ color:'var(--text-primary)' }}>
                          {topMissing.slice(0, 3).map(([s]) => s).join(', ')}
                        </strong>.
                        These appear in {topMissing[0]?.[1]} of your matched job descriptions.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}