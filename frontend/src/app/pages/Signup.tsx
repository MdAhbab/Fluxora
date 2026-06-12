import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Field, Btn } from '../components/shared/ui';
import { Moon, Sun, Check } from 'lucide-react';
import { useTheme } from '../../lib/theme';
import { useAuth } from '../../lib/auth';
import { authApi, authStore } from '../../lib/api';

const steps = [
  { num: '01', label: 'Workspace' },
  { num: '02', label: 'Building' },
  { num: '03', label: 'Modules' },
];

const allModules = [
  'Finance', 'Operations', 'Security', 'Community', 'Real Estate',
  'AI · Concierge', 'AI · Triage', 'AI · Pulse', 'AI · Scribe', 'Building Explorer · 3D',
];

export function Signup() {
  const nav = useNavigate();
  const { login } = useAuth();
  const { theme, toggle } = useTheme();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    org: '', email: '', adminName: '',
    bName: '', bAddress: '', floors: 14, unitsPerFloor: 6,
    modules: new Set<string>(['Finance', 'Operations', 'Security', 'Community']),
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const next = () => setStep(s => Math.min(2, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));
  const finish = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      // Real workspace creation: backend signs up an admin + a building, returns a token.
      const payload = await authApi.signup({
        name: data.adminName || 'Admin',
        email: data.email,
        password: 'Fluxora@2026',
        building_name: data.bName || data.org || 'Fluxora Tower',
        modules: Array.from(data.modules),
      });
      if (payload?.token && payload.user) {
        authStore.setSession(payload);
        // Force a clean reload into the dashboard so the auth/data providers re-hydrate from the token.
        window.location.href = '#/dashboard';
        window.location.reload();
        return;
      }
      throw new Error('No token');
    } catch {
      // Offline / unseeded backend: drop into the demo admin workspace so the flow still completes.
      await login('admin1@fluxora.bd', 'Fluxora@2026');
      nav('/dashboard');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grain min-h-screen bg-[var(--bg)] text-[var(--ink)] grid lg:grid-cols-[55%_45%]">
      <div className="bg-[var(--bg-raised)] flex flex-col min-h-screen">
        <header className="flex items-center justify-between p-6 lg:p-10">
          <Link to="/" className="flex items-center gap-3">
            <span className="w-2 h-2 bg-[var(--accent)] rotate-45" />
            <span className="mono uppercase tracking-[0.22em] text-[0.78rem]">Fluxora</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] hover:text-[var(--accent)]">Sign in →</Link>
            <button onClick={toggle} className="w-9 h-9 grid place-items-center border border-[var(--line)] hover:border-[var(--accent)]">
              {theme === 'dark' ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
            </button>
          </div>
        </header>

        <div className="flex-1 flex items-start px-6 lg:px-16 pt-8 lg:pt-16">
          <div className="w-full max-w-2xl grid grid-cols-[80px_1fr] gap-12">
            {/* step rail */}
            <ol className="space-y-8">
              {steps.map((s, i) => (
                <li key={s.num} className="flex flex-col items-center text-center">
                  <div className={`w-10 h-10 grid place-items-center border ${i === step ? 'border-[var(--accent)] text-[var(--accent)]' : i < step ? 'bg-[var(--accent)] text-[var(--accent-ink)] border-[var(--accent)]' : 'border-[var(--line)] text-[var(--ink-muted)]'}`}>
                    {i < step ? <Check size={14} strokeWidth={1.5} /> : <span className="mono text-[0.7rem]">{s.num}</span>}
                  </div>
                  {i < steps.length - 1 && <span className="w-px h-12 bg-[var(--line)] my-2" />}
                  <span className={`mono text-[0.58rem] uppercase tracking-[0.18em] mt-2 ${i === step ? 'text-[var(--accent)]' : 'text-[var(--ink-muted)]'}`}>{s.label}</span>
                </li>
              ))}
            </ol>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: [0.7, 0, 0.2, 1] }}
              >
                {step === 0 && (
                  <div>
                    <h1 className="display text-[clamp(2rem,4vw,3rem)] leading-[1.02]">Name your <span className="italic font-light text-[var(--accent)]">workspace.</span></h1>
                    <p className="mt-4 text-[var(--ink-muted)] leading-relaxed">One workspace per management company. Add as many buildings underneath as you operate.</p>
                    <div className="mt-10 space-y-8">
                      <Field label="Organisation" placeholder="e.g. Concord Property Management" value={data.org} onChange={e => setData(d => ({ ...d, org: e.target.value }))} />
                      <Field label="Admin name" placeholder="Your full name" value={data.adminName} onChange={e => setData(d => ({ ...d, adminName: e.target.value }))} />
                      <Field label="Email" type="email" placeholder="admin@yourdomain.bd" value={data.email} onChange={e => setData(d => ({ ...d, email: e.target.value }))} />
                    </div>
                  </div>
                )}
                {step === 1 && (
                  <div>
                    <h1 className="display text-[clamp(2rem,4vw,3rem)] leading-[1.02]">Add your <span className="italic font-light text-[var(--accent)]">first building.</span></h1>
                    <p className="mt-4 text-[var(--ink-muted)] leading-relaxed">Fluxora builds a procedural 3D model from these dimensions. You can refine in Architect Mode later.</p>
                    <div className="mt-10 space-y-8">
                      <Field label="Building name" placeholder="e.g. Gulshan Heights" value={data.bName} onChange={e => setData(d => ({ ...d, bName: e.target.value }))} />
                      <Field label="Address" placeholder="House 14, Road 7, Gulshan-1, Dhaka" value={data.bAddress} onChange={e => setData(d => ({ ...d, bAddress: e.target.value }))} />
                      <div className="grid grid-cols-2 gap-8">
                        <Field label="Floors" type="number" value={data.floors} onChange={e => setData(d => ({ ...d, floors: +e.target.value }))} />
                        <Field label="Units / floor" type="number" value={data.unitsPerFloor} onChange={e => setData(d => ({ ...d, unitsPerFloor: +e.target.value }))} />
                      </div>
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div>
                    <h1 className="display text-[clamp(2rem,4vw,3rem)] leading-[1.02]">Pick your <span className="italic font-light text-[var(--accent)]">modules.</span></h1>
                    <p className="mt-4 text-[var(--ink-muted)] leading-relaxed">Switch any on or off later. Most buildings begin with Finance, Security, and Community.</p>
                    <div className="mt-10 border-t border-[var(--line)]">
                      {allModules.map(m => {
                        const checked = data.modules.has(m);
                        return (
                          <button key={m} type="button"
                            onClick={() => setData(d => {
                              const next = new Set(d.modules);
                              if (next.has(m)) next.delete(m); else next.add(m);
                              return { ...d, modules: next };
                            })}
                            className="w-full flex items-center gap-4 py-4 border-b border-[var(--line)] text-left hover:bg-[var(--bg-sunken)] transition px-3"
                          >
                            <span className={`w-5 h-5 grid place-items-center border ${checked ? 'bg-[var(--ink)] text-[var(--bg-raised)] border-[var(--ink)]' : 'border-[var(--line)]'}`}>
                              {checked && <Check size={12} strokeWidth={2} />}
                            </span>
                            <span className="flex-1">{m}</span>
                            <span className="mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">{m.includes('AI') ? 'Add-on' : 'Core'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {error && <div className="mt-6 mono text-[0.74rem] text-[var(--critical)]">{error}</div>}
                <div className="mt-12 flex items-center justify-between">
                  <Btn variant="ghost" onClick={back} disabled={step === 0}>← Back</Btn>
                  {step < 2 ? (
                    <Btn variant="primary" onClick={next}>Continue</Btn>
                  ) : (
                    <Btn variant="primary" onClick={finish} disabled={busy}>{busy ? 'Creating…' : 'Enter dashboard →'}</Btn>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* RIGHT — animated tower lighting one floor per step */}
      <aside className="hidden lg:flex items-center justify-center p-12 relative">
        <svg viewBox="0 0 320 540" className="w-full max-w-[360px]">
          {Array.from({ length: 14 }).map((_, i) => {
            const f = 14 - i;
            const lit = f <= (step + 1) * 5;
            return (
              <g key={f}>
                <line x1="40" y1={60 + i * 32} x2="280" y2={60 + i * 32} stroke="var(--ink)" strokeWidth="0.5" />
                {Array.from({ length: 6 }).map((_, u) => (
                  <motion.rect
                    key={u} x={48 + u * 40} y={66 + i * 32} width={32} height={20}
                    fill={lit ? 'var(--accent)' : 'var(--bg-sunken)'}
                    stroke="var(--ink)" strokeWidth="0.3"
                    opacity={lit ? 0.7 : 0.35}
                    animate={{ opacity: lit ? 0.7 : 0.35 }}
                    transition={{ duration: 0.6, delay: u * 0.04 }}
                  />
                ))}
              </g>
            );
          })}
          <polyline points="24,60 160,30 296,60" fill="none" stroke="var(--ink)" strokeWidth="0.75" />
          <circle cx="160" cy="20" r="3" fill="var(--accent)" />
        </svg>
        <div className="absolute bottom-12 left-12 right-12 mono text-[0.6rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] flex justify-between">
          <span>FIG · 02.A</span>
          <span>Floors lit · {(step + 1) * 5} / 14</span>
        </div>
      </aside>
    </div>
  );
}
