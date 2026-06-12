import { HashRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, RequireAuth, useAuth } from '../lib/auth';
import { DataProvider } from '../lib/data';
import { ThemeProvider } from '../lib/theme';
import { ROLE_MODULES } from '../lib/roles';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { NotFound } from './pages/NotFound';
import { Settings } from './pages/Settings';
import { Software } from './pages/Software';
import { Dashboard } from './pages/Dashboard';

function DashboardRedirect() {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (session.role === 'software') return <Navigate to="/software" replace />;
  return <Navigate to={`/dashboard/${ROLE_MODULES[session.role].defaultModule}`} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <HashRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/dashboard/:activeModule" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
            <Route path="/software" element={<RequireAuth allow={['software']}><Software /></RequireAuth>} />
            <Route path="/software/:activeModule" element={<RequireAuth allow={['software']}><Software /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </HashRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
