import { useState } from 'react';
import { motion } from 'motion/react';
import { Eyebrow, Panel, StatusDot, StatusTag, Btn, Chips } from '../../components/shared/ui';
import { formatBDT, type Ticket } from '../../../lib/mock';
import { useData } from '../../../lib/data';
import { GripVertical, Phone } from 'lucide-react';

const TABS = ['Tickets', 'Staff', 'Assets', 'Vendors'];
const ASSET_FILTERS = ['All', 'OK', 'Service soon', 'Attention'];

const VENDORS = [
  { id: 'V-AC', name: 'CoolAir Services', cat: 'AC & HVAC', rating: 4, phone: '+880 1712 ...' },
  { id: 'V-PL', name: 'AquaFix Plumbing', cat: 'Plumbing', rating: 5, phone: '+880 1825 ...' },
  { id: 'V-EL', name: 'Volt Electric', cat: 'Electrical', rating: 4, phone: '+880 1611 ...' },
  { id: 'V-CL', name: 'CleanWorks BD', cat: 'Cleaning', rating: 4, phone: '+880 1934 ...' },
  { id: 'V-SE', name: 'Sentinel Guards', cat: 'Security', rating: 5, phone: '+880 1717 ...' },
];

export default function AdminOperations() {
  const { staff: STAFF, assets: ASSETS } = useData();
  const [tab, setTab] = useState('Tickets');
  const [assetFilter, setAssetFilter] = useState('All');

  return (
    <div className="space-y-10">
      <header>
        <Eyebrow num="00" label="Operations" />
        <h1 className="display text-[3rem] leading-[1.05] tracking-tight">
          The <span className="italic text-[var(--accent)]">working</span> building.
        </h1>
      </header>

      <Chips items={TABS} active={tab} onChange={setTab} />

      {tab === 'Tickets' && <TicketsKanban />}

      {tab === 'Staff' && (
        <section className="space-y-8">
          <Panel title="On duty now" num="01">
            <div className="px-6 py-5 flex flex-wrap gap-x-8 gap-y-4">
              {STAFF.filter(s => s.status === 'on-duty').map(s => (
                <div key={s.id} className="flex items-center gap-2">
                  <StatusDot v="positive" />
                  <span className="mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                    {s.name.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Roster" num="02">
            <div className="hidden md:grid grid-cols-12 px-6 py-3 mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] border-b border-[var(--line)]">
              <div className="col-span-3">Name</div>
              <div className="col-span-3">Role</div>
              <div className="col-span-2">Shift</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Hours</div>
              <div className="col-span-2 text-right">Pay</div>
            </div>
            <ul className="divide-y divide-[var(--line)]">
              {STAFF.map((s, i) => (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="grid grid-cols-2 md:grid-cols-12 gap-2 px-6 py-4"
                >
                  <div className="md:col-span-3 text-[0.95rem]">{s.name}</div>
                  <div className="md:col-span-3 mono text-[0.78rem] text-[var(--ink-muted)]">{s.role}</div>
                  <div className="md:col-span-2 mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">{s.shift}</div>
                  <div className="md:col-span-1 flex items-center gap-2">
                    <StatusDot v={s.status === 'on-duty' ? 'positive' : s.status === 'leave' ? 'overdue' : 'neutral'} />
                    <span className="mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">{s.status}</span>
                  </div>
                  <div className="md:col-span-1 mono tabular-nums text-right text-[0.86rem]">{s.hoursMonth}h</div>
                  <div className="md:col-span-2 mono tabular-nums text-right">{formatBDT(s.payMonth)}</div>
                </motion.li>
              ))}
            </ul>
          </Panel>
        </section>
      )}

      {tab === 'Assets' && (
        <section className="space-y-6">
          <Chips items={ASSET_FILTERS} active={assetFilter} onChange={setAssetFilter} />
          <Panel title="Registry" num="03">
            <ul className="divide-y divide-[var(--line)]">
              {ASSETS.filter(a => {
                if (assetFilter === 'All') return true;
                if (assetFilter === 'OK') return a.status === 'ok';
                if (assetFilter === 'Service soon') return a.status === 'service-soon';
                return a.status === 'attention';
              }).map((a, i) => (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="grid grid-cols-2 md:grid-cols-12 gap-2 px-6 py-4"
                >
                  <div className="md:col-span-2 mono text-[0.78rem] text-[var(--ink-muted)]">{a.id}</div>
                  <div className="md:col-span-4 text-[0.95rem]">{a.name}</div>
                  <div className="md:col-span-2 mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">{a.location}</div>
                  <div className="md:col-span-2">
                    <span className={`inline-flex items-center h-7 px-3 mono text-[0.66rem] uppercase tracking-[0.16em] border ${
                      a.status === 'ok'
                        ? 'border-[var(--line)] text-[var(--positive)]'
                        : a.status === 'service-soon'
                        ? 'border-[var(--caution)] text-[var(--caution)]'
                        : 'border-[var(--critical)] text-[var(--critical)]'
                    }`}>
                      {a.warrantyEnds}
                    </span>
                  </div>
                  <div className="md:col-span-2"><StatusTag v={a.status === 'ok' ? 'positive' : a.status === 'service-soon' ? 'pending' : 'overdue'}>{a.status}</StatusTag></div>
                </motion.li>
              ))}
            </ul>
          </Panel>
        </section>
      )}

      {tab === 'Vendors' && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--line)]">
          {VENDORS.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="bg-[var(--bg-raised)] p-6 flex flex-col gap-4"
            >
              <div className="mono text-[0.66rem] uppercase tracking-[0.22em] text-[var(--accent)]">{v.cat}</div>
              <div className="display text-[1.4rem] leading-tight">{v.name}</div>
              <div className="text-[var(--accent)] tracking-[0.2em]">
                {'★'.repeat(v.rating)}<span className="text-[var(--ink-muted)]">{'☆'.repeat(5 - v.rating)}</span>
              </div>
              <div className="mono text-[0.78rem] text-[var(--ink-muted)] flex items-center gap-2">
                <Phone size={12} strokeWidth={1.5} /> {v.phone}
              </div>
              <div className="pt-2 mt-auto"><Btn variant="outline">Re-engage</Btn></div>
            </motion.div>
          ))}
        </section>
      )}
    </div>
  );
}

function TicketsKanban() {
  const { tickets: TICKETS, moveTicket } = useData();
  const cols: { key: Ticket['status']; label: string; num: string }[] = [
    { key: 'open', label: 'Open', num: '01' },
    { key: 'in-progress', label: 'In progress', num: '02' },
    { key: 'resolved', label: 'Resolved', num: '03' },
  ];
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-[var(--line)] border border-[var(--line)]">
      {cols.map(col => {
        const items = TICKETS.filter(t => t.status === col.key);
        return (
          <div key={col.key} className="bg-[var(--bg-raised)] p-5 min-h-[400px]">
            <header className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="mono text-[0.66rem] tracking-[0.22em] uppercase text-[var(--accent)]">{col.num}</span>
                <h3 className="mono text-[0.78rem] tracking-[0.18em] uppercase">{col.label}</h3>
              </div>
              <span className="mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">{items.length}</span>
            </header>
            <ul className="space-y-3">
              {items.map((t, i) => (
                <motion.li
                  key={t.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="bg-[var(--bg-raised)] border border-[var(--line)] p-4 hover:border-[var(--accent)] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <GripVertical size={14} strokeWidth={1.5} className="text-[var(--ink-muted)]" />
                      <span className="mono text-[0.7rem] text-[var(--ink-muted)]">{t.id}</span>
                    </div>
                    <span className="mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">{t.flat}</span>
                  </div>
                  <h4 className="display text-[1.05rem] leading-tight mt-3">{t.title}</h4>
                  <div className="flex items-center justify-between mt-3">
                    <StatusTag v={t.priority === 'high' ? 'overdue' : t.priority === 'med' ? 'pending' : 'neutral'}>
                      {t.priority} · {t.category}
                    </StatusTag>
                    {t.assigned && (
                      <span className="mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">{t.assigned}</span>
                    )}
                  </div>

                  {t.status === 'open' && t.aiConfidence && (
                    <div className="mt-4 border border-dashed border-[var(--accent)] p-3 space-y-2">
                      <div className="mono text-[0.62rem] uppercase tracking-[0.2em] text-[var(--accent)]">
                        Triage proposes · {t.aiConfidence}%
                      </div>
                      <div className="mono text-[0.78rem]">
                        {t.category} → {t.category === 'plumbing' ? 'Rahim' : t.category === 'electric' ? 'Mizan' : 'Karim'}
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Btn variant="primary" className="h-8 px-3" onClick={() => moveTicket(t)}>Confirm</Btn>
                        <Btn variant="ghost" className="h-8 px-3">Override</Btn>
                      </div>
                    </div>
                  )}
                </motion.li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

