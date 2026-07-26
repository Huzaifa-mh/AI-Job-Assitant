import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button   from '../components/ui/Button';
import Input    from '../components/ui/Input';
import { Sparkles, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';

const PERKS = [
  'AI resume analysis in under 10 seconds',
  'Real LinkedIn job matching via JSearch API',
  'Skill gap detection and learning roadmap',
  'AI proposal generator for every application',
];

export default function Register() {
  const { register, loading } = useAuth();
  const navigate              = useNavigate();
  const [form,  setForm]      = useState({ full_name:'', email:'', password:'' });
  const [error, setError]     = useState('');

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    const res = await register(form.full_name, form.email, form.password);
    if (res.success) navigate('/dashboard');
    else setError(res.error);
  };

  return (
    <div style={{
      minHeight:      '100vh',
      display:        'grid',
      gridTemplateColumns: '1fr 1fr',
      background:     'var(--bg)',
    }}>

      {/* ── Left panel — perks ── */}
      <div style={{
        padding:        '48px 64px',
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'center',
        borderRight:    '1px solid var(--border)',
        position:       'relative',
        overflow:       'hidden',
      }}>
        {/* Glow */}
        <div style={{
          position:     'absolute', top:'20%', left:'10%',
          width:        400, height:400,
          background:   'radial-gradient(ellipse, rgba(99,102,241,0.1), transparent 70%)',
          pointerEvents:'none',
        }} />

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:56 }}>
          <div style={{
            width:          36, height:36, borderRadius:9,
            background:     'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display:        'flex', alignItems:'center', justifyContent:'center',
            boxShadow:      '0 4px 14px rgba(99,102,241,0.4)',
          }}>
            <Sparkles size={16} color="white" />
          </div>
          <span style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)' }}>FreelanceAI</span>
        </div>

        <div className="anim-fadeInUp">
          <h2 style={{ fontSize:32, fontWeight:700, color:'var(--text-primary)', marginBottom:12, lineHeight:1.2 }}>
            Supercharge your{' '}
            <span style={{
              background:           'linear-gradient(135deg, #6366F1, #8B5CF6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor:  'transparent',
              backgroundClip:       'text',
            }}>
              freelance career
            </span>
          </h2>
          <p style={{ fontSize:15, color:'var(--text-secondary)', marginBottom:40, lineHeight:1.7 }}>
            Join 50,000+ freelancers using AI to land better clients,
            write winning proposals, and grow their income.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {PERKS.map((perk, i) => (
              <div
                key={perk}
                className={`anim-fadeInUp delay-${i + 1}`}
                style={{ display:'flex', gap:12, alignItems:'flex-start' }}
              >
                <div style={{
                  width:          22,
                  height:         22,
                  borderRadius:   '50%',
                  background:     'rgba(16,185,129,0.15)',
                  border:         '1px solid rgba(16,185,129,0.3)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  flexShrink:     0,
                  marginTop:      1,
                }}>
                  <CheckCircle size={12} color="#10B981" />
                </div>
                <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6 }}>{perk}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        48,
      }}>
        <div style={{ width:'100%', maxWidth:400 }} className="anim-fadeInUp">

          <div style={{ marginBottom:28 }}>
            <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>
              Create your account
            </h1>
            <p style={{ fontSize:14, color:'var(--text-secondary)' }}>
              Free forever. No credit card required.
            </p>
          </div>

          {/* Card */}
          <div style={{
            background:   'var(--bg-card)',
            border:       '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding:      28,
          }}>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>

              {error && (
                <div style={{
                  background:   'rgba(239,68,68,0.08)',
                  border:       '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 8,
                  padding:      '10px 14px',
                  fontSize:     13,
                  color:        '#FCA5A5',
                }}>
                  ⚠ {error}
                </div>
              )}

              <Input
                label="Full name"
                type="text"
                placeholder="Muhammad Huzaifa"
                icon={<User size={14} />}
                required
                value={form.full_name}
                onChange={set('full_name')}
              />

              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                icon={<Mail size={14} />}
                required
                value={form.email}
                onChange={set('email')}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Minimum 6 characters"
                icon={<Lock size={14} />}
                hint="Use at least 6 characters"
                required
                value={form.password}
                onChange={set('password')}
              />

              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                icon={<Sparkles size={14} />}
                type="submit"
                style={{ marginTop:4 }}
              >
                Create free account
              </Button>

              <p style={{ fontSize:11, color:'var(--text-muted)', textAlign:'center', lineHeight:1.6 }}>
                By signing up, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </div>

          <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--primary)', fontWeight:600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}