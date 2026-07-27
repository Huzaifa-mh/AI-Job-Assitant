import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import {
  LayoutDashboard, FileText, Briefcase, TrendingUp,
  MessageSquare, Zap, BarChart3, User, LogOut,
  Sparkles, ChevronRight, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';

const NAV_ITEMS = [
  { to:'/dashboard',   icon: LayoutDashboard, label:'Dashboard'    },
  { to:'/resume',      icon: FileText,         label:'Resume'       },
  { to:'/jobs',        icon: Briefcase,        label:'Job Matching' },
  { to:'/skills',      icon: TrendingUp,       label:'Skill Gap'    },
  { to:'/proposals',   icon: Zap,              label:'Proposals'    },
  { to:'/negotiation', icon: MessageSquare,    label:'Negotiation'  },
  { to:'/analytics',   icon: BarChart3,        label:'Analytics'    },
  { to:'/profile',     icon: User,             label:'Profile'      },
];

/* ── Design tokens for sidebar ── */
const ICON_SIZE          = 18;    // nav icon size
const ICON_BOX           = 25;    // icon wrapper width & height ← your request
const LOGOUT_ICON_SIZE   = 18;    // logout icon ← your request
const COLLAPSE_ICON_SIZE = 16;    // collapse/expand toggle icon
const ACTIVE_ARROW_SIZE  = 16;    // active page chevron ← your request
const EMAIL_COLOR        = '#9FA3AC'; // ← your request

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar_collapsed') === 'true'
  );

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar_collapsed', String(next));
  };

  const W = collapsed ? 72 : 248;

  return (
    <>
      <style>{`:root { --sidebar-width: ${W}px; }`}</style>

      <aside style={{
        width:         W,
        minHeight:     '100vh',
        background:    'var(--bg-card)',
        borderRight:   '1px solid var(--border)',
        display:       'flex',
        flexDirection: 'column',
        position:      'fixed',
        top:           0,
        left:          0,
        zIndex:        100,
        overflowY:     'auto',
        overflowX:     'hidden',
        transition:    'width 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}>

        {/* ════════════════ LOGO + COLLAPSE TOGGLE ════════════════ */}
        <div style={{
          padding:        '18px 14px',
          borderBottom:   '1px solid var(--border)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap:            10,
          minHeight:      68,
        }}>

          {/* Logo row */}
          <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
            {/* Logo mark */}
            <div style={{
              width:          36,
              height:         36,
              borderRadius:   10,
              background:     'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              boxShadow:      '0 4px 14px rgba(99,102,241,0.35)',
              flexShrink:     0,
            }}>
              <Sparkles size={17} color="white" />
            </div>

            {/* Name — hidden when collapsed */}
            {!collapsed && (
              <div style={{ overflow:'hidden', minWidth:0 }}>
                <p style={{
                  fontSize:     13,
                  fontWeight:   700,
                  color:        'var(--text-primary)',
                  lineHeight:   1.25,
                  letterSpacing:'0.03em',
                  whiteSpace:   'nowrap',
                }}>
                  FreelanceAI
                </p>
                <p style={{
                  fontSize:     10,
                  color:        EMAIL_COLOR,
                  letterSpacing:'0.04em',
                  whiteSpace:   'nowrap',
                  marginTop:    2,
                }}>
                  Career Assistant
                </p>
              </div>
            )}
          </div>

          {/* Collapse button — only shown when expanded */}
          {!collapsed && (
            <button
              onClick={toggle}
              title="Collapse sidebar"
              style={{
                width:          32,
                height:         32,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                background:     'transparent',
                border:         '1px solid var(--border)',
                borderRadius:   8,
                cursor:         'pointer',
                color:          'var(--text-muted)',
                flexShrink:     0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background    = 'var(--bg-elevated)';
                e.currentTarget.style.color         = 'var(--text-primary)';
                e.currentTarget.style.borderColor   = 'var(--border-light)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background    = 'transparent';
                e.currentTarget.style.color         = 'var(--text-muted)';
                e.currentTarget.style.borderColor   = 'var(--border)';
              }}
            >
              <PanelLeftClose size={COLLAPSE_ICON_SIZE} />
            </button>
          )}
        </div>

        {/* Expand button — shown when collapsed */}
        {collapsed && (
          <button
            onClick={toggle}
            title="Expand sidebar"
            style={{
              width:          '100%',
              height:         40,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              background:     'transparent',
              border:         'none',
              cursor:         'pointer',
              color:          'var(--text-muted)',
              marginTop:      4,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <PanelLeftOpen size={COLLAPSE_ICON_SIZE} />
          </button>
        )}

        {/* ════════════════ NAVIGATION ════════════════ */}
        <nav style={{
          flex:    1,
          padding: `6px ${collapsed ? 10 : 12}px`,
          display: 'flex',
          flexDirection: 'column',
          gap:     3,
        }}>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              style={{ textDecoration:'none' }}
            >
              {({ isActive }) => (
                <div
                  style={{
                    display:        'flex',
                    alignItems:     'center',
                    gap:            10,
                    padding:        collapsed ? '10px 0' : '10px 12px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius:   10,
                    cursor:         'pointer',
                    position:       'relative',
                    background:     isActive
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.10))'
                      : 'transparent',
                    borderLeft:     !collapsed
                      ? `2px solid ${isActive ? '#6366F1' : 'transparent'}`
                      : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.background = 'var(--bg-elevated)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {/* Icon box — 25×25 as requested */}
                  <div style={{
                    width:          ICON_BOX,
                    height:         ICON_BOX,
                    borderRadius:   7,
                    background:     isActive ? 'rgba(99,102,241,0.2)' : 'transparent',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    flexShrink:     0,
                  }}>
                    <Icon
                      size={ICON_SIZE}
                      color={isActive ? 'var(--badge-primary-text)' : 'var(--text-secondary)'}
                    />
                  </div>

                  {/* Label */}
                  {!collapsed && (
                    <>
                      <span style={{
                        fontSize:     13,
                        fontWeight:   isActive ? 600 : 400,
                        color:        isActive ? 'var(--badge-primary-text)' : 'var(--text-secondary)',
                        flex:         1,
                        whiteSpace:   'nowrap',
                        overflow:     'hidden',
                        letterSpacing:'0.03em',
                      }}>
                        {label}
                      </span>

                      {/* Active arrow — size 16 as requested */}
                      {isActive && (
                        <ChevronRight
                          size={ACTIVE_ARROW_SIZE}
                          color="#6366F1"
                          style={{ flexShrink:0 }}
                        />
                      )}
                    </>
                  )}

                  {/* Collapsed: active indicator dot */}
                  {collapsed && isActive && (
                    <div style={{
                      position:     'absolute',
                      right:        6,
                      top:          '50%',
                      transform:    'translateY(-50%)',
                      width:        4,
                      height:       4,
                      borderRadius: '50%',
                      background:   'var(--primary)',
                    }} />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ════════════════ DIVIDER ════════════════ */}
        <div style={{
          height:  1,
          background: 'var(--border)',
          margin: `6px ${collapsed ? 10 : 16}px`,
        }} />

        {/* ════════════════ USER FOOTER ════════════════ */}
        <div style={{ padding: `6px ${collapsed ? 10 : 12}px 18px` }}>

          {/* Collapsed — just logout icon */}
          {collapsed ? (
            <button
              onClick={() => { logout(); navigate('/'); }}
              title="Sign out"
              style={{
                width:          '100%',
                height:         44,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                background:     'transparent',
                border:         'none',
                cursor:         'pointer',
                color:          'var(--text-muted)',
                borderRadius:   10,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Logout icon — 18×18 as requested */}
              <LogOut size={LOGOUT_ICON_SIZE} />
            </button>

          ) : (
            /* Expanded — full user card */
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
                width:          34,
                height:         34,
                borderRadius:   '50%',
                background:     'linear-gradient(135deg, #6366F1, #8B5CF6)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontSize:       12,
                fontWeight:     700,
                color:          'white',
                flexShrink:     0,
                letterSpacing:  '0.03em',
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
                  letterSpacing:'0.03em',
                  marginBottom: 2,
                }}>
                  {user?.full_name || 'User'}
                </p>
                {/* Email — color #9FA3AC as requested */}
                <p style={{
                  fontSize:     10,
                  color:        EMAIL_COLOR,
                  whiteSpace:   'nowrap',
                  overflow:     'hidden',
                  textOverflow: 'ellipsis',
                  letterSpacing:'0.02em',
                }}>
                  {user?.email || ''}
                </p>
              </div>

              {/* Logout button — icon 18×18 as requested */}
              <button
                onClick={() => { logout(); navigate('/'); }}
                title="Sign out"
                style={{
                  width:          30,
                  height:         30,
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  background:     'transparent',
                  border:         'none',
                  cursor:         'pointer',
                  color:          'var(--text-muted)',
                  borderRadius:   7,
                  flexShrink:     0,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color       = '#EF4444';
                  e.currentTarget.style.background  = 'rgba(239,68,68,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color       = 'var(--text-muted)';
                  e.currentTarget.style.background  = 'transparent';
                }}
              >
                <LogOut size={LOGOUT_ICON_SIZE} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}