import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  label,
  error,
  hint,
  icon,
  suffix,
  className = '',
  style     = {},
  ...props
}) {
  const [focused,     setFocused]     = useState(false);
  const [showPassword,setShowPassword]= useState(false);

  const isPassword = props.type === 'password';
  const inputType  = isPassword && showPassword ? 'text' : props.type;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6, ...style }}>

      {/* Label */}
      {label && (
        <label style={{
          fontSize:   12,
          fontWeight: 500,
          color:      focused ? 'var(--primary)' : 'var(--text-secondary)',
          transition: 'color 0.15s',
          letterSpacing: '0.01em',
        }}>
          {label}
          {props.required && <span style={{ color:'var(--danger)', marginLeft:3 }}>*</span>}
        </label>
      )}

      {/* Input wrapper */}
      <div style={{ position:'relative' }}>
        {/* Left icon */}
        {icon && (
          <span style={{
            position:  'absolute',
            left:      12,
            top:       '50%',
            transform: 'translateY(-50%)',
            color:     focused ? 'var(--primary)' : 'var(--text-muted)',
            display:   'flex',
            transition:'color 0.15s',
            pointerEvents: 'none',
          }}>
            {icon}
          </span>
        )}

        <input
          {...props}
          type={inputType}
          onFocus={(e) => { setFocused(true);  props.onFocus?.(e); }}
          onBlur={(e)  => { setFocused(false); props.onBlur?.(e);  }}
          style={{
            width:           '100%',
            background:      'var(--bg-elevated)',
            border:          `1px solid ${error ? 'var(--danger)' : focused ? 'var(--primary)' : 'var(--border-light)'}`,
            borderRadius:    10,
            padding:         `10px ${(isPassword || suffix) ? '40px' : '14px'} 10px ${icon ? '38px' : '14px'}`,
            color:           'var(--text-primary)',
            fontSize:        13,
            outline:         'none',
            transition:      'all 0.18s',
            boxShadow:       focused ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
          }}
        />

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(s => !s)}
            style={{
              position:   'absolute', right: 12, top: '50%',
              transform:  'translateY(-50%)',
              background: 'none', border: 'none',
              color:      'var(--text-muted)', cursor: 'pointer',
              display:    'flex', alignItems: 'center',
            }}
          >
            {showPassword ? <EyeOff size={14}/> : <Eye size={14}/>}
          </button>
        )}

        {/* Right suffix */}
        {suffix && !isPassword && (
          <span style={{
            position:  'absolute', right: 12, top: '50%',
            transform: 'translateY(-50%)',
            color:     'var(--text-muted)', fontSize: 12,
          }}>
            {suffix}
          </span>
        )}
      </div>

      {/* Error or hint */}
      {error && (
        <span style={{ fontSize:11, color:'var(--danger)', display:'flex', alignItems:'center', gap:4 }}>
          ⚠ {error}
        </span>
      )}
      {hint && !error && (
        <span style={{ fontSize:11, color:'var(--text-muted)' }}>{hint}</span>
      )}
    </div>
  );
}