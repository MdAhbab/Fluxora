// AgentAuditLog — every agent action writes a row (AGENTS.md §1 "Audit").
// A capped ring buffer in localStorage; surfaced in the Software ops console.

import { useSyncExternalStore } from 'react';
import type { AuditEntry } from './types';

const KEY = 'flx_ai_audit_v1';
const CAP = 100;

function read(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

let state: AuditEntry[] = read();
const listeners = new Set<() => void>();
const EMPTY: AuditEntry[] = [];

export const aiAudit = {
  get: (): AuditEntry[] => state,
  subscribe: (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
  log: (entry: Omit<AuditEntry, 'id' | 'ts'>) => {
    const row: AuditEntry = { ...entry, id: `a_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`, ts: Date.now() };
    state = [row, ...state].slice(0, CAP);
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
    for (const l of listeners) l();
  },
};

export function useAiAudit(): AuditEntry[] {
  return useSyncExternalStore(aiAudit.subscribe, aiAudit.get, () => EMPTY);
}
