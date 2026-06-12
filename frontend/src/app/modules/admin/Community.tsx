import { useState } from 'react';
import { motion } from 'motion/react';
import { Eyebrow, Panel, StatusDot, Btn, Chips, Field } from '../../components/shared/ui';
import { useData } from '../../../lib/data';
import { Upload, FileText } from 'lucide-react';

const TABS = ['Notices', 'Polls', 'Events', 'Documents', 'Directory', 'Chat rooms'];
const TONES = ['Formal', 'Friendly', 'Urgent'];

const DOCS = [
  { id: 'D-01', title: 'Building bylaws · 2024 revision', type: 'PDF', posted: '14 Jan', access: 'All residents' },
  { id: 'D-02', title: 'May 2026 financial report', type: 'PDF', posted: '08 May', access: 'Committee only' },
  { id: 'D-03', title: 'Lift maintenance contract', type: 'PDF', posted: '02 May', access: 'Committee only' },
  { id: 'D-04', title: 'Fire safety protocol', type: 'PDF', posted: '12 Apr', access: 'All residents' },
  { id: 'D-05', title: 'AGM minutes · April', type: 'PDF', posted: '28 Apr', access: 'All residents' },
];

const ROOMS = [
  { id: 'general', name: 'General', count: 84, unread: 3 },
  { id: 'committee', name: 'Committee', count: 6, unread: 0 },
  { id: 'maintenance', name: 'Maintenance', count: 12, unread: 1 },
  { id: 'owners', name: 'Owners', count: 48, unread: 0 },
];

const MESSAGES = [
  { who: 'N. Rahman', flat: '7C', when: '14:22', body: 'Has anyone noticed the lobby AC running too cold?' },
  { who: 'S. Choudhury', flat: '12A', when: '14:25', body: 'Yes, also yesterday evening. Reported to office.' },
  { who: 'M. Begum', flat: '14B', when: '14:31', body: 'I think they\'re testing it after the new compressor was installed.' },
];

const DIRECTORY = [
  { name: 'N. Rahman', flat: '7C', opt: 'Email · WhatsApp' },
  { name: 'S. Choudhury', flat: '12A', opt: 'WhatsApp' },
  { name: 'A. Karim', flat: '14A', opt: 'Email' },
  { name: 'F. Hossain', flat: '9D', opt: 'Email · WhatsApp' },
  { name: 'T. Ahmed', flat: '5A', opt: 'Phone' },
  { name: 'R. Islam', flat: '3D', opt: 'Email · WhatsApp' },
];

const EVENTS = [
  { date: '18 May', title: 'Rooftop Eid get-together', when: '18:00 — 22:00', where: 'Rooftop' },
  { date: '20 May', title: 'Community Hall booking', when: '11:00 — 15:00', where: 'Hall' },
  { date: '25 May', title: 'AGM · quarterly', when: '19:00 — 21:00', where: 'Community Hall' },
];

export default function AdminCommunity() {
  const { notices: NOTICES, polls: POLLS, addNotice, votePoll } = useData();
  const [tab, setTab] = useState('Notices');
  const [tone, setTone] = useState('Formal');
  const [brief, setBrief] = useState('Lift B planned maintenance on 14 May, 6–10am');
  const [drafted, setDrafted] = useState(true);
  const [room, setRoom] = useState('general');

  return (
    <div className="space-y-10">
      <header>
        <Eyebrow num="00" label="Community" />
        <h1 className="display text-[3rem] leading-[1.05] tracking-tight">
          The <span className="italic text-[var(--accent)]">people</span>.
        </h1>
      </header>

      <Chips items={TABS} active={tab} onChange={setTab} />

      {tab === 'Notices' && (
        <section className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Panel title="Notice Scribe" num="01">
              <div className="p-6 space-y-5">
                <Field label="Brief" value={brief} onChange={e => setBrief(e.target.value)} />
                <div>
                  <div className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mb-2">Tone</div>
                  <Chips items={TONES} active={tone} onChange={setTone} />
                </div>
                <Btn variant="primary" onClick={() => setDrafted(true)}>Draft</Btn>
              </div>
            </Panel>

            <Panel title="Bilingual draft" num="02" action={drafted && <Btn variant="outline" onClick={async () => { await addNotice({ title: brief, body: NOTICES[0]?.bodyEn ?? brief }); }}>Publish</Btn>}>
              {!drafted ? (
                <div className="p-12 text-center mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                  Draft will appear here
                </div>
              ) : (
                <div className="grid grid-cols-2 divide-x divide-[var(--line)]">
                  <div className="p-6 space-y-3">
                    <div className="mono text-[0.62rem] uppercase tracking-[0.2em] text-[var(--accent)]">English</div>
                    <h3 className="display text-[1.1rem] leading-tight">{NOTICES[0].title}</h3>
                    <p className="text-[0.9rem] leading-[1.6] text-[var(--ink-muted)]">{NOTICES[0].bodyEn}</p>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="mono text-[0.62rem] uppercase tracking-[0.2em] text-[var(--accent)]">বাংলা</div>
                    <h3 className="display text-[1.1rem] leading-tight">{NOTICES[0].title}</h3>
                    <p className="text-[0.9rem] leading-[1.6] text-[var(--ink-muted)]">{NOTICES[0].bodyBn}</p>
                  </div>
                </div>
              )}
            </Panel>
          </div>

          <div>
            <Eyebrow num="03" label="Past notices" />
            <Panel>
              <ul className="divide-y divide-[var(--line)]">
                {NOTICES.map((n, i) => (
                  <motion.li
                    key={n.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="px-6 py-4 flex items-start gap-4"
                  >
                    <span className="mono text-[0.7rem] text-[var(--ink-muted)] w-20 shrink-0">{n.posted}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.95rem]">{n.title}</div>
                      <div className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] mt-1">
                        {n.tone} {n.byScribe && '· Scribe'}
                      </div>
                    </div>
                    <span className="mono text-[0.72rem] text-[var(--ink-muted)]">{42 + i * 7} views</span>
                  </motion.li>
                ))}
              </ul>
            </Panel>
          </div>
        </section>
      )}

      {tab === 'Polls' && (
        <section className="space-y-8">
          <Panel title="New poll" num="01">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Question" placeholder="Should we add EV charging?" />
              <Field label="Closes" type="date" />
              <Field label="Option A" placeholder="Yes" />
              <Field label="Option B" placeholder="No" />
              <div className="md:col-span-2"><Btn variant="primary">Open poll</Btn></div>
            </div>
          </Panel>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {POLLS.map((p, i) => {
              const total = p.options.reduce((s, o) => s + o.votes, 0);
              return (
                <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }}>
                  <Panel title={p.id} num="·" action={<span className="mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">Closes {p.closes}</span>}>
                    <div className="p-6 space-y-5">
                      <h3 className="display text-[1.2rem] leading-tight">{p.question}</h3>
                      <ul className="space-y-3">
                        {p.options.map(o => {
                          const pct = Math.round((o.votes / total) * 100);
                          return (
                            <li key={o.label} onClick={() => votePoll(p, o)} className="cursor-pointer">
                              <div className="flex justify-between mono text-[0.78rem] mb-1">
                                <span>{o.label}</span>
                                <span className="text-[var(--ink-muted)]">{pct}% · {o.votes}</span>
                              </div>
                              <div className="h-2 bg-[var(--bg-sunken)]">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8, ease: [0.7, 0, 0.2, 1] }}
                                  className="h-full bg-[var(--accent)] opacity-80"
                                />
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">{total} votes</div>
                    </div>
                  </Panel>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {tab === 'Events' && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--line)]">
          {EVENTS.map((e, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="bg-[var(--bg-raised)] p-8"
            >
              <div className="mono text-[0.66rem] uppercase tracking-[0.22em] text-[var(--accent)]">{e.date}</div>
              <h3 className="display text-[1.5rem] mt-3 leading-tight">{e.title}</h3>
              <div className="mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--ink-muted)] mt-3">
                {e.when} · {e.where}
              </div>
            </motion.div>
          ))}
        </section>
      )}

      {tab === 'Documents' && (
        <section className="space-y-8">
          <div className="border border-dashed border-[var(--line)] p-12 text-center bg-[var(--bg-raised)] hover:border-[var(--accent)] transition-colors">
            <Upload size={20} strokeWidth={1.5} className="mx-auto text-[var(--ink-muted)]" />
            <div className="display text-[1.2rem] mt-4">Drop documents here</div>
            <p className="mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ink-muted)] mt-2">PDF · up to 10 MB</p>
          </div>
          <Panel title="Library" num="01">
            <ul className="divide-y divide-[var(--line)]">
              {DOCS.map((d, i) => (
                <motion.li
                  key={d.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="grid grid-cols-2 md:grid-cols-12 gap-2 px-6 py-4 items-center"
                >
                  <div className="md:col-span-1"><FileText size={16} strokeWidth={1.5} className="text-[var(--ink-muted)]" /></div>
                  <div className="md:col-span-5 text-[0.95rem]">{d.title}</div>
                  <div className="md:col-span-2 mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--accent)]">{d.type}</div>
                  <div className="md:col-span-2 mono text-[0.72rem] text-[var(--ink-muted)]">{d.posted}</div>
                  <div className="md:col-span-2 mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">{d.access}</div>
                </motion.li>
              ))}
            </ul>
          </Panel>
        </section>
      )}

      {tab === 'Directory' && (
        <section className="grid grid-cols-2 md:grid-cols-3 gap-px bg-[var(--line)]">
          {DIRECTORY.map((d, i) => (
            <motion.div
              key={d.flat}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-[var(--bg-raised)] p-6 flex gap-4 items-start"
            >
              <div className="w-12 h-12 grid place-items-center border border-[var(--line)] mono text-[0.78rem] shrink-0">
                {d.name.split(' ').map(s => s[0]).slice(0, 2).join('')}
              </div>
              <div className="min-w-0">
                <div className="text-[0.95rem]">{d.name}</div>
                <div className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--accent)] mt-1">Flat {d.flat}</div>
                <div className="mono text-[0.66rem] text-[var(--ink-muted)] mt-2">{d.opt}</div>
              </div>
            </motion.div>
          ))}
        </section>
      )}

      {tab === 'Chat rooms' && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--line)] border border-[var(--line)] min-h-[480px]">
          <aside className="bg-[var(--bg-raised)]">
            <div className="px-5 py-4 border-b border-[var(--line)] mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">
              Rooms
            </div>
            <ul className="divide-y divide-[var(--line)]">
              {ROOMS.map(r => (
                <li key={r.id}>
                  <button
                    onClick={() => setRoom(r.id)}
                    className={`w-full px-5 py-4 flex items-center justify-between text-left ${room === r.id ? 'bg-[var(--bg-sunken)] border-l-2 border-[var(--accent)]' : ''}`}
                  >
                    <div>
                      <div className="text-[0.95rem]">{r.name}</div>
                      <div className="mono text-[0.66rem] text-[var(--ink-muted)] mt-1">{r.count} members</div>
                    </div>
                    {r.unread > 0 && <StatusDot v="info" />}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="md:col-span-2 bg-[var(--bg-raised)] flex flex-col">
            <header className="px-6 py-4 border-b border-[var(--line)] flex items-center justify-between">
              <h3 className="mono text-[0.78rem] uppercase tracking-[0.18em]">{ROOMS.find(r => r.id === room)?.name}</h3>
              <span className="mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">Today</span>
            </header>
            <ul className="flex-1 p-6 space-y-5 overflow-y-auto">
              {MESSAGES.map((m, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="flex gap-4"
                >
                  <div className="w-9 h-9 grid place-items-center border border-[var(--line)] mono text-[0.66rem] shrink-0">
                    {m.who.split(' ').map(s => s[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-3">
                      <span className="text-[0.92rem]">{m.who}</span>
                      <span className="mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--accent)]">{m.flat}</span>
                      <span className="mono text-[0.66rem] text-[var(--ink-muted)]">{m.when}</span>
                    </div>
                    <p className="text-[0.92rem] leading-[1.55] mt-1">{m.body}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
            <div className="border-t border-[var(--line)] p-4 flex gap-3">
              <input
                placeholder="Write a message…"
                className="flex-1 h-10 px-3 bg-transparent border border-[var(--line)] focus:border-[var(--accent)] outline-none text-[0.92rem]"
              />
              <Btn variant="primary">Send</Btn>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
