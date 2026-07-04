import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Eyebrow, Panel, KPI, Chips, StatusTag } from '../../components/shared/ui';
import { formatBDT } from '../../../lib/mock';
import { useData } from '../../../lib/data';

const FILTERS = ['All', 'Owner', 'Rented', 'Vacant'];

export default function CommitteeEstate() {
  const { units: UNITS } = useData();
  const [filter, setFilter] = useState('All');

  const stats = useMemo(() => {
    const total = UNITS.length;
    const vacant = UNITS.filter(u => u.occupancy === 'vacant').length;
    const owner = UNITS.filter(u => u.occupancy === 'owner').length;
    const rented = UNITS.filter(u => u.occupancy === 'rented').length;
    const avgRent = 68_500;
    const occPct = Math.round(((total - vacant) / total) * 100);
    return { total, vacant, owner, rented, occPct, avgRent };
  }, [UNITS]);

  const rows = useMemo(() => {
    const f = filter.toLowerCase();
    if (filter === 'All') return UNITS;
    return UNITS.filter(u => u.occupancy === f);
  }, [filter]);

  // Build floor grid (top floor first): 14 floors × 6 cells
  const floors = useMemo(() => {
    const map: Record<number, typeof UNITS> = {};
    UNITS.forEach(u => { (map[u.floor] = map[u.floor] || []).push(u); });
    return Object.keys(map).map(Number).sort((a, b) => b - a).map(f => ({ f, units: map[f] }));
  }, [UNITS]);

  const tintFor = (occ: string) => {
    if (occ === 'owner') return 'var(--positive)';
    if (occ === 'rented') return 'var(--caution)';
    return 'transparent';
  };

  return (
    <div className="p-6 lg:p-10 space-y-10">
      <header>
        <Eyebrow num="04" label="Estate" />
        <h1 className="display text-[2.8rem] lg:text-[3.4rem] leading-[1.05]">
          The <span className="italic text-[var(--accent)]">estate</span>, surveyed
        </h1>
        <p className="mono text-[0.72rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mt-3">
          Read-only · oversight
        </p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--line)]">
        <KPI label="Occupancy" value={`${stats.occPct}`} unit="%" hint={`${stats.total - stats.vacant} of ${stats.total} flats`} />
        <KPI label="Vacant flats" value={String(stats.vacant)} hint="Available for listing" />
        <KPI label="Rented · Owned" value={`${stats.rented} · ${stats.owner}`} hint="Split across stack" />
        <KPI label="Avg. rent" value={formatBDT(stats.avgRent)} unit="BDT" hint="Active rentals" />
      </section>

      <section>
        <Eyebrow num="·" label="Units ledger" />
        <div className="mb-4"><Chips items={FILTERS} active={filter} onChange={setFilter} /></div>
        <Panel num="·" title={`${rows.length} units · ${filter}`}>
          <ul className="divide-y divide-[var(--line)]">
            {rows.slice(0, 40).map((u, i) => (
              <motion.li
                key={u.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.02, 0.5) }}
                className="px-6 py-3 grid grid-cols-[60px,1fr,1fr,auto,auto] gap-4 items-baseline"
              >
                <span className="mono text-[0.78rem] tabular-nums text-[var(--ink)]">{u.flat}</span>
                <span className="text-[0.9rem] text-[var(--ink)] truncate">{u.resident ?? <span className="text-[var(--ink-muted)] italic">— vacant —</span>}</span>
                <span className="mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">{u.size}</span>
                <StatusTag v={u.occupancy === 'vacant' ? 'neutral' : u.occupancy === 'owner' ? 'positive' : 'info'}>{u.occupancy}</StatusTag>
                <span className="mono text-[0.78rem] tabular-nums text-[var(--ink-muted)]">{u.balance ? formatBDT(u.balance) : '—'}</span>
              </motion.li>
            ))}
          </ul>
        </Panel>
      </section>

      <section>
        <Eyebrow num="·" label="Floor stack · occupancy" />
        <Panel num="·" title="Gulshan Heights · 14 floors × 6 units">
          <div className="p-8 lg:p-12 bg-[var(--bg-sunken)]">
            <div className="max-w-2xl mx-auto">
              {/* crown */}
              <div className="flex justify-center mb-3">
                <svg width="280" height="22" viewBox="0 0 280 22">
                  <polyline points="0,22 140,2 280,22" fill="none" stroke="var(--ink)" strokeWidth="0.75" />
                </svg>
              </div>

              <div className="space-y-[2px] border-l border-r border-[var(--ink)] px-3 py-3 bg-[var(--bg-raised)]">
                {floors.map(({ f, units }, idx) => (
                  <motion.div
                    key={f}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.035 }}
                    className="grid grid-cols-[28px,1fr] items-center gap-3"
                  >
                    <span className="mono text-[0.6rem] tracking-[0.16em] text-[var(--ink-muted)] text-right">{String(f).padStart(2, '0')}</span>
                    <div className="grid grid-cols-6 gap-[2px]">
                      {units.map(u => (
                        <div
                          key={u.id}
                          title={`${u.flat} · ${u.occupancy}`}
                          className="h-5 border border-[var(--line)] relative"
                          style={{ background: u.occupancy === 'vacant' ? 'transparent' : 'var(--bg-sunken)' }}
                        >
                          {u.occupancy !== 'vacant' && (
                            <div className="absolute inset-x-1 bottom-1 h-1" style={{ background: tintFor(u.occupancy) }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* base / lobby */}
              <div className="mt-1 grid grid-cols-[28px,1fr] gap-3 items-center">
                <span />
                <div className="h-7 bg-[var(--ink)] text-[var(--bg-raised)] grid place-items-center mono text-[0.6rem] tracking-[0.24em] uppercase">
                  Lobby · Gate A · Gate B
                </div>
              </div>

              <div className="flex justify-center gap-6 mt-8 mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                <span className="flex items-center gap-2"><span className="w-3 h-1 bg-[var(--positive)]" /> Owner</span>
                <span className="flex items-center gap-2"><span className="w-3 h-1 bg-[var(--caution)]" /> Rented</span>
                <span className="flex items-center gap-2"><span className="w-3 h-1 border border-[var(--line)]" /> Vacant</span>
              </div>
            </div>
          </div>
        </Panel>
      </section>
    </div>
  );
}
