import { useState } from 'react';
import { motion } from 'motion/react';
import { Eyebrow, Panel, Btn, Field, Drawer, StatusTag, StatusDot } from '../../components/shared/ui';
import { formatBDT, type Listing } from '../../../lib/mock';
import { useData } from '../../../lib/data';

const TABS = ['Browse', 'My listings', 'My applications'] as const;
type Tab = typeof TABS[number];

function FloorplanSVG({ seed = 1 }: { seed?: number }) {
  // simple deterministic floorplan
  const rooms = [
    { x: 4, y: 4, w: 40, h: 26, l: 'LIVING' },
    { x: 46, y: 4, w: 30, h: 18, l: 'KITCH' },
    { x: 46, y: 24, w: 30, h: 22, l: 'DINING' },
    { x: 4, y: 32, w: 22, h: 26, l: 'BED 1' },
    { x: 28, y: 32, w: 18, h: 26, l: 'BED 2' },
    { x: 48, y: 48, w: 28, h: 10, l: 'BED 3' },
  ];
  return (
    <svg viewBox="0 0 80 62" className="w-full h-full">
      <rect x={2} y={2} width={76} height={58} fill="none" stroke="var(--accent)" strokeWidth={0.5} />
      {rooms.map((r, i) => (
        <g key={i}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="none" stroke="var(--ink-muted)" strokeWidth={0.3} opacity={0.5 + (seed % 3) * 0.1} />
          <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 1} textAnchor="middle" fontSize="2.4" fill="var(--ink-muted)" fontFamily="monospace" letterSpacing="0.18em">{r.l}</text>
        </g>
      ))}
    </svg>
  );
}

export default function ResidentMarketplace() {
  const { listings: LISTINGS } = useData();
  const [tab, setTab] = useState<Tab>('Browse');
  const [open, setOpen] = useState<Listing | null>(null);

  return (
    <div className="p-5 lg:p-10 space-y-8 max-w-[1280px] mx-auto">
      <header>
        <Eyebrow num="05" label="Marketplace · বাজার" />
        <h1 className="display text-[2.2rem] lg:text-[3rem] leading-[1.05]">
          Residences <span className="italic text-[var(--accent)]">on offer</span>.
        </h1>
        <p className="mono text-[0.7rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mt-3">
          From neighbours · vetted by the building
        </p>
      </header>

      <nav className="flex flex-wrap gap-px bg-[var(--line)] border border-[var(--line)]">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 mono text-[0.66rem] uppercase tracking-[0.18em] ${tab === t ? 'bg-[var(--ink)] text-[var(--bg-raised)]' : 'bg-[var(--bg-raised)] text-[var(--ink-muted)] hover:text-[var(--accent)]'}`}
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === 'Browse' && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {LISTINGS.filter(l => l.status === 'active').map((l, i) => (
            <motion.article
              key={l.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="border border-[var(--line)] bg-[var(--bg-raised)]"
            >
              <div className="relative border-b border-[var(--line)] bg-[var(--bg-sunken)] aspect-[16/10] p-6">
                <FloorplanSVG seed={i + 1} />
                <span className="absolute top-3 right-3 mono text-[0.62rem] tracking-[0.2em] uppercase border border-[var(--accent)] text-[var(--accent)] px-2 py-1 bg-[var(--bg-raised)]">
                  {l.type}
                </span>
                <span className="absolute bottom-3 left-3 mono text-[0.6rem] tracking-[0.24em] uppercase text-[var(--ink-muted)]">FLOORPLAN</span>
              </div>
              <div className="p-6">
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <span className="display text-[2rem] tabular-nums">{formatBDT(l.rent)}</span>
                    {l.type === 'rent' && <span className="mono text-[0.7rem] tracking-[0.16em] uppercase text-[var(--ink-muted)] ml-2">/ mo</span>}
                  </div>
                </div>
                <div className="mono text-[0.72rem] tracking-[0.14em] uppercase text-[var(--ink-muted)] space-y-1">
                  <div>Flat {l.flat} · {l.size}</div>
                  <div>Available now · posted {l.posted}</div>
                </div>
                <div className="mt-5">
                  <button
                    onClick={() => setOpen(l)}
                    className="mono text-[0.7rem] tracking-[0.2em] uppercase text-[var(--accent)] hover:gap-3 inline-flex items-center gap-2 transition-all"
                  >
                    Apply →
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </section>
      )}

      {tab === 'My listings' && (
        <section>
          <Panel>
            <ul className="divide-y divide-[var(--line)]">
              {[
                { id: 'L-04', flat: '11B', size: '1,820 sqft · 3BR', rent: 62_000, apps: 3 },
                { id: 'L-08', flat: '11B · Parking bay B-12', rent: 4_500, size: 'Reserved parking', apps: 1 },
              ].map(l => (
                <li key={l.id} className="px-6 py-5 grid grid-cols-12 items-center gap-3">
                  <span className="col-span-1 mono text-[0.66rem] tracking-[0.14em] uppercase text-[var(--ink-muted)]">{l.id}</span>
                  <div className="col-span-6">
                    <div className="display text-[1.05rem]">{l.flat}</div>
                    <div className="mono text-[0.66rem] tracking-[0.14em] uppercase text-[var(--ink-muted)] mt-1">{l.size}</div>
                  </div>
                  <span className="col-span-2 display text-[1.05rem] tabular-nums">{formatBDT(l.rent)}</span>
                  <span className="col-span-2 mono text-[0.66rem] tracking-[0.16em] uppercase text-[var(--ink-muted)]">
                    {l.apps} applicants
                  </span>
                  <span className="col-span-1 flex justify-end"><Btn variant="outline">Manage</Btn></span>
                </li>
              ))}
            </ul>
          </Panel>
        </section>
      )}

      {tab === 'My applications' && (
        <section>
          <Panel>
            <ul className="divide-y divide-[var(--line)]">
              {[
                { id: 'A-12', flat: '3D', sub: '4 days ago', status: 'pending' as const },
                { id: 'A-11', flat: '5A', sub: '2 weeks ago', status: 'rejected' as const },
              ].map(a => (
                <li key={a.id} className="px-6 py-5 grid grid-cols-12 items-center gap-3">
                  <span className="col-span-2 mono text-[0.66rem] tracking-[0.14em] uppercase text-[var(--ink-muted)]">{a.id}</span>
                  <div className="col-span-6">
                    <div className="display text-[1.05rem]">Flat {a.flat}</div>
                    <div className="mono text-[0.66rem] tracking-[0.14em] uppercase text-[var(--ink-muted)] mt-1">Submitted {a.sub}</div>
                  </div>
                  <span className="col-span-3 flex items-center gap-2">
                    <StatusDot v={a.status === 'pending' ? 'pending' : a.status === 'rejected' ? 'overdue' : 'positive'} />
                    <span className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)]">{a.status}</span>
                  </span>
                  <span className="col-span-1 flex justify-end"><Btn variant="outline">View</Btn></span>
                </li>
              ))}
            </ul>
          </Panel>
        </section>
      )}

      <Drawer open={!!open} onClose={() => setOpen(null)} title={open ? `Apply · Flat ${open.flat}` : ''} width={500}>
        {open && (
          <div className="space-y-6">
            <div>
              <div className="eyebrow mb-2">{open.type === 'rent' ? 'Monthly rent' : 'Sale price'}</div>
              <div className="display text-[2.4rem] tabular-nums">{formatBDT(open.rent)}</div>
              <div className="mono text-[0.7rem] tracking-[0.16em] uppercase text-[var(--ink-muted)] mt-1">Flat {open.flat} · {open.size}</div>
              <div className="mt-3"><StatusTag v="positive">Verified by building</StatusTag></div>
            </div>
            <div className="aspect-[16/10] bg-[var(--bg-sunken)] border border-[var(--line)] p-6"><FloorplanSVG /></div>
            <p className="text-[0.92rem] text-[var(--ink-muted)] leading-relaxed">
              South-facing unit with full balcony. Generator backup, 24/7 security, dedicated parking bay included.
            </p>
            <div className="space-y-4 pt-2 border-t border-[var(--line)]">
              <div className="eyebrow">Apply</div>
              <Field label="Full name" placeholder="Your name" />
              <Field label="Phone" type="tel" placeholder="+880 1xxx ..." />
              <Field label="Preferred move-in" type="date" />
              <div>
                <div className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mb-2">Message to owner</div>
                <textarea rows={3} className="w-full bg-transparent border border-[var(--line)] focus:border-[var(--accent)] outline-none p-3 text-[0.92rem] resize-none transition-colors" placeholder="A short note..." />
              </div>
              <button className="w-full h-11 mono uppercase tracking-[0.18em] text-[0.7rem] bg-[var(--accent)] text-[var(--bg-raised)]">
                Submit application
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
