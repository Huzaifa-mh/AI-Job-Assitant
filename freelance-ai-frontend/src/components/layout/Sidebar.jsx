import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import {
  LayoutDashboard, FileText, Briefcase, TrendingUp,
  MessageSquare, Zap, BarChart3, User, LogOut,
  Sparkles, ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { to:'/dashboard',   icon: LayoutDashboard, label:'Dashboard',    desc:'Overview'         },
  { to:'/resume',      icon: FileText,         label:'Resume',       desc:'Upload & parse'   },
  { to:'/jobs',        icon: Briefcase,        label:'Job Matching', desc:'Find opportunities'},
  { to:'/skills',      icon: TrendingUp,       label:'Skill Gap',    desc:'What to learn'    },
  { to:'/proposals',   icon: Zap,              label:'Proposals',    desc:'AI cover letters' },
  { to:'/negotiation', icon: MessageSquare,    label:'Negotiation',  desc:'Practice deals'   },
  { to:'/analytics',   icon: BarChart3,        label:'Analytics',    desc:'Career insights'  },
  { to:'/profile',     icon: User,             label:'Profile',      desc:'Your account'     },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside style={{
      width:        'var(--sidebar-width)',
      minHeight:    '100vh',
      background:   'var(--bg-card)',
      borderRight:  '1px solid var(--border)',
      display:      'flex',
      flexDirection:'column',
      position:     'fixed',
      top:          0,
      left:         0,
      zIndex:       100,
      overflowY:    'auto',
    }}>

      {/* ── Logo ── */}
      <div style={{
        padding:      '20px 16px 16px',
        borderBottom: '1px solid var(--border)',
        marginBottom: 8,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {/* Logo mark */}
          <div style={{
            width:          36,
            height:         36,
            borderRadius:   10,
            background:     'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            boxShadow:      '0 4px 14px rgba(99,102,241,0.4)',
            flexShrink:     0,
          }}>
            <Sparkles size={16} color="white" />
          </div>

          <div>
            <p style={{
              fontSize:   13,
              fontWeight: 700,
              color:      'var(--text-primary)',
              lineHeight: 1.2,
            }}>
              FreelanceAI
            </p>
            <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>
              Career Assistant
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{
        flex:          1,
        padding:       '4px 10px',
        display:       'flex',
        flexDirection: 'column',
        gap:           2,
      }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label }, idx) => (
          <NavLink
            key={to}
            to={to}
            style={{ textDecoration:'none' }}
          >
            {({ isActive }) => (
              <div
                className={`anim-slideIn delay-${Math.min(idx + 1, 5)}`}
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          10,
                  padding:      '9px 12px',
                  borderRadius: 10,
                  cursor:       'pointer',
                  transition:   'all 0.15s ease',
                  position:     'relative',
                  background:   isActive
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.12))'
                    : 'transparent',
                  borderLeft:   `2px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = 'var(--bg-elevated)';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Icon */}
                <div style={{
                  width:          28,
                  height:         28,
                  borderRadius:   8,
                  background:     isActive ? 'rgba(99,102,241,0.2)' : 'transparent',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  flexShrink:     0,
                  transition:     'all 0.15s',
                }}>
                  <Icon
                    size={15}
                    color={isActive ? '#A5B4FC' : 'var(--text-secondary)'}
                  />
                </div>

                {/* Label */}
                <span style={{
                  fontSize:   13,
                  fontWeight: isActive ? 600 : 400,
                  color:      isActive ? '#E0E7FF' : 'var(--text-secondary)',
                  transition: 'color 0.15s',
                  flex:       1,
                }}>
                  {label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <ChevronRight size={12} color="#6366F1" />
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Divider ── */}
      <div style={{ height:1, background:'var(--border)', margin:'8px 16px' }} />

      {/* ── User card ── */}
      <div style={{ padding:'8px 10px 16px' }}>
        <div style={{
          background:   'var(--bg-elevated)',
          borderRadius: 12,
          padding:      '10px 12px',
          border:       '1px solid var(--border)',
          display:      'flex',
          alignItems:   'center',
          gap:          10,
        }}>
          {/* Avatar */}
          <div style={{
            width:          32,
            height:         32,
            borderRadius:   '50%',
            background:     'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       11,
            fontWeight:     700,
            color:          'white',
            flexShrink:     0,
          }}>
            {getInitials(user?.full_name)}
          </div>

          {/* Name + email */}
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{
              fontSize:     12,
              fontWeight:   600,
              color:        'var(--text-primary)',
              whiteSpace:   'nowrap',
              overflow:     'hidden',
              textOverflow: 'ellipsis',
            }}>
              {user?.full_name || 'User'}
            </p>
            <p style={{
              fontSize:     10,
              color:        'var(--text-muted)',
              whiteSpace:   'nowrap',
              overflow:     'hidden',
              textOverflow: 'ellipsis',
            }}>
              {user?.email || ''}
            </p>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{
              background:   'none',
              border:       'none',
              color:        'var(--text-muted)',
              cursor:       'pointer',
              padding:      4,
              borderRadius: 6,
              display:      'flex',
              alignItems:   'center',
              transition:   'color 0.15s',
              flexShrink:   0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}