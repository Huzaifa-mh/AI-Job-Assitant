import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const configs = {
  success: { icon: CheckCircle,    color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)' },
  error:   { icon: XCircle,        color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)'  },
  warning: { icon: AlertTriangle,  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
  info:    { icon: Info,           color: '#6366F1', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.25)' },
};

function ToastItem({ toast, onRemove }) {
  const cfg  = configs[toast.type] || configs.info;
  const Icon = cfg.icon;

  return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      gap:            10,
      background:     'var(--bg-card)',
      border:         `1px solid ${cfg.border}`,
      borderLeft:     `3px solid ${cfg.color}`,
      borderRadius:   10,
      padding:        '12px 14px',
      minWidth:       280,
      maxWidth:       380,
      boxShadow:      '0 20px 60px rgba(0,0,0,0.5)',
      animation:      'fadeInUp 0.3s ease',
    }}>
      <Icon size={15} color={cfg.color} style={{ flexShrink:0 }} />
      <p style={{ flex:1, fontSize:13, color:'var(--text-primary)', lineHeight:1.4 }}>
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background:'none', border:'none',
          color:'var(--text-muted)', cursor:'pointer',
          display:'flex', alignItems:'center', padding:2,
          borderRadius:4,
        }}
      >
        <X size={13} />
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;

  return (
    <div style={{
      position:      'fixed',
      bottom:        24,
      right:         24,
      zIndex:        9999,
      display:       'flex',
      flexDirection: 'column',
      gap:           8,
    }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}