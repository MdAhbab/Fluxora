import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import { Eyebrow, Panel, Btn, Drawer } from '../../components/shared/ui';
import { useAuth } from '../../../lib/auth';
import { useData } from '../../../lib/data';

const WEEK = [
  { d: 'Mon', h: 8.2 },
  { d: 'Tue', h: 8.0 },
  { d: 'Wed', h: 9.1 },
  { d: 'Thu', h: 7.8 },
  { d: 'Fri', h: 8.5 },
  { d: 'Sat', h: 4.0 },
  { d: 'Sun', h: 0 },
];

function HoldCircle({ clockedIn, onConfirm, duration = 1200 }: { clockedIn: boolean; onConfirm: () => void; duration?: number }) {
  const [progress, setProgress] = useState(0);
  const raf = useRef<number | null>(null);
  const start = useRef(0);
  const resetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (resetTimeout.current) clearTimeout(resetTimeout.current); }, []);

  const begin = () => {
    start.current = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start.current) / duration);
      setProgress(p);
      if (p < 1) raf.current = requestAnimationFrame(step);
      else {
        onConfirm();
        resetTimeout.current = setTimeout(() => setProgress(0), 400);
      }
    };
    raf.current = requestAnimationFrame(step);
  };
  const cancel = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    setProgress(0);
  };

  const size = 192;
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;

  return (
    <button
      onPointerDown={begin}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      className="relative h-48 w-48 rounded-full border border-[var(--line)] bg-[var(--bg-raised)] grid place-items-center overflow-hidden hover:border-[var(--accent)] transition-colors"
    >
      <svg className="absolute inset-0 -rotate-90 pointer-events-none" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent)" strokeWidth="3"
          strokeDasharray={c} strokeDashoffset={c - c * progress}
          style={{ transition: progress === 0 ? 'stroke-dashoffset .3s' : 'none' }}
        />
      </svg>
      <div className="text-center px-4">
        {clockedIn ? (
          <>
            <div className="mono text-[0.6rem] tracking-[0.22em] uppercase text-[var(--ink-muted)]">In since</div>
            <div className="display tabular-nums text-[2rem] leading-none mt-2">08:02</div>
            <div className="mono text-[0.66rem] tracking-[0.22em] uppercase text-[var(--accent)] mt-3">Hold · clock out</div>
          </>
        ) : (
          <>
            <Clock size={22} strokeWidth={1.5} className="mx-auto text-[var(--ink-muted)] mb-2" />
            <div className="mono text-[0.78rem] tracking-[0.22em] uppercase text-[var(--ink)]">Clock in</div>
            <div className="mono text-[0.6rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mt-2">Hold to confirm</div>
          </>
        )}
      </div>
    </button>
  );
}

function PinPad({ onClose }: { onClose: () => void }) {
  const [pin, setPin] = useState('');
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'];

  const press = (k: string) => {
    if (k === '⌫') setPin(p => p.slice(0, -1));
    else if (k === '✓') {
      onClose();
      setPin('');
    } else if (pin.length < 6) setPin(p => p + k);
  };

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      <div>
        <div className="mono text-[0.66rem] tracking-[0.22em] uppercase text-[var(--ink-muted)] text-center mb-3">Enter PIN</div>
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-10 h-12 border border-[var(--line)] grid place-items-center display text-[1.4rem] tabular-nums bg-[var(--bg-sunken)]">
              {pin[i] ? '•' : ''}
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {keys.map(k => (
          <button
            key={k}
            onClick={() => press(k)}
            className="h-16 border border-[var(--line)] hover:border-[var(--accent)] hover:text-[var(--accent)] bg-[var(--bg-raised)] mono text-[1.2rem] tabular-nums transition-colors"
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Attendance() {
  const { staff, checkinStaff, checkoutStaff } = useData();
  const { session } = useAuth();
  const [clockedIn, setClockedIn] = useState(true);
  const [kiosk, setKiosk] = useState(false);

  const me = staff.find(s => s.name === session?.name) ?? staff[0];
  const myPk = me ? Number(me.id.replace(/^S-/, '')) : 0;

  const handleConfirm = async () => {
    const ok = clockedIn ? await checkoutStaff(myPk) : await checkinStaff(myPk);
    if (ok) setClockedIn(v => !v);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Eyebrow num="01" label="Attendance" />

        {/* Clock in/out */}
        <div className="flex flex-col items-center py-10">
          <HoldCircle clockedIn={clockedIn} onConfirm={handleConfirm} />
          <div className="mono text-[0.66rem] tracking-[0.22em] uppercase text-[var(--ink-muted)] mt-6">
            {clockedIn ? 'You are on duty' : 'Off duty'}
          </div>
        </div>

        {/* Week strip */}
        <Panel title="This week" num="02" className="mb-6">
          <div className="p-6 space-y-3">
            {WEEK.map((w, i) => {
              const pct = (w.h / 10) * 100;
              return (
                <div key={w.d} className="flex items-center gap-4">
                  <div className="mono text-[0.66rem] tracking-[0.22em] uppercase text-[var(--ink-muted)] w-10">{w.d}</div>
                  <div className="flex-1 h-3 bg-[var(--bg-sunken)] relative overflow-hidden">
                    {w.h > 0 ? (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: i * 0.06, ease: [0.7, 0, 0.2, 1] }}
                        className="h-full bg-[var(--accent)]"
                      />
                    ) : null}
                  </div>
                  <div className="mono tabular-nums text-[0.72rem] text-[var(--ink-muted)] w-14 text-right">
                    {w.h > 0 ? `${w.h.toFixed(1)}h` : 'OFF'}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Monthly hours */}
        <Panel title="This month" num="03" className="mb-6">
          <div className="p-6 flex items-end justify-between">
            <div>
              <div className="display text-[2.6rem] tabular-nums leading-none">184<span className="mono text-[1rem] ml-2 text-[var(--ink-muted)]">hrs</span></div>
              <div className="mono text-[0.66rem] tracking-[0.22em] uppercase text-[var(--ink-muted)] mt-3">This month</div>
            </div>
            <div className="text-right">
              <div className="mono text-[0.66rem] tracking-[0.22em] uppercase text-[var(--ink-muted)]">Overtime</div>
              <div className="display text-[1.4rem] tabular-nums leading-none mt-2">12<span className="mono text-[0.7rem] ml-1 text-[var(--ink-muted)]">hrs</span></div>
            </div>
          </div>
        </Panel>

        {/* Kiosk */}
        <Panel title="Kiosk mode" num="04">
          <div className="p-6 flex items-center justify-between gap-4">
            <div>
              <div className="display text-[1.1rem]">Shared tablet?</div>
              <div className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mt-1">PIN-secured clock in/out</div>
            </div>
            <Btn variant="outline" className="h-12" onClick={() => setKiosk(true)}>
              Open kiosk pin pad
            </Btn>
          </div>
        </Panel>
      </div>

      <Drawer open={kiosk} onClose={() => setKiosk(false)} title="Kiosk · enter PIN" width={600}>
        <PinPad onClose={() => setKiosk(false)} />
      </Drawer>
    </div>
  );
}
