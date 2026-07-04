// 2D isometric / elevation Building Explorer — procedural from UNITS data.
// Same component, role variants via props.

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { type Unit } from '../../../lib/mock';
import { useData } from '../../../lib/data';
import { Drawer, StatusTag, Btn } from './ui';
import type { Role } from '../../../lib/roles';

type Lens = 'occupancy' | 'dues' | 'tickets' | 'security';

export function BuildingExplorer({ role, residentFlat, height = 540 }: { role: Role; residentFlat?: string; height?: number }) {
  const { units: UNITS } = useData();
  const [lens, setLens] = useState<Lens>('occupancy');
  const [selected, setSelected] = useState<Unit | null>(null);
  const [hoveredFloor, setHoveredFloor] = useState<number | null>(null);

  const floors = useMemo(() => {
    const out: Record<number, Unit[]> = {};
    UNITS.forEach(u => { (out[u.floor] = out[u.floor] || []).push(u); });
    return out;
  }, [UNITS]);

  const floorNumbers = Object.keys(floors).map(Number).sort((a, b) => b - a);

  const tint = (u: Unit) => {
    if (lens === 'occupancy') return u.occupancy === 'owner' ? 'var(--positive)' : u.occupancy === 'rented' ? 'var(--caution)' : 'transparent';
    if (lens === 'dues') return u.balance > 20000 ? 'var(--critical)' : u.balance > 0 ? 'var(--caution)' : 'var(--positive)';
    if (lens === 'tickets') return u.openTickets > 0 ? 'var(--critical)' : 'var(--positive)';
    if (lens === 'security') return residentFlat === u.flat ? 'var(--accent)' : 'var(--info)';
    return 'transparent';
  };

  const lenses: { id: Lens; label: string }[] = role === 'guard'
    ? [{ id: 'security', label: 'Security' }, { id: 'occupancy', label: 'Occupancy' }]
    : [{ id: 'occupancy', label: 'Occupancy' }, { id: 'dues', label: 'Dues' }, { id: 'tickets', label: 'Tickets' }, { id: 'security', label: 'Security' }];

  const W = 720;
  const floorH = 32;
  const unitW = 80;
  const startX = 80;
  const startY = 40;

  return (
    <div className="bg-[var(--bg-raised)] border border-[var(--line)] flex flex-col" style={{ minHeight: height }}>
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)]">
        <div className="flex items-center gap-3">
          <span className="mono text-[0.66rem] tracking-[0.22em] uppercase text-[var(--accent)]">FIG · 03</span>
          <span className="mono text-[0.66rem] tracking-[0.22em] uppercase">Building Explorer</span>
        </div>
        <div className="flex gap-1">
          {lenses.map(l => (
            <button key={l.id} onClick={() => setLens(l.id)}
              className={`h-7 px-3 mono text-[0.62rem] uppercase tracking-[0.18em] transition ${lens === l.id ? 'bg-[var(--ink)] text-[var(--bg-raised)]' : 'text-[var(--ink-muted)] hover:text-[var(--accent)]'}`}>
              {l.label}
            </button>
          ))}
          {role === 'admin' && (
            <button className="h-7 px-3 mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--accent)] border border-[var(--accent)] ml-2">
              ✎ Architect
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* floor scrubber */}
        <div className="w-16 border-r border-[var(--line)] py-4 overflow-y-auto">
          {floorNumbers.map(f => (
            <button
              key={f}
              onMouseEnter={() => setHoveredFloor(f)}
              onMouseLeave={() => setHoveredFloor(null)}
              className={`block w-full py-1 mono text-[0.66rem] tracking-[0.18em] transition ${hoveredFloor === f ? 'text-[var(--accent)] bg-[var(--bg-sunken)]' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'}`}
            >
              {String(f).padStart(2, '0')}
            </button>
          ))}
        </div>

        {/* svg model */}
        <div className="flex-1 overflow-auto" style={{ position: 'relative' }}>
          <svg viewBox={`0 0 ${W} ${startY * 2 + floorNumbers.length * floorH + 60}`} className="w-full">
            <defs>
              <pattern id="explorer-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="var(--line)" strokeWidth="0.5" />
              </pattern>
            </defs>

            {/* crown */}
            <polyline points={`${startX - 14},${startY} ${startX + (unitW * 6) / 2},${startY - 22} ${startX + unitW * 6 + 14},${startY}`} fill="none" stroke="var(--ink)" strokeWidth="0.75" />

            {floorNumbers.map((f, i) => {
              const y = startY + i * floorH;
              const hl = hoveredFloor === f;
              return (
                <g key={f} opacity={hl || hoveredFloor === null ? 1 : 0.35}>
                  <motion.line
                    x1={startX - 18} y1={y + floorH} x2={startX + unitW * 6 + 18} y2={y + floorH}
                    stroke={hl ? 'var(--accent)' : 'var(--ink)'} strokeWidth="0.75"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: i * 0.03 }}
                  />
                  <text x={startX - 24} y={y + floorH - 10} textAnchor="end" fill="var(--ink-muted)" fontSize="9" fontFamily="var(--font-mono)">
                    {String(f).padStart(2, '0')}
                  </text>

                  {floors[f]?.map((u, ui) => {
                    const x = startX + ui * unitW;
                    const t = tint(u);
                    const sel = selected?.id === u.id;
                    const isMine = residentFlat === u.flat;
                    return (
                      <g key={u.id} className="cursor-pointer" onClick={() => setSelected(u)}>
                        <rect x={x + 4} y={y + 4} width={unitW - 8} height={floorH - 8}
                          fill={u.occupancy === 'vacant' ? 'transparent' : 'var(--bg-sunken)'}
                          stroke={sel || isMine ? 'var(--accent)' : 'var(--ink)'}
                          strokeWidth={sel || isMine ? 1.5 : 0.5}
                        />
                        {u.occupancy === 'vacant' && (
                          <rect x={x + 4} y={y + 4} width={unitW - 8} height={floorH - 8} fill="url(#explorer-hatch)" opacity="0.4" />
                        )}
                        {t !== 'transparent' && (
                          <rect x={x + 8} y={y + floorH - 10} width="6" height="6" fill={t} />
                        )}
                        <text x={x + unitW / 2} y={y + floorH / 2 + 3} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--ink-muted)">
                          {u.flat}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* base */}
            <rect x={startX - 30} y={startY + floorNumbers.length * floorH} width={unitW * 6 + 60} height={28} fill="var(--bg-sunken)" stroke="var(--ink)" strokeWidth="0.75" />
            <text x={startX + (unitW * 6) / 2} y={startY + floorNumbers.length * floorH + 18} textAnchor="middle" fill="var(--ink-muted)" fontSize="8" fontFamily="var(--font-mono)" letterSpacing="2">
              LOBBY · GATE A · GATE B
            </text>
            <rect x="0" y={startY + floorNumbers.length * floorH + 28} width={W} height="30" fill="url(#explorer-hatch)" opacity="0.5" />
          </svg>
        </div>

        {/* legend */}
        <div className="w-44 border-l border-[var(--line)] p-4 mono text-[0.66rem] uppercase tracking-[0.16em] space-y-3 hidden lg:block">
          <div className="text-[var(--ink-muted)]">Legend</div>
          {lens === 'occupancy' && [['Owner', 'var(--positive)'], ['Rented', 'var(--caution)'], ['Vacant', 'transparent']].map(([l, c]) => (
            <div key={l} className="flex items-center gap-2">
              <span className="w-3 h-3 border border-[var(--line)]" style={{ background: c }} />
              <span>{l}</span>
            </div>
          ))}
          {lens === 'dues' && [['Clear', 'var(--positive)'], ['Partial', 'var(--caution)'], ['Overdue', 'var(--critical)']].map(([l, c]) => (
            <div key={l} className="flex items-center gap-2"><span className="w-3 h-3" style={{ background: c }} /><span>{l}</span></div>
          ))}
          {lens === 'tickets' && [['Clear', 'var(--positive)'], ['Open', 'var(--critical)']].map(([l, c]) => (
            <div key={l} className="flex items-center gap-2"><span className="w-3 h-3" style={{ background: c }} /><span>{l}</span></div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <Drawer open onClose={() => setSelected(null)} title={`Flat ${selected.flat}`}>
            <UnitDrawer u={selected} role={role} />
          </Drawer>
        )}
      </AnimatePresence>
    </div>
  );
}

function UnitDrawer({ u, role }: { u: Unit; role: Role }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow mb-2">Flat</div>
        <div className="display text-[3rem] tabular-nums leading-none">{u.flat}</div>
        <div className="mono text-[0.74rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] mt-2">Floor {u.floor} · {u.size}</div>
      </div>

      <div className="border-t border-[var(--line)] pt-6 space-y-3">
        <Row k="Occupancy" v={<StatusTag v={u.occupancy === 'vacant' ? 'neutral' : 'positive'}>{u.occupancy}</StatusTag>} />
        {u.resident && <Row k="Resident" v={u.resident} />}
        {role !== 'guard' && <Row k="Balance" v={<span className="mono">৳ {u.balance.toLocaleString('en-IN')}</span>} />}
        <Row k="Open tickets" v={<span className="mono">{u.openTickets}</span>} />
        {role === 'admin' && <Row k="Owner record" v="On file (acq. 2019)" />}
      </div>

      {role !== 'resident' && (
        <div className="border-t border-[var(--line)] pt-6 flex flex-wrap gap-2">
          <Btn variant="outline">Open ledger</Btn>
          <Btn variant="ghost">Message resident</Btn>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: any }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)]">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}
