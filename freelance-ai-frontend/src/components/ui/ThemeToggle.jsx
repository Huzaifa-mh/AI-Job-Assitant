import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width:          36,
        height:         36,
        borderRadius:   10,
        background:     'transparent',
        border:         '1px solid transparent',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        cursor:         'pointer',
        color:          'var(--text-secondary)',
        transition:     'background 0.15s, color 0.15s',
        position:       'relative',
        overflow:       'hidden',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span
        key={theme}
        style={{
          display:    'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation:  'themeIconIn 0.25s ease',
        }}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </span>
    </button>
  );
}
