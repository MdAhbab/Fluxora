import { lazy, Suspense, type FC } from 'react';
import { Navigate, useParams } from 'react-router';
import { useAuth } from '../../lib/auth';
import { ROLE_MODULES } from '../../lib/roles';
import { Shell } from '../components/shared/Shell';

// Per-role, per-module code splitting: a resident never downloads the admin
// Finance/Operations bundles, and vice-versa. Each module is its own lazy chunk.
const REGISTRY: Record<string, Record<string, FC>> = {
  admin: {
    overview: lazy(() => import('../modules/admin/Overview')),
    finance: lazy(() => import('../modules/admin/Finance')),
    operations: lazy(() => import('../modules/admin/Operations')),
    security: lazy(() => import('../modules/admin/Security')),
    community: lazy(() => import('../modules/admin/Community')),
    estate: lazy(() => import('../modules/admin/Estate')),
  },
  committee: {
    overview: lazy(() => import('../modules/committee/Overview')),
    approvals: lazy(() => import('../modules/committee/Approvals')),
    finance: lazy(() => import('../modules/committee/Finance')),
    community: lazy(() => import('../modules/committee/Community')),
    estate: lazy(() => import('../modules/committee/Estate')),
  },
  resident: {
    home: lazy(() => import('../modules/resident/Home')),
    billing: lazy(() => import('../modules/resident/Billing')),
    services: lazy(() => import('../modules/resident/Services')),
    visitors: lazy(() => import('../modules/resident/Visitors')),
    community: lazy(() => import('../modules/resident/Community')),
    marketplace: lazy(() => import('../modules/resident/Marketplace')),
  },
  guard: {
    gatehouse: lazy(() => import('../modules/guard/Gatehouse')),
    expected: lazy(() => import('../modules/guard/Expected')),
    logs: lazy(() => import('../modules/guard/Logs')),
    incidents: lazy(() => import('../modules/guard/Incidents')),
  },
  staff: {
    tasks: lazy(() => import('../modules/staff/Tasks')),
    attendance: lazy(() => import('../modules/staff/Attendance')),
    payroll: lazy(() => import('../modules/staff/Payroll')),
    noticeboard: lazy(() => import('../modules/staff/Noticeboard')),
  },
};

function ModuleFallback() {
  return <div className="py-24 grid place-items-center mono text-[0.7rem] uppercase tracking-[0.22em] text-[var(--ink-muted)] animate-pulse">Loading…</div>;
}

export function Dashboard() {
  const { session } = useAuth();
  const { activeModule } = useParams();
  if (!session) return <Navigate to="/login" replace />;
  const cfg = ROLE_MODULES[session.role];
  const Mod = REGISTRY[session.role]?.[activeModule || ''];
  if (!Mod) return <Navigate to={`/dashboard/${cfg.defaultModule}`} replace />;
  return (
    <Shell>
      <Suspense fallback={<ModuleFallback />}>
        <Mod />
      </Suspense>
    </Shell>
  );
}
