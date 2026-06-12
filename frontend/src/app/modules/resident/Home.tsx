import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ChevronRight, AlertCircle, Calendar } from 'lucide-react';
import { Eyebrow, Panel, Btn, HoldButton, StatusTag } from '../../components/shared/ui';
import { formatBDT, type Notice } from '../../../lib/mock';
import { useAuth } from '../../../lib/auth';
import { useData } from '../../../lib/data';

function greet(h: number) {
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function TowerVignette({ floor }: { floor: number }) {
  const floors = 14;
  const cols = 6;
  const fw = 60;
  const fh = 14;
  const startX = 12;
  const startY = 10;
  return (
    <svg viewBox="0 0 84 240" className="w-20 h-56">
      <rect x={startX - 4} y={startY - 4} width={fw + 8} height={floors * fh + 8} fill="none" stroke="var(--line)" strokeWidth={0.6} />
      {Array.from({ length: floors }).map((_, i) => {
        const f = floors - i;
        const y = startY + i * fh;
        return (
          <g key={f}>
            <line x1={startX} y1={y} x2={startX + fw} y2={y} stroke="var(--line)" strokeWidth={0.4} />
            {Array.from({ length: cols }).map((__, c) => {
              const x = startX + c * (fw / cols);
              const isMe = f === floor && c === 2;
              return (
                <rect
                  key={c}
                  x={x + 1}
                  y={y + 2}
                  width={fw / cols - 2}
                  height={fh - 4}
                  fill={isMe ? 'var(--accent)' : 'transparent'}
                  stroke="var(--line)"
                  strokeWidth={0.4}
                />
              );
            })}
          </g>
        );
      })}
      <line x1={startX - 4} y1={startY + floors * fh + 4} x2={startX + fw + 4} y2={startY + floors * fh + 4} stroke="var(--ink)" strokeWidth={0.8} />
    </svg>
  );
}

export default function ResidentHome() {
  const { invoices: INVOICES, tickets: TICKETS, notices: NOTICES, visitors: VISITORS, units: UNITS } = useData();
  const { session } = useAuth();
  const flat = session?.flat ?? '7C';
  const name = (session?.name ?? 'Nusrat Rahman').split(' ')[0];
  const greeting = greet(new Date().getHours());
  const [sosFired, setSosFired] = useState(false);

  const myInvoices = useMemo(() => {
    const mine = INVOICES.filter(i => i.flat === flat && i.status !== 'paid');
    return mine.length ? mine : INVOICES.filter(i => i.status !== 'paid').slice(0, 1);
  }, [flat]);

  const balance = myInvoices.reduce((s, i) => s + i.amount, 0);
  const dueDate = myInvoices[0]?.due ?? '12 May 2026';

  const todaysVisitors = useMemo(() => {
    const m = VISITORS.filter(v => v.flat === flat);
    return m.length ? m : VISITORS.slice(0, 2);
  }, [flat]);

  const myTickets = useMemo(() => {
    const m = TICKETS.filter(t => t.flat === flat && t.status !== 'resolved');
    return m.length ? m : TICKETS.filter(t => t.status !== 'resolved').slice(0, 1);
  }, [flat]);

  const unit = UNITS.find(u => u.flat === flat) ?? { flat: '7C', floor: 7, size: '1,820 sqft · 3BR' };

  const household = [
    { name: 'Tahmid Rahman', rel: 'Spouse', dob: '12.04.1988' },
    { name: 'Ayaan Rahman', rel: 'Son', dob: '03.09.2016' },
    { name: 'Rokeya Begum', rel: 'Mother', dob: '22.11.1958' },
  ];

  return (
    <div className="p-5 lg:p-10 space-y-10 max-w-[1280px] mx-auto">
      <header className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <Eyebrow num="00" label="আপনার ভবন · My Residence" />
          <h1 className="display text-[2.2rem] lg:text-[3.2rem] leading-[1.05]">
            {greeting}, <span className="italic text-[var(--accent)]">{name}</span>.
          </h1>
          <p className="mono text-[0.7rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mt-3">
            Tonight at Gulshan Heights · Flat {flat}
          </p>
        </div>
        <div className="shrink-0">
          {!sosFired ? (
            <div className="flex flex-col items-end gap-2">
              <HoldButton variant="critical" duration={1200} label="SOS · Hold 1.2s" onConfirm={() => setSosFired(true)} />
              <span className="mono text-[0.6rem] tracking-[0.2em] uppercase text-[var(--ink-muted)]">Emergency only</span>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-[var(--critical)] bg-[var(--bg-raised)] px-5 py-4 max-w-sm"
            >
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle size={14} strokeWidth={1.5} className="text-[var(--critical)]" />
                <span className="mono text-[0.66rem] tracking-[0.2em] uppercase text-[var(--critical)]">Help is on the way</span>
              </div>
              <div className="display text-[1.1rem] mt-2">Guard K. Sheikh dispatched.</div>
              <div className="mono text-[0.7rem] text-[var(--ink-muted)] mt-1">+880 1711 209 044 · Gate A</div>
            </motion.div>
          )}
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-2 p-6 flex items-center gap-6">
          <TowerVignette floor={unit.floor} />
          <div className="flex-1">
            <div className="eyebrow mb-2">Your flat</div>
            <div className="display text-[1.5rem]">Flat {unit.flat}</div>
            <div className="mono text-[0.72rem] tracking-[0.16em] uppercase text-[var(--ink-muted)] mt-2">
              Floor {unit.floor} · {unit.size}
            </div>
            <Link to="/dashboard/explorer" className="mono text-[0.7rem] tracking-[0.18em] uppercase text-[var(--accent)] mt-4 inline-flex items-center gap-2 hover:gap-3 transition-all">
              Open Building Explorer <ChevronRight size={12} strokeWidth={1.5} />
            </Link>
          </div>
        </Panel>
        <Panel className="p-6">
          <div className="eyebrow mb-2">Balance due</div>
          <div className="display text-[2rem] tabular-nums">{formatBDT(balance)}</div>
          <div className="mono text-[0.7rem] tracking-[0.16em] uppercase text-[var(--ink-muted)] mt-1">Due · {dueDate}</div>
          <button className="mt-4 w-full h-11 mono uppercase tracking-[0.18em] text-[0.7rem] bg-[var(--accent)] text-[var(--bg-raised)]">
            Pay via bKash
          </button>
        </Panel>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--line)]">
        <div className="bg-[var(--bg-raised)] p-5">
          <div className="eyebrow mb-2">Today's visitors</div>
          <div className="display text-[1.8rem] tabular-nums">{todaysVisitors.length}</div>
          <div className="mono text-[0.66rem] tracking-[0.16em] uppercase text-[var(--ink-muted)] mt-2 truncate">
            {todaysVisitors.map(v => v.name).join(' · ')}
          </div>
        </div>
        <div className="bg-[var(--bg-raised)] p-5">
          <div className="eyebrow mb-2">Active tickets</div>
          <div className="display text-[1.8rem] tabular-nums">{myTickets.length}</div>
          <div className="mono text-[0.66rem] tracking-[0.16em] uppercase text-[var(--ink-muted)] mt-2 truncate">
            {myTickets[0]?.title ?? 'All resolved'}
          </div>
        </div>
        <div className="bg-[var(--bg-raised)] p-5 col-span-2 lg:col-span-1">
          <div className="eyebrow mb-2">Next waste collection</div>
          <div className="display text-[1.2rem]">Thursday</div>
          <div className="mono text-[0.7rem] tracking-[0.16em] uppercase text-[var(--ink-muted)] mt-2">06:30 · F-block</div>
        </div>
      </section>

      <section>
        <Eyebrow label="Pinned notices · ঘোষণা" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {NOTICES.slice(0, 2).map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <BilingualNotice notice={n} />
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <Eyebrow label="Household · পরিবার" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[var(--line)]">
          {household.map(h => (
            <div key={h.name} className="bg-[var(--bg-raised)] p-5">
              <div className="display text-[1.15rem]">{h.name}</div>
              <div className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mt-1">{h.rel}</div>
              <div className="mono text-[0.7rem] tabular-nums text-[var(--ink-muted)] mt-3">{h.dob}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function BilingualNotice({ notice }: { notice: Notice }) {
  const [tab, setTab] = useState<'en' | 'bn'>('en');
  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between mb-3">
        <StatusTag v={notice.tone === 'urgent' ? 'overdue' : notice.tone === 'friendly' ? 'positive' : 'info'}>
          {notice.tone}
        </StatusTag>
        <div className="flex gap-px bg-[var(--line)]">
          {(['en', 'bn'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-2 py-1 mono text-[0.6rem] uppercase tracking-[0.18em] ${tab === t ? 'bg-[var(--ink)] text-[var(--bg-raised)]' : 'bg-[var(--bg-raised)] text-[var(--ink-muted)]'}`}
            >
              {t === 'en' ? 'EN' : 'বাং'}
            </button>
          ))}
        </div>
      </div>
      <h4 className="display text-[1.2rem] leading-snug mb-2">{notice.title}</h4>
      <p className="text-[0.92rem] text-[var(--ink-muted)] leading-relaxed">
        {tab === 'en' ? notice.bodyEn : notice.bodyBn}
      </p>
      <div className="mono text-[0.62rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mt-4">{notice.posted}</div>
    </Panel>
  );
}
