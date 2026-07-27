import { Sparkles, X } from 'lucide-react';
import { useAthena } from './AthenaProvider';

export default function AthenaButton() {
  const { isOpen, hasUnread, toggleOpen } = useAthena();

  return (
    <button
      onClick={toggleOpen}
      className={isOpen ? '' : 'anim-pulse'}
      title="Athena — AI Career Assistant"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 58,
        height: 58,
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        boxShadow: '0 8px 30px rgba(99,102,241,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 997,
        transition: 'transform 0.18s ease',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {isOpen ? <X size={22} color="#fff" /> : <Sparkles size={22} color="#fff" />}

      {hasUnread && !isOpen && (
        <span style={{
          position: 'absolute',
          top: 4,
          right: 4,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: 'var(--success)',
          border: '2px solid var(--bg)',
        }} />
      )}
    </button>
  );
}
