import { ReactNode, useEffect, useRef, useState, ButtonHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

// ───────────────── Eyebrow + rule ─────────────────
export function Eyebrow({ num, label, dense = false }: { num?: string; label: string; dense?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${dense ? '' : 'mb-4'}`}>
      {num && <span className="mono text-[0.66rem] tracking-[0.22em] uppercase text-[var(--accent)]">{num}</span>}
      <span className="mono text-[0.66rem] tracking-[0.22em] uppercase text-[var(--ink-muted)]">{label}</span>
      <span className="flex-1 h-px bg-[var(--line)]" />
    </div>
  );
}

// ───────────────── Status dot ─────────────────
type StatusVariant = 'positive' | 'pending' | 'overdue' | 'info' | 'neutral';
export function StatusDot({ v, pulse }: { v: StatusVariant; pulse?: boolean }) {
  const cls = {
    positive: 'bg-[var(--positive)]',
    pending: 'bg-[var(--caution)]',
    overdue: 'bg-[var(--critical)]',
    info: 'bg-[var(--info)]',
    neutral: 'bg-[var(--ink-muted)]',
  }[v];
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${cls} ${pulse ? 'animate-pulse' : ''}`} />;
}

export function StatusTag({ v, children }: { v: StatusVariant; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 mono text-[0.66rem] uppercase tracking-[0.16em]">
      <StatusDot v={v} pulse={v === 'overdue'} />
      <span className="text-[var(--ink-muted)]">{children}</span>
    </span>
  );
}

// ───────────────── Button ─────────────────
type Variant = 'primary' | 'ghost' | 'outline' | 'critical';
export function Btn({ variant = 'outline', children, className = '', ...rest }: { variant?: Variant; className?: string; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = 'group relative inline-flex items-center justify-center gap-3 h-10 px-5 mono uppercase tracking-[0.18em] text-[0.7rem] overflow-hidden transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const cls = {
    primary: 'bg-[var(--ink)] text-[var(--bg-raised)]',
    outline: 'border border-[var(--line)] hover:border-[var(--accent)] text-[var(--ink)] hover:text-[var(--accent)]',
    ghost: 'text-[var(--ink-muted)] hover:text-[var(--accent)]',
    critical: 'bg-[var(--critical)] text-[var(--bg-raised)]',
  }[variant];
  return (
    <button className={`${base} ${cls} ${className}`} {...rest}>
      <span className="relative z-10">{children}</span>
      {variant === 'primary' && (
        <span className="absolute inset-0 bg-[var(--accent)] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(.7,0,.2,1)]" />
      )}
    </button>
  );
}

// ───────────────── KPI Odometer ─────────────────
export function KPI({ label, value, unit, hint }: { label: string; value: string; unit?: string; hint?: string }) {
  return (
    <div className="p-6 border border-[var(--line)] bg-[var(--bg-raised)]">
      <div className="eyebrow mb-3">{label}</div>
      <div className="flex items-baseline gap-2">
        {unit && <span className="mono text-[0.8rem] text-[var(--ink-muted)]">{unit}</span>}
        <span className="display text-[2.2rem] tabular-nums leading-none">{value}</span>
      </div>
      {hint && <div className="mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-muted)] mt-2">{hint}</div>}
    </div>
  );
}

// ───────────────── Hairline Card ─────────────────
export function Panel({ children, className = '', title, action, num }: { children: ReactNode; className?: string; title?: string; action?: ReactNode; num?: string }) {
  return (
    <section className={`bg-[var(--bg-raised)] border border-[var(--line)] ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)]">
          <div className="flex items-center gap-3">
            {num && <span className="mono text-[0.66rem] tracking-[0.22em] uppercase text-[var(--accent)]">{num}</span>}
            {title && <h3 className="mono text-[0.78rem] tracking-[0.18em] uppercase text-[var(--ink)]">{title}</h3>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

// ───────────────── Drawer (right slide-over) ─────────────────
export function Drawer({ open, onClose, title, children, width = 480 }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; width?: number }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-[var(--ink)]/30 backdrop-blur-[2px] z-50"
          />
          <motion.aside
            initial={{ x: width + 40 }} animate={{ x: 0 }} exit={{ x: width + 40 }}
            transition={{ duration: 0.5, ease: [0.7, 0, 0.2, 1] }}
            style={{ width: `min(${width}px, 92vw)` }}
            className="fixed right-0 top-0 bottom-0 bg-[var(--bg-raised)] border-l border-[var(--line)] z-50 overflow-y-auto"
          >
            {title && (
              <header className="sticky top-0 bg-[var(--bg-raised)] border-b border-[var(--line)] px-6 py-4 flex items-center justify-between z-10">
                <h3 className="mono text-[0.78rem] tracking-[0.2em] uppercase">{title}</h3>
                <button onClick={onClose} className="w-8 h-8 grid place-items-center border border-[var(--line)] hover:border-[var(--accent)]">
                  <X size={14} strokeWidth={1.5} />
                </button>
              </header>
            )}
            <div className="p-6">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ───────────────── Hold-to-confirm Button ─────────────────
export function HoldButton({ onConfirm, label = 'Hold to confirm', variant = 'primary', duration = 1200 }: { onConfirm: () => void; label?: string; variant?: 'primary' | 'critical'; duration?: number }) {
  const [progress, setProgress] = useState(0);
  const raf = useRef<number | null>(null);
  const start = useRef<number>(0);

  const begin = () => {
    start.current = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start.current) / duration);
      setProgress(p);
      if (p < 1) raf.current = requestAnimationFrame(step);
      else { onConfirm(); setTimeout(() => setProgress(0), 400); }
    };
    raf.current = requestAnimationFrame(step);
  };
  const cancel = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    setProgress(0);
  };

  return (
    <button
      onPointerDown={begin}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      className={`group relative inline-flex items-center justify-center h-11 px-6 mono uppercase tracking-[0.18em] text-[0.7rem] overflow-hidden ${variant === 'critical' ? 'bg-[var(--critical)] text-[var(--bg-raised)]' : 'bg-[var(--ink)] text-[var(--bg-raised)]'}`}
    >
      <span className="absolute inset-0 origin-left bg-[var(--accent)]" style={{ transform: `scaleX(${progress})`, transition: progress === 0 ? 'transform .3s' : 'none' }} />
      <span className="relative z-10">{label}</span>
    </button>
  );
}

// ───────────────── Empty / Loading / Error ─────────────────
export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="p-12 text-center">
      <svg viewBox="0 0 80 80" className="w-16 h-16 mx-auto opacity-40">
        <rect x="22" y="20" width="36" height="48" fill="none" stroke="currentColor" strokeWidth="0.75" />
        {[28, 36, 44, 52].map(y => <line key={y} x1="22" y1={y} x2="58" y2={y} stroke="currentColor" strokeWidth="0.5" />)}
        {[30, 38, 46, 54].map(y => <rect key={y} x="26" y={y} width="6" height="3" fill="var(--accent)" opacity="0.3" />)}
      </svg>
      <div className="display text-[1.4rem] mt-6">{title}</div>
      {hint && <p className="mono text-[0.76rem] uppercase tracking-[0.16em] text-[var(--ink-muted)] mt-3">{hint}</p>}
      {action && <div className="mt-6 inline-block">{action}</div>}
    </div>
  );
}

export function Skeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-[var(--line)]">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-6 gap-4 py-4 px-6 animate-pulse">
          <div className="col-span-1 h-3 bg-[var(--bg-sunken)]" />
          <div className="col-span-3 h-3 bg-[var(--bg-sunken)]" />
          <div className="col-span-1 h-3 bg-[var(--bg-sunken)]" />
          <div className="col-span-1 h-3 bg-[var(--bg-sunken)]" />
        </div>
      ))}
    </div>
  );
}

// ───────────────── Filter chip row ─────────────────
export function Chips({ items, active, onChange }: { items: string[]; active: string; onChange: (s: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(i => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`h-8 px-3 mono text-[0.66rem] uppercase tracking-[0.18em] border transition-colors ${
            active === i
              ? 'bg-[var(--ink)] text-[var(--bg-raised)] border-[var(--ink)]'
              : 'border-[var(--line)] text-[var(--ink-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
          }`}
        >
          {i}
        </button>
      ))}
    </div>
  );
}

// ───────────────── Mini bar chart (single-hue) ─────────────────
export function MiniBars({ data, max }: { data: { label: string; value: number }[]; max?: number }) {
  const m = max ?? Math.max(...data.map(d => d.value));
  return (
    <div className="grid grid-cols-12 items-end gap-1 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-2 h-full justify-end">
          <motion.div
            initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.04 }}
            style={{ height: `${(d.value / m) * 100}%`, transformOrigin: 'bottom' }}
            className="w-full bg-[var(--accent)] opacity-80"
          />
          <span className="mono text-[0.55rem] tracking-[0.18em] uppercase text-[var(--ink-muted)]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ───────────────── Field (hairline input) ─────────────────
export function Field({ label, type = 'text', ...rest }: { label: string; type?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <div className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mb-2">{label}</div>
      <input
        type={type}
        className="w-full h-11 px-3 bg-transparent border-b border-[var(--line)] focus:border-[var(--accent)] outline-none transition-colors font-sans text-[0.95rem]"
        {...rest}
      />
    </label>
  );
}

// ───────────────── Ghost numeral background ─────────────────
export function Ghost({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span aria-hidden className={`pointer-events-none select-none display absolute leading-none opacity-[0.04] ${className}`}>
      {children}
    </span>
  );
}
