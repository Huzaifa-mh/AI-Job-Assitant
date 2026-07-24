import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, FileText, Briefcase,
  TrendingUp, Zap, MessageSquare, BarChart3,
  CheckCircle, Star, ChevronDown, ChevronUp,
} from 'lucide-react';
import Button from '../components/ui/Button';

/* ── Data ── */
const FEATURES = [
  { icon: FileText,      color:'#6366F1', title:'AI Resume Analysis',      desc:'Upload your resume and get instant AI-powered skill extraction, scoring, and improvement suggestions.' },
  { icon: Briefcase,     color:'#8B5CF6', title:'Smart Job Matching',       desc:'Fetch real LinkedIn jobs via JSearch API and get match percentages calculated from your actual skills.' },
  { icon: TrendingUp,    color:'#10B981', title:'Skill Gap Analysis',       desc:'Discover exactly which skills are holding you back and get a prioritized roadmap to fill each gap.' },
  { icon: Zap,           color:'#F59E0B', title:'AI Proposal Generator',    desc:'Generate tailored proposals and cover letters in seconds using your resume and the job description.' },
  { icon: MessageSquare, color:'#EC4899', title:'Negotiation Simulator',    desc:'Practice client negotiations with an AI that plays a skeptical client and scores your responses.' },
  { icon: BarChart3,     color:'#06B6D4', title:'Career Analytics',         desc:'Track match scores, proposal history, and skill growth over time with beautiful interactive charts.' },
];

const STATS = [
  { value:'50K+',  label:'Freelancers'    },
  { value:'94%',   label:'Match Accuracy' },
  { value:'$2.4M', label:'Avg Salary Boost'},
  { value:'10x',   label:'Faster Proposals'},
];

const TESTIMONIALS = [
  { name:'Sarah K.',  role:'Full Stack Dev',    text:'The job matching is incredibly accurate. Got 3 interviews in my first week using this.',   rating:5 },
  { name:'Marcus T.', role:'UI/UX Designer',    text:'The negotiation simulator helped me land a 40% higher rate on my last contract deal.',      rating:5 },
  { name:'Priya M.',  role:'Data Scientist',    text:'Skill gap analysis showed exactly what to learn next. Went from 40% to 85% match scores.', rating:5 },
];

const PLANS = [
  {
    name:'Starter', price:'$0',  period:'/month', popular:false, variant:'secondary',
    features:['5 resume analyses/month','Basic job matching','Skill gap report','Community support'],
    cta:'Start Free',
  },
  {
    name:'Pro', price:'$29', period:'/month', popular:true, variant:'primary',
    features:['Unlimited analyses','Advanced job matching','AI Proposal Generator','Negotiation Simulator','Priority support'],
    cta:'Start Pro',
  },
  {
    name:'Agency', price:'$79', period:'/month', popular:false, variant:'secondary',
    features:['Everything in Pro','5 team seats','White-label reports','API access','Dedicated manager'],
    cta:'Contact Sales',
  },
];

const FAQS = [
  { q:'How accurate is the job matching?',       a:'Our AI achieves ~94% accuracy using skill overlap scoring combined with TF-IDF semantic matching against real LinkedIn job descriptions fetched via JSearch API.' },
  { q:'Can I try before subscribing?',            a:'Yes — the Starter plan is permanently free with generous limits. No credit card required.' },
  { q:'How does the proposal generator work?',   a:'It reads your resume and the job description, then generates a fully tailored proposal. Phase 5 will use fine-tuned Llama 3 for even better results.' },
  { q:'Is my resume data secure?',               a:'Your data is encrypted at rest and in transit using industry-standard protocols. We never share personal information with third parties.' },
  { q:'What platforms does job matching pull from?', a:'We use the JSearch API which aggregates jobs from LinkedIn, Indeed, Glassdoor, and hundreds of company career pages in real time.' },
];

/* ── Sub-components ── */
function NavLink({ children, href }) {
  return (
    <a
      href={href}
      style={{ fontSize:14, color:'var(--text-secondary)', transition:'color 0.15s', textDecoration:'none' }}
      onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
      onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
    >
      {children}
    </a>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize:      11,
      fontWeight:    700,
      color:         'var(--primary)',
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      marginBottom:  12,
    }}>
      {children}
    </p>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background:   'var(--bg-card)',
        border:       `1px solid ${open ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
        borderRadius: 12,
        overflow:     'hidden',
        transition:   'border-color 0.2s',
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width:          '100%',
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          padding:        '16px 20px',
          background:     'none',
          border:         'none',
          cursor:         'pointer',
          color:          'var(--text-primary)',
          fontSize:       14,
          fontWeight:     500,
          textAlign:      'left',
          gap:            12,
        }}
      >
        {q}
        {open
          ? <ChevronUp   size={16} color="var(--primary)" style={{ flexShrink:0 }} />
          : <ChevronDown size={16} color="var(--text-muted)" style={{ flexShrink:0 }} />
        }
      </button>
      {open && (
        <p style={{
          padding:    '0 20px 16px',
          fontSize:   13,
          color:      'var(--text-secondary)',
          lineHeight: 1.7,
          animation:  'fadeIn 0.2s ease',
        }}>
          {a}
        </p>
      )}
    </div>
  );
}

/* ── Main Component ── */
export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', overflowX:'hidden' }}>

      {/* ════════════════════════════════ NAVBAR ════════════════════════════════ */}
      <nav style={{
        position:       'sticky',
        top:            0,
        zIndex:         50,
        height:         64,
        padding:        '0 48px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        background:     'rgba(11,16,32,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom:   '1px solid var(--border)',
      }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:          34,
            height:         34,
            borderRadius:   9,
            background:     'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            boxShadow:      '0 4px 14px rgba(99,102,241,0.4)',
          }}>
            <Sparkles size={16} color="white" />
          </div>
          <span style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)' }}>
            FreelanceAI
          </span>
        </div>

        {/* Links */}
        <div style={{ display:'flex', gap:32, alignItems:'center' }}>
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
          <NavLink href="#testimonials">Testimonials</NavLink>
          <NavLink href="#faq">FAQ</NavLink>
        </div>

        {/* CTA */}
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            Sign in
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<ArrowRight size={13} />}
            onClick={() => navigate('/register')}
          >
            Get started free
          </Button>
        </div>
      </nav>

      {/* ════════════════════════════════ HERO ════════════════════════════════ */}
      <section style={{ padding:'100px 48px 80px', textAlign:'center', position:'relative', overflow:'hidden' }}>

        {/* Background radial glow */}
        <div style={{
          position:   'absolute',
          top:        '10%',
          left:       '50%',
          transform:  'translateX(-50%)',
          width:      700,
          height:     500,
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)',
          pointerEvents:'none',
        }} />

        {/* Secondary glow */}
        <div style={{
          position:   'absolute',
          top:        '30%',
          left:       '20%',
          width:      300,
          height:     300,
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 70%)',
          pointerEvents:'none',
        }} />

        {/* Badge */}
        <div
          className="anim-fadeInUp"
          style={{
            display:       'inline-flex',
            alignItems:    'center',
            gap:           7,
            background:    'rgba(99,102,241,0.1)',
            border:        '1px solid rgba(99,102,241,0.3)',
            borderRadius:  20,
            padding:       '6px 14px',
            fontSize:      12,
            color:         '#A5B4FC',
            fontWeight:    500,
            marginBottom:  28,
          }}
        >
          <Sparkles size={11} />
          Powered by JSearch API · spaCy NLP · Playwright
        </div>

        {/* Headline */}
        <h1
          className="anim-fadeInUp delay-1"
          style={{
            fontSize:     'clamp(40px, 5.5vw, 76px)',
            fontWeight:   800,
            lineHeight:   1.08,
            marginBottom: 20,
            maxWidth:     860,
            margin:       '0 auto 20px',
          }}
        >
          Your AI-powered{' '}
          <span style={{
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A78BFA 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor:  'transparent',
            backgroundClip:       'text',
          }}>
            Freelance Career
          </span>
          {' '}Engine
        </h1>

        {/* Sub */}
        <p
          className="anim-fadeInUp delay-2"
          style={{
            fontSize:     18,
            color:        'var(--text-secondary)',
            maxWidth:     540,
            margin:       '0 auto 40px',
            lineHeight:   1.75,
          }}
        >
          Analyze resumes, match dream clients, close proposals,
          negotiate rates, and track every metric — all with AI that
          knows the freelance market.
        </p>

        {/* CTAs */}
        <div
          className="anim-fadeInUp delay-3"
          style={{ display:'flex', gap:14, justifyContent:'center', marginBottom:64 }}
        >
          <Button
            variant="primary"
            size="xl"
            icon={<Sparkles size={15} />}
            onClick={() => navigate('/register')}
          >
            Analyze My Resume Free
          </Button>
          <Button
            variant="secondary"
            size="xl"
            onClick={() => navigate('/login')}
          >
            View Demo
          </Button>
        </div>

        {/* Hero card */}
        <div
          className="anim-fadeInUp delay-4"
          style={{
            maxWidth:     580,
            margin:       '0 auto',
            background:   'var(--bg-card)',
            border:       '1px solid var(--border)',
            borderRadius: 20,
            padding:      '24px 28px',
            boxShadow:    '0 40px 80px rgba(0,0,0,0.4)',
            textAlign:    'left',
          }}
        >
          {/* Card header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{
                width:      8,
                height:     8,
                borderRadius:'50%',
                background: '#10B981',
                animation:  'pulseDot 1.5s ease infinite',
              }} />
              <span style={{ fontSize:12, color:'#10B981', fontWeight:600 }}>Score: 94/100</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text-muted)' }}>
              <Sparkles size={11} />
              AI analyzing...
            </div>
          </div>

          {/* Upload zone */}
          <div style={{
            border:       '2px dashed var(--border-light)',
            borderRadius: 14,
            padding:      '32px 24px',
            textAlign:    'center',
            background:   'var(--bg-elevated)',
          }}>
            <div style={{
              width:          48,
              height:         48,
              borderRadius:   12,
              background:     'rgba(99,102,241,0.15)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              margin:         '0 auto 14px',
            }}>
              <FileText size={22} color="var(--primary)" />
            </div>
            <p style={{ fontWeight:600, color:'var(--text-primary)', marginBottom:6, fontSize:15 }}>
              Drop your resume to get started
            </p>
            <p style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:20 }}>
              Supports PDF, DOCX — analyzed in under 10 seconds
            </p>
            <Button
              variant="primary"
              size="md"
              icon={<Sparkles size={13} />}
              onClick={() => navigate('/register')}
            >
              Analyze Now
            </Button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════ STATS ════════════════════════════════ */}
      <section style={{
        padding:      '40px 48px',
        borderTop:    '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          maxWidth:            820,
          margin:              '0 auto',
          display:             'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap:                 32,
          textAlign:           'center',
        }}>
          {STATS.map((s, i) => (
            <div key={s.value} className={`anim-fadeInUp delay-${i + 1}`}>
              <p style={{
                fontSize:   30,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor:  'transparent',
                backgroundClip:       'text',
                marginBottom: 4,
              }}>
                {s.value}
              </p>
              <p style={{ fontSize:13, color:'var(--text-secondary)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════ FEATURES ════════════════════════════════ */}
      <section id="features" style={{ padding:'96px 48px' }}>
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <SectionLabel>Features</SectionLabel>
          <h2 style={{ fontSize:36, fontWeight:700, color:'var(--text-primary)', marginBottom:14 }}>
            Everything you need to dominate freelancing
          </h2>
          <p style={{ fontSize:15, color:'var(--text-secondary)', maxWidth:520, margin:'0 auto' }}>
            AI-powered modules working in concert to accelerate every stage of your freelance career.
          </p>
        </div>

        <div style={{
          maxWidth:            1100,
          margin:              '0 auto',
          display:             'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap:                 18,
        }}>
          {FEATURES.map(({ icon: Icon, color, title, desc }, i) => (
            <div
              key={title}
              className={`anim-fadeInUp delay-${Math.min(i + 1, 5)}`}
              style={{
                background:   'var(--bg-card)',
                border:       '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding:      24,
                transition:   'all 0.22s ease',
                cursor:       'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${color}50`;
                e.currentTarget.style.transform   = 'translateY(-5px)';
                e.currentTarget.style.boxShadow   = `0 20px 40px rgba(0,0,0,0.25)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform   = 'translateY(0)';
                e.currentTarget.style.boxShadow   = 'none';
              }}
            >
              <div style={{
                width:          42,
                height:         42,
                borderRadius:   11,
                background:     `${color}18`,
                border:         `1px solid ${color}30`,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                marginBottom:   16,
              }}>
                <Icon size={18} color={color} />
              </div>
              <p style={{ fontWeight:600, color:'var(--text-primary)', marginBottom:8, fontSize:14 }}>{title}</p>
              <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════ TESTIMONIALS ════════════════════════════════ */}
      <section id="testimonials" style={{ padding:'80px 48px', background:'rgba(17,24,39,0.5)' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <SectionLabel>Testimonials</SectionLabel>
          <h2 style={{ fontSize:36, fontWeight:700, color:'var(--text-primary)' }}>
            Trusted by 50,000+ freelancers
          </h2>
        </div>
        <div style={{
          maxWidth:            880,
          margin:              '0 auto',
          display:             'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap:                 18,
        }}>
          {TESTIMONIALS.map(({ name, role, text, rating }, i) => (
            <div
              key={name}
              className={`anim-fadeInUp delay-${i + 1}`}
              style={{
                background:   'var(--bg-card)',
                border:       '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding:      24,
              }}
            >
              {/* Stars */}
              <div style={{ display:'flex', gap:3, marginBottom:16 }}>
                {Array(rating).fill(0).map((_, i) => (
                  <Star key={i} size={13} color="#F59E0B" fill="#F59E0B" />
                ))}
              </div>
              <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.75, marginBottom:20 }}>
                "{text}"
              </p>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{
                  width:          34,
                  height:         34,
                  borderRadius:   '50%',
                  background:     'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontSize:       12,
                  fontWeight:     700,
                  color:          'white',
                }}>
                  {name[0]}
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{name}</p>
                  <p style={{ fontSize:11, color:'var(--text-muted)' }}>{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════ PRICING ════════════════════════════════ */}
      <section id="pricing" style={{ padding:'96px 48px' }}>
        <div style={{ textAlign:'center', marginBottom:52 }}>
          <SectionLabel>Pricing</SectionLabel>
          <h2 style={{ fontSize:36, fontWeight:700, color:'var(--text-primary)', marginBottom:12 }}>
            Simple, transparent pricing
          </h2>
          <p style={{ fontSize:15, color:'var(--text-secondary)' }}>
            Start free, upgrade when you're ready. No hidden fees.
          </p>
        </div>

        <div style={{
          maxWidth:            880,
          margin:              '0 auto',
          display:             'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap:                 18,
          alignItems:          'center',
        }}>
          {PLANS.map(({ name, price, period, popular, features, cta, variant }, i) => (
            <div
              key={name}
              className={`anim-fadeInUp delay-${i + 1}`}
              style={{
                background:   popular
                  ? 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))'
                  : 'var(--bg-card)',
                border:       popular
                  ? '1px solid rgba(99,102,241,0.4)'
                  : '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding:      popular ? '32px 24px' : '24px',
                transform:    popular ? 'scale(1.04)' : 'none',
              }}
            >
              {popular && (
                <div style={{
                  display:      'inline-flex',
                  alignItems:   'center',
                  gap:          5,
                  background:   'rgba(99,102,241,0.2)',
                  borderRadius: 20,
                  padding:      '3px 10px',
                  fontSize:     11,
                  fontWeight:   600,
                  color:        '#A5B4FC',
                  marginBottom: 14,
                }}>
                  <Sparkles size={10} /> Most Popular
                </div>
              )}

              <p style={{ fontWeight:700, fontSize:16, color:'var(--text-primary)', marginBottom:4 }}>{name}</p>

              <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:20 }}>
                <span style={{ fontSize:38, fontWeight:800, color:'var(--text-primary)' }}>{price}</span>
                <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{period}</span>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
                {features.map(f => (
                  <div key={f} style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                    <CheckCircle size={14} color="#10B981" style={{ flexShrink:0, marginTop:2 }} />
                    <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{f}</span>
                  </div>
                ))}
              </div>

              <Button
                variant={variant}
                fullWidth
                onClick={() => navigate('/register')}
              >
                {cta}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════ FAQ ════════════════════════════════ */}
      <section id="faq" style={{ padding:'80px 48px', background:'rgba(17,24,39,0.5)' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <SectionLabel>FAQ</SectionLabel>
          <h2 style={{ fontSize:36, fontWeight:700, color:'var(--text-primary)' }}>
            Frequently asked questions
          </h2>
        </div>
        <div style={{
          maxWidth:      660,
          margin:        '0 auto',
          display:       'flex',
          flexDirection: 'column',
          gap:           8,
        }}>
          {FAQS.map(faq => <FaqItem key={faq.q} {...faq} />)}
        </div>
      </section>

      {/* ════════════════════════════════ CTA ════════════════════════════════ */}
      <section style={{ padding:'80px 48px' }}>
        <div style={{
          maxWidth:     640,
          margin:       '0 auto',
          background:   'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.06))',
          border:       '1px solid rgba(99,102,241,0.25)',
          borderRadius: 24,
          padding:      '56px 40px',
          textAlign:    'center',
          position:     'relative',
          overflow:     'hidden',
        }}>
          {/* Glow blob */}
          <div style={{
            position:   'absolute',
            top:        '-40px',
            right:      '-40px',
            width:      200,
            height:     200,
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.15), transparent 70%)',
            pointerEvents:'none',
          }} />

          <h2 style={{ fontSize:34, fontWeight:700, color:'var(--text-primary)', marginBottom:12 }}>
            Start your AI-powered career today
          </h2>
          <p style={{ fontSize:15, color:'var(--text-secondary)', marginBottom:32, lineHeight:1.7 }}>
            Join 50,000+ freelancers using AI to land better clients and earn more.
          </p>
          <Button
            variant="primary"
            size="xl"
            icon={<ArrowRight size={15} />}
            onClick={() => navigate('/register')}
          >
            Get started for free
          </Button>
        </div>
      </section>

      {/* ════════════════════════════════ FOOTER ════════════════════════════════ */}
      <footer style={{
        padding:        '24px 48px',
        borderTop:      '1px solid var(--border)',
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Sparkles size={13} color="var(--primary)" />
          <span style={{ fontSize:13, color:'var(--text-muted)' }}>FreelanceAI © 2025</span>
        </div>
        <p style={{ fontSize:12, color:'var(--text-muted)' }}>
          Final Year Project · AI-Powered Freelance Career Assistant
        </p>
      </footer>
    </div>
  );
}