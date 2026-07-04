import { Eyebrow, Panel, Btn, HoldButton, StatusTag } from '../../components/shared/ui';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, AlertOctagon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Incident = {
  id: string;
  date: string;
  flat: string;
  type: string;
  responseMin: number;
  responder: string;
};

const HISTORY: Incident[] = [
  { id: 'I-019', date: '08 May · 22:14', flat: '11B', type: 'Medical SOS', responseMin: 2, responder: 'K. Sheikh' },
  { id: 'I-018', date: '05 May · 03:42', flat: '14B', type: 'Fire alarm · false', responseMin: 4, responder: 'B. Mia' },
  { id: 'I-017', date: '02 May · 19:08', flat: '7C', type: 'Intruder report', responseMin: 1, responder: 'K. Sheikh' },
  { id: 'I-016', date: '28 Apr · 11:30', flat: '9D', type: 'Medical SOS', responseMin: 3, responder: 'B. Mia' },
  { id: 'I-015', date: '21 Apr · 23:50', flat: '5A', type: 'Lift entrapment', responseMin: 6, responder: 'K. Sheikh' },
];

const CONTACTS = [
  { label: 'Fire Service', number: '199', tel: '199' },
  { label: 'Ambulance', number: '199', tel: '199' },
  { label: 'Police', number: '999', tel: '999' },
  { label: 'Building Security', number: '+880 1722 000 119', tel: '+8801722000119' },
];

export default function Incidents() {
  const [active, setActive] = useState(false);
  const [responded, setResponded] = useState<string | null>(null);
  const resolveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (resolveTimeout.current) clearTimeout(resolveTimeout.current); }, []);

  const trigger = () => {
    setResponded(null);
    setActive(true);
  };

  const onRespond = () => {
    setResponded('RESPONDED · 19:42 · K. Sheikh');
    if (resolveTimeout.current) clearTimeout(resolveTimeout.current);
    resolveTimeout.current = setTimeout(() => {
      setActive(false);
      setResponded(null);
    }, 1800);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <Eyebrow num="03" label="Incidents" dense />
        <Btn variant="outline" className="!h-12" onClick={trigger} disabled={active}>
          <AlertOctagon size={18} strokeWidth={1.5} /> Simulate incoming SOS
        </Btn>
      </div>

      {/* Active SOS */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative"
          >
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 border-2 pointer-events-none"
              style={{ borderColor: 'var(--critical)' }}
            />
            <div className="relative p-8 bg-[var(--bg-raised)] border border-[var(--critical)]">
              <div className="flex items-center gap-3 mb-6">
                <AlertOctagon size={22} strokeWidth={1.5} style={{ color: 'var(--critical)' }} />
                <span className="mono text-[0.78rem] tracking-[0.28em] uppercase" style={{ color: 'var(--critical)' }}>
                  Active SOS · Incoming
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-8 items-center">
                <div className="display text-[6rem] leading-none tabular-nums" style={{ color: 'var(--critical)' }}>
                  12A
                </div>
                <div>
                  <div className="display text-[2rem]">Sajid Choudhury</div>
                  <div className="mono text-[0.78rem] uppercase tracking-[0.22em] text-[var(--ink-muted)] mt-2">
                    Floor 12 · Medical · panic button
                  </div>
                  <div className="mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] mt-1">
                    Triggered 19:41 · 24 sec ago
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  {responded ? (
                    <div className="mono text-[0.85rem] tracking-[0.22em] uppercase" style={{ color: 'var(--positive)' }}>
                      {responded}
                    </div>
                  ) : (
                    <HoldButton onConfirm={onRespond} label="Hold to respond" variant="critical" duration={1200} />
                  )}
                  <span className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)]">
                    Hold for 1.2s to confirm
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incident history */}
      <Panel className="p-0">
        <header className="px-6 py-4 border-b border-[var(--line)]">
          <h3 className="mono text-[0.78rem] tracking-[0.18em] uppercase">Incident history</h3>
        </header>
        <div className="divide-y divide-[var(--line)]">
          {HISTORY.map(h => (
            <div key={h.id} className="h-16 flex items-center gap-5 px-6">
              <div className="mono text-[0.7rem] tracking-[0.18em] uppercase text-[var(--accent)] w-20">
                {h.id}
              </div>
              <div className="mono text-[0.78rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] w-36">
                {h.date}
              </div>
              <div className="display text-[1.3rem] tabular-nums w-20">{h.flat}</div>
              <div className="flex-1 text-[0.95rem]">{h.type}</div>
              <div className="mono text-[0.78rem] tabular-nums text-[var(--ink-muted)] w-24 text-right">
                {h.responseMin} min
              </div>
              <div className="mono text-[0.78rem] uppercase tracking-[0.18em] w-32 text-right">
                {h.responder}
              </div>
              <StatusTag v="positive">Resolved</StatusTag>
            </div>
          ))}
        </div>
      </Panel>

      {/* Emergency contacts */}
      <section>
        <Eyebrow num="·" label="Emergency speed-dial" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONTACTS.map(c => (
            <a
              key={c.label}
              href={`tel:${c.tel}`}
              className="group flex items-center justify-between gap-6 px-6 h-24 border border-[var(--line)] bg-[var(--bg-raised)] hover:border-[var(--accent)] transition-colors"
            >
              <div>
                <div className="mono text-[0.7rem] tracking-[0.22em] uppercase text-[var(--ink-muted)] mb-2">
                  {c.label}
                </div>
                <div className="display text-[1.6rem] mono tabular-nums text-[var(--ink)] group-hover:text-[var(--accent)]">
                  {c.number}
                </div>
              </div>
              <div className="w-14 h-14 grid place-items-center border border-[var(--line)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]">
                <Phone size={22} strokeWidth={1.5} />
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
