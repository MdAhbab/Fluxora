import { Eyebrow, Panel, KPI, Btn, Drawer, Field } from '../../components/shared/ui';
import { motion, AnimatePresence } from 'motion/react';
import { Scan, CheckCircle2, XCircle, Camera } from 'lucide-react';
import { useData } from '../../../lib/data';
import { useState, useEffect } from 'react';

type StampKind = 'verified' | 'denied' | null;

type StampData = {
  kind: Exclude<StampKind, null>;
  name: string;
  flat: string;
  host: string;
  reason?: string;
};

export default function Gatehouse() {
  const { visitors: VISITORS, checkinVisitor, checkoutVisitor, scanVisitor } = useData();
  const [stamp, setStamp] = useState<StampData | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [expected, setExpected] = useState(() => VISITORS.filter(v => v.status === 'expected'));
  const [checkedIn, setCheckedIn] = useState(() => VISITORS.filter(v => v.status === 'checked-in'));

  // Re-derive the gate lists whenever live data loads or refreshes.
  useEffect(() => {
    setExpected(VISITORS.filter(v => v.status === 'expected'));
    setCheckedIn(VISITORS.filter(v => v.status === 'checked-in'));
  }, [VISITORS]);

  useEffect(() => {
    if (!stamp) return;
    const t = setTimeout(() => setStamp(null), 4000);
    return () => clearTimeout(t);
  }, [stamp]);

  const simulateVerified = () => {
    const v = expected[0] ?? VISITORS[0] ?? { name: '—', flat: '—', host: '—', qr: '' };
    setStamp({ kind: 'verified', name: v.name, flat: v.flat, host: v.host });
  };
  const simulateDenied = () => {
    setStamp({ kind: 'denied', name: 'Unknown · QR FLX-X042', flat: '—', host: '—', reason: 'Pass expired' });
  };

  const checkIn = async (id: string) => {
    const v = expected.find(x => x.id === id);
    if (!v) return;
    await checkinVisitor(v);
    setExpected(expected.filter(x => x.id !== id));
    setCheckedIn([{ ...v, status: 'checked-in' }, ...checkedIn]);
  };
  const checkOut = async (id: string) => {
    const v = checkedIn.find(x => x.id === id);
    if (!v) return;
    await checkoutVisitor(v);
    setCheckedIn(checkedIn.filter(x => x.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT — Viewfinder */}
        <Panel className="p-6">
          <Eyebrow num="00" label="Gatehouse" />
          <div className="relative aspect-square bg-[var(--bg-sunken)] border border-[var(--line)] overflow-hidden">
            {/* corner brackets */}
            {[
              'top-0 left-0 border-t-2 border-l-2',
              'top-0 right-0 border-t-2 border-r-2',
              'bottom-0 left-0 border-b-2 border-l-2',
              'bottom-0 right-0 border-b-2 border-r-2',
            ].map((c, i) => (
              <span key={i} className={`absolute w-12 h-12 border-[var(--accent)] ${c}`} />
            ))}
            {/* scanline */}
            <motion.div
              className="absolute left-0 right-0 h-px bg-[var(--accent)]"
              style={{ boxShadow: '0 0 12px var(--accent)' }}
              animate={{ top: ['8%', '92%', '8%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <div className="absolute inset-0 grid place-items-center">
              <div className="flex flex-col items-center gap-3 opacity-60">
                <Camera size={48} strokeWidth={1.5} className="text-[var(--ink-muted)]" />
                <span className="mono text-[0.78rem] tracking-[0.24em] uppercase text-[var(--ink-muted)]">
                  Point QR · Scanning
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-6">
            <Btn variant="primary" className="!h-14 !text-[0.78rem]" onClick={simulateVerified}>
              <Scan size={18} strokeWidth={1.5} /> Simulate scan
            </Btn>
            <Btn variant="outline" className="!h-14 !text-[0.78rem]" onClick={simulateDenied}>
              <XCircle size={18} strokeWidth={1.5} /> Denied · test
            </Btn>
            <Btn variant="outline" className="!h-14 !text-[0.78rem]" onClick={() => setManualOpen(true)}>
              Manual entry
            </Btn>
          </div>
        </Panel>

        {/* RIGHT — Expected */}
        <Panel className="p-6">
          <Eyebrow num="01" label="Expected today" />
          <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {expected.length === 0 && (
              <div className="py-8 text-center mono text-[0.78rem] tracking-[0.18em] uppercase text-[var(--ink-muted)]">
                No expected visitors
              </div>
            )}
            {expected.map(v => (
              <div key={v.id} className="h-20 flex items-center gap-5 px-2">
                <div className="display text-[2rem] tabular-nums w-20 leading-none text-[var(--accent)]">
                  {v.flat}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="display text-[1.15rem] truncate">{v.name}</div>
                  <div className="mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] mt-1">
                    {v.when} · Host {v.host}
                  </div>
                </div>
                <Btn variant="primary" className="!h-12 !px-5" onClick={() => checkIn(v.id)}>
                  Check in
                </Btn>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Eyebrow num="·" label="Checked in today" />
            <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {checkedIn.length === 0 && (
                <div className="py-6 text-center mono text-[0.72rem] tracking-[0.18em] uppercase text-[var(--ink-muted)]">
                  None yet
                </div>
              )}
              {checkedIn.map(v => (
                <div key={v.id} className="h-14 flex items-center gap-4 px-2">
                  <div className="mono text-[0.95rem] tabular-nums w-16 text-[var(--accent)]">{v.flat}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.95rem] truncate">{v.name}</div>
                    <div className="mono text-[0.65rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                      {v.when}
                    </div>
                  </div>
                  <Btn variant="outline" className="!h-10" onClick={() => checkOut(v.id)}>
                    Check out
                  </Btn>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <KPI label="Gate events today" value="47" hint="Across A + B" />
        <KPI label="Visitor scans" value="32" hint="68% verified" />
        <KPI label="Lifts operational" value="1" unit="of 2" hint="Lift B in service" />
        <KPI label="Open assigned tasks" value="0" hint="All clear" />
      </div>

      {/* Manual entry drawer */}
      <Drawer open={manualOpen} onClose={() => setManualOpen(false)} title="Manual entry">
        <div className="space-y-6">
          <Field label="Visitor name" placeholder="Full name" />
          <Field label="Flat" placeholder="e.g. 7C" />
          <Field label="Purpose" placeholder="Delivery / Guest / Vendor" />
          <div className="pt-4 flex gap-3">
            <Btn variant="primary" className="!h-12 flex-1" onClick={() => setManualOpen(false)}>
              Confirm entry
            </Btn>
            <Btn variant="outline" className="!h-12" onClick={() => setManualOpen(false)}>
              Cancel
            </Btn>
          </div>
        </div>
      </Drawer>

      {/* Stamp overlay */}
      <AnimatePresence>
        {stamp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-[var(--ink)]/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -6, opacity: 0 }}
              animate={{ scale: 1, rotate: -3, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              className="bg-[var(--bg-raised)] border border-[var(--line)] px-16 py-12 text-center max-w-2xl"
            >
              <div className="flex items-center justify-center gap-4 mb-4">
                {stamp.kind === 'verified' ? (
                  <CheckCircle2 size={48} strokeWidth={1.5} style={{ color: 'var(--positive)' }} />
                ) : (
                  <XCircle size={48} strokeWidth={1.5} style={{ color: 'var(--critical)' }} />
                )}
                <div
                  className="display text-[6rem] leading-none tracking-tight uppercase"
                  style={{ color: stamp.kind === 'verified' ? 'var(--positive)' : 'var(--critical)' }}
                >
                  {stamp.kind === 'verified' ? 'Verified' : 'Denied'}
                </div>
              </div>
              <div className="display text-[2rem] mt-6">{stamp.name}</div>
              <div className="mono text-[0.78rem] uppercase tracking-[0.22em] text-[var(--ink-muted)] mt-3">
                Flat {stamp.flat} · Host {stamp.host}
              </div>
              {stamp.reason && (
                <div className="mono text-[0.78rem] uppercase tracking-[0.22em] mt-3" style={{ color: 'var(--critical)' }}>
                  Reason · {stamp.reason}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
