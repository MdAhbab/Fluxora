import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Calendar, BarChart3, Megaphone, Briefcase } from 'lucide-react';
import { Eyebrow, Panel, Chips, Btn, HoldButton, EmptyState } from '../../components/shared/ui';
import { formatBDT } from '../../../lib/mock';
import { useData } from '../../../lib/data';

type Row = {
  id: string;
  kind: 'Expenses' | 'Bookings' | 'Polls' | 'Notices' | 'Vendor reviews';
  title: string;
  raised: string;
  detail: string;
};

const VENDOR_REVIEWS: { id: string; title: string; raised: string; detail: string }[] = [
  { id: 'V-12', title: 'CleanWorks BD — contract renewal', raised: 'Admin · 07 May', detail: '12 mo · ৳ 38k/mo' },
  { id: 'V-11', title: 'Padma Diesel — new rate card', raised: 'Admin · 05 May', detail: '+3% diesel' },
];

const TABS = ['All', 'Expenses', 'Bookings', 'Polls', 'Notices', 'Vendor reviews'] as const;

function iconFor(kind: Row['kind']) {
  const cls = 'shrink-0 text-[var(--ink-muted)]';
  if (kind === 'Expenses') return <FileText size={24} strokeWidth={1.5} className={cls} />;
  if (kind === 'Bookings') return <Calendar size={24} strokeWidth={1.5} className={cls} />;
  if (kind === 'Polls') return <BarChart3 size={24} strokeWidth={1.5} className={cls} />;
  if (kind === 'Notices') return <Megaphone size={24} strokeWidth={1.5} className={cls} />;
  return <Briefcase size={24} strokeWidth={1.5} className={cls} />;
}

export default function CommitteeApprovals() {
  const { expenses: EXPENSES, bookings: BOOKINGS, polls: POLLS, notices: NOTICES } = useData();
  const [tab, setTab] = useState<string>('All');

  const allRows = useMemo<Row[]>(() => {
    return [
      ...EXPENSES.map<Row>(e => ({
        id: e.id, kind: 'Expenses',
        title: `${e.vendor} — ${e.category}`,
        raised: `Admin · ${e.date}`,
        detail: formatBDT(e.amount),
      })),
      ...BOOKINGS.filter(b => b.status === 'pending').map<Row>(b => ({
        id: b.id, kind: 'Bookings',
        title: `${b.facility} — ${b.when}`,
        raised: `${b.resident} · Flat ${b.flat}`,
        detail: 'Hall',
      })),
      ...POLLS.map<Row>(p => ({
        id: p.id, kind: 'Polls',
        title: p.question,
        raised: `Closes ${p.closes} · ${p.options.length} options`,
        detail: 'Draft',
      })),
      ...NOTICES.slice(0, 2).map<Row>(n => ({
        id: n.id, kind: 'Notices',
        title: n.title,
        raised: `Notice Scribe · ${n.tone}`,
        detail: 'Publish',
      })),
      ...VENDOR_REVIEWS.map<Row>(v => ({
        id: v.id, kind: 'Vendor reviews',
        title: v.title, raised: v.raised, detail: v.detail,
      })),
    ];
  }, [EXPENSES, BOOKINGS, POLLS, NOTICES]);

  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const rows = allRows.filter(r => !removed.has(r.id));
  const filtered = tab === 'All' ? rows : rows.filter(r => r.kind === tab);
  const remove = (id: string) => setRemoved(prev => new Set(prev).add(id));

  return (
    <div className="p-6 lg:p-10 space-y-10">
      <header>
        <Eyebrow num="01" label="Approvals" />
        <h1 className="display text-[2.8rem] lg:text-[3.4rem] leading-[1.05]">
          Sign-off, <span className="italic text-[var(--accent)]">considered</span>
        </h1>
      </header>

      <Chips items={[...TABS]} active={tab} onChange={setTab} />

      <Panel num="·" title={`${filtered.length} item${filtered.length === 1 ? '' : 's'} in queue`}>
        {filtered.length === 0 ? (
          <EmptyState title="Nothing waiting" hint="The desk is clear" />
        ) : (
          <ul className="divide-y divide-[var(--line)]">
            {filtered.map((r, i) => (
              <motion.li
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="px-6 py-5 grid grid-cols-[auto,1fr,auto] gap-5 items-center"
              >
                {iconFor(r.kind)}
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="mono text-[0.6rem] tracking-[0.2em] uppercase text-[var(--accent)]">{r.kind}</span>
                    <span className="mono text-[0.62rem] tracking-[0.16em] uppercase text-[var(--ink-muted)]">{r.id}</span>
                  </div>
                  <div className="text-[0.95rem] text-[var(--ink)] truncate">{r.title}</div>
                  <div className="mono text-[0.66rem] tracking-[0.14em] uppercase text-[var(--ink-muted)] mt-1">
                    Raised by {r.raised}
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-end md:items-center gap-3">
                  <span className="mono text-[0.8rem] tabular-nums text-[var(--ink)]">{r.detail}</span>
                  <div className="flex gap-2">
                    <Btn variant="primary" onClick={() => remove(r.id)}>Approve</Btn>
                    <HoldButton variant="critical" label="Hold to reject" duration={1200} onConfirm={() => remove(r.id)} />
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
