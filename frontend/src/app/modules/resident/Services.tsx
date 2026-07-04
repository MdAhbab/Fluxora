import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Camera, Plus } from 'lucide-react';
import { Eyebrow, Panel, Chips, Btn, Field, StatusDot } from '../../components/shared/ui';
import { useAuth } from '../../../lib/auth';
import { useData } from '../../../lib/data';

const CATEGORIES = ['Plumbing', 'Electric', 'Lift', 'Cleaning', 'Other'];
const FACILITIES = ['Rooftop', 'Gym', 'Hall', 'Pool'];
const STAGES = ['Open', 'In progress', 'Resolved'] as const;

export default function ResidentServices() {
  const { tickets: TICKETS, bookings: BOOKINGS, resources, createTicket, addBooking } = useData();
  const { session } = useAuth();
  const flat = session?.flat ?? '7C';
  const [cat, setCat] = useState('Plumbing');
  const [desc, setDesc] = useState('');
  const [ack, setAck] = useState<string | null>(null);
  const [facility, setFacility] = useState('Rooftop');
  const [bookingTime, setBookingTime] = useState('');
  const ackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (ackTimeout.current) clearTimeout(ackTimeout.current); }, []);

  const myTickets = useMemo(() => {
    const m = TICKETS.filter(t => t.flat === flat);
    return m.length ? m : TICKETS.slice(0, 3);
  }, [TICKETS, flat]);

  const stageIdx = (s: string) => (s === 'open' ? 0 : s === 'in-progress' ? 1 : 2);

  const submit = async () => {
    if (!desc.trim()) return;
    const ok = await createTicket({ category: cat, description: desc });
    if (ok) {
      setAck('Request submitted — track it under My requests.');
      setDesc('');
    } else {
      setAck("Couldn't submit just now — please retry.");
    }
    if (ackTimeout.current) clearTimeout(ackTimeout.current);
    ackTimeout.current = setTimeout(() => setAck(null), 8000);
  };

  // calendar grid
  const daysInMonth = 31;
  const bookedDays = [12, 18, 20, 26];

  return (
    <div className="p-5 lg:p-10 space-y-12 max-w-[1280px] mx-auto">
      <header>
        <Eyebrow num="02" label="Services" />
        <h1 className="display text-[2.2rem] lg:text-[3rem] leading-[1.05]">
          Care for <span className="italic text-[var(--accent)]">your home</span>.
        </h1>
        <p className="mono text-[0.7rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mt-3">
          Maintenance · bookings · trusted providers
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Eyebrow label="File a maintenance ticket" dense />
          <Panel className="p-6 space-y-6">
            <div>
              <div className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mb-3">Category</div>
              <Chips items={CATEGORIES} active={cat} onChange={setCat} />
            </div>
            <div>
              <div className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mb-2">Describe the issue</div>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                rows={4}
                placeholder="e.g. Kitchen sink dripping since last night..."
                className="w-full bg-transparent border border-[var(--line)] focus:border-[var(--accent)] outline-none p-3 text-[0.95rem] resize-none transition-colors"
              />
            </div>
            <button className="w-full border border-dashed border-[var(--line)] hover:border-[var(--accent)] py-8 flex flex-col items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--accent)] transition-colors">
              <Camera size={18} strokeWidth={1.5} />
              <span className="mono text-[0.66rem] tracking-[0.18em] uppercase">Attach photos</span>
            </button>
            <button
              onClick={submit}
              className="w-full h-11 mono uppercase tracking-[0.18em] text-[0.7rem] bg-[var(--ink)] text-[var(--bg-raised)]"
            >
              Submit ticket
            </button>
          </Panel>
          {ack && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="border-2 border-[var(--accent)] bg-[var(--bg-raised)] p-5"
            >
              <div className="mono text-[0.66rem] tracking-[0.2em] uppercase text-[var(--accent)] mb-2">Triage acknowledgment</div>
              <div className="display text-[1.1rem] leading-snug">{ack}</div>
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Eyebrow label="My tickets" dense />
          <div className="space-y-4">
            {myTickets.map((t, i) => {
              const idx = stageIdx(t.status);
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Panel className="p-5">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="display text-[1.05rem] leading-snug pr-3">{t.title}</h4>
                      <span className="mono text-[0.62rem] tracking-[0.16em] uppercase text-[var(--ink-muted)] shrink-0">{t.id}</span>
                    </div>
                    <div className="mono text-[0.66rem] tracking-[0.16em] uppercase text-[var(--ink-muted)]">Opened {t.opened}</div>
                    <div className="flex items-center gap-2 mt-4">
                      {STAGES.map((s, k) => (
                        <div key={s} className="flex items-center gap-2 flex-1">
                          <span className={`inline-block w-2 h-2 rounded-full ${k <= idx ? 'bg-[var(--accent)]' : 'bg-[var(--line)]'}`} />
                          <span className={`mono text-[0.6rem] tracking-[0.16em] uppercase ${k === idx ? 'text-[var(--accent)]' : 'text-[var(--ink-muted)]'}`}>
                            {s}
                          </span>
                          {k < 2 && <span className={`flex-1 h-px ${k < idx ? 'bg-[var(--accent)]' : 'bg-[var(--line)]'}`} />}
                        </div>
                      ))}
                    </div>
                    <div className="mono text-[0.66rem] tracking-[0.16em] uppercase text-[var(--ink-muted)] mt-4">
                      Assigned · <span className="text-[var(--ink)]">{t.assigned ?? 'Awaiting triage'}</span>
                    </div>
                  </Panel>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <Eyebrow label="Facility bookings" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel className="p-6">
            <div className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mb-3">May 2026</div>
            <div className="grid grid-cols-7 gap-1">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} className="mono text-[0.6rem] text-center text-[var(--ink-muted)] py-1">{d}</div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const booked = bookedDays.includes(day);
                return (
                  <div
                    key={day}
                    className={`aspect-square flex items-center justify-center mono text-[0.7rem] tabular-nums border ${booked ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-[var(--line)] text-[var(--ink-muted)]'}`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel className="p-6 space-y-5">
            <div className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)]">Book a facility</div>
            <Chips items={FACILITIES} active={facility} onChange={setFacility} />
            <Field label="Date & time" type="datetime-local" value={bookingTime} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBookingTime(e.target.value)} />
            <button
              className="w-full h-11 mono uppercase tracking-[0.18em] text-[0.7rem] bg-[var(--ink)] text-[var(--bg-raised)]"
              onClick={async () => {
                if (!bookingTime) return;
                const resource = resources.find((r: any) => r.name?.toLowerCase().includes(facility.toLowerCase()));
                const start = new Date(bookingTime);
                const end = new Date(start.getTime() + 60 * 60 * 1000);
                await addBooking({ resource: resource?.id ?? 0, start_time: start.toISOString(), end_time: end.toISOString(), purpose: facility });
              }}
            >
              Request booking
            </button>
          </Panel>
        </div>

        <div className="mt-6">
          <Panel title="Recent bookings">
            <ul className="divide-y divide-[var(--line)]">
              {BOOKINGS.map(b => (
                <li key={b.id} className="px-6 py-4 grid grid-cols-12 items-center gap-3 mono text-[0.78rem]">
                  <span className="col-span-2 text-[var(--ink-muted)] tracking-[0.14em] uppercase">{b.id}</span>
                  <span className="col-span-3">{b.facility}</span>
                  <span className="col-span-5 text-[var(--ink-muted)]">{b.when}</span>
                  <span className="col-span-2 flex items-center gap-2 justify-end">
                    <StatusDot v={b.status === 'confirmed' ? 'positive' : b.status === 'pending' ? 'pending' : 'overdue'} />
                    <span className="uppercase tracking-[0.16em] text-[var(--ink-muted)]">{b.status}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </section>

      <section>
        <Eyebrow label="Verified providers" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--line)]">
          {[
            { name: 'CoolBreeze AC Service', trade: 'AC service', stars: 4, phone: '+880 1722 091 044' },
            { name: 'BrightWire Electric', trade: 'Electrician', stars: 5, phone: '+880 1611 887 553' },
            { name: 'PipeRight Plumbing', trade: 'Plumber', stars: 4, phone: '+880 1900 332 110' },
          ].map(p => (
            <div key={p.name} className="bg-[var(--bg-raised)] p-5">
              <div className="mono text-[0.62rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mb-1">{p.trade}</div>
              <div className="display text-[1.1rem] leading-snug">{p.name}</div>
              <div className="mt-2 text-[var(--accent)] tracking-widest">
                {'★'.repeat(p.stars)}<span className="text-[var(--line)]">{'★'.repeat(5 - p.stars)}</span>
              </div>
              <div className="mono text-[0.72rem] tabular-nums text-[var(--ink-muted)] mt-3">{p.phone}</div>
              <div className="mt-4"><Btn variant="outline">Review</Btn></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
