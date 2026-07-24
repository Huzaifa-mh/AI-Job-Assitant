import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import { useState } from 'react';

const PAGE_META = {
  '/dashboard':   { title:'Dashboard',          sub:'Welcome back'                     },
  '/resume':      { title:'Resume',             sub:'Upload and manage your resumes'   },
  '/jobs':        { title:'Job Matching',       sub:'Find and match opportunities'     },
  '/skills':      { title:'Skill Gap Analysis', sub:'Identify what to learn next'      },
  '/proposals':   { title:'Proposal Generator', sub:'AI-powered cover letters'         },
  '/negotiation': { title:'Negotiation Simulator', sub:'Practice client negotiations'  },
  '/analytics':   { title:'Career Analytics',   sub:'Track your progress over time'   },
  '/profile':     { title:'Profile',            sub:'Manage your account settings'    },
};

export default function Topbar() {
  const { user }    = useAuth();
  const { pathname }= useLocation();
  const meta        = PAGE_META[pathname] || { title:'FreelanceAI', sub:'' };
  const [showNotif, setShowNotif] = useState(false);

  const notifications = [
    { text:'Your resume was processed successfully', time:'2m ago',  type:'success' },
    { text:'3 new job matches found for your skills', time:'1h ago', type:'info'    },
    { text:'Complete your profile for better results', time:'1d ago',type:'warning' },
  ];

  return (
    <header style={{
      height:       60,
      background:   'rgba(11,16,32,0.9)',
      backdropFilter:'blur(12px)',
      borderBottom: '1px solid var(--border)',
      display:      'flex',
      alignItems:   'center',
      justifyContent:'space-between',
      padding:      '0 28px',
      position:     'sticky',
      top:          0,
      zIndex:       50,
    }}>

      {/* Left — Page title */}
      <div>
        <h1 style={{
          fontSize:   16,
          fontWeight: 600,
          color:      'var(--text-primary)',
          lineHeight: 1.2,
        }}>
          {meta.title}
        </h1>
        {meta.sub && (
          <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:1 }}>
            {meta.sub}
          </p>
        )}
      </div>

      {/* Right — Actions */}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>

        {/* Notification bell */}
        <div style={{ position:'relative' }}>
          <button
            onClick={() => setShowNotif(s => !s)}
            style={{
              width:          36,
              height:         36,
              borderRadius:   10,
              background:     showNotif ? 'var(--bg-elevated)' : 'transparent',
              border:         '1px solid transparent',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              cursor:         'pointer',
              color:          'var(--text-secondary)',
              transition:     'all 0.15s',
              position:       'relative',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            onMouseLeave={e => { if (!showNotif) e.currentTarget.style.background = 'transparent'; }}
          >
            <Bell size={16} />
            {/* Unread dot */}
            <div style={{
              position:   'absolute',
              top:        6,
              right:      6,
              width:      7,
              height:     7,
              borderRadius:'50%',
              background: 'var(--primary)',
              border:     '1.5px solid var(--bg-card)',
            }} />
          </button>

          {/* Dropdown */}
          {showNotif && (
            <div style={{
              position:     'absolute',
              top:          44,
              right:        0,
              width:        300,
              background:   'var(--bg-card)',
              border:       '1px solid var(--border)',
              borderRadius: 12,
              boxShadow:    '0 20px 60px rgba(0,0,0,0.4)',
              overflow:     'hidden',
              animation:    'fadeInUp 0.2s ease',
              zIndex:       200,
            }}>
              <div style={{ padding:'12px 14px', borderBottom:'1px solid var(--border)' }}>
                <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>Notifications</p>
              </div>
              {notifications.map((n, i) => (
                <div key={i} style={{
                  padding:    '10px 14px',
                  borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                  display:    'flex',
                  gap:        10,
                  cursor:     'pointer',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width:      6,
                    height:     6,
                    borderRadius:'50%',
                    background: n.type === 'success' ? '#10B981' : n.type === 'warning' ? '#F59E0B' : '#6366F1',
                    flexShrink: 0,
                    marginTop:  5,
                  }} />
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:12, color:'var(--text-primary)', lineHeight:1.5 }}>{n.text}</p>
                    <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width:1, height:20, background:'var(--border)' }} />

        {/* User avatar */}
        <div style={{
          display:    'flex',
          alignItems: 'center',
          gap:        8,
          padding:    '4px 10px 4px 4px',
          borderRadius: 10,
          cursor:     'pointer',
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{
            width:          30,
            height:         30,
            borderRadius:   '50%',
            background:     'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       11,
            fontWeight:     700,
            color:          'white',
          }}>
            {getInitials(user?.full_name)}
          </div>
          <p style={{ fontSize:12, fontWeight:500, color:'var(--text-primary)' }}>
            {user?.full_name?.split(' ')[0] || 'User'}
          </p>
        </div>
      </div>
    </header>
  );
}