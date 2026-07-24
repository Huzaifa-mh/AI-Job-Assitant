import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Landing     from './pages/Landing';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Dashboard   from './pages/Dashboard';
import Resume      from './pages/Resume';
import Jobs        from './pages/Jobs';
import Skills      from './pages/Skills';
import Proposals   from './pages/Proposals';
import Negotiation from './pages/Negotiation';
import Analytics   from './pages/Analytics';
import Profile     from './pages/Profile';

// Protected route wrapper
function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"        element={<Landing />}  />
      <Route path="/login"   element={<Login />}    />
      <Route path="/register"element={<Register />} />

      {/* Protected */}
      <Route path="/dashboard"   element={<Protected><Dashboard   /></Protected>} />
      <Route path="/resume"      element={<Protected><Resume      /></Protected>} />
      <Route path="/jobs"        element={<Protected><Jobs        /></Protected>} />
      <Route path="/skills"      element={<Protected><Skills      /></Protected>} />
      <Route path="/proposals"   element={<Protected><Proposals   /></Protected>} />
      <Route path="/negotiation" element={<Protected><Negotiation /></Protected>} />
      <Route path="/analytics"   element={<Protected><Analytics   /></Protected>} />
      <Route path="/profile"     element={<Protected><Profile     /></Protected>} />

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
    </AuthProvider>
  );
}