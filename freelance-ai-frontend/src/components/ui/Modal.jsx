import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, maxWidth = 640 }) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="anim-fadeIn"
      style={{
        position:       'fixed',
        inset:          0,
        background:     'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        zIndex:         1000,
        padding:        20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="anim-fadeInUp"
        style={{
          width:        '100%',
          maxWidth,
          maxHeight:    '90vh',
          overflowY:    'auto',
          background:   'var(--bg-card)',
          border:       '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow:    '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '18px 22px',
          borderBottom:   '1px solid var(--border)',
          position:       'sticky',
          top:             0,
          background:     'var(--bg-card)',
        }}>
          <p style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)' }}>{title}</p>
          <button
            onClick={onClose}
            style={{
              background: 'none', border:'none', cursor:'pointer',
              color: 'var(--text-muted)', display:'flex', padding:4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding:22 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
