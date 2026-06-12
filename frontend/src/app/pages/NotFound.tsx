import { Link } from 'react-router';
import { motion } from 'motion/react';

export function NotFound() {
  return (
    <div className="grain min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col">
      <header className="p-6 lg:p-10 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <span className="w-2 h-2 bg-[var(--accent)] rotate-45" />
          <span className="mono uppercase tracking-[0.22em] text-[0.78rem]">Fluxora</span>
        </Link>
        <span className="mono text-[0.66rem] tracking-[0.22em] uppercase text-[var(--ink-muted)]">Error · 404</span>
      </header>

      <main className="flex-1 grid lg:grid-cols-2 items-center gap-10 px-6 lg:px-16 pb-20">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <span className="mono text-[0.7rem] tracking-[0.22em] uppercase text-[var(--accent)]">∅</span>
            <span className="mono text-[0.7rem] tracking-[0.22em] uppercase text-[var(--ink-muted)]">Missing floor</span>
            <span className="flex-1 h-px bg-[var(--line)]" />
          </div>
          <h1 className="display text-[clamp(2.6rem,7vw,6rem)] leading-[1.02]">
            This floor<br/><span className="italic font-light text-[var(--accent)]">doesn't exist.</span>
          </h1>
          <p className="mt-8 text-[var(--ink-muted)] max-w-md leading-relaxed">
            The page you tried to reach is not in our building. Take the lift back to the lobby — or ask the concierge for directions.
          </p>
          <div className="mt-10 flex items-center gap-6">
            <Link to="/" className="group relative inline-flex items-center gap-3 px-6 h-12 bg-[var(--ink)] text-[var(--bg-raised)] mono uppercase tracking-[0.2em] text-[0.7rem] overflow-hidden">
              <span className="relative z-10">Back to lobby</span><span className="relative z-10">→</span>
              <span className="absolute inset-0 bg-[var(--accent)] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </Link>
            <Link to="/login" className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] hover:text-[var(--accent)] border-b border-transparent hover:border-[var(--accent)] pb-1">Sign in →</Link>
          </div>
        </div>

        <div className="flex justify-center">
          <svg viewBox="0 0 320 540" className="w-full max-w-[400px]">
            {Array.from({ length: 14 }).map((_, i) => (
              <g key={i}>
                <line x1="40" y1={60 + i * 32} x2="280" y2={60 + i * 32} stroke="var(--ink)" strokeWidth="0.5" />
                {Array.from({ length: 6 }).map((_, u) => {
                  const missing = i === 6 && u === 3;
                  return (
                    <motion.rect
                      key={u}
                      x={48 + u * 40} y={66 + i * 32} width={32} height={20}
                      fill={missing ? 'var(--critical)' : 'var(--bg-sunken)'}
                      stroke="var(--ink)" strokeWidth="0.3"
                      opacity={missing ? 1 : 0.3}
                      animate={missing ? { opacity: [1, 0.2, 1] } : {}}
                      transition={missing ? { duration: 1.4, repeat: Infinity } : {}}
                    />
                  );
                })}
              </g>
            ))}
            <polyline points="24,60 160,30 296,60" fill="none" stroke="var(--ink)" strokeWidth="0.75" />
          </svg>
        </div>
      </main>
    </div>
  );
}
