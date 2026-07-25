import { useState, useEffect } from 'react';
import { matchAPI, resumeAPI } from '../services/api';
import { scoreColor } from '../utils/helpers';
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
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts';

const COLORS = ['#6366F1','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', fontSize:12 }}>
      <p style={{ color:'var(--text-secondary)', marginBottom:3 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color:p.color, fontWeight:600 }}>{p.name}: {p.value}{p.name==='Match Score'?'%':''}</p>
      ))}
    </div>
  );
};

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
  const avg    = results.length ? Math.round(results.reduce((a,r)=>a+r.match_score,0)/results.length) : 0;
  const top    = results.length ? Math.max(...results.map(r=>r.match_score)) : 0;
  const high   = results.filter(r=>r.match_score>=70).length;
  const low    = results.filter(r=>r.match_score<50).length;

  /* ── Chart data ── */
  const barData = results
    .sort((a,b)=>b.match_score-a.match_score)
    .slice(0,8)
    .map(r=>({ name: r.title?.slice(0,14)+'...' || `Job ${r.job_id}`, 'Match Score': r.match_score, company: r.company }));

  const pieData = [
    { name:'Strong ≥70%', value: high },
    { name:'Moderate 50-69%', value: results.filter(r=>r.match_score>=50&&r.match_score<70).length },
    { name:'Weak <50%', value: low },
  ].filter(d=>d.value>0);

  const lineData = results
    .slice(-10)
    .map((r,i)=>({ idx:i+1, score: r.match_score, job: r.title?.slice(0,12) }));

  return (
    <AppLayout>
      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

        {/* Header */}
        <div className="anim-fadeInUp">
          <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>
            Career Analytics
          </h1>
          <p style={{ fontSize:13, color:'var(--text-secondary)' }}>
            Track your job matching performance and career growth metrics.
          </p>
        </div>

        {/* KPIs */}
        <div className="anim-fadeInUp delay-1" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
          {[
            { label:'Avg Match Score',  value:`${avg}%`,         color:scoreColor(avg), icon:<BarChart3 size={16}/>,  sub:'across all jobs'     },
            { label:'Top Match',        value:`${top}%`,         color:'#10B981',        icon:<Award size={16}/>,      sub:'best compatibility'  },
            { label:'Strong Matches',   value:high,              color:'#10B981',        icon:<TrendingUp size={16}/>, sub:'≥70% score'          },
            { label:'Jobs Analyzed',    value:results.length,    color:'var(--primary)', icon:<Briefcase size={16}/>,  sub:'total matches run'   },
          ].map(({ label, value, color, icon, sub }) => (
            <div key={label} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'18px 20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <p style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>{label}</p>
                  <p style={{ fontSize:28, fontWeight:800, color, lineHeight:1, marginBottom:4 }}>{value}</p>
                  <p style={{ fontSize:11, color:'var(--text-secondary)' }}>{sub}</p>
                </div>
                <div style={{ width:36, height:36, borderRadius:9, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', color }}>
                  {icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {results.length === 0 ? (
          <Card>
            <EmptyState icon="📊" title="No data yet" desc="Run job matching to see your analytics dashboard populate." />
          </Card>
        ) : (
          <>
            {/* Charts row 1 */}
            <div className="anim-fadeInUp delay-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

              {/* Bar chart */}
              <Card>
                <p style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)', marginBottom:20 }}>
                  Top Job Match Scores
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} margin={{ top:0, right:8, left:-20, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fill:'var(--text-muted)', fontSize:10 }} />
                    <YAxis domain={[0,100]} tick={{ fill:'var(--text-muted)', fontSize:10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Match Score" radius={[5,5,0,0]}>
                      {barData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Pie chart */}
              <Card>
                <p style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)', marginBottom:20 }}>
                  Match Distribution
                </p>
                <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                  <ResponsiveContainer width="55%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={['#10B981','#F59E0B','#EF4444'][i]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {pieData.map((d, i) => (
                      <div key={d.name} style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:10, height:10, borderRadius:3, background:['#10B981','#F59E0B','#EF4444'][i], flexShrink:0 }} />
                        <div>
                          <p style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>{d.value}</p>
                          <p style={{ fontSize:10, color:'var(--text-muted)' }}>{d.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Line chart */}
            <Card className="anim-fadeInUp delay-3">
              <p style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)', marginBottom:20 }}>
                Match Score Trend
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={lineData} margin={{ top:0, right:8, left:-20, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="idx" tick={{ fill:'var(--text-muted)', fontSize:10 }} />
                  <YAxis domain={[0,100]} tick={{ fill:'var(--text-muted)', fontSize:10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="score" name="Match Score" stroke="#6366F1" strokeWidth={2} dot={{ fill:'#6366F1', r:4 }} activeDot={{ r:6 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Top matches table */}
            <Card className="anim-fadeInUp delay-4">
              <p style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)', marginBottom:16 }}>
                All Job Matches — Ranked
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {results.sort((a,b)=>b.match_score-a.match_score).map((r, i) => (
                  <div key={r.job_id} style={{
                    display:'flex', alignItems:'center', gap:14,
                    background:'var(--bg-elevated)', border:'1px solid var(--border)',
                    borderRadius:10, padding:'11px 14px',
                  }}>
                    <span style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', width:24, textAlign:'center', flexShrink:0 }}>
                      #{i+1}
                    </span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {r.title}
                      </p>
                      <p style={{ fontSize:11, color:'var(--text-secondary)' }}>{r.company} · {r.location}</p>
                    </div>
                    <div style={{ width:120, flexShrink:0 }}>
                      <ProgressBar value={r.match_score} color="auto" showValue={false} height={5} />
                    </div>
                    <Badge color={r.match_score>=70?'success':r.match_score>=50?'warning':'danger'}>
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