import { ReactNode, useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sun, ChevronDown, LogOut, Settings, Bell, Sparkles, Send, Check } from 'lucide-react';
import { useAuth } from '../../../lib/auth';
import { useTheme } from '../../../lib/theme';
import { ROLE_MODULES, ROLE_LABEL } from '../../../lib/roles';
import { useData } from '../../../lib/data';
import { fmtRelative } from '../../../lib/adapt';
import { runConcierge, enhanceReply, toAgentData, aiSettings, aiAudit, useAiSettings, type Proposal } from '../../../lib/ai';

export function Shell({ children }: { children: ReactNode }) {
  const { session, logout, switchBuilding } = useAuth();
  const { theme, toggle } = useTheme();
  const { buildings, building: liveBuilding, notifications } = useData();
  const nav = useNavigate();
  const { activeModule } = useParams();
  const [bldgOpen, setBldgOpen] = useState(false);
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  if (!session) return null;
  const role = session.role;
  const cfg = ROLE_MODULES[role];
  const buildingList = buildings.length ? buildings : [];
  const building = liveBuilding || buildingList.find(b => b.id === session.buildingId) || buildingList[0] || { id: '', name: 'Fluxora', address: '' };
  // Only multi-building managers get the switcher.
  const canSwitch = role === 'admin' && buildingList.length > 1;
  const notifItems = (notifications && notifications.length)
    ? notifications.slice(0, 6).map((n: any) => ({ t: n.message, when: fmtRelative(n.sent_at) }))
    : [
        { t: 'Flat 7C raised a plumbing ticket', when: '2m' },
        { t: 'Visitor pass FLX-V904 expected at 20:30', when: '12m' },
        { t: 'Lift B scheduled service tomorrow 06:00', when: '1h' },
      ];

  return (
    <div className="grain min-h-screen flex bg-[var(--bg)] text-[var(--ink)]">
      {/* RAIL */}
      <aside className="hidden md:flex group fixed left-0 top-0 bottom-0 z-30 flex-col bg-[var(--bg-raised)] border-r border-[var(--line)] w-[72px] hover:w-[240px] transition-[width] duration-500 ease-[cubic-bezier(.7,0,.2,1)] overflow-hidden">
        <div className="h-16 flex items-center px-5 border-b border-[var(--line)]">
          <span className="w-2 h-2 bg-[var(--accent)] rotate-45 shrink-0" />
          <span className="mono uppercase tracking-[0.22em] text-[0.7rem] ml-3 opacity-0 group-hover:opacity-100 transition-opacity delay-150 whitespace-nowrap">Fluxora</span>
        </div>

        <nav className="flex-1 py-6 space-y-1">
          {cfg.modules.map(m => (
            <NavLink
              key={m.id}
              to={`/dashboard/${m.id}`}
              className={({ isActive }) => `flex items-center h-11 px-5 mono text-[0.7rem] tracking-[0.2em] uppercase relative whitespace-nowrap ${
                isActive ? 'text-[var(--ink)]' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
              }`}
            >
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="active-rail" className="absolute left-0 top-2 bottom-2 w-[2px] bg-[var(--accent)]" />}
                  <span className={`shrink-0 ${isActive ? 'text-[var(--accent)]' : ''}`}>{m.num}</span>
                  <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity delay-100">{m.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[var(--line)] p-5 mono text-[0.6rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
          {ROLE_LABEL[role]}
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 md:ml-[72px] min-w-0">
        {/* TOPBAR */}
        <header className="sticky top-0 z-20 bg-[var(--bg)]/85 backdrop-blur-md border-b border-[var(--line)]">
          <div className="h-16 px-5 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0">
              {canSwitch ? (
                <div className="relative">
                  <button
                    onClick={() => setBldgOpen(o => !o)}
                    className="flex items-center gap-3 display text-[1.2rem] lg:text-[1.4rem] tracking-[-0.01em] hover:text-[var(--accent)] transition"
                  >
                    <span className="truncate max-w-[60vw]">{building.name}</span>
                    <ChevronDown size={16} strokeWidth={1.5} className={`transition-transform ${bldgOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {bldgOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="absolute top-full left-0 mt-2 w-72 bg-[var(--bg-raised)] border border-[var(--line)] shadow-xl z-30"
                      >
                        {buildingList.map(b => {
                          const id = b.id;
                          const active = b.id === building.id;
                          return (
                            <button
                              key={id}
                              onClick={() => { switchBuilding(id); setBldgOpen(false); }}
                              className={`w-full text-left px-4 py-3 border-b border-[var(--line)] last:border-0 hover:bg-[var(--bg-sunken)] transition ${active ? 'bg-[var(--bg-sunken)]' : ''}`}
                            >
                              <div className="flex items-baseline justify-between">
                                <span className="display text-[1rem]">{b.name}</span>
                                {active && <span className="mono text-[0.6rem] uppercase tracking-[0.18em] text-[var(--accent)]">Active</span>}
                              </div>
                              <div className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] mt-1">{b.address}</div>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="display text-[1.2rem] lg:text-[1.4rem] truncate">{building.name}</div>
              )}
              <span className="hidden lg:inline mono text-[0.62rem] tracking-[0.2em] uppercase text-[var(--ink-muted)] border-l border-[var(--line)] pl-4">
                {ROLE_LABEL[role]} · {session.name}{session.flat ? ` · Flat ${session.flat}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button onClick={() => setNotifOpen(o => !o)} className="w-9 h-9 grid place-items-center border border-[var(--line)] hover:border-[var(--accent)] transition relative">
                  <Bell size={14} strokeWidth={1.5} />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-[var(--bg-raised)] border border-[var(--line)] z-30 shadow-xl">
                      <div className="px-4 py-3 border-b border-[var(--line)] mono text-[0.68rem] tracking-[0.18em] uppercase">Notifications</div>
                      {notifItems.map((n, i) => (
                        <div key={i} className="px-4 py-3 border-b border-[var(--line)] last:border-0 flex items-start gap-3">
                          <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[var(--accent)]" />
                          <div className="flex-1">
                            <div className="text-[0.86rem]">{n.t}</div>
                            <div className="mono text-[0.6rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] mt-1">{n.when}</div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button onClick={() => nav('/settings')} className="w-9 h-9 grid place-items-center border border-[var(--line)] hover:border-[var(--accent)] transition">
                <Settings size={14} strokeWidth={1.5} />
              </button>
              <button onClick={toggle} className="w-9 h-9 grid place-items-center border border-[var(--line)] hover:border-[var(--accent)] transition" aria-label="Toggle theme">
                {theme === 'dark' ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
              </button>
              <button onClick={() => { logout(); nav('/'); }} className="w-9 h-9 grid place-items-center border border-[var(--line)] hover:border-[var(--accent)] transition" aria-label="Log out">
                <LogOut size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="px-5 lg:px-8 py-8 lg:py-10 pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule || 'root'}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.7, 0, 0.2, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* MOBILE TAB BAR */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[var(--bg-raised)] border-t border-[var(--line)] flex">
          {cfg.modules.slice(0, 5).map(m => (
            <NavLink key={m.id} to={`/dashboard/${m.id}`}
              className={({ isActive }) => `flex-1 py-3 flex flex-col items-center gap-1 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--ink-muted)]'}`}>
              <span className="mono text-[0.66rem] tracking-[0.2em]">{m.num}</span>
              <span className="mono text-[0.58rem] tracking-[0.16em] uppercase">{m.label.split(' ')[0]}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* CONCIERGE DOCK */}
      {role !== 'software' && (
        <>
          <button
            onClick={() => setConciergeOpen(o => !o)}
            className="fixed bottom-20 md:bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] grid place-items-center shadow-xl hover:scale-105 transition-transform"
            aria-label="Open Flux Concierge"
          >
            <Sparkles size={18} strokeWidth={1.5} />
          </button>
          <AnimatePresence>
            {conciergeOpen && <Concierge onClose={() => setConciergeOpen(false)} role={role} />}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

type ChatTurn = { id: number; from: 'user' | 'bot'; text: string; sources?: string[]; proposal?: Proposal; done?: boolean };

const CHIPS: Record<string, string[]> = {
  admin: ['What are collections at?', 'Who is on duty?', 'Any overdue invoices?'],
  committee: ['What are collections at?', 'Any overdue invoices?'],
  resident: ['What is my balance?', 'Register a visitor tomorrow 10am', 'Book the rooftop Friday 7pm'],
  guard: ['Next waste collection?', 'Show the lift notice'],
  staff: ['Show the latest notice', 'Next waste collection?'],
};

function Concierge({ onClose, role }: { onClose: () => void; role: string }) {
  const data = useData();
  const { session } = useAuth();
  const settings = useAiSettings();
  const enabled = settings.agents.concierge;
  const [turns, setTurns] = useState<ChatTurn[]>([{ id: 0, from: 'bot', text: 'I can check your balance, draft a payment, register a visitor, book a facility, file a ticket, or look up a notice. What do you need?', done: true }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const seq = useRef(1);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' }); }, [turns]);

  const ask = (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setInput('');
    setBusy(true);
    const userTurn: ChatTurn = { id: seq.current++, from: 'user', text: q };
    setTurns(t => [...t, userTurn]);

    const snap = toAgentData(data);
    const reply = runConcierge(q, role as any, snap);
    const botId = seq.current++;
    // Deterministic answer shows instantly and the input frees up immediately —
    // the optional model enrichment runs detached so a slow endpoint never blocks.
    setTurns(t => [...t, { id: botId, from: 'bot', text: reply.text, sources: reply.sources, proposal: reply.proposal, done: true }]);
    setBusy(false);
    aiAudit.log({ agent: 'concierge', action: `Answered: "${q.slice(0, 60)}"`, tools: reply.sources || [], mode: aiSettings.get().mode, model: enabled ? 'auto' : 'deterministic', buildingId: data.building?.id });

    enhanceReply(reply, q, enabled)
      .then(text => { if (text && text !== reply.text) setTurns(t => t.map(x => x.id === botId ? { ...x, text } : x)); })
      .catch(() => { /* keep deterministic text */ });
  };

  const confirm = async (turn: ChatTurn) => {
    const p = turn.proposal;
    if (!p) return;
    let ok = false;
    if (p.kind === 'payment') ok = await data.payInvoice(p.payload.invoice, p.payload.method);
    else if (p.kind === 'visitor') ok = await data.createAppointment(p.payload as any);
    else if (p.kind === 'ticket') ok = await data.createTicket(p.payload as any);
    else if (p.kind === 'booking') {
      const match = (data.resources || []).find((r: any) => String(r.name || '').toLowerCase().includes(String(p.payload.facility).toLowerCase()));
      ok = await data.addBooking({ resource: match?.id ?? 0, start_time: p.payload.start_time, end_time: p.payload.end_time, purpose: p.payload.purpose });
    }
    aiAudit.log({ agent: 'concierge', action: `${ok ? 'Confirmed' : 'Failed'} ${p.kind}: ${p.summary}`, tools: [p.kind], mode: aiSettings.get().mode, model: 'deterministic', approvedBy: session?.name, buildingId: data.building?.id });
    setTurns(t => t.map(x => x.id === turn.id ? { ...x, proposal: undefined, text: ok ? `Done — ${p.summary.toLowerCase()}.` : `I couldn't complete that just now. You can do it manually from the module.` } : x));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.7, 0, 0.2, 1] }}
      className="fixed bottom-36 md:bottom-24 right-6 z-40 w-[min(400px,calc(100vw-2rem))] h-[min(560px,70vh)] bg-[var(--bg-raised)] border border-[var(--line)] shadow-2xl flex flex-col"
    >
      <header className="px-5 py-4 border-b border-[var(--line)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles size={16} strokeWidth={1.5} className="text-[var(--accent)]" />
          <span className="mono uppercase tracking-[0.2em] text-[0.72rem]">Flux Concierge</span>
          <span className="mono text-[0.56rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] border border-[var(--line)] px-1.5 py-0.5">{enabled ? settings.mode : 'manual'}</span>
        </div>
        <button onClick={onClose} className="mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] hover:text-[var(--accent)]">Close</button>
      </header>

      <div ref={scroller} className="flex-1 overflow-y-auto p-5 space-y-4">
        {turns.map(turn => (
          <div key={turn.id} className={turn.from === 'user' ? 'flex justify-end' : ''}>
            <div className={`${turn.from === 'user' ? 'bg-[var(--accent)] text-[var(--accent-ink)] max-w-[85%]' : 'bg-[var(--bg-sunken)]'} p-3 text-[0.84rem] leading-relaxed`}>
              {turn.text}
              {turn.from === 'bot' && turn.sources && turn.sources.length > 0 && (
                <div className="mono text-[0.54rem] uppercase tracking-[0.16em] text-[var(--ink-muted)] mt-2">via {turn.sources.join(' · ')}</div>
              )}
              {turn.proposal && (
                <div className="mt-3 border border-dashed border-[var(--accent)] p-3 space-y-2">
                  <div className="mono text-[0.6rem] uppercase tracking-[0.18em] text-[var(--accent)]">Proposal · needs your confirmation</div>
                  <div className="text-[0.82rem]">{turn.proposal.summary}</div>
                  <button onClick={() => confirm(turn)} className="inline-flex items-center gap-2 h-8 px-3 bg-[var(--ink)] text-[var(--bg-raised)] mono text-[0.62rem] uppercase tracking-[0.16em]">
                    <Check size={12} strokeWidth={2} /> {turn.proposal.confirmLabel || 'Confirm'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && <div className="mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">thinking…</div>}
        {turns.length <= 1 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {(CHIPS[role] || []).map(c => (
              <button key={c} onClick={() => ask(c)} className="mono text-[0.62rem] uppercase tracking-[0.14em] border border-[var(--line)] hover:border-[var(--accent)] hover:text-[var(--accent)] h-8 px-3 transition text-left">
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={e => { e.preventDefault(); ask(input); }} className="border-t border-[var(--line)] p-3 flex items-center gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} className="flex-1 h-10 px-3 bg-transparent text-[0.92rem] outline-none" placeholder="Ask the concierge…" />
        <button type="submit" disabled={busy} className="w-10 h-10 grid place-items-center bg-[var(--accent)] text-[var(--accent-ink)] disabled:opacity-40"><Send size={14} strokeWidth={1.5} /></button>
      </form>
    </motion.div>
  );
}
