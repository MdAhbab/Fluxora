import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, CheckCircle2, Wrench, Zap, Sparkles, Droplet } from 'lucide-react';
import { Eyebrow, Panel, KPI, Chips, Btn, HoldButton } from '../../components/shared/ui';
import { type Ticket } from '../../../lib/mock';
import { useData } from '../../../lib/data';

type LocalStatus = 'open' | 'in-progress' | 'resolved';

const CATEGORY_ICON: Record<Ticket['category'], typeof Wrench> = {
  plumbing: Droplet,
  electric: Zap,
  cleaning: Sparkles,
  lift: Wrench,
  security: Wrench,
  general: Wrench,
};

const FILTERS = ['All', 'Plumbing', 'Electric', 'Cleaning', 'Lift', 'Security'];

export default function Tasks() {
  const { tickets: TICKETS, moveTicket, setTicketStatus } = useData();
  const [filter, setFilter] = useState('All');
  const [localStatus, setLocalStatus] = useState<Record<string, LocalStatus>>({});
  const [photoTaken, setPhotoTaken] = useState<Record<string, boolean>>({});

  const getStatus = (t: Ticket): LocalStatus => localStatus[t.id] ?? (t.status as LocalStatus);

  const visible = TICKETS.filter(t => {
    const s = getStatus(t);
    if (s === 'resolved' && !localStatus[t.id]) return false;
    if (s === 'resolved') return false;
    if (filter === 'All') return true;
    return t.category === filter.toLowerCase();
  });

  const resolvedToday = TICKETS.filter(t => t.status === 'resolved' || localStatus[t.id] === 'resolved');

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Eyebrow num="00" label="My tasks" />

        {/* Top stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <KPI label="Completed today" value="03" hint="On track" />
          <div className="p-6 border border-[var(--line)] bg-[var(--bg-raised)] flex flex-col justify-between">
            <div className="mono text-[0.66rem] tracking-[0.22em] uppercase text-[var(--ink-muted)]">On duty since</div>
            <div className="display text-[1.8rem] tabular-nums leading-none mt-3">08:02</div>
          </div>
        </div>

        {/* Filter chips */}
        <div className="mb-6">
          <Chips items={FILTERS} active={filter} onChange={setFilter} />
        </div>

        {/* Worklist */}
        <Eyebrow num="01" label="Active queue" />
        <ul className="space-y-3">
          <AnimatePresence initial={true}>
            {visible.map((t, i) => {
              const Icon = CATEGORY_ICON[t.category];
              const status = getStatus(t);
              return (
                <motion.li
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="border border-[var(--line)] bg-[var(--bg-raised)]"
                >
                  <div className="flex items-stretch gap-4 p-4 min-h-24">
                    {/* Icon square */}
                    <div className="w-12 h-12 shrink-0 border border-[var(--line)] grid place-items-center text-[var(--accent)]">
                      <Icon size={20} strokeWidth={1.5} />
                    </div>

                    {/* Middle */}
                    <div className="flex-1 min-w-0">
                      <div className="mono text-[0.66rem] tracking-[0.22em] uppercase text-[var(--ink-muted)] mb-1">
                        {t.opened}
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="mono tabular-nums text-[1.8rem] leading-none text-[var(--ink)]">{t.id.replace('T-', '')}</span>
                      </div>
                      <div className="display text-[1rem] mt-1 truncate">{t.title}</div>
                      <div className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mt-1">
                        Flat {t.flat} · {t.category}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="shrink-0 flex items-center">
                      {status === 'open' && (
                        <Btn
                          variant="primary"
                          className="h-12 px-5"
                          onClick={async () => { await setTicketStatus(t, 'in_progress'); setLocalStatus(s => ({ ...s, [t.id]: 'in-progress' })); }}
                        >
                          Start
                        </Btn>
                      )}
                      {status === 'in-progress' && (
                        <HoldButton
                          label="Hold to resolve"
                          duration={1200}
                          onConfirm={async () => { await setTicketStatus(t, 'resolved'); setLocalStatus(s => ({ ...s, [t.id]: 'resolved' })); }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Photo proof when in-progress */}
                  {status === 'in-progress' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="border-t border-[var(--line)]"
                    >
                      <div className="px-4 py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 border border-dashed border-[var(--line)] px-3 py-2 flex-1">
                          <Camera size={16} strokeWidth={1.5} className="text-[var(--ink-muted)]" />
                          <span className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)]">
                            {photoTaken[t.id] ? 'Photo attached' : 'Photo proof'}
                          </span>
                        </div>
                        <Btn
                          variant="outline"
                          className="h-12"
                          onClick={() => setPhotoTaken(p => ({ ...p, [t.id]: true }))}
                        >
                          <Camera size={14} strokeWidth={1.5} />
                          Take photo
                        </Btn>
                      </div>
                    </motion.div>
                  )}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        {/* Resolved today */}
        <div className="mt-10">
          <Eyebrow num="02" label="Today's resolved" />
          <Panel>
            <ul className="divide-y divide-[var(--line)]">
              {resolvedToday.length === 0 && (
                <li className="px-6 py-6 mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                  None yet
                </li>
              )}
              {resolvedToday.map(t => (
                <li key={t.id} className="px-6 py-4 flex items-center gap-4">
                  <CheckCircle2 size={18} strokeWidth={1.5} className="text-[var(--positive)] shrink-0" />
                  <span className="mono tabular-nums text-[0.8rem] text-[var(--ink-muted)] w-20">{t.opened}</span>
                  <span className="flex-1 truncate text-[0.9rem]">{t.title}</span>
                  <span className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">{t.id}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
