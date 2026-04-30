const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const TOKEN_KEY = 'fluxora_token'
const USER_KEY = 'fluxora_user'
const BUILDING_KEY = 'fluxora_building'

export const authStore = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser: () => {
    const value = localStorage.getItem(USER_KEY)
    return value ? JSON.parse(value) : null
  },
  getBuilding: () => {
    const value = localStorage.getItem(BUILDING_KEY)
    return value ? JSON.parse(value) : null
  },
  setSession: ({ token, user, building }) => {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    if (building) localStorage.setItem(BUILDING_KEY, JSON.stringify(building))
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(BUILDING_KEY)
  },
}

export const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

export const apiRequest = async (path, options = {}) => {
  const headers = new Headers(options.headers || {})
  const token = authStore.getToken()
  const hasBody = options.body !== undefined && options.body !== null
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  if (token) headers.set('Authorization', `Token ${token}`)
  if (hasBody && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: hasBody && !isFormData && typeof options.body !== 'string'
      ? JSON.stringify(options.body)
      : options.body,
  })

  let payload = null
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    payload = await response.json()
  }

  if (!response.ok) {
    const message = payload?.detail || payload?.error || `Request failed with ${response.status}`
    throw new Error(message)
  }

  return payload
}

export const authApi = {
  login: (email, password) => apiRequest('/api/auth/login/', {
    method: 'POST',
    body: { email, password },
  }),
  signup: (payload) => apiRequest('/api/auth/signup/', {
    method: 'POST',
    body: payload,
  }),
  me: () => apiRequest('/api/auth/me/'),
  logout: () => apiRequest('/api/auth/logout/', { method: 'POST' }),
}
