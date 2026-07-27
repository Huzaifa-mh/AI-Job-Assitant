import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, FileText, Briefcase,
  TrendingUp, Zap, BarChart3,
  CheckCircle, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Play, Pause,
  Upload,
} from 'lucide-react';
import Button from '../components/ui/Button';


/* ── Nexus inline SVG logo ── */
function NexusLogo({ size = 36 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width={size} height={size} style={{ flexShrink:0 }}>
      <defs>
        <linearGradient id="lp-leftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#1B2D5B"/>
          <stop offset="100%" stopColor="#1E5FA8"/>
        </linearGradient>
        <linearGradient id="lp-rightGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#00AADD"/>
          <stop offset="100%" stopColor="#00D4FF"/>
        </linearGradient>
        <linearGradient id="lp-bridgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#1E5FA8"/>
          <stop offset="50%"  stopColor="#0088CC"/>
          <stop offset="100%" stopColor="#00BBEE"/>
        </linearGradient>
        <filter id="lp-shadow">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#00AADD" floodOpacity="0.3"/>
        </filter>
        <filter id="lp-glow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <ellipse cx="60" cy="108" rx="28" ry="5" fill="#00AADD" opacity="0.12"/>
      <path d="M 24 94 L 24 26 Q 24 20 30 20 L 42 20 Q 48 20 48 26 L 48 62 L 38 74 L 38 94 Z" fill="url(#lp-leftGrad)" filter="url(#lp-shadow)"/>
      <path d="M 28 26 L 28 70 L 38 58 L 38 26 Q 38 24 35 24 L 31 24 Q 28 24 28 26 Z" fill="white" opacity="0.1"/>
      <path d="M 24 94 L 38 94 L 38 88 L 24 88 Z" fill="#0A1628" opacity="0.35"/>
      <path d="M 48 62 L 48 26 Q 48 20 54 18 L 66 18 Q 72 20 70 28 L 70 32 L 52 68 L 52 74 L 38 74 Z" fill="url(#lp-bridgeGrad)" filter="url(#lp-shadow)"/>
      <path d="M 50 26 L 50 60 L 58 44 L 60 22 Z" fill="white" opacity="0.08"/>
      <path d="M 70 32 L 70 56 L 80 44 L 94 26 Q 96 20 90 18 L 78 18 Q 72 18 70 24 Z" fill="url(#lp-rightGrad)" filter="url(#lp-glow)"/>
      <path d="M 70 56 L 70 94 L 84 94 L 84 42 Z" fill="url(#lp-rightGrad)"/>
      <path d="M 70 94 L 84 94 L 84 88 L 70 88 Z" fill="#006699" opacity="0.5"/>
      <path d="M 88 18 L 96 23 L 82 40 L 76 34 Z" fill="#00D4FF" opacity="0.9"/>
    </svg>
  );
}

/* ══════════════════════════════════════════
   DATA
══════════════════════════════════════════ */

const STATS = [
  { value:'50K+',  label:'Freelancers'     },
  { value:'94%',   label:'Match Accuracy'  },
  { value:'$2.4M', label:'Avg Salary Boost'},
  { value:'10x',   label:'Faster Proposals'},
];

const FAQS = [
  { q:'How accurate is the job matching?',           a:'Our AI achieves ~94% accuracy using skill overlap scoring combined with TF-IDF semantic matching against real LinkedIn job descriptions fetched via JSearch API.' },
  { q:'Can I try before subscribing?',                a:'Yes — the Starter plan is permanently free with generous limits. No credit card required.' },
  { q:'How does the proposal generator work?',       a:'It reads your resume and the job description, then generates a fully tailored proposal using Gemini AI. It also identifies your fit points and gap acknowledgments.' },
  { q:'Is my resume data secure?',                   a:'Your data is encrypted at rest and in transit. We never share personal information with third parties.' },
  { q:'What platforms does job matching pull from?', a:'We use the JSearch API which aggregates jobs from LinkedIn, Indeed, Glassdoor, and hundreds of company career pages in real time.' },
];

const STEPS = [
  { num:'01', title:'Upload Resume',    desc:'PDF or DOCX, parsed in seconds', icon:FileText,   color:'#6366F1' },
  { num:'02', title:'Get Matched',      desc:'Live jobs ranked by fit score',  icon:Briefcase,  color:'#8B5CF6' },
  { num:'03', title:'Close Skill Gaps', desc:'See what to learn next',         icon:TrendingUp, color:'#10B981' },
  { num:'04', title:'Generate & Track', desc:'AI proposals, logged over time', icon:Zap,        color:'#F59E0B' },
];

const COMPARISON_ROWS = [
  { label:'Time to find matching jobs', manual:'2–3 hrs / day',  ai:'Instant, auto-ranked' },
  { label:'Proposal writing',           manual:'30–45 min each', ai:'Generated in seconds' },
  { label:'Skill gap awareness',        manual:'Guesswork',      ai:'Data-driven, ranked by demand' },
  { label:'Application tracking',       manual:'Spreadsheets',   ai:'Automatic analytics dashboard' },
  { label:'Jobs reviewed per session',  manual:'10–15',          ai:'50+, pre-filtered by fit' },
];

/* ══════════════════════════════════════════
   FEATURE SLIDES
══════════════════════════════════════════ */

const FEATURES = [
  {
    id:      1,
    tag:     'Resume Analysis',
    icon:    FileText,
    color:   '#6366F1',
    title:   'AI reads your resume in seconds',
    desc:    'Upload a PDF or DOCX and our Python FastAPI service extracts every skill, technology, experience entry, and contact detail using spaCy NLP. No manual input required.',
    bullets: ['Supports PDF and DOCX formats','Extracts 30+ skill categories','Identifies LinkedIn & GitHub URLs','Ready in under 10 seconds'],
  },
  {
    id:      2,
    tag:     'Job Matching',
    icon:    Briefcase,
    color:   '#8B5CF6',
    title:   'Real LinkedIn jobs matched to your skills',
    desc:    'We fetch live jobs via JSearch API and run a hybrid matching engine — 70% skill overlap scoring plus 30% TF-IDF semantic similarity — to rank every job by compatibility.',
    bullets: ['Live jobs from LinkedIn & Indeed','Match score per job','Sort by highest compatibility','One-click apply assistant'],
  },
  {
    id:      3,
    tag:     'Skill Gap',
    icon:    TrendingUp,
    color:   '#10B981',
    title:   'Know exactly what to learn next',
    desc:    'After matching, we aggregate every missing skill across your top jobs and rank them by frequency. You see a prioritised roadmap — not a vague suggestion, but data-driven evidence.',
    bullets: ['Missing skills ranked by demand','Market demand percentages','2025 trending technologies','Free learning resources linked'],
  },
  {
    id:      4,
    tag:     'AI Proposals',
    icon:    Zap,
    color:   '#F59E0B',
    title:   'Cover letters that actually get responses',
    desc:    'Pick any of your top matched jobs and generate a tailored proposal in one click. Gemini AI reads both your resume and the job description to write a proposal specific to the role.',
    bullets: ['Tailored to each job description','Highlights your fit points','Acknowledges skill gaps honestly','Editable before sending'],
  },
  {
    id:      5,
    tag:     'Analytics',
    icon:    BarChart3,
    color:   '#06B6D4',
    title:   'Track your career growth over time',
    desc:    'Every match and proposal is logged. View your average match score trend, skill distribution, and proposal success rate through beautiful interactive charts.',
    bullets: ['Match score trend line','Skill distribution pie chart','Top matched jobs ranked','Career growth timeline'],
  },
];

/* ══════════════════════════════════════════
   MINI UI PREVIEW COMPONENTS
══════════════════════════════════════════ */

function PreviewShell({ children }) {
  return (
    <div style={{
      background:   '#0d1526',
      borderRadius: 16,
      border:       '1px solid #1e2d45',
      overflow:     'hidden',
      height:       380,
      position:     'relative',
      boxShadow:    '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08)',
    }}>
      {/* Fake browser chrome */}
      <div style={{
        height:       38,
        background:   '#0a1020',
        borderBottom: '1px solid #1e2d45',
        display:      'flex',
        alignItems:   'center',
        padding:      '0 14px',
        gap:          6,
      }}>
        {['#EF4444','#F59E0B','#10B981'].map(c => (
          <div key={c} style={{ width:9, height:9, borderRadius:'50%', background:c, opacity:0.6 }} />
        ))}
        <div style={{ flex:1, height:18, borderRadius:5, background:'#1a2744', margin:'0 12px', maxWidth:260 }} />
      </div>
      <div style={{ padding:16, height:'calc(100% - 38px)', overflowY:'hidden' }}>
        {children}
      </div>
    </div>
  );
}

function MiniSkillBadge({ label, color = '#6366F1' }) {
  return (
    <span style={{
      fontSize:10, fontWeight:600, padding:'3px 9px', borderRadius:20,
      background:`${color}20`, color, border:`1px solid ${color}30`,
      letterSpacing:'0.03em', whiteSpace:'nowrap',
    }}>
      {label}
    </span>
  );
}

function ResumePreview() {
  return (
    <PreviewShell>
      <div style={{ background:'#111f38', border:'1px solid #1e2d45', borderRadius:10, padding:'10px 14px', marginBottom:12, display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:32, height:32, borderRadius:8, background:'rgba(99,102,241,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <FileText size={15} color="#6366F1" />
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:11, fontWeight:600, color:'#F9FAFB' }}>resume.pdf</p>
          <p style={{ fontSize:10, color:'#6B7280' }}>Processed · 2.1MB</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#10B981' }} />
          <span style={{ fontSize:10, color:'#10B981', fontWeight:600 }}>Done</span>
        </div>
      </div>

      <p style={{ fontSize:9, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:7 }}>Extracted skills</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:14 }}>
        {['React','Node.js','Python','FastAPI','SQL Server','TypeScript','Docker','spaCy'].map(s => (
          <MiniSkillBadge key={s} label={s} color="#6366F1" />
        ))}
      </div>

      <p style={{ fontSize:9, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:7 }}>Contact info detected</p>
      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
        {[
          { label:'Email',    value:'huzaifa@example.com' },
          { label:'Phone',    value:'+92-310-0786745'     },
          { label:'LinkedIn', value:'linkedin.com/in/huzaifa' },
          { label:'GitHub',   value:'github.com/huzaifa'  },
        ].map(({ label, value }) => (
          <div key={label} style={{ display:'flex', gap:8, alignItems:'center', padding:'5px 9px', background:'#111f38', borderRadius:6, border:'1px solid #1e2d45' }}>
            <span style={{ fontSize:9, color:'#6B7280', width:44, flexShrink:0 }}>{label}</span>
            <span style={{ fontSize:10, color:'#E0E7FF' }}>{value}</span>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function JobMatchPreview() {
  const jobs = [
    { title:'React Developer',       company:'TechCorp',      score:87, color:'#10B981' },
    { title:'Full Stack Engineer',   company:'StartupXYZ',    score:74, color:'#10B981' },
    { title:'Frontend Specialist',   company:'DigitalAgency', score:61, color:'#F59E0B' },
    { title:'Node.js Developer',     company:'CloudSystems',  score:53, color:'#F59E0B' },
    { title:'.NET Developer',        company:'ThinkDigitally', score:38, color:'#EF4444' },
  ];
  return (
    <PreviewShell>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <span style={{ fontSize:10, color:'#6B7280', letterSpacing:'0.03em' }}>47 jobs cached · sorted by match</span>
        <span style={{ fontSize:9, color:'#6366F1', fontWeight:600, background:'rgba(99,102,241,0.12)', padding:'2px 8px', borderRadius:10 }}>↑ Score</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {jobs.map((j, i) => (
          <div key={i} style={{
            background:'#111f38',
            border:`1px solid ${i===0?'rgba(99,102,241,0.4)':'#1e2d45'}`,
            borderRadius:9, padding:'9px 12px',
            display:'flex', alignItems:'center', gap:10,
          }}>
            <div style={{ width:24, height:24, borderRadius:6, background: i===0 ? 'rgba(245,158,11,0.15)' : '#1a2744', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color: i===0 ? '#F59E0B' : '#6B7280', flexShrink:0 }}>
              #{i+1}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:11, fontWeight:600, color:'#F9FAFB', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{j.title}</p>
              <p style={{ fontSize:9, color:'#6B7280' }}>{j.company}</p>
            </div>
            <div style={{ width:54, flexShrink:0 }}>
              <div style={{ height:4, background:'#1a2744', borderRadius:2, overflow:'hidden', marginBottom:2 }}>
                <div style={{ height:'100%', width:`${j.score}%`, background:j.color, borderRadius:2 }} />
              </div>
            </div>
            <span style={{ fontSize:11, fontWeight:700, color:j.color, width:28, textAlign:'right', flexShrink:0 }}>{j.score}%</span>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function SkillGapPreview() {
  const gaps = [
    { skill:'Docker',     pct:80, count:'7 jobs' },
    { skill:'TypeScript', pct:65, count:'6 jobs' },
    { skill:'Kubernetes', pct:55, count:'5 jobs' },
    { skill:'PostgreSQL', pct:45, count:'4 jobs' },
    { skill:'AWS',        pct:35, count:'3 jobs' },
  ];
  return (
    <PreviewShell>
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        {[
          { label:'Avg Score', value:'64%', color:'#F59E0B' },
          { label:'Strong',    value:'3',   color:'#10B981' },
          { label:'Gaps',      value:'5',   color:'#EF4444' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ flex:1, background:'#111f38', border:'1px solid #1e2d45', borderRadius:8, padding:'8px 6px', textAlign:'center' }}>
            <p style={{ fontSize:15, fontWeight:800, color, lineHeight:1, marginBottom:3 }}>{value}</p>
            <p style={{ fontSize:9, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize:9, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Top missing skills</p>
      {gaps.map(({ skill, pct, count }) => (
        <div key={skill} style={{ marginBottom:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
            <span style={{ fontSize:11, fontWeight:600, color:'#F9FAFB' }}>{skill}</span>
            <span style={{ fontSize:10, fontWeight:700, color:'#EF4444' }}>{count}</span>
          </div>
          <div style={{ height:5, background:'#1a2744', borderRadius:3, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${pct}%`, background:'#EF4444', borderRadius:3 }} />
          </div>
        </div>
      ))}
    </PreviewShell>
  );
}

function ProposalPreview() {
  return (
    <PreviewShell>
      <div style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.25)', borderRadius:9, padding:'9px 12px', marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <p style={{ fontSize:11, fontWeight:600, color:'#F9FAFB' }}>React Developer — TechCorp</p>
          <p style={{ fontSize:10, color:'#9CA3AF' }}>87% match · AI generating...</p>
        </div>
        <span style={{ fontSize:10, color:'#A5B4FC', background:'rgba(99,102,241,0.18)', padding:'2px 8px', borderRadius:12, fontWeight:600 }}>87%</span>
      </div>

      <div style={{ background:'#111f38', border:'1px solid #1e2d45', borderRadius:7, padding:'7px 10px', marginBottom:9 }}>
        <p style={{ fontSize:9, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3 }}>Subject line</p>
        <p style={{ fontSize:11, color:'#E0E7FF' }}>Application for React Developer — Muhammad Huzaifa</p>
      </div>

      <div style={{ background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:7, padding:'8px 10px', marginBottom:9 }}>
        <p style={{ fontSize:9, color:'#10B981', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>Why you're a fit</p>
        {['3+ years React & Node.js experience','Built AI-powered full-stack applications','Familiar with REST APIs & SQL Server'].map((pt,i) => (
          <div key={i} style={{ display:'flex', gap:6, marginBottom:4 }}>
            <CheckCircle size={9} color="#10B981" style={{ flexShrink:0, marginTop:1 }} />
            <p style={{ fontSize:10, color:'#9CA3AF' }}>{pt}</p>
          </div>
        ))}
      </div>

      <div style={{ background:'#111f38', border:'1px solid #1e2d45', borderRadius:7, padding:'8px 10px' }}>
        <p style={{ fontSize:10, color:'#9CA3AF', lineHeight:1.65 }}>
          "Dear TechCorp team, I am excited to apply for the React Developer role. With 3+ years of experience building scalable web applications using React and Node.js..."
        </p>
      </div>
    </PreviewShell>
  );
}

function AnalyticsPreview() {
  const bars = [
    { label:'React Dev',  value:87, color:'#6366F1' },
    { label:'Full Stack', value:74, color:'#8B5CF6' },
    { label:'Frontend',   value:61, color:'#10B981' },
    { label:'Node.js',    value:53, color:'#F59E0B' },
    { label:'.NET Dev',   value:38, color:'#EF4444' },
  ];
  return (
    <PreviewShell>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7, marginBottom:14 }}>
        {[
          { label:'Avg Match',   value:'62%', color:'#F59E0B' },
          { label:'Top Match',   value:'87%', color:'#10B981' },
          { label:'Jobs Ranked', value:'47',  color:'#6366F1' },
          { label:'Proposals',   value:'3',   color:'#8B5CF6' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background:'#111f38', border:'1px solid #1e2d45', borderRadius:8, padding:'9px 10px' }}>
            <p style={{ fontSize:17, fontWeight:800, color, lineHeight:1, marginBottom:3 }}>{value}</p>
            <p style={{ fontSize:9, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize:9, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:9 }}>Match score ranking</p>
      {bars.map(({ label, value, color }) => (
        <div key={label} style={{ marginBottom:8 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
            <span style={{ fontSize:10, color:'#9CA3AF' }}>{label}</span>
            <span style={{ fontSize:10, fontWeight:700, color }}>{value}%</span>
          </div>
          <div style={{ height:4, background:'#1a2744', borderRadius:2, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${value}%`, background:color, borderRadius:2 }} />
          </div>
        </div>
      ))}
    </PreviewShell>
  );
}

/* Assign previews to features */
const FEATURE_PREVIEWS = {
  1: <ResumePreview />,
  2: <JobMatchPreview />,
  3: <SkillGapPreview />,
  4: <ProposalPreview />,
  5: <AnalyticsPreview />,
};

/* ══════════════════════════════════════════
   FAQ ITEM
══════════════════════════════════════════ */

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background:   '#111827',
      border:       `1px solid ${open ? 'rgba(99,102,241,0.35)' : '#1F2937'}`,
      borderRadius: 12,
      overflow:     'hidden',
      transition:   'border-color 0.2s',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width:'100%', display:'flex', justifyContent:'space-between',
          alignItems:'center', padding:'16px 20px',
          background:'none', border:'none', cursor:'pointer',
          color:'#F9FAFB', fontSize:14, fontWeight:500,
          textAlign:'left', gap:12, letterSpacing:'0.03em',
        }}
      >
        {q}
        {open
          ? <ChevronUp   size={16} color="#6366F1" style={{ flexShrink:0 }} />
          : <ChevronDown size={16} color="#6B7280" style={{ flexShrink:0 }} />
        }
      </button>
      {open && (
        <p style={{
          padding:'0 20px 16px', fontSize:13, color:'#9CA3AF',
          lineHeight:1.75, letterSpacing:'0.03em', animation:'fadeIn 0.2s ease',
        }}>
          {a}
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   HOW IT WORKS
══════════════════════════════════════════ */

function HowItWorks() {
  return (
    <section style={{ padding:'72px 48px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ textAlign:'center', marginBottom:52 }}>
        <p style={{ fontSize:13, fontWeight:700, color:'#6366F1', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:12 }}>
          How It Works
        </p>
        <h2 style={{ fontSize:32, fontWeight:700, color:'#F9FAFB', letterSpacing:'0.02em' }}>
          From resume to offer in four steps
        </h2>
      </div>

      <div style={{
        maxWidth:1100, margin:'0 auto',
        display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0,
        position:'relative',
      }}>
        <div style={{
          position:'absolute', top:24, left:'12.5%', right:'12.5%',
          height:1, background:'linear-gradient(90deg, rgba(99,102,241,0.4), rgba(245,158,11,0.4))',
          zIndex:0,
        }} />

        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.num} style={{ position:'relative', zIndex:1, textAlign:'center', padding:'0 16px' }}>
              <div style={{
                width:48, height:48, borderRadius:'50%',
                background:'#0B1020', border:`2px solid ${s.color}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                margin:'0 auto 20px',
                boxShadow:`0 0 0 6px #0B1020, 0 4px 16px ${s.color}40`,
              }}>
                <Icon size={19} color={s.color} />
              </div>
              <p style={{ fontSize:11, fontWeight:700, color:s.color, letterSpacing:'0.1em', marginBottom:8 }}>
                STEP {s.num}
              </p>
              <h4 style={{ fontSize:16, fontWeight:600, color:'#F9FAFB', marginBottom:6, letterSpacing:'0.01em' }}>
                {s.title}
              </h4>
              <p style={{ fontSize:12, color:'#6B7280', lineHeight:1.6, letterSpacing:'0.02em' }}>
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   COMPARISON TABLE
══════════════════════════════════════════ */

function ComparisonTable() {
  return (
    <section style={{ padding:'80px 48px' }}>
      <div style={{ textAlign:'center', marginBottom:48 }}>
        <p style={{ fontSize:13, fontWeight:700, color:'#6366F1', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:12 }}>
          Why It Matters
        </p>
        <h2 style={{ fontSize:32, fontWeight:700, color:'#F9FAFB', letterSpacing:'0.02em' }}>
          Manual job hunting vs. FreelanceAI
        </h2>
      </div>

      <div style={{
        maxWidth:820, margin:'0 auto',
        border:'1px solid rgba(255,255,255,0.08)', borderRadius:16,
        overflow:'hidden',
      }}>
        <div style={{
          display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr',
          background:'rgba(255,255,255,0.03)',
          borderBottom:'1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ padding:'16px 20px' }} />
          <div style={{ padding:'16px 20px', textAlign:'center' }}>
            <span style={{ fontSize:13, fontWeight:600, color:'#6B7280', letterSpacing:'0.03em' }}>Manual</span>
          </div>
          <div style={{ padding:'16px 20px', textAlign:'center', background:'rgba(99,102,241,0.08)' }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#A5B4FC', letterSpacing:'0.03em' }}>FreelanceAI</span>
          </div>
        </div>

        {COMPARISON_ROWS.map((row, i) => (
          <div key={row.label} style={{
            display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr',
            borderBottom: i < COMPARISON_ROWS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }}>
            <div style={{ padding:'16px 20px', display:'flex', alignItems:'center' }}>
              <span style={{ fontSize:13, color:'#E5E7EB', letterSpacing:'0.02em' }}>{row.label}</span>
            </div>
            <div style={{ padding:'16px 20px', textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:12, color:'#6B7280', letterSpacing:'0.02em' }}>{row.manual}</span>
            </div>
            <div style={{
              padding:'16px 20px', textAlign:'center', background:'rgba(99,102,241,0.04)',
              display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            }}>
              <CheckCircle size={12} color="#10B981" style={{ flexShrink:0 }} />
              <span style={{ fontSize:12, fontWeight:600, color:'#F9FAFB', letterSpacing:'0.02em' }}>{row.ai}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   FEATURE OVERVIEW GRID + SHOWCASE SLIDER
══════════════════════════════════════════ */

function FeatureOverviewGrid({ active, onSelect }) {
  return (
    <div style={{
      display:'grid',
      gridTemplateColumns:'repeat(5, 1fr)',
      gap:12,
      maxWidth:1100,
      margin:'0 auto 56px',
    }}>
      {FEATURES.map((feat, i) => {
        const FIcon = feat.icon;
        const isActive = i === active;
        return (
          <button
            key={feat.id}
            onClick={() => onSelect(i)}
            style={{
              display:'flex', flexDirection:'column', alignItems:'flex-start', gap:10,
              padding:'16px 14px',
              borderRadius:14,
              border:`1px solid ${isActive ? feat.color : 'rgba(255,255,255,0.06)'}`,
              background: isActive ? `${feat.color}12` : 'rgba(255,255,255,0.02)',
              cursor:'pointer',
              textAlign:'left',
              transition:'all 0.2s ease',
              boxShadow: isActive ? `0 8px 24px ${feat.color}22` : 'none',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background='rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background='rgba(255,255,255,0.02)'; }}
          >
            <div style={{
              width:32, height:32, borderRadius:9,
              background:`${feat.color}18`, border:`1px solid ${feat.color}30`,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <FIcon size={15} color={feat.color} />
            </div>
            <div>
              <p style={{
                fontSize:12, fontWeight:600,
                color: isActive ? '#F9FAFB' : '#9CA3AF',
                marginBottom:2, letterSpacing:'0.02em',
              }}>
                {feat.tag}
              </p>
              <p style={{ fontSize:10, color:'#6B7280', lineHeight:1.4 }}>
                Step {i + 1}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function FeatureShowcase() {
  const [active,  setActive]  = useState(0);
  const [playing, setPlaying] = useState(true);
  const [animDir, setAnimDir] = useState('right');
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setAnimDir('right');
      setVisible(false);
      setTimeout(() => {
        setActive(a => (a + 1) % FEATURES.length);
        setVisible(true);
      }, 240);
    }, 4500);
  };

  useEffect(() => {
    if (playing) startTimer();
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [playing]);

  const go = (idx, dir = 'right') => {
    setAnimDir(dir);
    setVisible(false);
    setTimeout(() => { setActive(idx); setVisible(true); }, 220);
    if (playing) startTimer();
  };

  const prev = () => go((active - 1 + FEATURES.length) % FEATURES.length, 'left');
  const next = () => go((active + 1) % FEATURES.length, 'right');
  const selectFromGrid = (i) => go(i, i > active ? 'right' : 'left');

  const f    = FEATURES[active];
  const Icon = f.icon;

  return (
    <section style={{ padding:'80px 48px' }}>
      <div style={{ textAlign:'center', marginBottom:44 }}>
        <p style={{ fontSize:13, fontWeight:700, color:'#6366F1', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:12 }}>
          Product Tour
        </p>
        <h2 style={{ fontSize:36, fontWeight:700, color:'#F9FAFB', marginBottom:14, letterSpacing:'0.02em' }}>
          Everything you need, end to end
        </h2>
        <p style={{ fontSize:15, color:'#9CA3AF', maxWidth:560, margin:'0 auto', lineHeight:1.75, letterSpacing:'0.03em' }}>
          Five connected steps take you from raw resume to a tracked, tailored job application — powered by real data, not guesswork.
        </p>
      </div>

      <FeatureOverviewGrid active={active} onSelect={selectFromGrid} />

      <div style={{
        maxWidth:    1100,
        margin:      '0 auto',
        background:  'rgba(255,255,255,0.015)',
        border:      '1px solid rgba(255,255,255,0.06)',
        borderRadius:24,
        padding:     '44px',
        display:     'grid',
        gridTemplateColumns:'1fr 1fr',
        gap:         60,
        alignItems:  'center',
        opacity:     visible ? 1 : 0,
        transform:   visible
          ? 'translateX(0)'
          : animDir === 'right' ? 'translateX(18px)' : 'translateX(-18px)',
        transition: 'opacity 0.24s ease, transform 0.24s ease',
      }}>

        <div>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:`${f.color}15`, border:`1px solid ${f.color}30`,
            borderRadius:20, padding:'5px 14px', marginBottom:20,
          }}>
            <Icon size={13} color={f.color} />
            <span style={{ fontSize:12, fontWeight:600, color:f.color, letterSpacing:'0.04em' }}>
              Feature {active + 1} of {FEATURES.length} · {f.tag}
            </span>
          </div>

          <h3 style={{ fontSize:30, fontWeight:700, color:'#F9FAFB', lineHeight:1.22, marginBottom:16, letterSpacing:'0.01em' }}>
            {f.title}
          </h3>

          <p style={{ fontSize:14, color:'#9CA3AF', lineHeight:1.8, marginBottom:26, letterSpacing:'0.03em' }}>
            {f.desc}
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:11, marginBottom:36 }}>
            {f.bullets.map((b, i) => (
              <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                <div style={{
                  width:18, height:18, borderRadius:'50%', flexShrink:0,
                  background:`${f.color}15`, border:`1px solid ${f.color}25`,
                  display:'flex', alignItems:'center', justifyContent:'center', marginTop:2,
                }}>
                  <CheckCircle size={10} color={f.color} />
                </div>
                <span style={{ fontSize:13, color:'#9CA3AF', lineHeight:1.55, letterSpacing:'0.03em' }}>
                  {b}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button
              onClick={prev}
              style={{
                width:34, height:34, borderRadius:'50%',
                display:'flex', alignItems:'center', justifyContent:'center',
                background:'#111827', border:'1px solid #1e2d45',
                cursor:'pointer', color:'#6B7280', transition:'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#6366F1'; e.currentTarget.style.color='#6366F1'; e.currentTarget.style.background='rgba(99,102,241,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#1e2d45'; e.currentTarget.style.color='#6B7280'; e.currentTarget.style.background='#111827'; }}
            >
              <ChevronLeft size={15} />
            </button>

            <span style={{ fontSize:12, color:'#6B7280', letterSpacing:'0.04em', minWidth:36, textAlign:'center' }}>
              {active + 1} / {FEATURES.length}
            </span>

            <button
              onClick={next}
              style={{
                width:34, height:34, borderRadius:'50%',
                display:'flex', alignItems:'center', justifyContent:'center',
                background:'#111827', border:'1px solid #1e2d45',
                cursor:'pointer', color:'#6B7280', transition:'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#6366F1'; e.currentTarget.style.color='#6366F1'; e.currentTarget.style.background='rgba(99,102,241,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#1e2d45'; e.currentTarget.style.color='#6B7280'; e.currentTarget.style.background='#111827'; }}
            >
              <ChevronRight size={15} />
            </button>

            <button
              onClick={() => setPlaying(p => !p)}
              style={{
                display:'flex', alignItems:'center', gap:6,
                background:'none', border:'none', cursor:'pointer',
                color:'#6B7280', fontSize:12, letterSpacing:'0.03em',
                padding:'6px 10px', borderRadius:8, transition:'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color='#F9FAFB'; e.currentTarget.style.background='#111827'; }}
              onMouseLeave={e => { e.currentTarget.style.color='#6B7280'; e.currentTarget.style.background='none'; }}
            >
              {playing ? <Pause size={12}/> : <Play size={12}/>}
              {playing ? 'Pause' : 'Play'}
            </button>
          </div>
        </div>

        <div>
          {FEATURE_PREVIEWS[f.id]}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════ */

export default function Landing() {
  const navigate   = useNavigate();
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    navigate('/register');
  };

  return (
    <div style={{ background:'#0B1020', minHeight:'100vh', overflowX:'hidden' }}>

      {/* ════════════════ NAVBAR ════════════════ */}
      <nav style={{
        position:     'sticky',
        top:          0,
        zIndex:       50,
        height:       68,
        padding:      '0 52px',
        display:      'flex',
        alignItems:   'center',
        justifyContent:'space-between',
        background:   'rgba(11,16,32,0.92)',
        backdropFilter:'blur(20px)',
        WebkitBackdropFilter:'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>

        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          
          {/* Logo */}
<div style={{ display:'flex', alignItems:'center', gap:10 }}>
  <NexusLogo size={38} />
  <div>
    <p style={{
      fontSize:14, fontWeight:800, color:'#F9FAFB',
      lineHeight:1.15, letterSpacing:'0.08em', textTransform:'uppercase',
    }}>
      NEXUS
    </p>
    <p style={{
      fontSize:9, color:'#6B7280',
      letterSpacing:'0.08em', textTransform:'uppercase',
    }}>
      Freelance Platform
    </p>
  </div>
</div>
        </div>

        <div style={{
          display:'flex', gap:2, alignItems:'center',
          background:'rgba(255,255,255,0.03)',
          border:'1px solid rgba(255,255,255,0.06)',
          borderRadius:30, padding:'4px 6px',
        }}>
          {[
            { label:'How It Works', href:'#how' },
            { label:'Product Tour', href:'#tour' },
            { label:'FAQ',          href:'#faq'  },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{
                fontSize:13, color:'#9CA3AF', textDecoration:'none',
                padding:'6px 16px', borderRadius:24, letterSpacing:'0.03em',
                transition:'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color='#F9FAFB'; e.currentTarget.style.background='rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.color='#9CA3AF'; e.currentTarget.style.background='transparent'; }}
            >
              {label}
            </a>
          ))}
        </div>

        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding:'8px 18px', background:'transparent',
              border:'1px solid rgba(255,255,255,0.1)',
              borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:500,
              color:'#9CA3AF', letterSpacing:'0.03em', transition:'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color='#F9FAFB'; e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.color='#9CA3AF'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.background='transparent'; }}
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding:'8px 20px',
              background:'linear-gradient(135deg,#6366F1,#8B5CF6)',
              border:'none', borderRadius:10, cursor:'pointer',
              fontSize:13, fontWeight:600, color:'white',
              letterSpacing:'0.03em',
              boxShadow:'0 4px 16px rgba(99,102,241,0.35)',
              display:'flex', alignItems:'center', gap:7,
              transition:'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow='0 6px 24px rgba(99,102,241,0.5)'; e.currentTarget.style.transform='translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow='0 4px 16px rgba(99,102,241,0.35)'; e.currentTarget.style.transform='translateY(0)'; }}
          >
            Get started free <ArrowRight size={13} />
          </button>
        </div>
      </nav>

      {/* ════════════════ HERO ════════════════ */}
      <section style={{ padding:'100px 48px 72px', textAlign:'center', position:'relative', overflow:'hidden' }}>

        <div style={{ position:'absolute', top:'0%', left:'50%', transform:'translateX(-50%)', width:900, height:700, background:'radial-gradient(ellipse,rgba(99,102,241,0.09),transparent 60%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'25%', left:'12%', width:340, height:340, background:'radial-gradient(ellipse,rgba(139,92,246,0.06),transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'15%', right:'8%',  width:300, height:300, background:'radial-gradient(ellipse,rgba(16,185,129,0.05),transparent 70%)', pointerEvents:'none' }} />

        <h1
          className="anim-fadeInUp"
          style={{
            fontSize:'clamp(42px,5.5vw,78px)', fontWeight:800,
            lineHeight:1.07, maxWidth:880, margin:'0 auto 20px',
            letterSpacing:'-0.02em',
          }}
        >
          Your AI-powered{' '}
          <span style={{
            background:'linear-gradient(135deg,#6366F1 0%,#8B5CF6 45%,#A78BFA 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>
            Freelance Career
          </span>
          {' '}Engine
        </h1>

        <p
          className="anim-fadeInUp delay-1"
          style={{
            fontSize:18, color:'#9CA3AF',
            maxWidth:520, margin:'0 auto 56px',
            lineHeight:1.75, letterSpacing:'0.03em',
          }}
        >
          Analyze resumes, match real LinkedIn jobs, generate AI proposals,
          and track your career growth — all in one platform.
        </p>

        <div
          className="anim-fadeInUp delay-2"
          style={{ maxWidth:560, margin:'0 auto 56px' }}
        >
          <div style={{
            display:'inline-flex', alignItems:'center', gap:7,
            marginBottom:20,
          }}>
            <div style={{
              display:'flex', alignItems:'center', gap:6,
              background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)',
              borderRadius:20, padding:'5px 12px',
            }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:'#10B981', animation:'pulseDot 1.5s ease infinite' }} />
              <span style={{ fontSize:12, color:'#10B981', fontWeight:600, letterSpacing:'0.04em' }}>AI ready · Score: 94/100</span>
            </div>
          </div>

          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => navigate('/register')}
            style={{
              background:  dragging ? 'rgba(99,102,241,0.08)' : 'rgba(17,24,39,0.9)',
              border:      `2px dashed ${dragging ? '#6366F1' : 'rgba(99,102,241,0.35)'}`,
              borderRadius:20,
              padding:     '52px 40px',
              cursor:      'pointer',
              transition:  'all 0.2s ease',
              backdropFilter:'blur(10px)',
              boxShadow:   dragging
                ? '0 0 0 4px rgba(99,102,241,0.15), 0 32px 80px rgba(0,0,0,0.4)'
                : '0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(99,102,241,0.1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#6366F1';
              e.currentTarget.style.boxShadow   = '0 0 0 4px rgba(99,102,241,0.1), 0 32px 80px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={e => {
              if (!dragging) {
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)';
                e.currentTarget.style.boxShadow   = '0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(99,102,241,0.1)';
              }
            }}
          >
            <div style={{
              width:68, height:68, borderRadius:18,
              background:'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.15))',
              border:'1px solid rgba(99,102,241,0.3)',
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 20px',
              boxShadow:'0 8px 24px rgba(99,102,241,0.25)',
              animation: dragging ? undefined : 'float 3s ease-in-out infinite',
            }}>
              <Upload size={28} color="#A5B4FC" />
            </div>

            <p style={{ fontSize:18, fontWeight:700, color:'#F9FAFB', marginBottom:8, letterSpacing:'0.02em' }}>
              {dragging ? 'Drop to analyze' : 'Drop your resume here'}
            </p>
            <p style={{ fontSize:13, color:'#6B7280', marginBottom:28, letterSpacing:'0.03em' }}>
              PDF or DOCX · Max 5MB · Results in under 10 seconds
            </p>

            <div style={{ display:'flex', gap:12, justifyContent:'center', alignItems:'center', flexWrap:'wrap' }}>
              <div style={{
                display:'inline-flex', alignItems:'center', gap:8,
                padding:'11px 28px',
                background:'linear-gradient(135deg,#6366F1,#8B5CF6)',
                borderRadius:12, fontSize:14, fontWeight:600, color:'white',
                boxShadow:'0 4px 20px rgba(99,102,241,0.4)',
                letterSpacing:'0.03em',
              }}>
                <Sparkles size={15} /> Analyze My Resume Free
              </div>
              <span style={{ fontSize:13, color:'#4B5563', letterSpacing:'0.03em' }}>or</span>
              <span style={{ fontSize:13, color:'#9CA3AF', letterSpacing:'0.03em' }}>browse to upload</span>
            </div>
          </div>

          <div style={{ display:'flex', justifyContent:'center', gap:20, marginTop:18, flexWrap:'wrap' }}>
            {['Free forever','No credit card','Instant results'].map(t => (
              <div key={t} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <CheckCircle size={12} color="#10B981" />
                <span style={{ fontSize:12, color:'#6B7280', letterSpacing:'0.03em' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ STATS BAR ════════════════ */}
      <section style={{
        padding:'36px 48px',
        borderTop:'1px solid rgba(255,255,255,0.05)',
        borderBottom:'1px solid rgba(255,255,255,0.05)',
        background:'rgba(255,255,255,0.01)',
      }}>
        <div style={{
          maxWidth:820, margin:'0 auto',
          display:'grid', gridTemplateColumns:'repeat(4,1fr)',
          gap:32, textAlign:'center',
        }}>
          {STATS.map((s, i) => (
            <div key={s.value} className={`anim-fadeInUp delay-${i+1}`}>
              <p style={{
                fontSize:32, fontWeight:800, marginBottom:5,
                background:'linear-gradient(135deg,#6366F1,#8B5CF6)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
              }}>
                {s.value}
              </p>
              <p style={{ fontSize:13, color:'#6B7280', letterSpacing:'0.04em' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <div id="how">
        <HowItWorks />
      </div>

      {/* ════════════════ FEATURE SHOWCASE ════════════════ */}
      <div id="tour" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <FeatureShowcase />
      </div>

      {/* ════════════════ COMPARISON TABLE ════════════════ */}
      <ComparisonTable />

      {/* ════════════════ FAQ ════════════════ */}
      <section id="faq" style={{ padding:'80px 48px', background:'rgba(17,24,39,0.4)' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <p style={{ fontSize:13, fontWeight:700, color:'#6366F1', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:12 }}>
            FAQ
          </p>
          <h2 style={{ fontSize:36, fontWeight:700, color:'#F9FAFB', letterSpacing:'0.02em' }}>
            Frequently asked questions
          </h2>
        </div>
        <div style={{ maxWidth:660, margin:'0 auto', display:'flex', flexDirection:'column', gap:8 }}>
          {FAQS.map(faq => <FaqItem key={faq.q} {...faq} />)}
        </div>
      </section>

      {/* ════════════════ FINAL CTA ════════════════ */}
      <section style={{ padding:'80px 48px' }}>
        <div style={{
          maxWidth:620, margin:'0 auto',
          background:'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.06))',
          border:'1px solid rgba(99,102,241,0.2)',
          borderRadius:24, padding:'56px 40px',
          textAlign:'center', position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', top:'-50px', right:'-50px', width:220, height:220, background:'radial-gradient(ellipse,rgba(139,92,246,0.12),transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'-40px', left:'-40px', width:180, height:180, background:'radial-gradient(ellipse,rgba(99,102,241,0.08),transparent 70%)', pointerEvents:'none' }} />
          <h2 style={{ fontSize:32, fontWeight:700, color:'#F9FAFB', marginBottom:12, letterSpacing:'0.01em', lineHeight:1.25 }}>
            Start your AI-powered career today
          </h2>
          <p style={{ fontSize:15, color:'#9CA3AF', marginBottom:32, lineHeight:1.7, letterSpacing:'0.03em' }}>
            Join 50,000+ freelancers using AI to land better clients and earn more.
          </p>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding:'12px 32px',
              background:'linear-gradient(135deg,#6366F1,#8B5CF6)',
              border:'none', borderRadius:12, cursor:'pointer',
              fontSize:14, fontWeight:600, color:'white',
              boxShadow:'0 6px 24px rgba(99,102,241,0.4)',
              display:'inline-flex', alignItems:'center', gap:8,
              letterSpacing:'0.03em', transition:'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 32px rgba(99,102,241,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 6px 24px rgba(99,102,241,0.4)'; }}
          >
            Get started for free <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.05)', padding:'56px 52px 28px' }}>
        <div style={{
          maxWidth:1100, margin:'0 auto 40px',
          display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr 1fr', gap:32,
        }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:14 }}>
  <NexusLogo size={28} />
  <span style={{ fontSize:15, fontWeight:800, color:'#F9FAFB', letterSpacing:'0.08em', textTransform:'uppercase' }}>
    NEXUS
  </span>
</div>
<p style={{ fontSize:12, color:'#6B7280', lineHeight:1.7, maxWidth:220 }}>
  AI-powered career assistant for freelancers — resume analysis,
  job matching, and proposal generation.
</p>
          </div>

          {[
            { title:'Product',   links:['How It Works','Product Tour','FAQ'] },
            { title:'Company',   links:['About','Final Year Project'] },
            { title:'Resources', links:['Career Tips','Documentation'] },
          ].map(col => (
            <div key={col.title}>
              <p style={{ fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>
                {col.title}
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {col.links.map(l => (
                  <a key={l} href="#" style={{ fontSize:13, color:'#6B7280', textDecoration:'none' }}>{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

       <div style={{ display:'flex', alignItems:'center', gap:9 }}>
  <NexusLogo size={20} />
  <span style={{ fontSize:12, color:'#4B5563', letterSpacing:'0.05em' }}>
    NEXUS © 2025
  </span>
</div>
<p style={{ fontSize:12, color:'#374151' }}>
  Final Year Project · Nexus Freelance Platform
</p>
      </footer>
    </div>
  );
}
