import { useEffect, useRef, useState } from 'react';
import { Minus, X, Send, Trash2, ChevronUp } from 'lucide-react';
import { useAthena } from './AthenaProvider';
import AthenaMessage from './AthenaMessage';

const CAPABILITIES = [
  'Resume Review', 'Job Matching', 'Skill Gap Analysis', 'Proposal Writing',
  'Cover Letters', 'Career Advice', 'Interview Preparation', 'Negotiation Guidance',
  'Resume Improvements', 'Application Questions',
];

export default function AthenaPanel() {
  const {
    messages, isOpen, isMinimized, isSending,
    sendMessage, regenerate, clearChat, closePanel, toggleMinimize, markRevealDone,
  } = useAthena();

  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!isMinimized) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isMinimized]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!input.trim() || isSending) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="athena-panel anim-fadeInUp" style={{
      position: 'fixed',
      bottom: 94,
      right: 24,
      width: 380,
      height: isMinimized ? 'auto' : 560,
      maxHeight: 'calc(100vh - 120px)',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 998,
    }}>

      {/* Header */}
      <div
        onClick={isMinimized ? toggleMinimize : undefined}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', borderBottom: isMinimized ? 'none' : '1px solid var(--border)',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
          cursor: isMinimized ? 'pointer' : 'default',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', fontSize: 15,
            background: 'linear-gradient(135deg,#8B5CF6,#6366F1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            ✨
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Athena</p>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>AI Career Assistant</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', animation: 'pulseDot 2s infinite' }} />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Online</span>
          </div>
          {!isMinimized && (
            <button onClick={clearChat} title="Clear chat" style={headerBtnStyle}>
              <Trash2 size={14} />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); toggleMinimize(); }} title={isMinimized ? 'Expand' : 'Minimize'} style={headerBtnStyle}>
            {isMinimized ? <ChevronUp size={14} /> : <Minus size={14} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); closePanel(); }} title="Close" style={headerBtnStyle}>
            <X size={14} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>
                  Hi, I'm Athena.
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>I can help you with:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {CAPABILITIES.map(c => (
                    <span key={c} style={{
                      fontSize: 11, padding: '5px 10px', borderRadius: 20,
                      background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                      color: 'var(--badge-primary-text)',
                    }}>
                      {c}
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Ask me anything about your career.
                </p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <AthenaMessage
                  key={msg.id}
                  message={msg}
                  isLast={i === messages.length - 1}
                  onRegenerate={regenerate}
                  onRevealDone={markRevealDone}
                />
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask Athena anything..."
              disabled={isSending}
              style={{
                flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border-light)',
                borderRadius: 10, padding: '9px 12px', color: 'var(--text-primary)',
                fontSize: 13, outline: 'none', opacity: isSending ? 0.6 : 1, fontFamily: 'var(--font)',
              }}
            />
            <button
              onClick={handleSend}
              disabled={isSending || !input.trim()}
              style={{
                width: 36, height: 36, borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #6366F1, #4f52d9)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isSending || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: isSending || !input.trim() ? 0.5 : 1, flexShrink: 0,
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const headerBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--text-muted)', display: 'flex', padding: 2,
};
