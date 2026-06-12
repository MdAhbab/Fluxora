import { useState } from 'react';
import { motion } from 'motion/react';
import { Eyebrow, Panel, KPI, Btn, HoldButton, StatusDot } from '../../components/shared/ui';
import { BuildingExplorer } from '../../components/shared/Explorer';
import { formatBDT } from '../../../lib/mock';
import { useData } from '../../../lib/data';

type ApprovalItem = {
  id: string;
  type: 'EXPENSE' | 'BOOKING' | 'POLL' | 'NOTICE';
  title: string;
  sub: string;
  detail: string;
};

const APPROVALS: ApprovalItem[] = [
  { id: 'E-22', type: 'EXPENSE', title: 'Padma Diesel — generator refill', sub: 'Raised by A. Mahmud · 08 May', detail: formatBDT(84_000) },
  { id: 'B-43', type: 'BOOKING', title: 'Community Hall — 20 May', sub: 'M. Begum · Flat 14B · 11:00–15:00', detail: '4 hrs' },
  { id: 'P-04', type: 'POLL', title: 'Pool reopening hours — draft', sub: 'Drafted by S. Karim · 3 options', detail: '5 day close' },
  { id: 'N-09', type: 'NOTICE', title: 'Service-charge revision — June', sub: 'Notice Scribe · formal tone', detail: 'Publish' },
  { id: 'E-21', type: 'EXPENSE', title: 'AquaPure — water treatment', sub: 'Raised by A. Mahmud · 06 May', detail: formatBDT(22_500) },
  { id: 'B-44', type: 'BOOKING', title: 'Rooftop — 18 May', sub: 'F. Hossain · Flat 9D · 18:00–22:00', detail: '4 hrs' },
];

const LEDGER = [
  { who: 'S. Karim', action: 'approved expense E-19 (Otis Services)', t: '08 May · 14:22' },
  { who: 'R. Hossain', action: 'published notice N-08 (Lift B maintenance)', t: '08 May · 11:03' },
  { who: 'S. Karim', action: 'rejected booking B-40 (rooftop · double-booked)', t: '07 May · 19:41' },
  { who: 'T. Ahmed', action: 'voted on poll P-03 (EV charging)', t: '07 May · 09:18' },
  { who: 'S. Karim', action: 'approved expense E-18 (DPDC utility)', t: '06 May · 16:50' },
];

const VOTES = [
  { id: 'P-03', label: 'EV charging in B-bay', cast: 'Yes' },
  { id: 'P-02', label: 'Pool maintenance cadence', cast: 'Biweekly' },
  { id: 'P-01', label: 'Quarterly audit firm renewal', cast: 'Yes' },
];

export default function CommitteeOverview() {
  const { expenses: EXPENSES, bookings: BOOKINGS, polls: POLLS } = useData();
  const [items, setItems] = useState(APPROVALS);
  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <div className="p-6 lg:p-10 space-y-10">
      <header>
        <Eyebrow num="00" label="Boardroom" />
        <h1 className="display text-[2.8rem] lg:text-[3.4rem] leading-[1.05]">
          The <span className="italic text-[var(--accent)]">Boardroom</span>
        </h1>
        <p className="mono text-[0.72rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mt-3">
          Oversight · sign-off · the Pulse
        </p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--line)]">
        <KPI label="Pending approvals" value={String(items.length)} hint="Awaiting sign-off" />
        <KPI label="Expenses to review" value={formatBDT(EXPENSES.reduce((s, e) => s + e.amount, 0))} unit="BDT" hint="May, to date" />
        <KPI label="Cleared this month" value="৳ 1.84 M" hint="42 of 84 invoices" />
        <KPI label="Open polls" value={String(POLLS.length)} hint={`${BOOKINGS.length} bookings pending`} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 order-2 lg:order-1">
          <BuildingExplorer role="committee" />
        </div>

        <div className="lg:col-span-5 order-1 lg:order-2 space-y-6">
          <Panel num="·" title="Approvals · awaiting sign-off">
            <ul className="divide-y divide-[var(--line)]">
              {items.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="px-6 py-5"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="mono text-[0.6rem] tracking-[0.2em] uppercase text-[var(--accent)] border border-[var(--accent)]/40 px-1.5 py-0.5">
                          {item.type}
                        </span>
                        <span className="mono text-[0.62rem] tracking-[0.18em] uppercase text-[var(--ink-muted)]">{item.id}</span>
                      </div>
                      <div className="text-[0.95rem] text-[var(--ink)] truncate">{item.title}</div>
                      <div className="mono text-[0.66rem] tracking-[0.14em] uppercase text-[var(--ink-muted)] mt-1">{item.sub}</div>
                    </div>
                    <div className="mono text-[0.78rem] text-[var(--ink)] tabular-nums whitespace-nowrap">{item.detail}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Btn variant="primary" onClick={() => remove(item.id)}>Approve</Btn>
                    <HoldButton variant="critical" duration={1200} label="Hold to reject" onConfirm={() => remove(item.id)} />
                  </div>
                </motion.li>
              ))}
              {items.length === 0 && (
                <li className="px-6 py-10 text-center mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                  Inbox clear · the building rests
                </li>
              )}
            </ul>
          </Panel>

          <Panel num="·" title="Recent committee actions">
            <ul className="divide-y divide-[var(--line)]">
              {LEDGER.map((row, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  className="px-6 py-3 flex items-baseline justify-between gap-4"
                >
                  <div className="flex items-baseline gap-3 min-w-0">
                    <StatusDot v="positive" />
                    <span className="text-[0.86rem] truncate">
                      <span className="text-[var(--ink)]">{row.who}</span>{' '}
                      <span className="text-[var(--ink-muted)]">{row.action}</span>
                    </span>
                  </div>
                  <span className="mono text-[0.62rem] tracking-[0.16em] uppercase text-[var(--ink-muted)] whitespace-nowrap">{row.t}</span>
                </motion.li>
              ))}
            </ul>
          </Panel>
        </div>
      </section>

      <section>
        <Eyebrow num="·" label="This week · votes you've cast" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--line)]">
          {VOTES.map(v => (
            <div key={v.id} className="bg-[var(--bg-raised)] p-5">
              <div className="mono text-[0.62rem] tracking-[0.2em] uppercase text-[var(--ink-muted)] mb-2">{v.id}</div>
              <div className="text-[0.92rem] text-[var(--ink)] mb-3">{v.label}</div>
              <div className="mono text-[0.7rem] tracking-[0.18em] uppercase text-[var(--accent)]">Cast · {v.cast}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
