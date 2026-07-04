import { Eyebrow, Panel, StatusDot } from '../../components/shared/ui';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, AlertOctagon } from 'lucide-react';
import { type GateLog } from '../../../lib/mock';
import { useData } from '../../../lib/data';

const HOURLY = [
  { h: '06', v: 3 }, { h: '07', v: 6 }, { h: '08', v: 11 }, { h: '09', v: 9 },
  { h: '10', v: 7 }, { h: '11', v: 8 }, { h: '12', v: 12 }, { h: '13', v: 6 },
  { h: '14', v: 5 }, { h: '15', v: 9 }, { h: '16', v: 11 }, { h: '17', v: 14 },
];

function typeMeta(t: GateLog['type']) {
  switch (t) {
    case 'verified': return { Icon: CheckCircle2, label: 'VERIFIED', color: 'var(--ink)' };
    case 'denied': return { Icon: XCircle, label: 'DENIED', color: 'var(--critical)' };
    case 'manual': return { Icon: AlertOctagon, label: 'MANUAL', color: 'var(--caution)' };
    case 'sos': return { Icon: AlertOctagon, label: 'SOS', color: 'var(--critical)' };
  }
}

export default function Logs() {
  const { gateLogs: GATE_LOGS, lifts: LIFTS } = useData();
  const maxV = Math.max(...HOURLY.map(h => h.v));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Eyebrow num="02" label="Gate logs" dense />
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--positive)] opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--positive)]" />
          </span>
          <span className="mono text-[0.7rem] tracking-[0.22em] uppercase text-[var(--ink-muted)]">
            Session log · live
          </span>
        </div>
      </div>

      {/* Hourly mini chart */}
      <Panel className="p-6">
        <Eyebrow num="·" label="Hourly traffic · 06:00 – 18:00" />
        <div className="grid grid-cols-12 items-end gap-2 h-28">
          {HOURLY.map((b, i) => (
            <div key={b.h} className="flex flex-col items-center gap-2 h-full justify-end">
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.6, delay: i * 0.04 }}
                style={{ height: `${(b.v / maxV) * 100}%`, transformOrigin: 'bottom' }}
                className="w-full bg-[var(--accent)] opacity-80"
              />
              <span className="mono text-[0.6rem] tracking-[0.16em] uppercase text-[var(--ink-muted)]">
                {b.h}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      {/* Stream */}
      <Panel className="p-0">
        <header className="px-6 py-4 border-b border-[var(--line)] flex items-center justify-between">
          <h3 className="mono text-[0.78rem] tracking-[0.18em] uppercase">Live stream</h3>
          <span className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)]">
            {GATE_LOGS.length} events
          </span>
        </header>
        <div className="divide-y divide-[var(--line)]">
          {GATE_LOGS.map((log, i) => {
            const m = typeMeta(log.type);
            const Icon = m.Icon;
            return (
              <div key={i} className="h-16 flex items-center gap-5 px-6">
                <div className="mono text-[0.95rem] tabular-nums text-[var(--accent)] w-16">
                  {log.time}
                </div>
                <div className="mono text-[0.7rem] tracking-[0.2em] uppercase border border-[var(--line)] px-2 py-1 w-10 text-center">
                  {log.gate}
                </div>
                <div className="flex items-center gap-2 w-32" style={{ color: m.color }}>
                  <Icon size={18} strokeWidth={1.5} />
                  <span className="mono text-[0.72rem] tracking-[0.2em] uppercase">{m.label}</span>
                </div>
                <div className="display text-[1.3rem] tabular-nums w-20 text-[var(--ink)]">
                  {log.flat}
                </div>
                <div className="flex-1 text-[0.92rem] text-[var(--ink-muted)] truncate">
                  {log.detail}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Lift status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {LIFTS.map(l => {
          const ok = l.status === 'operational';
          return (
            <Panel key={l.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <Eyebrow num="·" label={l.label} dense />
                  <div className="flex items-center gap-3 mt-4">
                    <StatusDot v={ok ? 'positive' : 'overdue'} pulse={!ok} />
                    <span className="mono text-[0.78rem] tracking-[0.22em] uppercase" style={{ color: ok ? 'var(--positive)' : 'var(--critical)' }}>
                      {l.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="mono text-[0.66rem] tracking-[0.22em] uppercase text-[var(--ink-muted)] mb-2">
                    Floor
                  </div>
                  <div className="display text-[3.6rem] tabular-nums leading-none text-[var(--accent)]">
                    {l.floor}
                  </div>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
