// AI settings store — provider mode, self-host endpoint, ordered BYOK keys, and
// per-agent toggles. Persisted to localStorage and shared across components via
// useSyncExternalStore (no extra React provider, no re-render storms).

import { useSyncExternalStore } from 'react';
import type { AiSettings, AgentId, ProviderKey, ProviderMode } from './types';

const KEY = 'flx_ai_settings_v1';

const DEFAULTS: AiSettings = {
  mode: 'self',
  selfHostUrl: 'http://127.0.0.1:11434',
  selfHostModel: 'gemma3:4b',
  keys: [],
  agents: { concierge: true, triage: true, pulse: true, scribe: true },
  managedQuota: { used: 0, limit: 2000 },
};

function read(): AiSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULTS,
      ...parsed,
      agents: { ...DEFAULTS.agents, ...(parsed.agents || {}) },
      managedQuota: { ...DEFAULTS.managedQuota, ...(parsed.managedQuota || {}) },
    };
  } catch {
    return DEFAULTS;
  }
}

let state: AiSettings = read();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function commit(next: AiSettings) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage full / blocked */ }
  emit();
}

export const aiSettings = {
  get: (): AiSettings => state,
  subscribe: (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; },

  setMode: (mode: ProviderMode) => commit({ ...state, mode }),
  setSelfHost: (selfHostUrl: string, selfHostModel?: string) =>
    commit({ ...state, selfHostUrl, selfHostModel: selfHostModel ?? state.selfHostModel }),
  toggleAgent: (id: AgentId, on?: boolean) =>
    commit({ ...state, agents: { ...state.agents, [id]: on ?? !state.agents[id] } }),

  addKey: (k: Omit<ProviderKey, 'id' | 'status'>) =>
    commit({ ...state, keys: [...state.keys, { ...k, id: `k_${Date.now().toString(36)}`, status: 'live' }] }),
  removeKey: (id: string) =>
    commit({ ...state, keys: state.keys.filter(k => k.id !== id) }),
  // Mark a key cooled-down after a provider rejection (429 / auth / quota).
  coolDownKey: (id: string, ms = 5 * 60_000) =>
    commit({
      ...state,
      keys: state.keys.map(k => k.id === id ? { ...k, status: 'cooldown', cooldownUntil: Date.now() + ms } : k),
    }),
  reviveKeys: () => {
    const now = Date.now();
    const next = state.keys.map(k =>
      k.status === 'cooldown' && (k.cooldownUntil ?? 0) <= now ? { ...k, status: 'live' as const, cooldownUntil: undefined } : k);
    if (next.some((k, i) => k.status !== state.keys[i].status)) commit({ ...state, keys: next });
  },
};

// React binding.
export function useAiSettings(): AiSettings {
  return useSyncExternalStore(aiSettings.subscribe, aiSettings.get, () => DEFAULTS);
}
