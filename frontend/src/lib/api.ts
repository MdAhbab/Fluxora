// Real API client for the Fluxora Django REST backend.
// Token auth; same-origin in dev via the Vite proxy (`/api`, `/media`).

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';
const TOKEN_KEY = 'fluxora_token';
const USER_KEY = 'fluxora_user';
const BUILDING_KEY = 'fluxora_building';

export type ApiUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: 'admin' | 'committee' | 'resident' | 'guard' | 'staff';
  avatar_path?: string | null;
};

export type ApiBuilding = {
  id: number;
  name: string;
  address: string;
  num_floors?: number | null;
  total_units?: number | null;
  [key: string]: unknown;
};

export type SessionPayload = {
  token?: string;
  user?: ApiUser | null;
  building?: ApiBuilding | null;
};

export const authStore = {
  getToken: (): string | null => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  getUser: (): ApiUser | null => {
    try {
      const v = localStorage.getItem(USER_KEY);
      return v ? JSON.parse(v) : null;
    } catch { return null; }
  },
  getBuilding: (): ApiBuilding | null => {
    try {
      const v = localStorage.getItem(BUILDING_KEY);
      return v ? JSON.parse(v) : null;
    } catch { return null; }
  },
  setSession: ({ token, user, building }: SessionPayload) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (building) localStorage.setItem(BUILDING_KEY, JSON.stringify(building));
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(BUILDING_KEY);
  },
};

export const normalizeList = <T = any>(payload: any): T[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & { body?: any };

export const apiRequest = async <T = any>(path: string, options: RequestOptions = {}): Promise<T> => {
  const headers = new Headers(options.headers || {});
  const token = authStore.getToken();
  const hasBody = options.body !== undefined && options.body !== null;
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (token) headers.set('Authorization', `Token ${token}`);
  if (hasBody && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: hasBody && !isFormData && typeof options.body !== 'string'
      ? JSON.stringify(options.body)
      : (options.body as BodyInit | undefined),
  });

  let payload: any = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    payload = await response.json();
  }

  if (!response.ok) {
    const message = payload?.detail || payload?.error || `Request failed with ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return payload as T;
};

export const api = {
  get: <T = any>(path: string) => apiRequest<T>(path),
  post: <T = any>(path: string, body?: any) => apiRequest<T>(path, { method: 'POST', body }),
  patch: <T = any>(path: string, body?: any) => apiRequest<T>(path, { method: 'PATCH', body }),
  put: <T = any>(path: string, body?: any) => apiRequest<T>(path, { method: 'PUT', body }),
  del: <T = any>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
};

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<SessionPayload>('/api/auth/login/', { method: 'POST', body: { email, password } }),
  signup: (payload: { name: string; email: string; password: string; building_name?: string; modules?: string[] }) =>
    apiRequest<SessionPayload>('/api/auth/signup/', { method: 'POST', body: payload }),
  me: () => apiRequest<{ user: ApiUser | null; building: ApiBuilding | null }>('/api/auth/me/'),
  logout: () => apiRequest('/api/auth/logout/', { method: 'POST' }),
};

export type DashboardSummary = {
  building: ApiBuilding | null;
  buildings: ApiBuilding[];
  me: ApiUser | null;
  current_resident_id: number | null;
  metrics: Record<string, number>;
  sections: Record<string, any[]> & { parking_layout?: any };
};

export const dashboardApi = {
  summary: (buildingId?: string | number) =>
    apiRequest<DashboardSummary>(`/api/dashboard/summary/${buildingId ? `?building_id=${buildingId}` : ''}`),
};
