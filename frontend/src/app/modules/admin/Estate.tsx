import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Eyebrow, Panel, StatusDot, Btn, Chips, Drawer } from '../../components/shared/ui';
import { formatBDT, type Unit } from '../../../lib/mock';
import { useData } from '../../../lib/data';
import { Search } from 'lucide-react';

const TABS = ['Units', 'Floor stack', 'Parking', 'Listings'];
const UNIT_FILTERS = ['All', 'Owner', 'Rented', 'Vacant'];

export default function AdminEstate() {
  const { units: UNITS, listings: LISTINGS, vehicles: VEHICLES } = useData();
  const [tab, setTab] = useState('Units');
  const [filter, setFilter] = useState('All');
  const [q, setQ] = useState('');
  const [selectedBay, setSelectedBay] = useState<string | null>(null);

  const filteredUnits = useMemo(
    () =>
      UNITS.filter(u => {
        const okF =
          filter === 'All' ||
          (filter === 'Owner' && u.occupancy === 'owner') ||
          (filter === 'Rented' && u.occupancy === 'rented') ||
          (filter === 'Vacant' && u.occupancy === 'vacant');
        const okQ =
          !q || u.flat.toLowerCase().includes(q.toLowerCase()) || (u.resident ?? '').toLowerCase().includes(q.toLowerCase());
        return okF && okQ;
      }),
    [UNITS, filter, q],
  );

  return (
    <div className="space-y-10">
      <header>
        <Eyebrow num="00" label="Estate" />
        <h1 className="display text-[3rem] leading-[1.05] tracking-tight">
          The <span className="italic text-[var(--accent)]">property</span>.
        </h1>
      </header>

      <Chips items={TABS} active={tab} onChange={setTab} />

      {tab === 'Units' && (
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <Chips items={UNIT_FILTERS} active={filter} onChange={setFilter} />
            <div className="flex items-center gap-3 border-b border-[var(--line)] focus-within:border-[var(--accent)] transition-colors min-w-[260px]">
              <Search size={14} strokeWidth={1.5} className="text-[var(--ink-muted)]" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search flat or resident"
                className="flex-1 h-10 bg-transparent outline-none text-[0.92rem]"
              />
            </div>
          </div>

          <Panel title="Units ledger" num="01" action={<span className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">{filteredUnits.length} rows</span>}>
            <div className="hidden md:grid grid-cols-12 px-6 py-3 mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] border-b border-[var(--line)]">
              <div className="col-span-1">Flat</div>
              <div className="col-span-1">Floor</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-2">Occupancy</div>
              <div className="col-span-3">Resident</div>
              <div className="col-span-2 text-right">Balance</div>
              <div className="col-span-1 text-right">Tix</div>
            </div>
            <ul className="divide-y divide-[var(--line)] max-h-[600px] overflow-y-auto">
              {filteredUnits.map((u, i) => (
                <motion.li
                  key={u.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.01, 0.3) }}
                  className="grid grid-cols-2 md:grid-cols-12 gap-2 px-6 py-3 hover:bg-[var(--bg-sunken)] transition-colors"
                >
                  <div className="md:col-span-1 mono text-[0.82rem]">{u.flat}</div>
                  <div className="md:col-span-1 mono text-[0.78rem] text-[var(--ink-muted)]">F{u.floor}</div>
                  <div className="md:col-span-2 mono text-[0.72rem] text-[var(--ink-muted)]">{u.size}</div>
                  <div className="md:col-span-2 flex items-center gap-2">
                    <StatusDot v={u.occupancy === 'owner' ? 'positive' : u.occupancy === 'rented' ? 'info' : 'neutral'} />
                    <span className="mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">{u.occupancy}</span>
                  </div>
                  <div className="md:col-span-3 text-[0.9rem]">{u.resident ?? <span className="text-[var(--ink-muted)] italic">vacant</span>}</div>
                  <div className="md:col-span-2 mono tabular-nums text-right text-[0.84rem]">{u.balance ? formatBDT(u.balance) : '—'}</div>
                  <div className="md:col-span-1 mono text-right text-[0.78rem]">{u.openTickets || '·'}</div>
                </motion.li>
              ))}
            </ul>
          </Panel>
        </section>
      )}

      {tab === 'Floor stack' && <FloorStack />}

      {tab === 'Parking' && (
        <section className="space-y-6">
          <Panel title="Bay map" num="01" action={<span className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">24 bays · 3 assigned</span>}>
            <div className="p-8 grid grid-cols-4 sm:grid-cols-6 gap-px bg-[var(--line)]">
              {Array.from({ length: 24 }).map((_, i) => {
                const id = `B-${String(i + 1).padStart(2, '0')}`;
                const v = VEHICLES.find(v => v.bay === id);
                return (
                  <motion.button
                    key={id}
                    onClick={() => v && setSelectedBay(id)}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.015 }}
                    className={`aspect-square p-3 text-left transition-colors ${
                      v
                        ? 'bg-[var(--bg-raised)] hover:bg-[var(--bg-sunken)] cursor-pointer'
                        : 'bg-[repeating-linear-gradient(45deg,var(--bg-raised),var(--bg-raised)_6px,var(--bg-sunken)_6px,var(--bg-sunken)_8px)]'
                    }`}
                  >
                    <div className="mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">{id}</div>
                    {v ? (
                      <>
                        <div className="mono text-[0.74rem] mt-3 tabular-nums">{v.reg.split('-').slice(1).join('-')}</div>
                        <div className="mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--accent)] mt-1">F·{v.flat}</div>
                      </>
                    ) : (
                      <div className="mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] mt-3 opacity-60">empty</div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </Panel>

          <Drawer open={!!selectedBay} onClose={() => setSelectedBay(null)} title={`Bay ${selectedBay ?? ''}`}>
            {selectedBay && (() => {
              const v = VEHICLES.find(x => x.bay === selectedBay)!;
              return (
                <div className="space-y-6">
                  <div>
                    <div className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">Registration</div>
                    <div className="display text-[2rem] tabular-nums mt-1">{v.reg}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-px bg-[var(--line)]">
                    <div className="bg-[var(--bg-raised)] p-4">
                      <div className="mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">Flat</div>
                      <div className="display text-[1.4rem] mt-1">{v.flat}</div>
                    </div>
                    <div className="bg-[var(--bg-raised)] p-4">
                      <div className="mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">Owner</div>
                      <div className="text-[0.95rem] mt-2">{v.owner}</div>
                    </div>
                  </div>
                  <Btn variant="outline" className="w-full">Reassign bay</Btn>
                </div>
              );
            })()}
          </Drawer>
        </section>
      )}

      {tab === 'Listings' && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--line)]">
          {LISTINGS.map((l, i) => (
            <motion.article
              key={l.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="bg-[var(--bg-raised)] p-7 flex flex-col gap-5"
            >
              <div className="flex items-start justify-between">
                <span className="mono text-[0.62rem] uppercase tracking-[0.22em] text-[var(--accent)] border border-[var(--accent)] px-2 py-1">
                  For {l.type}
                </span>
                <span className="mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">{l.posted} ago</span>
              </div>

              <div>
                <div className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">Flat {l.flat}</div>
                <div className="display text-[2.4rem] tabular-nums mt-2 leading-none">
                  {l.type === 'sale' ? (l.rent / 1_000_000).toFixed(1) + 'M' : (l.rent / 1000).toFixed(0) + 'K'}
                  <span className="mono text-[0.78rem] text-[var(--ink-muted)] ml-2">৳{l.type === 'rent' && '/mo'}</span>
                </div>
              </div>

              <div className="mono text-[0.74rem] text-[var(--ink-muted)]">{l.size}</div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--line)] mt-auto">
                <StatusDot v={l.status === 'active' ? 'positive' : l.status === 'applied' ? 'info' : 'neutral'} />
                <span className="mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">{l.status}</span>
                <Btn variant="outline" className="h-8 px-3">Moderate</Btn>
              </div>
            </motion.article>
          ))}
        </section>
      )}
    </div>
  );
}

function FloorStack() {
  const { units: UNITS } = useData();
  const floors = Array.from({ length: 14 }, (_, i) => 14 - i);
  return (
    <section>
      <Eyebrow num="01" label="Stack · F14 to F1" />
      <Panel>
        <div className="p-6 space-y-px bg-[var(--line)]">
          {floors.map((f, fi) => {
            const units = UNITS.filter(u => u.floor === f);
            return (
              <motion.div
                key={f}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: fi * 0.03 }}
                className="bg-[var(--bg-raised)] grid grid-cols-[60px_1fr] items-stretch"
              >
                <div className="border-r border-[var(--line)] grid place-items-center mono text-[0.72rem] tracking-[0.18em] text-[var(--ink-muted)]">
                  F{f}
                </div>
                <div className="grid grid-cols-6 gap-px bg-[var(--line)]">
                  {units.map((u: Unit) => {
                    const tint =
                      u.occupancy === 'owner'
                        ? 'bg-[var(--accent)]/15 hover:bg-[var(--accent)]/25'
                        : u.occupancy === 'rented'
                        ? 'bg-[var(--info)]/10 hover:bg-[var(--info)]/20'
                        : 'bg-[var(--bg-sunken)] hover:bg-[var(--bg-raised)]';
                    return (
                      <div
                        key={u.id}
                        title={`${u.flat} · ${u.occupancy}${u.resident ? ' · ' + u.resident : ''}`}
                        className={`px-3 py-3 ${tint} transition-colors cursor-pointer flex items-center justify-between`}
                      >
                        <span className="mono text-[0.72rem]">{u.flat}</span>
                        <StatusDot v={u.occupancy === 'owner' ? 'positive' : u.occupancy === 'rented' ? 'info' : 'neutral'} />
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="px-6 py-4 border-t border-[var(--line)] flex flex-wrap gap-6">
          {[
            { v: 'positive' as const, label: 'Owner' },
            { v: 'info' as const, label: 'Rented' },
            { v: 'neutral' as const, label: 'Vacant' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2">
              <StatusDot v={l.v} />
              <span className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">{l.label}</span>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}
