import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import type { Role } from './roles';
import { ROLE_MODULES, ROLE_LABEL } from './roles';
import { DEMO_ACCOUNTS } from './mock';
import { authApi, authStore, ApiError, type ApiUser } from './api';

export type Session = {
  role: Role;
  name: string;
  email: string;
  flat?: string;
  buildingId: string;
  buildingIds: string[];
  userId?: number;
  token?: string;     // present only for real backend sessions
  demo?: boolean;     // true when running on the offline demo fallback
};

type AuthCtx = {
  session: Session | null;
  ready: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  switchBuilding: (id: string) => void;
  patchSession: (partial: Partial<Session>) => void;
};

const Ctx = createContext<AuthCtx>(null as any);
const KEY = 'flx_session_v1';

const BACKEND_ROLES: Role[] = ['admin', 'committee', 'resident', 'guard', 'staff'];

function roleFromApi(role: string | undefined): Role {
  return (BACKEND_ROLES as string[]).includes(role || '') ? (role as Role) : 'resident';
}

function sessionFromApi(user: ApiUser, building: any, token?: string): Session {
  const buildingId = building?.id != null ? String(building.id) : '';
  return {
    role: roleFromApi(user.role),
    name: user.name,
    email: user.email,
    buildingId,
    buildingIds: buildingId ? [buildingId] : [],
    userId: user.id,
    token,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [ready, setReady] = useState(false);

  // Persist session locally.
  useEffect(() => {
    if (session) localStorage.setItem(KEY, JSON.stringify(session));
    else localStorage.removeItem(KEY);
  }, [session]);

  // On boot, if a real token exists, confirm it with the backend.
  useEffect(() => {
    let alive = true;
    (async () => {
      const token = authStore.getToken();
      if (token) {
        try {
          const { user, building } = await authApi.me();
          if (alive && user) setSession(s => ({ ...sessionFromApi(user, building, token), buildingIds: s?.buildingIds?.length ? s.buildingIds : (building?.id != null ? [String(building.id)] : []) }));
        } catch {
          // Token invalid/expired — fall back to whatever local session we had.
          authStore.clear();
        }
      }
      if (alive) setReady(true);
    })();
    return () => { alive = false; };
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    // 1) Try the real backend.
    try {
      const payload = await authApi.login(email, pass);
      if (payload?.token && payload.user) {
        authStore.setSession(payload);
        setSession(sessionFromApi(payload.user, payload.building, payload.token));
        return true;
      }
    } catch (err) {
      // Network or non-auth error: fall through to demo only for known demo emails.
      if (err instanceof ApiError && err.status !== 400 && err.status !== 401) {
        // server reachable but unexpected — still try demo fallback below
      }
    }
    // 2) Offline / unseeded fallback: known demo accounts get a local (no-token)
    //    session — but only with the correct demo password, so a rejected
    //    backend login can't be bypassed by the fallback.
    const acct = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase() && a.pass === pass);
    if (acct) {
      authStore.clear();
      setSession({
        role: acct.role,
        name: acct.name,
        email: acct.email,
        flat: acct.flat,
        buildingId: 'gh',
        buildingIds: acct.role === 'admin' || acct.role === 'software' ? ['gh', 'br', 'dr'] : ['gh'],
        demo: true,
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    authStore.clear();
    setSession(null);
  };

  const switchBuilding = (id: string) => setSession(s => (s ? { ...s, buildingId: id } : s));
  const patchSession = (partial: Partial<Session>) => setSession(s => (s ? { ...s, ...partial } : s));

  return (
    <Ctx.Provider value={{ session, ready, login, logout, switchBuilding, patchSession }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);

export function RequireAuth({ children, allow }: { children: ReactNode; allow?: Role[] }) {
  const { session } = useAuth();
  const loc = useLocation();
  if (!session) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  if (allow && !allow.includes(session.role)) {
    const home = session.role === 'software' ? '/software' : `/dashboard/${ROLE_MODULES[session.role].defaultModule}`;
    return <Navigate to={home} replace />;
  }
  return <>{children}</>;
}

export { ROLE_LABEL };
