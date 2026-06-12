import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Share2 } from 'lucide-react';
import { Eyebrow, Panel, Chips, Btn, Field, Drawer, StatusDot } from '../../components/shared/ui';
import { type Visitor } from '../../../lib/mock';
import { useAuth } from '../../../lib/auth';
import { useData } from '../../../lib/data';

const PURPOSES = ['Personal', 'Delivery', 'Service'];

function FakeQR({ seed = 'FLX' }: { seed?: string }) {
  // deterministic pseudo-random grid
  const size = 21;
  const cells: boolean[] = [];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  for (let i = 0; i < size * size; i++) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    cells.push((h % 7) < 3);
  }
  // corner finders
  const isFinder = (r: number, c: number) => {
    const inBox = (r0: number, c0: number) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7;
    return inBox(0, 0) || inBox(0, size - 7) || inBox(size - 7, 0);
  };
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-44 h-44 bg-white p-2">
      {Array.from({ length: size * size }).map((_, i) => {
        const r = Math.floor(i / size);
        const c = i % size;
        const finder = isFinder(r, c);
        let on = cells[i];
        if (finder) {
          const inner = (r >= 2 && r <= 4 && c >= 2 && c <= 4)
            || (r >= 2 && r <= 4 && c >= size - 5 && c <= size - 3)
            || (r >= size - 5 && r <= size - 3 && c >= 2 && c <= 4);
          const edge = (r === 0 || r === 6 || c === 0 || c === 6)
            || (r === 0 || r === 6 || c === size - 1 || c === size - 7)
            || (r === size - 1 || r === size - 7 || c === 0 || c === 6);
          on = inner || (edge && (r < 7 || r >= size - 7) && (c < 7 || c >= size - 7));
        }
        return on ? <rect key={i} x={c} y={r} width={1} height={1} fill="#1a1410" /> : null;
      })}
    </svg>
  );
}

function GatePass({ visitor }: { visitor: { name: string; flat: string; when: string; qr: string; phone?: string } }) {
  return (
    <div className="relative bg-[var(--bg-raised)] border-2 border-[var(--accent)] p-6">
      {/* corner brackets */}
      {[
        'top-0 left-0 border-t-2 border-l-2',
        'top-0 right-0 border-t-2 border-r-2',
        'bottom-0 left-0 border-b-2 border-l-2',
        'bottom-0 right-0 border-b-2 border-r-2',
      ].map((c, i) => <span key={i} className={`absolute w-3 h-3 border-[var(--ink)] ${c}`} />)}
      {/* crosshair */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-[var(--line)] opacity-60" />
      <div className="absolute inset-y-0 left-1/2 w-px bg-[var(--line)] opacity-60" />

      <div className="relative space-y-5">
        <div className="flex items-center justify-between">
          <span className="mono text-[0.66rem] tracking-[0.24em] uppercase text-[var(--accent)]">FLUXORA</span>
          <span className="mono text-[0.66rem] tracking-[0.24em] uppercase text-[var(--ink-muted)]">Visitor Pass</span>
        </div>
        <div>
          <div className="mono text-[0.6rem] tracking-[0.2em] uppercase text-[var(--ink-muted)]">Guest</div>
          <div className="display text-[1.8rem] leading-tight">{visitor.name}</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mono text-[0.6rem] tracking-[0.2em] uppercase text-[var(--ink-muted)]">Flat</div>
            <div className="display text-[3rem] leading-none tabular-nums">{visitor.flat}</div>
          </div>
          <div>
            <div className="mono text-[0.6rem] tracking-[0.2em] uppercase text-[var(--ink-muted)]">Window</div>
            <div className="mono text-[0.9rem] mt-2 tabular-nums">{visitor.when}</div>
          </div>
        </div>
        <div className="flex items-center justify-center pt-3">
          <FakeQR seed={visitor.qr} />
        </div>
        <div className="text-center mono text-[0.66rem] tracking-[0.22em] uppercase text-[var(--ink-muted)]">{visitor.qr}</div>
        <div className="flex justify-center pt-2">
          <Btn variant="outline"><Share2 size={12} strokeWidth={1.5} /> Share pass</Btn>
        </div>
      </div>
    </div>
  );
}

export default function ResidentVisitors() {
  const { visitors: VISITORS, createAppointment } = useData();
  const { session } = useAuth();
  const flat = session?.flat ?? '7C';
  const [purpose, setPurpose] = useState('Personal');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [tab, setTab] = useState<'Upcoming' | 'Past'>('Upcoming');
  const [drawerPass, setDrawerPass] = useState<Visitor | null>(null);
  const [createdPass, setCreatedPass] = useState<{ name: string; flat: string; when: string; qr: string } | null>(null);

  const upcoming = useMemo(() => {
    const m = VISITORS.filter(v => v.status === 'expected');
    return m.length ? m : VISITORS.slice(0, 2);
  }, [VISITORS]);
  const past = useMemo(() => VISITORS.filter(v => v.status === 'checked-out' || v.status === 'checked-in'), [VISITORS]);

  const list = tab === 'Upcoming' ? upcoming : past;

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createAppointment({ visitor_name: name, visitor_phone: phone, scheduled_time: new Date().toISOString() });
    setCreatedPass({
      name,
      flat,
      when: 'Today · 20:30',
      qr: 'FLX-V' + Math.floor(900 + Math.random() * 99),
    });
  };

  return (
    <div className="p-5 lg:p-10 space-y-12 max-w-[1280px] mx-auto">
      <header>
        <Eyebrow num="03" label="Visitors · অতিথি" />
        <h1 className="display text-[2.2rem] lg:text-[3rem] leading-[1.05]">
          Your <span className="italic text-[var(--accent)]">gate pass</span>.
        </h1>
        <p className="mono text-[0.7rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mt-3">
          Pre-register guests · skip the gate queue
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Eyebrow label="Pre-register a visitor" dense />
          <Panel className="p-6 space-y-5">
            <Field label="Guest name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} placeholder="e.g. F. Hasan" />
            <Field label="Phone" type="tel" value={phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)} placeholder="+880 1xxx ..." />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date" type="date" />
              <Field label="Time" type="time" />
            </div>
            <div>
              <div className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mb-3">Purpose</div>
              <Chips items={PURPOSES} active={purpose} onChange={setPurpose} />
            </div>
            <button
              onClick={handleCreate}
              className="w-full h-11 mono uppercase tracking-[0.18em] text-[0.7rem] bg-[var(--ink)] text-[var(--bg-raised)]"
            >
              Create pass
            </button>
          </Panel>
        </div>

        <div>
          <Eyebrow label="Pass preview" dense />
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={createdPass?.qr ?? 'default'}>
            <GatePass
              visitor={createdPass ?? { name: 'F. Hasan', flat, when: 'Today · 19:30', qr: 'FLX-V901' }}
            />
          </motion.div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <Eyebrow label="Pass history" dense />
          <div className="flex gap-px bg-[var(--line)]">
            {(['Upcoming', 'Past'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 mono text-[0.66rem] uppercase tracking-[0.18em] ${tab === t ? 'bg-[var(--ink)] text-[var(--bg-raised)]' : 'bg-[var(--bg-raised)] text-[var(--ink-muted)]'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <Panel>
          <ul className="divide-y divide-[var(--line)]">
            {list.map((v, i) => (
              <motion.li
                key={v.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="px-6 py-4 grid grid-cols-12 items-center gap-3"
              >
                <span className="col-span-2 mono text-[0.7rem] tracking-[0.14em] uppercase text-[var(--ink-muted)]">{v.id}</span>
                <span className="col-span-4 text-[0.95rem]">{v.name}</span>
                <span className="col-span-3 mono text-[0.78rem] text-[var(--ink-muted)]">{v.when}</span>
                <span className="col-span-2 flex items-center gap-2">
                  <StatusDot v={v.status === 'checked-in' ? 'positive' : v.status === 'expected' ? 'info' : 'neutral'} />
                  <span className="mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">{v.status}</span>
                </span>
                <span className="col-span-1 flex justify-end">
                  {tab === 'Upcoming' && (
                    <button
                      onClick={() => setDrawerPass(v)}
                      className="mono text-[0.62rem] tracking-[0.18em] uppercase text-[var(--accent)] hover:underline"
                    >
                      Show
                    </button>
                  )}
                </span>
              </motion.li>
            ))}
          </ul>
        </Panel>
      </section>

      <Drawer open={!!drawerPass} onClose={() => setDrawerPass(null)} title="Visitor pass" width={460}>
        {drawerPass && (
          <GatePass visitor={{ name: drawerPass.name, flat: drawerPass.flat, when: drawerPass.when, qr: drawerPass.qr }} />
        )}
      </Drawer>
    </div>
  );
}
