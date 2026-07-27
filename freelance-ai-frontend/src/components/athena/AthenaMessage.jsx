import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, RefreshCw } from 'lucide-react';

const REVEAL_CHARS_PER_TICK = 3;
const REVEAL_INTERVAL_MS    = 12;

const markdownComponents = {
  code: ({ inline, children, ...props }) => (
    inline
      ? <code style={{ background:'var(--bg)', padding:'2px 5px', borderRadius:4, fontSize:12 }} {...props}>{children}</code>
      : <code style={{ display:'block', whiteSpace:'pre-wrap' }} {...props}>{children}</code>
  ),
  pre: ({ children }) => (
    <pre style={{
      background:'var(--bg)', border:'1px solid var(--border)', borderRadius:8,
      padding:'10px 12px', overflowX:'auto', fontSize:12, margin:'6px 0',
    }}>
      {children}
    </pre>
  ),
  a: ({ children, ...props }) => (
    <a {...props} target="_blank" rel="noreferrer" style={{ color:'var(--primary)', textDecoration:'underline' }}>
      {children}
    </a>
  ),
  p: ({ children }) => <p style={{ margin:'0 0 6px 0' }}>{children}</p>,
};

export default function AthenaMessage({ message, isLast, onRegenerate, onRevealDone }) {
  const { id, role, content, pending, isError, animate } = message;
  const isUser = role === 'user';
  const [displayed, setDisplayed] = useState(animate ? '' : content);
  const [copied, setCopied]       = useState(false);

  useEffect(() => {
    if (!animate) { setDisplayed(content); return; }

    let i = 0;
    const interval = setInterval(() => {
      i += REVEAL_CHARS_PER_TICK;
      setDisplayed(content.slice(0, i));
      if (i >= content.length) {
        clearInterval(interval);
        onRevealDone(id);
      }
    }, REVEAL_INTERVAL_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: 8,
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%', flexShrink: 0, fontSize: 12,
        background: isUser
          ? 'linear-gradient(135deg,#10B981,#059669)'
          : 'linear-gradient(135deg,#8B5CF6,#6366F1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isUser ? '🧑‍💻' : '✨'}
      </div>

      <div className="anim-fadeInUp" style={{
        maxWidth: '78%',
        background: isError
          ? 'rgba(239,68,68,0.1)'
          : isUser
            ? 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.15))'
            : 'var(--bg-elevated)',
        border: `1px solid ${isError ? 'rgba(239,68,68,0.3)' : isUser ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        padding: '9px 12px',
      }}>
        {pending ? (
          <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '2px 0' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)',
                animation: `typingDot 1.2s ease ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: isError ? '#EF4444' : 'var(--text-primary)', lineHeight: 1.6 }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {displayed}
            </ReactMarkdown>
          </div>
        )}

        {!pending && (
          <div style={{ display: 'flex', gap: 10, marginTop: 4, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
            <button onClick={handleCopy} title="Copy" style={iconBtnStyle}>
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
            {!isUser && isLast && !isError && (
              <button onClick={onRegenerate} title="Regenerate" style={iconBtnStyle}>
                <RefreshCw size={12} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const iconBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--text-muted)', display: 'flex', padding: 0,
};
