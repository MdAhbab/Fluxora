import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, RequireAuth, useAuth } from '../lib/auth';
import { DataProvider } from '../lib/data';
import { ThemeProvider } from '../lib/theme';
import { ROLE_MODULES } from '../lib/roles';

// Route-level code splitting: each page is its own chunk so the initial load
// only ships the landing/auth path, not every role's dashboard + the ops console.
const Landing = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Signup = lazy(() => import('./pages/Signup').then(m => ({ default: m.Signup })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Software = lazy(() => import('./pages/Software').then(m => ({ default: m.Software })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));

function RouteFallback() {
  return (
    <div className="min-h-screen grid place-items-center bg-[var(--bg)] text-[var(--ink-muted)]">
      <span className="mono text-[0.7rem] uppercase tracking-[0.22em] animate-pulse">Loading…</span>
    </div>
  );
}

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
            <Suspense fallback={<RouteFallback />}>
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
            </Suspense>
          </HashRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
