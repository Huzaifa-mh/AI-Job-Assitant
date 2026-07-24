export default function Spinner({ size = 20, color = 'var(--primary)', thickness = 2 }) {
  return (
    <div style={{
      width:       size,
      height:      size,
      borderRadius:'50%',
      border:      `${thickness}px solid rgba(99,102,241,0.2)`,
      borderTop:   `${thickness}px solid ${color}`,
      animation:   'spin 0.75s linear infinite',
      flexShrink:  0,
    }} />
  );
}

// Full page loading screen
export function PageLoader() {
  return (
    <div style={{
      minHeight:      '100vh',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      gap:            16,
      background:     'var(--bg)',
    }}>
      <Spinner size={36} thickness={3} />
      <p style={{ fontSize:13, color:'var(--text-secondary)' }}>Loading...</p>
    </div>
  );
}

// Skeleton block
export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius, ...style }}
    />
  );
}