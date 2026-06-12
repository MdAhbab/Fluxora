import { useState } from 'react';
import { motion } from 'motion/react';
import { Eyebrow, Panel, KPI, StatusDot, StatusTag, Btn } from '../../components/shared/ui';
import { useData } from '../../../lib/data';
import { Pencil, Phone } from 'lucide-react';

const EMERGENCY = [
  { label: 'Fire Service', name: 'Dhaka Fire Brigade', phone: '999' },
  { label: 'Ambulance', name: 'Apollo Emergency', phone: '+880 9610 ...' },
  { label: 'Police', name: 'Gulshan Thana', phone: '+880 2 ...' },
  { label: 'Building Security', name: 'Karim Sheikh (Lead)', phone: '+880 1717 ...' },
];

export default function AdminSecurity() {
  const { visitors: VISITORS, gateLogs: GATE_LOGS, lifts: LIFTS, vehicles: VEHICLES } = useData();
  const expected = VISITORS.filter(v => v.status === 'expected');
  const [contacts] = useState(EMERGENCY);
  const [editing, setEditing] = useState<number | null>(null);

  return (
    <div className="space-y-10">
      <header>
        <Eyebrow num="00" label="Security" />
        <h1 className="display text-[3rem] leading-[1.05] tracking-tight">
          The <span className="italic text-[var(--accent)]">perimeter</span>.
        </h1>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--line)]">
        <KPI label="Visitors today" value="14" hint="6 expected" />
        <KPI label="Active passes" value="9" hint="2 expiring" />
        <KPI label="Lifts operational" value="1/2" hint="Lift B in service" />
        <KPI label="SOS · 7d" value="0" hint="No incidents" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Panel title="Expected today" num="01" action={<Btn variant="outline">Pre-register</Btn>}>
          {expected.length === 0 ? (
            <div className="p-6 mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">None expected</div>
          ) : (
            <ul className="divide-y divide-[var(--line)]">
              {expected.map((v, i) => (
                <motion.li
                  key={v.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="px-6 py-4 flex items-start gap-4"
                >
                  <div className="w-10 h-10 grid place-items-center border border-[var(--line)] mono text-[0.72rem]">
                    {v.name.split(' ').map(s => s[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.95rem]">{v.name}</div>
                    <div className="mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                      {v.flat} · Host {v.host}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mono text-[0.72rem] text-[var(--ink-muted)]">{v.when}</div>
                    <div className="mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--accent)] mt-1">{v.qr}</div>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Gate stream" num="02" action={<StatusTag v="positive">Live</StatusTag>}>
          <ul className="divide-y divide-[var(--line)] max-h-[420px] overflow-y-auto">
            {GATE_LOGS.map((g, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className={`px-6 py-3 flex items-center gap-4 ${g.type === 'denied' ? 'bg-[var(--critical)]/5' : ''}`}
              >
                <span className="mono text-[0.7rem] tabular-nums text-[var(--ink-muted)] w-12">{g.time}</span>
                <span className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] w-12">G·{g.gate}</span>
                <StatusDot v={g.type === 'denied' ? 'overdue' : g.type === 'manual' ? 'pending' : g.type === 'sos' ? 'overdue' : 'positive'} pulse={g.type === 'denied'} />
                <div className="flex-1 min-w-0">
                  <span className={`text-[0.9rem] ${g.type === 'denied' ? 'text-[var(--critical)]' : ''}`}>{g.detail}</span>
                </div>
                <span className="mono text-[0.7rem] text-[var(--ink-muted)]">{g.flat}</span>
              </motion.li>
            ))}
          </ul>
        </Panel>
      </section>

      <section>
        <Eyebrow num="03" label="Lift monitoring" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--line)]">
          {LIFTS.map((l, i) => (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="bg-[var(--bg-raised)] p-8"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="mono text-[0.66rem] uppercase tracking-[0.22em] text-[var(--accent)]">{l.id.toUpperCase()}</div>
                  <div className="display text-[2.4rem] mt-2">{l.label}</div>
                </div>
                <StatusTag v={l.status === 'operational' ? 'positive' : l.status === 'service' ? 'pending' : 'overdue'}>
                  {l.status}
                </StatusTag>
              </div>
              <div className="grid grid-cols-2 gap-px bg-[var(--line)] mt-8">
                <div className="bg-[var(--bg-raised)] p-4">
                  <div className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">Current floor</div>
                  <div className="display text-[1.6rem] mt-2">F{l.floor}</div>
                </div>
                <div className="bg-[var(--bg-raised)] p-4">
                  <div className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">Last service</div>
                  <div className="display text-[1.2rem] mt-2 italic text-[var(--accent)]">04 May</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <Eyebrow num="04" label="Access cards & vehicles" />
        <Panel title="Vehicle registry">
          <ul className="divide-y divide-[var(--line)]">
            {VEHICLES.map((v, i) => (
              <motion.li
                key={v.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="grid grid-cols-2 md:grid-cols-12 gap-2 px-6 py-4"
              >
                <div className="md:col-span-3 mono text-[0.78rem]">{v.reg}</div>
                <div className="md:col-span-2 mono text-[0.78rem] text-[var(--ink-muted)]">{v.flat}</div>
                <div className="md:col-span-4 text-[0.92rem]">{v.owner}</div>
                <div className="md:col-span-2 mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">Bay {v.bay}</div>
                <div className="md:col-span-1 text-right"><StatusDot v="positive" /></div>
              </motion.li>
            ))}
          </ul>
        </Panel>
      </section>

      <section>
        <Eyebrow num="05" label="Emergency contacts" />
        <div className="border border-[var(--line)] bg-[var(--bg-raised)] divide-y divide-[var(--line)]">
          {contacts.map((c, i) => (
            <div key={c.label} className="grid grid-cols-1 md:grid-cols-12 gap-2 px-6 py-4 items-center">
              <div className="md:col-span-3 mono text-[0.66rem] uppercase tracking-[0.2em] text-[var(--accent)]">{c.label}</div>
              <div className="md:col-span-5 text-[0.95rem]">{c.name}</div>
              <div className="md:col-span-3 mono text-[0.78rem] text-[var(--ink-muted)] flex items-center gap-2">
                <Phone size={12} strokeWidth={1.5} /> {c.phone}
              </div>
              <div className="md:col-span-1 text-right">
                <button
                  onClick={() => setEditing(editing === i ? null : i)}
                  className="w-8 h-8 grid place-items-center border border-[var(--line)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  <Pencil size={12} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
        {editing !== null && (
          <p className="mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-muted)] mt-3">
            Editing {contacts[editing].label} · changes auto-save
          </p>
        )}
      </section>
    </div>
  );
}

