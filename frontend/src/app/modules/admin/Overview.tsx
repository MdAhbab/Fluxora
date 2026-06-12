import { motion } from 'motion/react';
import { Eyebrow, Panel, KPI, StatusDot, StatusTag, MiniBars } from '../../components/shared/ui';
import { BuildingExplorer } from '../../components/shared/Explorer';
import { formatBDT } from '../../../lib/mock';
import { useData } from '../../../lib/data';
import { Activity, Truck, ArrowUpRight } from 'lucide-react';

type Variant = 'positive' | 'pending' | 'overdue' | 'info' | 'neutral';

type LedgerItem = {
  kind: 'gate' | 'ticket' | 'notice';
  time: string;
  title: string;
  detail: string;
  v: Variant;
};

const FOOTFALL = Array.from({ length: 12 }, (_, i) => {
  const hours = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'];
  const vals = [4, 2, 1, 8, 24, 42, 38, 31, 36, 58, 47, 22];
  return { label: hours[i], value: vals[i] };
});

export default function AdminOverview() {
  const { invoices: INVOICES, tickets: TICKETS, notices: NOTICES, gateLogs: GATE_LOGS, lifts: LIFTS } = useData();
  const outstanding = INVOICES.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);
  const cleared = INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const openTickets = TICKETS.filter(t => t.status !== 'resolved').length;

  const ledger: LedgerItem[] = [
    ...GATE_LOGS.slice(0, 5).map<LedgerItem>(g => ({
      kind: 'gate',
      time: g.time,
      title: `Gate ${g.gate} · ${g.flat}`,
      detail: g.detail,
      v: g.type === 'denied' ? 'overdue' : g.type === 'manual' ? 'pending' : 'positive',
    })),
    ...TICKETS.slice(0, 4).map<LedgerItem>(t => ({
      kind: 'ticket',
      time: t.opened,
      title: `${t.id} · ${t.flat}`,
      detail: t.title,
      v: t.status === 'resolved' ? 'positive' : t.status === 'in-progress' ? 'info' : 'pending',
    })),
    ...NOTICES.slice(0, 2).map<LedgerItem>(n => ({
      kind: 'notice',
      time: n.posted,
      title: 'Notice',
      detail: n.title,
      v: 'neutral',
    })),
  ];

  return (
    <div className="space-y-12">
      <header>
        <Eyebrow num="00" label="Command" />
        <h1 className="display text-[3.2rem] leading-[1.05] tracking-tight">
          Good evening, <span className="italic text-[var(--accent)]">A. Mahmud</span>.
        </h1>
        <p className="mono text-[0.72rem] uppercase tracking-[0.2em] text-[var(--ink-muted)] mt-3">
          Gulshan Heights · Tuesday, 11 June 2026
        </p>
      </header>

      {/* KPI row */}
      <section>
        <Eyebrow num="01" label="Pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--line)]">
          {[
            { label: 'Outstanding', value: (outstanding / 1000).toFixed(0) + 'K', unit: '৳', hint: '+4% MoM' },
            { label: 'Cleared this month', value: (cleared / 1_000_000).toFixed(2) + 'M', unit: '৳', hint: '21 of 24 invoices' },
            { label: 'Open tickets', value: String(openTickets), hint: '2 high priority' },
            { label: 'Occupancy', value: '94', unit: '%', hint: '79 of 84 units' },
          ].map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <KPI {...k} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Explorer + Ledger */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Eyebrow num="02" label="Estate explorer" />
          <Panel>
            <BuildingExplorer role="admin" />
          </Panel>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Eyebrow num="03" label="Activity ledger" />
          <Panel
            title="Live stream"
            num="·"
            action={<StatusTag v="positive">Live</StatusTag>}
          >
            <ul className="divide-y divide-[var(--line)]">
              {ledger.map((item, i) => (
                <motion.li
                  key={`${item.kind}-${i}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="px-6 py-3 flex items-start gap-4 hover:bg-[var(--bg-sunken)] transition-colors"
                >
                  <span className="mono text-[0.7rem] tabular-nums text-[var(--ink-muted)] w-16 shrink-0 pt-1">
                    {item.time}
                  </span>
                  <span className="pt-2"><StatusDot v={item.v} /></span>
                  <div className="flex-1 min-w-0">
                    <div className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                      {item.kind}
                    </div>
                    <div className="text-[0.92rem] truncate">{item.detail}</div>
                  </div>
                  <span className="mono text-[0.7rem] text-[var(--ink-muted)] shrink-0">{item.title}</span>
                </motion.li>
              ))}
            </ul>
          </Panel>
        </motion.div>
      </section>

      {/* Bottom strip */}
      <section>
        <Eyebrow num="04" label="Today" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--line)]">
          <div className="bg-[var(--bg-raised)] p-6">
            <div className="mono text-[0.66rem] uppercase tracking-[0.22em] text-[var(--ink-muted)] flex items-center gap-2">
              <Activity size={12} strokeWidth={1.5} /> Lift status
            </div>
            <ul className="mt-5 space-y-3">
              {LIFTS.map(l => (
                <li key={l.id} className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <StatusDot
                      v={l.status === 'operational' ? 'positive' : l.status === 'service' ? 'pending' : 'overdue'}
                      pulse={l.status !== 'operational'}
                    />
                    <span className="display text-[1.1rem]">{l.label}</span>
                  </span>
                  <span className="mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                    {l.status} · F{l.floor}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[var(--bg-raised)] p-6">
            <div className="mono text-[0.66rem] uppercase tracking-[0.22em] text-[var(--ink-muted)] flex items-center gap-2">
              <Truck size={12} strokeWidth={1.5} /> Next waste collection
            </div>
            <div className="display text-[1.6rem] mt-4 leading-tight">
              Thursday <span className="italic text-[var(--accent)]">14 May</span>
            </div>
            <div className="mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--ink-muted)] mt-2">
              F-block · 07:00–09:00
            </div>
          </div>

          <div className="bg-[var(--bg-raised)] p-6">
            <div className="mono text-[0.66rem] uppercase tracking-[0.22em] text-[var(--ink-muted)] flex items-center gap-2 mb-4">
              <ArrowUpRight size={12} strokeWidth={1.5} /> Today's footfall
            </div>
            <MiniBars data={FOOTFALL} />
          </div>
        </div>
      </section>

      <p className="mono text-[0.6rem] uppercase tracking-[0.22em] text-[var(--ink-muted)] text-center pt-8">
        End of command brief · {formatBDT(outstanding)} pending
      </p>
    </div>
  );
}
