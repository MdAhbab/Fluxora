import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, ArrowLeft, GripVertical } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useTheme } from '../../lib/theme';
import { useData } from '../../lib/data';
import { api } from '../../lib/api';
import { useAiSettings, aiSettings, type AgentId } from '../../lib/ai';
import { Btn, Eyebrow, Field, Panel, StatusDot } from '../components/shared/ui';

const AGENTS: { id: AgentId; label: string }[] = [
  { id: 'concierge', label: 'Flux Concierge' },
  { id: 'triage', label: 'Triage Desk' },
  { id: 'pulse', label: 'Building Pulse' },
  { id: 'scribe', label: 'Notice Scribe' },
];

const sections = [
  { id: 'profile', label: 'Profile' },
  { id: 'workspace', label: 'Workspace' },
  { id: 'modules', label: 'Modules' },
  { id: 'ai', label: 'AI & Intelligence' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'danger', label: 'Danger zone' },
];

export function Settings() {
  const { session, patchSession } = useAuth();
  const { theme, toggle } = useTheme();
  const { isLive, refresh, me } = useData();
  const nav = useNavigate();
  const [active, setActive] = useState('profile');
  const [name, setName] = useState(session?.name ?? '');
  const [phone, setPhone] = useState((me?.phone as string) ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveProfile = async () => {
    if (saving) return;
    setSaving(true);
    setSaved(false);
    try {
      if (isLive) {
        await api.patch('/api/settings/', { section: 'user', name, phone });
        await refresh();
      }
      patchSession({ name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch {
      /* keep the form populated; surface nothing destructive */
    } finally {
      setSaving(false);
    }
  };
  const ai = useAiSettings();
  const [newKey, setNewKey] = useState({ provider: '', model: '', key: '' });
  const addKey = () => {
    if (!newKey.provider || !newKey.key) return;
    const tail = newKey.key.slice(-4);
    aiSettings.addKey({ provider: newKey.provider, model: newKey.model || 'gpt-4o-mini', key: newKey.key, label: `…${tail}` });
    setNewKey({ provider: '', model: '', key: '' });
  };

  if (!session) return null;
  const showWorkspace = session.role === 'admin';
  const showDanger = session.role === 'admin';

  return (
    <div className="grain min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <header className="sticky top-0 z-20 bg-[var(--bg)]/85 backdrop-blur-md border-b border-[var(--line)]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <button onClick={() => nav(-1)} className="flex items-center gap-3 mono uppercase tracking-[0.2em] text-[0.72rem] hover:text-[var(--accent)] transition">
            <ArrowLeft size={14} strokeWidth={1.5} /> Back
          </button>
          <span className="display text-[1.2rem]">Settings</span>
          <span className="mono text-[0.62rem] tracking-[0.18em] uppercase text-[var(--ink-muted)]">{session.email}</span>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10 lg:py-16 grid lg:grid-cols-[240px_1fr] gap-10 lg:gap-16">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Eyebrow num="00" label="Sections" />
          <nav className="mt-2">
            {sections.map(s => {
              if (s.id === 'workspace' && !showWorkspace) return null;
              if (s.id === 'danger' && !showDanger) return null;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`w-full text-left py-3 mono text-[0.74rem] uppercase tracking-[0.18em] border-b border-[var(--line)] ${active === s.id ? 'text-[var(--accent)]' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'}`}
                >
                  {s.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.section key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }} className="space-y-6">
              {active === 'profile' && (
                <>
                  <h2 className="display text-[2rem] mb-4">Profile</h2>
                  <Panel className="p-6 space-y-6">
                    <Field label="Full name" value={name} onChange={e => setName(e.target.value)} />
                    <Field label="Email" type="email" defaultValue={session.email} disabled />
                    {session.flat && <Field label="Flat" defaultValue={session.flat} disabled />}
                    <Field label="Phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+880 1700 000 000" />
                    <div className="pt-2 flex items-center gap-4">
                      <Btn variant="primary" onClick={saveProfile} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Btn>
                      {saved && <span className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--positive)]">Saved</span>}
                    </div>
                  </Panel>
                </>
              )}

              {active === 'workspace' && (
                <>
                  <h2 className="display text-[2rem] mb-4">Workspace</h2>
                  <Panel className="p-6 space-y-6">
                    <Field label="Organisation" defaultValue="Concord Property Management" />
                    <Field label="Trade licence" defaultValue="DCC-2019-LP-04412" />
                    <Field label="Billing currency" defaultValue="BDT" />
                    <Field label="Locale" defaultValue="bn-BD · English" />
                    <div className="pt-2"><Btn variant="primary">Save</Btn></div>
                  </Panel>
                </>
              )}

              {active === 'modules' && (
                <>
                  <h2 className="display text-[2rem] mb-4">Modules</h2>
                  <Panel>
                    {['Finance', 'Operations', 'Security', 'Community', 'Real Estate', 'Building Explorer', 'Marketplace'].map((m, i) => (
                      <div key={m} className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)] last:border-0">
                        <div className="flex items-center gap-4">
                          <GripVertical size={14} className="text-[var(--ink-muted)]" strokeWidth={1.5} />
                          <span>{m}</span>
                        </div>
                        <label className="inline-flex items-center gap-3">
                          <span className="mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">{i < 6 ? 'On' : 'Off'}</span>
                          <span className={`w-10 h-5 rounded-full relative ${i < 6 ? 'bg-[var(--accent)]' : 'bg-[var(--bg-sunken)]'}`}>
                            <span className={`absolute top-0.5 ${i < 6 ? 'right-0.5' : 'left-0.5'} w-4 h-4 bg-[var(--bg-raised)] rounded-full transition-all`} />
                          </span>
                        </label>
                      </div>
                    ))}
                  </Panel>
                </>
              )}

              {active === 'ai' && (
                <>
                  <h2 className="display text-[2rem] mb-4">AI & Intelligence</h2>
                  <Panel title="Provider" num="AI · 01" className="p-6 space-y-4">
                    {[
                      { id: 'self', l: 'Self-hosted Gemma', s: 'Point to your Ollama / vLLM endpoint' },
                      { id: 'byok', l: 'Bring-your-own keys', s: 'Ordered fallback list, multi-provider' },
                      { id: 'managed', l: 'Fluxora Managed AI', s: 'Metered inference on our servers' },
                    ].map(o => (
                      <button key={o.id} onClick={() => aiSettings.setMode(o.id as any)}
                        className={`w-full text-left flex items-start gap-4 p-4 border ${ai.mode === o.id ? 'border-[var(--accent)] bg-[var(--bg-raised)]' : 'border-[var(--line)] hover:border-[var(--ink-muted)]'}`}>
                        <span className={`w-4 h-4 rounded-full border ${ai.mode === o.id ? 'border-[var(--accent)]' : 'border-[var(--line)]'} grid place-items-center mt-0.5`}>
                          {ai.mode === o.id && <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />}
                        </span>
                        <div>
                          <div>{o.l}</div>
                          <div className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] mt-1">{o.s}</div>
                        </div>
                      </button>
                    ))}
                  </Panel>

                  {ai.mode === 'self' && (
                    <Panel title="Endpoint" num="AI · 02" className="p-6 space-y-5">
                      <Field label="Base URL" value={ai.selfHostUrl} onChange={e => aiSettings.setSelfHost(e.target.value)} placeholder="http://127.0.0.1:11434" />
                      <Field label="Model" value={ai.selfHostModel} onChange={e => aiSettings.setSelfHost(ai.selfHostUrl, e.target.value)} placeholder="gemma3:4b" />
                      <p className="mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">Agents fall back to deterministic mode when the endpoint is unreachable.</p>
                    </Panel>
                  )}

                  {ai.mode === 'byok' && (
                    <Panel title="Keys · Ordered Fallback" num="AI · 02">
                      {ai.keys.length === 0 && (
                        <div className="px-6 py-5 mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">No keys yet — add one below. Keys are tried in order; a rejected key cools down and the next is used.</div>
                      )}
                      {ai.keys.map((k, i) => (
                        <div key={k.id} className="grid grid-cols-[24px_1fr_110px_90px_40px] items-center gap-4 px-6 py-4 border-b border-[var(--line)] last:border-0">
                          <span className="mono text-[0.62rem] text-[var(--ink-muted)]">{String(i + 1).padStart(2, '0')}</span>
                          <span className="truncate">{k.provider}<span className="mono text-[0.66rem] text-[var(--ink-muted)] ml-2">{k.model}</span></span>
                          <span className="mono text-[0.74rem] text-[var(--ink-muted)]">{k.label}</span>
                          <span className="flex items-center gap-2 mono text-[0.62rem] uppercase tracking-[0.18em]">
                            <StatusDot v={k.status === 'live' ? 'positive' : k.status === 'cooldown' ? 'pending' : 'neutral'} /> {k.status}
                          </span>
                          <button className="text-[var(--ink-muted)] hover:text-[var(--critical)]" onClick={() => aiSettings.removeKey(k.id)}>
                            <Trash2 size={14} strokeWidth={1.5} />
                          </button>
                        </div>
                      ))}
                      <div className="px-6 py-5 border-t border-[var(--line)] grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <Field label="Provider" value={newKey.provider} onChange={e => setNewKey(k => ({ ...k, provider: e.target.value }))} placeholder="Groq" />
                        <Field label="Model" value={newKey.model} onChange={e => setNewKey(k => ({ ...k, model: e.target.value }))} placeholder="llama-3.1-8b" />
                        <Field label="API key" type="password" value={newKey.key} onChange={e => setNewKey(k => ({ ...k, key: e.target.value }))} placeholder="sk-…" />
                        <div className="sm:col-span-3"><Btn variant="outline" onClick={addKey}><Plus size={12} strokeWidth={1.5} /> Add provider key</Btn></div>
                      </div>
                    </Panel>
                  )}

                  {ai.mode === 'managed' && (
                    <Panel title="Managed quota" num="AI · 02" className="p-6 space-y-3">
                      <div className="mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">{ai.managedQuota.used} / {ai.managedQuota.limit} requests this month</div>
                      <div className="h-2 bg-[var(--bg-sunken)]"><div className="h-full bg-[var(--accent)]" style={{ width: `${Math.min(100, (ai.managedQuota.used / ai.managedQuota.limit) * 100)}%` }} /></div>
                    </Panel>
                  )}

                  <Panel title="Per-agent toggles" num="AI · 03">
                    {AGENTS.map(a => (
                      <div key={a.id} className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)] last:border-0">
                        <div>{a.label}</div>
                        <button onClick={() => aiSettings.toggleAgent(a.id)} aria-label={`Toggle ${a.label}`} className={`w-10 h-5 rounded-full relative transition-colors ${ai.agents[a.id] ? 'bg-[var(--accent)]' : 'bg-[var(--bg-sunken)]'}`}>
                          <span className={`absolute top-0.5 w-4 h-4 bg-[var(--bg-raised)] rounded-full transition-all ${ai.agents[a.id] ? 'right-0.5' : 'left-0.5'}`} />
                        </button>
                      </div>
                    ))}
                  </Panel>
                </>
              )}

              {active === 'appearance' && (
                <>
                  <h2 className="display text-[2rem] mb-4">Appearance</h2>
                  <Panel className="p-6">
                    <div className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] mb-6">Select your daily theme. We respect your system preference on first sign-in.</div>
                    <div className="grid grid-cols-2 gap-4">
                      {(['light', 'dark'] as const).map(t => (
                        <button key={t} onClick={() => { if (theme !== t) toggle(); }}
                          className={`p-4 border ${theme === t ? 'border-[var(--accent)]' : 'border-[var(--line)] hover:border-[var(--ink-muted)]'}`}>
                          <Preview dark={t === 'dark'} />
                          <div className="flex items-center justify-between mt-3">
                            <span className="mono text-[0.74rem] uppercase tracking-[0.18em]">{t === 'light' ? 'Daylight' : 'Nightwatch'}</span>
                            {theme === t && <span className="mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--accent)]">Active</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </Panel>
                </>
              )}

              {active === 'danger' && (
                <>
                  <h2 className="display text-[2rem] mb-4 text-[var(--critical)]">Danger zone</h2>
                  <Panel className="p-6 border-[var(--critical)]">
                    <p className="text-[var(--ink-muted)] mb-6 leading-relaxed">These actions are irreversible. Your data exports as a CSV bundle first.</p>
                    <div className="flex flex-wrap gap-3">
                      <Btn variant="outline">Export data</Btn>
                      <Btn variant="outline">Transfer ownership</Btn>
                      <button className="h-10 px-5 mono uppercase tracking-[0.18em] text-[0.7rem] bg-[var(--critical)] text-[var(--bg-raised)]">Delete workspace</button>
                    </div>
                  </Panel>
                </>
              )}
            </motion.section>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Preview({ dark }: { dark: boolean }) {
  const bg = dark ? '#0D0C0A' : '#F2EFE9';
  const raised = dark ? '#161412' : '#FBF9F4';
  const line = dark ? '#2A2722' : '#D8D2C4';
  const accent = dark ? '#C9A36A' : '#8C6A3F';
  const ink = dark ? '#EDE8DF' : '#191713';
  return (
    <div style={{ background: bg, padding: 10 }} className="aspect-[4/3] flex gap-2">
      <div style={{ background: raised, border: `1px solid ${line}` }} className="w-8" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3" style={{ background: raised }} />
        <div className="grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map(i => <div key={i} style={{ background: raised, border: `1px solid ${line}` }} className="h-6" />)}
        </div>
        <div style={{ background: raised }} className="flex-1 grid grid-cols-2 gap-1.5 p-1.5">
          <div style={{ background: bg, border: `1px solid ${line}` }} />
          <div style={{ background: bg, border: `1px solid ${line}` }} />
        </div>
        <div style={{ background: accent, color: dark ? '#0D0C0A' : '#FBF9F4' }} className="h-2.5 text-[0.5rem] grid place-items-center" />
      </div>
    </div>
  );
}
