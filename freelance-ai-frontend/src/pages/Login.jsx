import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button   from '../components/ui/Button';
import Input    from '../components/ui/Input';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate           = useNavigate();
  const [form,  setForm]   = useState({ email:'', password:'' });
  const [error, setError]  = useState('');

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(form.email, form.password);
    if (res.success) navigate('/dashboard');
    else setError(res.error);
  };

  return (
    <div style={{
      minHeight:      '100vh',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        24,
      background:     'var(--bg)',
      position:       'relative',
      overflow:       'hidden',
    }}>
      {/* Background glows */}
      <div style={{
        position:   'absolute', top:'20%', left:'30%',
        width:      500, height:500,
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.07), transparent 70%)',
        pointerEvents:'none',
      }} />
      <div style={{
        position:   'absolute', bottom:'20%', right:'30%',
        width:      400, height:400,
        background: 'radial-gradient(ellipse, rgba(139,92,246,0.06), transparent 70%)',
        pointerEvents:'none',
      }} />

      <div style={{ width:'100%', maxWidth:400 }} className="anim-fadeInUp">

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{
            width:          44,
            height:         44,
            borderRadius:   12,
            background:     'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            margin:         '0 auto 14px',
            boxShadow:      '0 8px 24px rgba(99,102,241,0.35)',
          }}>
            <Sparkles size={20} color="white" />
          </div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>
            Welcome back
          </h1>
          <p style={{ fontSize:14, color:'var(--text-secondary)' }}>
            Sign in to your FreelanceAI account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background:   'var(--bg-card)',
          border:       '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding:      32,
        }}>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>

            {/* Error */}
            {error && (
              <div style={{
                background:   'rgba(239,68,68,0.08)',
                border:       '1px solid rgba(239,68,68,0.25)',
                borderRadius: 8,
                padding:      '10px 14px',
                fontSize:     13,
                color:        'var(--badge-danger-text)',
                display:      'flex',
                alignItems:   'center',
                gap:          8,
              }}>
                ⚠ {error}
              </div>
            )}

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail size={14} />}
              required
              value={form.email}
              onChange={set('email')}
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock size={14} />}
                required
                value={form.password}
                onChange={set('password')}
              />
              <div style={{ textAlign:'right', marginTop:6 }}>
                <Link to="#" style={{ fontSize:12, color:'var(--primary)' }}>
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              icon={<ArrowRight size={14} />}
              type="submit"
              style={{ marginTop:4 }}
            >
              Sign in
            </Button>
          </form>
        </div>

        {/* Footer link */}
        <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color:'var(--primary)', fontWeight:600 }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}