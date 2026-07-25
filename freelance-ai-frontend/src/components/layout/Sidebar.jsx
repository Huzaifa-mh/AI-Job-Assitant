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

  const W = collapsed ? 64 : 240;

  return (
    <>
      {/* Inject CSS variable for sidebar width */}
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

        {/* ── Logo + collapse toggle ── */}
        <div style={{
          padding:        '16px 12px',
          borderBottom:   '1px solid var(--border)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap:            8,
          marginBottom:   4,
          minHeight:      64,
        }}>
          {/* Logo mark — always visible */}
          <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
            <div style={{
              width:34, height:34, borderRadius:9, flexShrink:0,
              background:'linear-gradient(135deg,#6366F1,#8B5CF6)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 4px 14px rgba(99,102,241,0.35)',
            }}>
              <Sparkles size={15} color="white" />
            </div>
            {!collapsed && (
              <div style={{ overflow:'hidden', whiteSpace:'nowrap' }}>
                <p style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', lineHeight:1.2 }}>FreelanceAI</p>
                <p style={{ fontSize:10, color:'var(--text-muted)' }}>Career Assistant</p>
              </div>
            )}
          </div>

          {/* Collapse toggle */}
          {!collapsed && (
            <button
              onClick={toggle}
              title="Collapse sidebar"
              style={{
                background:'none', border:'1px solid var(--border)', cursor:'pointer',
                color:'var(--text-muted)', padding:5, borderRadius:7, display:'flex',
                alignItems:'center', flexShrink:0, transition:'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color='var(--text-primary)'; e.currentTarget.style.borderColor='var(--border-light)'; }}
              onMouseLeave={e => { e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.borderColor='var(--border)'; }}
            >
              <PanelLeftClose size={14} />
            </button>
          )}
        </div>

        {/* Collapsed expand button */}
        {collapsed && (
          <button
            onClick={toggle}
            title="Expand sidebar"
            style={{
              background:'none', border:'none', cursor:'pointer',
              color:'var(--text-muted)', padding:'8px 0', display:'flex',
              alignItems:'center', justifyContent:'center', width:'100%',
              transition:'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color='var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}
          >
            <PanelLeftOpen size={15} />
          </button>
        )}

        {/* ── Nav items ── */}
        <nav style={{
          flex:1, padding:`4px ${collapsed ? 8 : 10}px`,
          display:'flex', flexDirection:'column', gap:2,
        }}>
          {NAV_ITEMS.map(({ to, icon: Icon, label }, idx) => (
            <NavLink key={to} to={to} style={{ textDecoration:'none' }} title={collapsed ? label : undefined}>
              {({ isActive }) => (
                <div style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          10,
                  padding:      collapsed ? '9px 0' : '9px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 10,
                  cursor:       'pointer',
                  transition:   'all 0.15s ease',
                  background:   isActive
                    ? 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.12))'
                    : 'transparent',
                  borderLeft:   !collapsed ? `2px solid ${isActive ? 'var(--primary)' : 'transparent'}` : 'none',
                  position:     'relative',
                }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background='var(--bg-elevated)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background='transparent'; }}
                >
                  <div style={{
                    width:28, height:28, borderRadius:8, flexShrink:0,
                    background:     isActive ? 'rgba(99,102,241,0.2)' : 'transparent',
                    display:        'flex', alignItems:'center', justifyContent:'center',
                    transition:     'all 0.15s',
                  }}>
                    <Icon size={15} color={isActive ? '#A5B4FC' : 'var(--text-secondary)'} />
                  </div>
                  {!collapsed && (
                    <>
                      <span style={{
                        fontSize:13, fontWeight: isActive ? 600 : 400,
                        color:    isActive ? '#E0E7FF' : 'var(--text-secondary)',
                        flex:1, whiteSpace:'nowrap', overflow:'hidden',
                        transition:'color 0.15s',
                      }}>
                        {label}
                      </span>
                      {isActive && <ChevronRight size={12} color="#6366F1" />}
                    </>
                  )}

                  {/* Collapsed active dot */}
                  {collapsed && isActive && (
                    <div style={{
                      position:'absolute', right:4, top:'50%', transform:'translateY(-50%)',
                      width:4, height:4, borderRadius:'50%', background:'var(--primary)',
                    }} />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Divider ── */}
        <div style={{ height:1, background:'var(--border)', margin:`8px ${collapsed ? 8 : 16}px` }} />

        {/* ── User card ── */}
        <div style={{ padding:`8px ${collapsed ? 8 : 10}px 16px` }}>
          {collapsed ? (
            <button
              onClick={() => { logout(); navigate('/'); }}
              title="Sign out"
              style={{
                width:'100%', background:'none', border:'none', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                padding:'8px 0', borderRadius:8, color:'var(--text-muted)', transition:'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color='#EF4444'}
              onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}
            >
              <LogOut size={15} />
            </button>
          ) : (
            <div style={{
              background:'var(--bg-elevated)', borderRadius:12,
              padding:'10px 12px', border:'1px solid var(--border)',
              display:'flex', alignItems:'center', gap:10,
            }}>
              <div style={{
                width:30, height:30, borderRadius:'50%', flexShrink:0,
                background:'linear-gradient(135deg,#6366F1,#8B5CF6)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:11, fontWeight:700, color:'white',
              }}>
                {getInitials(user?.full_name)}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {user?.full_name}
                </p>
                <p style={{ fontSize:10, color:'var(--text-muted)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {user?.email}
                </p>
              </div>
              <button
                onClick={() => { logout(); navigate('/'); }}
                title="Sign out"
                style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', padding:4, borderRadius:6, display:'flex', flexShrink:0 }}
                onMouseEnter={e => e.currentTarget.style.color='#EF4444'}
                onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}