import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar } from 'lucide-react';
import { Eyebrow, Panel, Btn, StatusTag } from '../../components/shared/ui';
import { type Notice, type Poll } from '../../../lib/mock';
import { useData } from '../../../lib/data';

const TABS = ['Notices', 'Polls', 'Events', 'Documents', 'Directory', 'Chat'] as const;
type Tab = typeof TABS[number];

export default function ResidentCommunity() {
  const [tab, setTab] = useState<Tab>('Notices');

  return (
    <div className="p-5 lg:p-10 space-y-8 max-w-[1280px] mx-auto">
      <header>
        <Eyebrow num="04" label="Community · কমিউনিটি" />
        <h1 className="display text-[2.2rem] lg:text-[3rem] leading-[1.05]">
          The <span className="italic text-[var(--accent)]">neighbourhood</span>.
        </h1>
      </header>

      <nav className="flex flex-wrap gap-px bg-[var(--line)] border border-[var(--line)] overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 mono text-[0.66rem] uppercase tracking-[0.18em] whitespace-nowrap ${tab === t ? 'bg-[var(--ink)] text-[var(--bg-raised)]' : 'bg-[var(--bg-raised)] text-[var(--ink-muted)] hover:text-[var(--accent)]'}`}
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === 'Notices' && <Notices />}
      {tab === 'Polls' && <Polls />}
      {tab === 'Events' && <Events />}
      {tab === 'Documents' && <Documents />}
      {tab === 'Directory' && <Directory />}
      {tab === 'Chat' && <Chat />}
    </div>
  );
}

function Notices() {
  const { notices: NOTICES } = useData();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {NOTICES.map((n, i) => (
        <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
          <NoticeCard notice={n} />
        </motion.div>
      ))}
    </div>
  );
}

function NoticeCard({ notice }: { notice: Notice }) {
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  return (
    <Panel className="p-6">
      <div className="flex items-center justify-between mb-3">
        <StatusTag v={notice.tone === 'urgent' ? 'overdue' : notice.tone === 'friendly' ? 'positive' : 'info'}>{notice.tone}</StatusTag>
        <div className="flex gap-px bg-[var(--line)]">
          {(['en', 'bn'] as const).map(t => (
            <button
              key={t}
              onClick={() => setLang(t)}
              className={`px-2 py-1 mono text-[0.6rem] uppercase tracking-[0.18em] ${lang === t ? 'bg-[var(--ink)] text-[var(--bg-raised)]' : 'bg-[var(--bg-raised)] text-[var(--ink-muted)]'}`}
            >
              {t === 'en' ? 'EN' : 'বাং'}
            </button>
          ))}
        </div>
      </div>
      <h4 className="display text-[1.3rem] leading-snug mb-3">{notice.title}</h4>
      <p className="text-[0.94rem] text-[var(--ink-muted)] leading-relaxed">{lang === 'en' ? notice.bodyEn : notice.bodyBn}</p>
      <div className="mono text-[0.62rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mt-4">{notice.posted}</div>
    </Panel>
  );
}

function Polls() {
  const { polls: POLLS } = useData();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {POLLS.map(p => <PollCard key={p.id} poll={p} />)}
    </div>
  );
}

function PollCard({ poll }: { poll: Poll }) {
  const { votePoll } = useData();
  const [voted, setVoted] = useState<number | null>(null);
  const total = poll.options.reduce((s, o) => s + o.votes, 0) + (voted !== null ? 1 : 0);
  return (
    <Panel className="p-6">
      <div className="mono text-[0.62rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mb-2">Poll · closes {poll.closes}</div>
      <h4 className="display text-[1.25rem] leading-snug mb-5">{poll.question}</h4>
      {voted === null ? (
        <div className="space-y-2">
          {poll.options.map((o, i) => (
            <button
              key={o.label}
              onClick={async () => { setVoted(i); await votePoll(poll, o); }}
              className="w-full text-left px-4 py-3 border border-[var(--line)] hover:border-[var(--accent)] hover:text-[var(--accent)] mono text-[0.78rem] uppercase tracking-[0.16em] transition-colors"
            >
              {o.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {poll.options.map((o, i) => {
            const v = o.votes + (i === voted ? 1 : 0);
            const pct = Math.round((v / total) * 100);
            return (
              <div key={o.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="mono text-[0.72rem] uppercase tracking-[0.14em] flex items-center gap-2">
                    {o.label} {i === voted && <span className="text-[var(--accent)]">· your vote</span>}
                  </span>
                  <span className="mono text-[0.72rem] tabular-nums text-[var(--ink-muted)]">{pct}%</span>
                </div>
                <div className="h-1.5 bg-[var(--bg-sunken)] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: [0.7, 0, 0.2, 1] }}
                    className="h-full bg-[var(--accent)]"
                  />
                </div>
              </div>
            );
          })}
          <div className="mono text-[0.62rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] pt-2">{total} votes total</div>
        </div>
      )}
    </Panel>
  );
}

function Events() {
  const events = [
    { d: '18 May', title: 'Rooftop Eid get-together', count: 42 },
    { d: '25 May', title: 'Children\'s art workshop', count: 18 },
    { d: '01 Jun', title: 'AGM 2026 · ballroom', count: 67 },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {events.map((e, i) => (
        <motion.div key={e.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
          <Panel className="p-6">
            <div className="flex items-center gap-2 mono text-[0.62rem] tracking-[0.2em] uppercase text-[var(--accent)] mb-3">
              <Calendar size={12} strokeWidth={1.5} /> {e.d}
            </div>
            <h4 className="display text-[1.3rem] leading-snug">{e.title}</h4>
            <div className="mono text-[0.66rem] tracking-[0.16em] uppercase text-[var(--ink-muted)] mt-4">{e.count} attending</div>
            <div className="mt-5"><Btn variant="outline">RSVP</Btn></div>
          </Panel>
        </motion.div>
      ))}
    </div>
  );
}

function Documents() {
  const docs = [
    { name: 'Building bylaws v3.2', type: 'PDF', posted: 'Jan 2026' },
    { name: 'AGM 2026 minutes', type: 'PDF', posted: 'Mar 2026' },
    { name: 'Fire safety protocol', type: 'PDF', posted: 'Nov 2025' },
    { name: 'Floor plans · Tower A', type: 'PDF', posted: 'Aug 2024' },
  ];
  return (
    <Panel>
      <ul className="divide-y divide-[var(--line)]">
        {docs.map(d => (
          <li key={d.name} className="px-6 py-4 grid grid-cols-12 items-center gap-3">
            <span className="col-span-6 text-[0.95rem]">{d.name}</span>
            <span className="col-span-2 mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)]">{d.type}</span>
            <span className="col-span-3 mono text-[0.7rem] text-[var(--ink-muted)]">{d.posted}</span>
            <span className="col-span-1 text-right">
              <a className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--accent)] hover:underline" href="#">Open</a>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function Directory() {
  const [show, setShow] = useState(true);
  const people = [
    { n: 'Nusrat Rahman', f: '7C', p: 'Architect' },
    { n: 'Tahmid Rahman', f: '7C', p: 'Investment banker' },
    { n: 'S. Choudhury', f: '12A', p: 'Lawyer' },
    { n: 'F. Hossain', f: '9D', p: 'Doctor · cardiology' },
    { n: 'A. Karim', f: '14B', p: 'Entrepreneur' },
    { n: 'M. Begum', f: '14B', p: 'Professor' },
    { n: 'T. Ahmed', f: '5A', p: 'Engineer' },
    { n: 'R. Islam', f: '3D', p: 'Photographer' },
    { n: 'K. Hossain', f: '11B', p: 'Diplomat' },
    { n: 'J. Akter', f: '8A', p: 'Teacher' },
    { n: 'I. Khan', f: '6C', p: 'Designer' },
    { n: 'P. Sultana', f: '4D', p: 'Editor' },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border border-[var(--line)] px-5 py-3 bg-[var(--bg-raised)]">
        <div className="mono text-[0.7rem] tracking-[0.18em] uppercase text-[var(--ink-muted)]">Show my profile · directory</div>
        <button
          onClick={() => setShow(s => !s)}
          className={`mono text-[0.7rem] tracking-[0.2em] uppercase ${show ? 'text-[var(--accent)]' : 'text-[var(--ink-muted)]'}`}
        >
          {show ? 'ON' : 'OFF'}
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--line)]">
        {people.map(p => (
          <div key={p.n + p.f} className="bg-[var(--bg-raised)] p-4">
            <div className="display text-[1.05rem] leading-tight">{p.n}</div>
            <div className="mono text-[0.62rem] tracking-[0.18em] uppercase text-[var(--accent)] mt-1">Flat {p.f}</div>
            <div className="mono text-[0.66rem] tracking-[0.14em] text-[var(--ink-muted)] mt-2">{p.p}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Chat() {
  const { chatRooms, sendMessage } = useData();
  const [chatText, setChatText] = useState('');
  const rooms = [
    { id: 'general', label: 'General', active: true },
    { id: 'parents', label: 'Parents group' },
    { id: 'rooftop', label: 'Rooftop garden' },
    { id: 'lift-b', label: 'Lift B updates' },
  ];
  const msgs = [
    { who: 'S. Karim · 12A', t: '18:42', text: 'Heads up — lift B will be down tomorrow morning.' },
    { who: 'F. Hossain · 9D', t: '18:44', text: 'Thanks for the early notice.' },
    { who: 'You', t: '18:50', text: 'Will the elevator vendor be on-site by 6?', me: true },
    { who: 'S. Karim · 12A', t: '18:51', text: 'Yes, Otis confirmed 05:45.' },
    { who: 'M. Begum · 14B', t: '19:02', text: 'ধন্যবাদ ভাই — আগেই জানিয়ে দিলেন।' },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 border border-[var(--line)] bg-[var(--bg-raised)] min-h-[480px]">
      <aside className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-[var(--line)]">
        <div className="mono text-[0.62rem] tracking-[0.2em] uppercase text-[var(--ink-muted)] px-4 py-3 border-b border-[var(--line)]">Rooms</div>
        <ul>
          {rooms.map(r => (
            <li key={r.id} className={`px-4 py-3 cursor-pointer border-b border-[var(--line)] ${r.active ? 'bg-[var(--bg-sunken)] border-l-2 border-l-[var(--accent)]' : 'hover:bg-[var(--bg-sunken)]/50'}`}>
              <div className="text-[0.92rem]">{r.label}</div>
            </li>
          ))}
        </ul>
      </aside>
      <section className="lg:col-span-3 p-5 space-y-4">
        {msgs.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`max-w-md ${m.me ? 'ml-auto text-right' : ''}`}>
            <div className="mono text-[0.6rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mb-1">{m.who} · {m.t}</div>
            <div className={`inline-block px-4 py-3 ${m.me ? 'bg-[var(--ink)] text-[var(--bg-raised)]' : 'border border-[var(--line)]'} text-[0.92rem] leading-relaxed`}>{m.text}</div>
          </motion.div>
        ))}
        <div className="pt-4 border-t border-[var(--line)] flex gap-2">
          <input
            className="flex-1 h-10 px-3 bg-transparent border border-[var(--line)] focus:border-[var(--accent)] outline-none text-[0.9rem]"
            placeholder="Write a message..."
            value={chatText}
            onChange={e => setChatText(e.target.value)}
          />
          <Btn variant="primary" onClick={async () => { if (!chatText.trim()) return; await sendMessage(chatRooms[0]?.id, chatText); setChatText(''); }}>Send</Btn>
        </div>
      </section>
    </div>
  );
}
