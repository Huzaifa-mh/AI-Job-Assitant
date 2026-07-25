import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchAPI, resumeAPI } from '../services/api';
import { getInitials, scoreColor, timeAgo } from '../utils/helpers';
import AppLayout    from '../components/layout/AppLayout';
import Card         from '../components/ui/Card';
import StatCard     from '../components/ui/StatCard';
import Button       from '../components/ui/Button';
import Badge        from '../components/ui/Badge';
import Spinner      from '../components/ui/Spinner';
import EmptyState   from '../components/ui/EmptyState';
import ProgressBar  from '../components/ui/ProgressBar';
import {
  FileText, Briefcase, TrendingUp, Zap,
  MessageSquare, BarChart3, ArrowRight,
  Sparkles, Clock, CheckCircle, Upload,
} from 'lucide-react';

/* ── Quick action tiles ── */
const QUICK_ACTIONS = [
  { icon: Upload,        label:'Upload Resume',    sub:'Parse & extract skills',   to:'/resume',      color:'#6366F1' },
  { icon: Briefcase,     label:'Match Jobs',       sub:'Find opportunities',        to:'/jobs',        color:'#8B5CF6' },
  { icon: TrendingUp,    label:'Skill Gap',        sub:'See what to learn',         to:'/skills',      color:'#10B981' },
  { icon: Zap,           label:'Write Proposal',   sub:'AI cover letter',           to:'/proposals',   color:'#F59E0B' },
  { icon: MessageSquare, label:'Practice Negotiation', sub:'Simulate client deal', to:'/negotiation', color:'#EC4899' },
  { icon: BarChart3,     label:'View Analytics',   sub:'Career insights',           to:'/analytics',   color:'#06B6D4' },
];

/* ── AI tips ── */
const AI_TIPS = [
  { text:'Add a GitHub link to your resume to boost profile score by ~12%',   color:'#6366F1' },
  { text:'Remote jobs on LinkedIn offer 3x more freelance opportunities',       color:'#10B981' },
  { text:'Proposals sent within 1 hour of posting get 5x more responses',      color:'#F59E0B' },
  { text:'Upskilling in TypeScript increases your match score by up to 28%',   color:'#EC4899' },
];

export default function Dashboard() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [topMatches, setTopMatches] = useState([]);
  const [resumes,    setResumes]    = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      matchAPI.getTop().catch(()  => ({ data: [] })),
      resumeAPI.getMine().catch(() => ({ data: [] })),
    ]).then(([m, r]) => {
      setTopMatches(m.data || []);
      setResumes(r.data   || []);
    }).finally(() => setLoading(false));
  }, []);

  const processedResume = resumes.find(r => r.status === 'processed');
  const hour            = new Date().getHours();
  const greeting        = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const avgScore        = topMatches.length
    ? Math.round(topMatches.reduce((a, r) => a + r.match_score, 0) / topMatches.length)
    : 0;

  return (
    <AppLayout>
      <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

        {/* ── Welcome banner ── */}
        <div
          className="anim-fadeInUp"
          style={{
            background:   'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.06))',
            border:       '1px solid rgba(99,102,241,0.2)',
            borderRadius: 20,
            padding:      '24px 28px',
            display:      'flex',
            justifyContent:'space-between',
            alignItems:   'center',
            gap:          16,
            position:     'relative',
            overflow:     'hidden',
          }}
        >
          {/* Glow blob */}
          <div style={{
            position:     'absolute', top:'-30px', right:'-30px',
            width:        200, height:200,
            background:   'radial-gradient(ellipse, rgba(139,92,246,0.12), transparent 70%)',
            pointerEvents:'none',
          }} />

          <div>
            <p style={{ fontSize:11, color:'var(--primary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>
              {greeting}
            </p>
            <h1 style={{ fontSize:24, fontWeight:700, color:'var(--text-primary)', marginBottom:6, lineHeight:1.2 }}>
              {user?.full_name || 'Freelancer'} 👋
            </h1>
            <p style={{ fontSize:14, color:'var(--text-secondary)' }}>
              {processedResume
                ? `Resume ready · ${topMatches.length} job matches found · Avg score ${avgScore}%`
                : 'Upload your resume to unlock AI job matching and skill analysis.'
              }
            </p>
          </div>

          <div style={{ display:'flex', gap:10, flexShrink:0 }}>
            {!processedResume && (
              <Button
                variant="primary"
                icon={<Upload size={13} />}
                onClick={() => navigate('/resume')}
              >
                Upload Resume
              </Button>
            )}
            <Button
              variant="secondary"
              icon={<Briefcase size={13} />}
              onClick={() => navigate('/jobs')}
            >
              Browse Jobs
            </Button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div
          className="anim-fadeInUp delay-1"
          style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14 }}
        >
          <StatCard
            label="Resumes"
            value={resumes.length}
            sub="uploaded"
            icon={<FileText size={17} />}
            trend={resumes.length > 0 ? 'Active' : undefined}
            trendUp
          />
          <StatCard
            label="Job Matches"
            value={topMatches.length}
            sub="found so far"
            icon={<Briefcase size={17} />}
            trend={topMatches.length > 0 ? `${topMatches.length} jobs` : undefined}
            trendUp
          />
          <StatCard
            label="Top Match"
            value={topMatches[0] ? `${topMatches[0].match_score}%` : '—'}
            sub="best compatibility"
            icon={<TrendingUp size={17} />}
            color={topMatches[0] ? scoreColor(topMatches[0].match_score) : 'var(--primary)'}
          />
          <StatCard
            label="Avg Score"
            value={avgScore ? `${avgScore}%` : '—'}
            sub="across all matches"
            icon={<BarChart3 size={17} />}
            color={avgScore ? scoreColor(avgScore) : 'var(--primary)'}
          />
        </div>

        {/* ── Main grid ── */}
        <div
          className="anim-fadeInUp delay-2"
          style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:20 }}
        >

          {/* ── LEFT COLUMN ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

            {/* Quick actions */}
            <Card>
              <p style={{ fontWeight:600, fontSize:15, color:'var(--text-primary)', marginBottom:16 }}>
                Quick Actions
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10 }}>
                {QUICK_ACTIONS.map(({ icon: Icon, label, sub, to, color }) => (
                  <div
                    key={to}
                    onClick={() => navigate(to)}
                    style={{
                      background:   'var(--bg-elevated)',
                      border:       '1px solid var(--border)',
                      borderRadius: 12,
                      padding:      14,
                      cursor:       'pointer',
                      transition:   'all 0.18s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = `${color}60`;
                      e.currentTarget.style.transform   = 'translateY(-3px)';
                      e.currentTarget.style.background  = `${color}0a`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.transform   = 'translateY(0)';
                      e.currentTarget.style.background  = 'var(--bg-elevated)';
                    }}
                  >
                    <div style={{
                      width:          34,
                      height:         34,
                      borderRadius:   9,
                      background:     `${color}18`,
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      marginBottom:   10,
                    }}>
                      <Icon size={15} color={color} />
                    </div>
                    <p style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)', marginBottom:2 }}>{label}</p>
                    <p style={{ fontSize:11, color:'var(--text-secondary)' }}>{sub}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top job matches */}
            <Card>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <p style={{ fontWeight:600, fontSize:15, color:'var(--text-primary)' }}>Top Job Matches</p>
                <Button variant="ghost" size="sm" icon={<ArrowRight size={12} />} onClick={() => navigate('/jobs')}>
                  View all
                </Button>
              </div>

              {loading ? (
                <div style={{ display:'flex', justifyContent:'center', padding:32 }}>
                  <Spinner size={28} />
                </div>
              ) : topMatches.length === 0 ? (
                <EmptyState
                  icon="🎯"
                  title="No matches yet"
                  desc="Upload a resume and run job matching to see results here."
                  action={
                    <Button variant="primary" size="sm" onClick={() => navigate('/resume')}>
                      Upload Resume
                    </Button>
                  }
                />
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {topMatches.map((job, i) => (
                    <div
                      key={job.job_id}
                      className={`anim-fadeInUp delay-${Math.min(i + 1, 5)}`}
                      onClick={() => navigate('/jobs')}
                      style={{
                        display:      'flex',
                        alignItems:   'center',
                        gap:          12,
                        background:   'var(--bg-elevated)',
                        border:       '1px solid var(--border)',
                        borderRadius: 10,
                        padding:      '12px 14px',
                        cursor:       'pointer',
                        transition:   'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--border-light)';
                        e.currentTarget.style.transform   = 'translateX(3px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.transform   = 'translateX(0)';
                      }}
                    >
                      {/* Rank badge */}
                      <div style={{
                        width:          28,
                        height:         28,
                        borderRadius:   8,
                        background:     i === 0 ? 'rgba(245,158,11,0.15)' : 'var(--border)',
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                        fontSize:       11,
                        fontWeight:     700,
                        color:          i === 0 ? '#F59E0B' : 'var(--text-muted)',
                        flexShrink:     0,
                      }}>
                        #{i + 1}
                      </div>

                      {/* Info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{
                          fontSize:     13,
                          fontWeight:   600,
                          color:        'var(--text-primary)',
                          whiteSpace:   'nowrap',
                          overflow:     'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {job.title}
                        </p>
                        <p style={{ fontSize:11, color:'var(--text-secondary)' }}>
                          {job.company} · {job.location}
                        </p>
                      </div>

                      {/* Score */}
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <p style={{
                          fontSize:   14,
                          fontWeight: 700,
                          color:      scoreColor(job.match_score),
                        }}>
                          {job.match_score}%
                        </p>
                        <p style={{ fontSize:10, color:'var(--text-muted)' }}>match</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Profile completion */}
            <Card>
              <p style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)', marginBottom:16 }}>
                Profile Completion
              </p>

              {/* Avatar */}
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                <div style={{
                  width:          48,
                  height:         48,
                  borderRadius:   '50%',
                  background:     'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontSize:       16,
                  fontWeight:     700,
                  color:          'white',
                  boxShadow:      '0 4px 14px rgba(99,102,241,0.3)',
                }}>
                  {getInitials(user?.full_name)}
                </div>
                <div>
                  <p style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>
                    {user?.full_name}
                  </p>
                  <p style={{ fontSize:11, color:'var(--text-muted)' }}>{user?.email}</p>
                </div>
              </div>

              <ProgressBar
                value={processedResume ? 75 : 25}
                color="var(--primary)"
                label="Profile strength"
              />

              <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:14 }}>
                {[
                  { label:'Account created',   done: true  },
                  { label:'Resume uploaded',    done: !!processedResume },
                  { label:'Jobs matched',       done: topMatches.length > 0 },
                  { label:'Proposal generated', done: false },
                ].map(({ label, done }) => (
                  <div key={label} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <CheckCircle
                      size={13}
                      color={done ? '#10B981' : 'var(--border-light)'}
                    />
                    <span style={{
                      fontSize: 12,
                      color:    done ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Resume status */}
            <Card>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <p style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>My Resumes</p>
                <Button variant="ghost" size="xs" onClick={() => navigate('/resume')}>
                  Manage
                </Button>
              </div>

              {loading ? (
                <div style={{ display:'flex', justifyContent:'center', padding:20 }}>
                  <Spinner size={20} />
                </div>
              ) : resumes.length === 0 ? (
                <EmptyState
                  icon={<FileText size={20} />}
                  title="No resume yet"
                  desc="Upload your first resume to get started."
                  compact
                  action={
                    <Button variant="primary" size="xs" onClick={() => navigate('/resume')}>
                      Upload Now
                    </Button>
                  }
                />
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {resumes.slice(0, 3).map(r => (
                    <div
                      key={r.resume_id}
                      style={{
                        display:      'flex',
                        alignItems:   'center',
                        gap:          10,
                        background:   'var(--bg-elevated)',
                        borderRadius: 10,
                        padding:      '9px 12px',
                        border:       '1px solid var(--border)',
                      }}
                    >
                      <FileText size={13} color="var(--primary)" />
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{
                          fontSize:     12,
                          color:        'var(--text-primary)',
                          whiteSpace:   'nowrap',
                          overflow:     'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {r.file_path?.split(/[/\\]/).pop() || `Resume #${r.resume_id}`}
                        </p>
                      </div>
                      <Badge color={
                        r.status === 'processed' ? 'success' :
                        r.status === 'failed'    ? 'danger'  : 'warning'
                      } size="sm">
                        {r.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* AI tips */}
            <Card>
              <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:14 }}>
                <Sparkles size={13} color="var(--primary)" />
                <p style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>AI Tips</p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {AI_TIPS.map((tip, i) => (
                  <div
                    key={i}
                    style={{
                      display:      'flex',
                      gap:          9,
                      alignItems:   'flex-start',
                      padding:      '9px 11px',
                      background:   'var(--bg-elevated)',
                      borderRadius: 9,
                      border:       '1px solid var(--border)',
                    }}
                  >
                    <div style={{
                      width:      5,
                      height:     5,
                      borderRadius:'50%',
                      background: tip.color,
                      marginTop:  6,
                      flexShrink: 0,
                    }} />
                    <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.55 }}>
                      {tip.text}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
