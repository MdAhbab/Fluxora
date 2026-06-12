// AI Gateway — the single chokepoint that abstracts the model provider.
//
// Mirrors AGENTS.md §1: mode A self-hosted Gemma, mode B bring-your-own keys with
// ordered multi-key fallback + cooldown, mode C Fluxora Managed AI. Budget guards:
// per-request timeout and a graceful decline that never leaks raw model text.
//
// In environments with no reachable model (the default), complete() returns
// ok:false and every agent falls back to its deterministic reasoner — exactly the
// "progressive enhancement / fully manual path" the spec mandates.

import { aiSettings } from './settings';
import type { ModelOutcome, ProviderMode } from './types';

const TIMEOUT_MS = 30_000;

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

type CallTarget = {
  url: string;            // OpenAI-compatible chat completions endpoint
  model: string;
  headers: Record<string, string>;
  keyId?: string;
};

function chatUrl(base: string): string {
  const trimmed = base.replace(/\/+$/, '');
  return /\/v1$/.test(trimmed) ? `${trimmed}/chat/completions` : `${trimmed}/v1/chat/completions`;
}

// Resolve the ordered list of endpoints to try for the active mode.
function targets(): { mode: ProviderMode; list: CallTarget[] } {
  const s = aiSettings.get();
  if (s.mode === 'self') {
    return {
      mode: 'self',
      list: [{ url: chatUrl(s.selfHostUrl), model: s.selfHostModel, headers: {} }],
    };
  }
  if (s.mode === 'managed') {
    // Backend gateway (not yet implemented) — same-origin via the Vite proxy.
    return { mode: 'managed', list: [{ url: '/api/ai/complete', model: 'fluxora-managed', headers: {} }] };
  }
  // BYOK: ordered, skipping cooled-down keys.
  aiSettings.reviveKeys();
  const list = aiSettings.get().keys
    .filter(k => k.status !== 'cooldown')
    .map(k => ({
      url: chatUrl(k.endpoint || 'https://api.openai.com'),
      model: k.model,
      headers: { Authorization: `Bearer ${k.key}` },
      keyId: k.id,
    }));
  return { mode: 'byok', list };
}

async function callOne(t: CallTarget, messages: ChatMessage[]): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(t.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...t.headers },
      body: JSON.stringify({ model: t.model, messages, temperature: 0.3, stream: false }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const err: any = new Error(`provider ${res.status}`);
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content ?? data?.message?.content ?? '';
    if (!text) throw new Error('empty completion');
    return String(text);
  } finally {
    clearTimeout(timer);
  }
}

// Single completion with provider fallback. Never throws — returns ok:false on
// exhaustion so callers degrade gracefully to deterministic output.
export async function complete(messages: ChatMessage[]): Promise<ModelOutcome> {
  const { mode, list } = targets();
  if (!list.length) {
    return { ok: false, text: '', mode, model: 'deterministic', error: 'no provider configured' };
  }
  for (const t of list) {
    try {
      const text = await callOne(t, messages);
      return { ok: true, text: text.trim(), mode, model: t.model, keyId: t.keyId };
    } catch (e: any) {
      // BYOK: cool down keys rejected for quota/auth so the next key is tried.
      if (mode === 'byok' && t.keyId && [401, 403, 429].includes(e?.status)) {
        aiSettings.coolDownKey(t.keyId);
      }
      // try next target
    }
  }
  return { ok: false, text: '', mode, model: 'deterministic', error: 'all providers failed' };
}

// JSON completion with one schema-repair retry (AGENTS.md §3.2). Returns null on
// failure so the caller keeps its deterministic structure.
export async function completeJson<T>(
  messages: ChatMessage[],
  validate: (v: any) => v is T,
): Promise<{ value: T; outcome: ModelOutcome } | null> {
  let last: ModelOutcome | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const outcome = await complete(messages);
    last = outcome;
    if (!outcome.ok) return null;
    const parsed = safeJson(outcome.text);
    if (parsed && validate(parsed)) return { value: parsed, outcome };
    // retry once with the validator error appended
    messages = [...messages, { role: 'user', content: 'Your previous reply was not valid JSON for the required schema. Reply with strict JSON only.' }];
  }
  return last && last.ok ? null : null;
}

function safeJson(text: string): any {
  try {
    const m = text.match(/\{[\s\S]*\}/);
    return JSON.parse(m ? m[0] : text);
  } catch {
    return null;
  }
}
