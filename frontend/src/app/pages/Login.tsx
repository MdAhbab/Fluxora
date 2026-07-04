import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useAuth } from '../../lib/auth';
import { ROLE_LABEL, ROLE_MODULES } from '../../lib/roles';
import { DEMO_ACCOUNTS } from '../../lib/mock';
import { Field, Btn } from '../components/shared/ui';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../lib/theme';

export function Login() {
  const { login } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const ok = await login(email, pass);
      if (!ok) {
        setError('No record. Try one of the demo accounts on the right.');
        return;
      }
      // DashboardRedirect routes by role (software → /software).
      nav('/dashboard');
    } catch {
      setError('Could not sign in. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grain min-h-screen bg-[var(--bg)] text-[var(--ink)] grid lg:grid-cols-[45%_55%]">
      {/* LEFT — form */}
      <div className="relative flex flex-col bg-[var(--bg-raised)] min-h-screen">
        <header className="flex items-center justify-between p-6 lg:p-10">
          <Link to="/" className="flex items-center gap-3">
            <span className="w-2 h-2 bg-[var(--accent)] rotate-45" />
            <span className="mono uppercase tracking-[0.22em] text-[0.78rem]">Fluxora</span>
          </Link>
          <button onClick={toggle} className="w-9 h-9 grid place-items-center border border-[var(--line)] hover:border-[var(--accent)]">
            {theme === 'dark' ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
          </button>
        </header>

        <div className="flex-1 flex items-center px-6 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-md">
            <div className="flex items-center gap-3 mb-8">
              <span className="mono text-[0.66rem] tracking-[0.22em] uppercase text-[var(--accent)]">00 / Lobby</span>
              <span className="flex-1 h-px bg-[var(--line)]" />
            </div>

            <h1 className="display text-[clamp(2.4rem,5vw,3.6rem)] leading-[1.02]">
              Welcome<br/><span className="italic font-light text-[var(--accent)]">back inside.</span>
            </h1>

            <form onSubmit={submit} className="mt-12 space-y-8">
              <Field label="Email" type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="you@building.bd" autoFocus />
              <Field label="Password" type="password" value={pass} onChange={e => { setPass(e.target.value); setError(''); }} placeholder="••••••" />
              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mono text-[0.74rem] text-[var(--critical)]">
                  {error}
                </motion.div>
              )}
              <div className="flex items-center justify-between gap-4 pt-2">
                <Btn variant="primary" type="submit" disabled={busy}>{busy ? 'Entering…' : 'Enter'}</Btn>
                <Link to="/signup" className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] hover:text-[var(--accent)] border-b border-transparent hover:border-[var(--accent)] pb-1">Begin a tenancy →</Link>
              </div>
            </form>
          </motion.div>
        </div>

        <footer className="px-6 lg:px-10 py-6 mono text-[0.6rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] border-t border-[var(--line)] flex justify-between">
          <span>© 2026 Fluxora</span>
          <span>v 2.4 · ledger build</span>
        </footer>
      </div>

      {/* RIGHT — concierge card with demo accounts */}
      <aside className="hidden lg:flex flex-col p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {/* small ghost tower */}
          <svg viewBox="0 0 400 600" className="absolute right-0 top-0 h-full opacity-[0.06]">
            {Array.from({ length: 14 }).map((_, i) => (
              <g key={i}>
                <line x1="60" y1={60 + i * 36} x2="340" y2={60 + i * 36} stroke="var(--ink)" strokeWidth="0.5" />
                {Array.from({ length: 6 }).map((_, u) => (
                  <rect key={u} x={70 + u * 45} y={66 + i * 36} width={36} height={24} fill="var(--ink)" opacity="0.4" />
                ))}
              </g>
            ))}
          </svg>
        </div>

        <div className="flex items-center gap-3 mb-10 relative z-10">
          <span className="mono text-[0.66rem] tracking-[0.22em] uppercase text-[var(--accent)]">01 / Concierge card</span>
          <span className="flex-1 h-px bg-[var(--line)]" />
        </div>

        <h2 className="display text-[2rem] mb-8 relative z-10">Try a demo role.<br/><span className="italic font-light text-[var(--accent)]">One tap to enter.</span></h2>

        <div className="border border-[var(--accent)] bg-[var(--bg-raised)] relative z-10">
          {DEMO_ACCOUNTS.map((a, i) => (
            <button key={a.email}
              onClick={() => { setEmail(a.email); setPass(a.pass); }}
              className={`w-full text-left grid grid-cols-[100px_1fr_auto] items-center px-6 py-4 ${i > 0 ? 'border-t border-[var(--line)]' : ''} hover:bg-[var(--bg-sunken)] transition group`}>
              <span className="mono text-[0.66rem] tracking-[0.2em] uppercase text-[var(--accent)]">{ROLE_LABEL[a.role].split(' ')[0]}</span>
              <span>
                <div className="display text-[1rem]">{a.name}</div>
                <div className="mono text-[0.66rem] text-[var(--ink-muted)] mt-0.5">{a.email}</div>
              </span>
              <span className="mono text-[0.6rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] group-hover:text-[var(--accent)]">use →</span>
            </button>
          ))}
        </div>

        <p className="mt-6 mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] relative z-10">
          Click a row to pre-fill, then press Enter.
        </p>
      </aside>
    </div>
  );
}
