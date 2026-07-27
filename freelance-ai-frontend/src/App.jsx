import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// ── Completed pages ──
import Landing     from './pages/Landing';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Dashboard   from './pages/Dashboard';
import Resume      from './pages/Resume';
import Jobs        from './pages/Jobs';
import Skills      from './pages/Skills';
import Proposals   from './pages/Proposals';

// ── Placeholder for pages not built yet ──
import AppLayout from './components/layout/AppLayout';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';

// ── Global AI assistant ──
import AthenaWidget from './components/athena/AthenaWidget';

function ComingSoon({ title }) {
  return (
    <AppLayout>
      <div style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        minHeight:      '60vh',
        gap:            16,
        textAlign:      'center',
      }}>
        <div style={{
          width:          64,
          height:         64,
          borderRadius:   16,
          background:     'rgba(99,102,241,0.1)',
          border:         '1px solid rgba(99,102,241,0.2)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontSize:       28,
        }}>
          🚧
        </div>
        <p style={{ fontSize:20, fontWeight:700, color:'var(--text-primary)' }}>{title}</p>
        <p style={{ fontSize:14, color:'var(--text-secondary)', maxWidth:320 }}>
          This page is being built. It will be available in the next batch.
        </p>
      </div>
    </AppLayout>
  );
}

// ── Protected route wrapper ──
function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<Landing />}  />
      <Route path="/login"    element={<Login />}    />
      <Route path="/register" element={<Register />} />

      {/* Protected — built */}
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/resume"    element={<Protected><Resume    /></Protected>} />

      {/* Protected — placeholders (swap as batches arrive) */}
     <Route path="/jobs"        element={<Protected><Jobs        /></Protected>} />
      <Route path="/skills"      element={<Protected><Skills      /></Protected>} />
      <Route path="/proposals"   element={<Protected><Proposals /></Protected>} />
      <Route path="/negotiation" element={<Protected><ComingSoon title="Negotiation Simulator"/></Protected>} />
      <Route path="/analytics"   element={<Protected><Analytics title="Career Analytics"    /></Protected>} />
      <Route path="/profile"     element={<Protected><Profile title="Profile"             /></Protected>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <AthenaWidget />
    </AuthProvider>
  );
}