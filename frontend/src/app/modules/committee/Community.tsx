import { useState } from 'react';
import { motion } from 'motion/react';
import { Eyebrow, Panel, Chips, Btn, Field, StatusTag } from '../../components/shared/ui';
import { useData } from '../../../lib/data';

const TABS = ['Notices', 'Polls', 'Events'];
const TONES = ['Formal', 'Friendly', 'Urgent'];

const EVENTS = [
  { id: 'EV-03', title: 'Rooftop Iftar', date: '14 Mar 2026', attendance: 64 },
  { id: 'EV-02', title: 'Eid Get-together', date: '18 May 2026', attendance: 92 },
  { id: 'EV-01', title: 'Annual General Meeting', date: '02 Jun 2026', attendance: 48 },
];

const VIEWS: Record<string, number> = { 'N-08': 142, 'N-07': 96, 'N-06': 188 };

export default function CommitteeCommunity() {
  const [tab, setTab] = useState('Notices');

  return (
    <div className="p-6 lg:p-10 space-y-10">
      <header>
        <Eyebrow num="03" label="Community" />
        <h1 className="display text-[2.8rem] lg:text-[3.4rem] leading-[1.05]">
          The <span className="italic text-[var(--accent)]">voice</span> of the building
        </h1>
      </header>

      <Chips items={TABS} active={tab} onChange={setTab} />

      {tab === 'Notices' && <NoticesTab />}
      {tab === 'Polls' && <PollsTab />}
      {tab === 'Events' && <EventsTab />}
    </div>
  );
}

function NoticesTab() {
  const { notices: NOTICES, addNotice } = useData();
  const [tone, setTone] = useState('Formal');
  const [brief, setBrief] = useState('Lift B annual service scheduled 14 May, 06:00–10:00.');
  const [drafted, setDrafted] = useState(false);

  return (
    <div className="space-y-10">
      <Panel num="·" title="Notice Scribe · composer">
        <div className="p-6 space-y-6">
          <div>
            <div className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mb-2">Brief</div>
            <textarea
              value={brief}
              onChange={e => { setBrief(e.target.value); setDrafted(false); }}
              rows={3}
              className="w-full p-3 bg-transparent border border-[var(--line)] focus:border-[var(--accent)] outline-none transition-colors text-[0.95rem] font-sans"
              placeholder="What needs to be announced?"
            />
          </div>
          <div>
            <div className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mb-2">Tone</div>
            <Chips items={TONES} active={tone} onChange={setTone} />
          </div>
          <div className="flex gap-2">
            <Btn variant="primary" onClick={() => setDrafted(true)}>Draft</Btn>
            <Btn variant="ghost" onClick={() => { setBrief(''); setDrafted(false); }}>Clear</Btn>
          </div>
        </div>

        {drafted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 border-t border-[var(--line)]"
          >
            <div className="p-6 border-r border-[var(--line)]">
              <div className="mono text-[0.66rem] tracking-[0.2em] uppercase text-[var(--accent)] mb-3">English</div>
              <h4 className="display text-[1.3rem] leading-[1.25] mb-3">Lift B annual service — 14 May</h4>
              <p className="text-[0.92rem] leading-[1.7] text-[var(--ink)]">
                Lift B will be unavailable for routine annual service on 14 May between 06:00 and 10:00.
                Lift A remains operational. Please plan ahead, particularly residents on upper floors.
              </p>
            </div>
            <div className="p-6">
              <div className="mono text-[0.66rem] tracking-[0.2em] uppercase text-[var(--accent)] mb-3">বাংলা</div>
              <h4 className="display text-[1.3rem] leading-[1.25] mb-3">লিফট বি বার্ষিক রক্ষণাবেক্ষণ — ১৪ মে</h4>
              <p className="text-[0.92rem] leading-[1.7] text-[var(--ink)]">
                বার্ষিক রক্ষণাবেক্ষণের জন্য লিফট বি ১৪ মে সকাল ৬টা থেকে ১০টা পর্যন্ত বন্ধ থাকবে। লিফট এ চালু থাকবে।
              </p>
            </div>
            <div className="md:col-span-2 p-6 border-t border-[var(--line)] flex justify-end">
              <Btn variant="primary" onClick={() => { addNotice({ title: brief.split('.')[0].trim(), body: brief }); setDrafted(false); }}>Publish</Btn>
            </div>
          </motion.div>
        )}
      </Panel>

      <Panel num="·" title="Published notices">
        <ul className="divide-y divide-[var(--line)]">
          {NOTICES.map((n, i) => (
            <motion.li
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="px-6 py-5 grid grid-cols-[80px,1fr,auto] gap-4 items-baseline"
            >
              <span className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">{n.id}</span>
              <div className="min-w-0">
                <div className="text-[0.95rem] text-[var(--ink)] truncate">{n.title}</div>
                <div className="mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-muted)] mt-1">
                  {n.tone} · {n.posted}{n.byScribe && ' · drafted by Scribe'}
                </div>
              </div>
              <span className="mono text-[0.72rem] tabular-nums text-[var(--accent)]">{VIEWS[n.id] ?? 0} views</span>
            </motion.li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function PollsTab() {
  const { polls: POLLS, votePoll } = useData();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  return (
    <div className="space-y-10">
      <Panel num="·" title="New poll">
        <div className="p-6 space-y-5">
          <Field label="Question" value={question} onChange={e => setQuestion(e.target.value)} placeholder="What's being decided?" />
          {options.map((o, i) => (
            <Field
              key={i}
              label={`Option ${i + 1}`}
              value={o}
              onChange={e => setOptions(prev => prev.map((p, idx) => idx === i ? e.target.value : p))}
            />
          ))}
          <div className="flex gap-2">
            {options.length < 4 && <Btn variant="ghost" onClick={() => setOptions(p => [...p, ''])}>+ Add option</Btn>}
            {options.length > 2 && <Btn variant="ghost" onClick={() => setOptions(p => p.slice(0, -1))}>− Remove</Btn>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Closes" type="date" />
          </div>
          <Btn variant="primary">Open poll</Btn>
        </div>
      </Panel>

      <Panel num="·" title="Live polls">
        <ul className="divide-y divide-[var(--line)]">
          {POLLS.map((p, i) => {
            const total = p.options.reduce((s, o) => s + o.votes, 0);
            return (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="px-6 py-6"
              >
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <div className="mono text-[0.62rem] tracking-[0.2em] uppercase text-[var(--ink-muted)] mb-1">{p.id}</div>
                    <h4 className="display text-[1.2rem] leading-[1.3]">{p.question}</h4>
                  </div>
                  <StatusTag v="info">Closes {p.closes}</StatusTag>
                </div>
                <div className="space-y-3">
                  {p.options.map(o => {
                    const pct = Math.round((o.votes / total) * 100);
                    return (
                      <div key={o.label} onClick={() => votePoll(p, o)} className="cursor-pointer">
                        <div className="flex justify-between mono text-[0.7rem] uppercase tracking-[0.16em] mb-1">
                          <span className="text-[var(--ink)]">{o.label}</span>
                          <span className="text-[var(--ink-muted)] tabular-nums">{o.votes} · {pct}%</span>
                        </div>
                        <div className="h-1 bg-[var(--bg-sunken)] relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: [0.7, 0, 0.2, 1] }}
                            className="absolute inset-y-0 left-0 bg-[var(--accent)]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}

function EventsTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--line)]">
      {EVENTS.map((e, i) => (
        <motion.div
          key={e.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
          className="bg-[var(--bg-raised)] p-8 border border-[var(--line)]"
        >
          <div className="mono text-[0.62rem] tracking-[0.2em] uppercase text-[var(--ink-muted)] mb-3">{e.id}</div>
          <h3 className="display text-[1.6rem] leading-[1.2] mb-4">{e.title}</h3>
          <div className="space-y-2 pt-4 border-t border-[var(--line)]">
            <div className="flex justify-between mono text-[0.7rem] uppercase tracking-[0.18em]">
              <span className="text-[var(--ink-muted)]">Date</span>
              <span className="text-[var(--ink)]">{e.date}</span>
            </div>
            <div className="flex justify-between mono text-[0.7rem] uppercase tracking-[0.18em]">
              <span className="text-[var(--ink-muted)]">Attendance</span>
              <span className="text-[var(--accent)] tabular-nums">{e.attendance}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
