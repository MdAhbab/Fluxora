import { useState } from 'react';
import { Link, useNavigate, useParams, NavLink } from 'react-router';
import { motion } from 'motion/react';
import { Sun, Moon, LogOut, Server, Activity, Wallet, Cpu, FileSearch, ChevronRight } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useTheme } from '../../lib/theme';
import { useData } from '../../lib/data';
import { TENANTS, formatBDT } from '../../lib/mock';
import { Eyebrow, Panel, StatusDot, StatusTag, KPI, MiniBars, Btn, Chips, Drawer } from '../components/shared/ui';

const MODS = [
  { id: 'tenants', label: 'Tenants', num: '00', icon: Server },
  { id: 'billing', label: 'Revenue', num: '01', icon: Wallet },
  { id: 'health', label: 'Health', num: '02', icon: Activity },
  { id: 'ai', label: 'AI Console', num: '03', icon: Cpu },
  { id: 'audit', label: 'Audit Log', num: '04', icon: FileSearch },
];

export function Software() {
  const { session, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { activeModule = 'tenants' } = useParams();
  const nav = useNavigate();

  if (!session) return null;

  return (
    <div className="grain min-h-screen flex bg-[var(--bg)] text-[var(--ink)]">
      <aside className="hidden md:flex group fixed left-0 top-0 bottom-0 z-30 flex-col bg-[var(--bg-raised)] border-r border-[var(--line)] w-[72px] hover:w-[240px] transition-[width] duration-500 overflow-hidden">
        <div className="h-16 flex items-center px-5 border-b border-[var(--line)]">
          <span className="w-2 h-2 bg-[var(--accent)] rotate-45 shrink-0" />
          <span className="mono uppercase tracking-[0.22em] text-[0.7rem] ml-3 opacity-0 group-hover:opacity-100 transition-opacity">Fluxora · Ops</span>
        </div>
        <nav className="flex-1 py-6">
          {MODS.map(m => (
            <NavLink key={m.id} to={`/software/${m.id}`}
              className={({ isActive }) => `flex items-center h-11 px-5 mono text-[0.7rem] tracking-[0.2em] uppercase relative whitespace-nowrap ${isActive ? 'text-[var(--ink)]' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'}`}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-2 bottom-2 w-[2px] bg-[var(--accent)]" />}
                  <span className={`shrink-0 ${isActive ? 'text-[var(--accent)]' : ''}`}>{m.num}</span>
                  <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">{m.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 md:ml-[72px] min-w-0">
        <header className="sticky top-0 z-20 bg-[var(--bg)]/85 backdrop-blur-md border-b border-[var(--line)]">
          <div className="h-16 px-5 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="display text-[1.4rem]">Fluxora Operations</Link>
              <span className="mono text-[0.62rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] border-l border-[var(--line)] pl-4">Software Admin · {session.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggle} className="w-9 h-9 grid place-items-center border border-[var(--line)] hover:border-[var(--accent)]">
                {theme === 'dark' ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
              </button>
              <button onClick={() => { logout(); nav('/'); }} className="w-9 h-9 grid place-items-center border border-[var(--line)] hover:border-[var(--accent)]"><LogOut size={14} strokeWidth={1.5} /></button>
            </div>
          </div>
        </header>

        <main className="px-5 lg:px-8 py-10 pb-32">
          <motion.div key={activeModule} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.7, 0, 0.2, 1] }}>
            {activeModule === 'tenants' && <Tenants />}
            {activeModule === 'billing' && <Revenue />}
            {activeModule === 'health' && <Health />}
            {activeModule === 'ai' && <AIConsole />}
            {activeModule === 'audit' && <Audit />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function Tenants() {
  const { tenants } = useData();
  const TENANTS = tenants.length ? tenants : [];
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<typeof TENANTS[0] | null>(null);
  const filtered = filter === 'All' ? TENANTS : TENANTS.filter(t => filter === 'Healthy' ? t.health === 'green' : filter === 'At risk' ? t.health !== 'green' : t.plan === filter);

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <Eyebrow num="00" label="Tenants" />
          <h1 className="display text-[clamp(2rem,3.6vw,3rem)] leading-none">All buildings on Fluxora</h1>
        </div>
        <Chips items={['All', 'Healthy', 'At risk', 'Foundation', 'Residence', 'Estate']} active={filter} onChange={setFilter} />
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Active tenants" value={String(TENANTS.length)} hint="+1 this month" />
        <KPI label="Total flats" value={String(TENANTS.reduce((a, t) => a + t.flats, 0))} />
        <KPI label="MRR" value={formatBDT(TENANTS.reduce((a, t) => a + t.mrr, 0))} hint="excl. add-ons" />
        <KPI label="Health" value={`${TENANTS.filter(t => t.health === 'green').length} / ${TENANTS.length}`} hint="green" />
      </div>

      <Panel num="01" title="Tenant ledger">
        <div className="grid grid-cols-[1fr_120px_80px_120px_100px_60px] mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] px-6 py-3 border-b border-[var(--line)]">
          <span>Building</span><span>Plan</span><span>Flats</span><span className="text-right">MRR</span><span>Health</span><span></span>
        </div>
        {filtered.map(t => (
          <button key={t.id} onClick={() => setSelected(t)} className="w-full text-left grid grid-cols-[1fr_120px_80px_120px_100px_60px] items-center px-6 py-4 border-b border-[var(--line)] hover:bg-[var(--bg-sunken)] last:border-0">
            <div>
              <div>{t.name}</div>
              <div className="mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] mt-0.5">since {t.since}</div>
            </div>
            <span className="mono text-[0.78rem] text-[var(--ink-muted)]">{t.plan}</span>
            <span className="mono">{t.flats}</span>
            <span className="mono text-right tabular-nums">{formatBDT(t.mrr)}</span>
            <StatusTag v={t.health === 'green' ? 'positive' : t.health === 'amber' ? 'pending' : 'overdue'}>{t.health}</StatusTag>
            <ChevronRight size={14} strokeWidth={1.5} className="text-[var(--ink-muted)] justify-self-end" />
          </button>
        ))}
      </Panel>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.name}>
        {selected && (
          <div className="space-y-6">
            <div>
              <div className="eyebrow mb-2">Plan</div>
              <div className="display text-[2rem]">{selected.plan}</div>
              <div className="mono text-[0.74rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">since {selected.since}</div>
            </div>
            <div className="border-t border-[var(--line)] pt-6 space-y-3">
              <Row k="Flats" v={selected.flats} />
              <Row k="MRR" v={formatBDT(selected.mrr)} />
              <Row k="Health" v={<StatusTag v={selected.health === 'green' ? 'positive' : 'overdue'}>{selected.health}</StatusTag>} />
              <Row k="API calls / day" v="14,200" />
              <Row k="AI tokens / mo" v="2.4M" />
            </div>
            <div className="border-t border-[var(--line)] pt-6 flex flex-wrap gap-2">
              <Btn variant="outline">Impersonate</Btn>
              <Btn variant="outline">Suspend</Btn>
              <Btn variant="ghost">Open audit log</Btn>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function Revenue() {
  const months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const data = months.map((m, i) => ({ label: m, value: 56000 + i * 8500 }));
  return (
    <div className="space-y-8">
      <Eyebrow num="01" label="Revenue" />
      <h1 className="display text-[clamp(2rem,3.6vw,3rem)] leading-none">Recurring revenue · BDT</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="MRR" value={formatBDT(76600)} hint="+18% MoM" />
        <KPI label="ARR" value={formatBDT(919200)} />
        <KPI label="Churn · 30d" value="0.8%" />
        <KPI label="LTV / CAC" value="6.4×" />
      </div>
      <Panel num="02" title="Trailing six months">
        <div className="p-8"><MiniBars data={data} /></div>
      </Panel>
    </div>
  );
}

function Health() {
  return (
    <div className="space-y-8">
      <Eyebrow num="02" label="Platform health" />
      <h1 className="display text-[clamp(2rem,3.6vw,3rem)] leading-none">Everything's quiet</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="API uptime · 30d" value="99.987%" hint="0 incidents" />
        <KPI label="P95 latency" value="86" unit="ms" />
        <KPI label="Background workers" value="12 / 12" />
        <KPI label="DB size" value="78" unit="GB" />
      </div>
      <Panel num="03" title="Incident timeline">
        <div className="p-12 text-center text-[var(--ink-muted)] mono text-[0.74rem] uppercase tracking-[0.18em]">No incidents in the trailing 30 days.</div>
      </Panel>
    </div>
  );
}

function AIConsole() {
  return (
    <div className="space-y-8">
      <Eyebrow num="03" label="AI console" />
      <h1 className="display text-[clamp(2rem,3.6vw,3rem)] leading-none">Managed AI tap</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Tokens · 30d" value="184.2M" />
        <KPI label="Spend · 30d" value="$ 2,140" />
        <KPI label="Avg latency" value="1.4" unit="s" />
        <KPI label="Fallback hits" value="0.4%" />
      </div>
      <Panel num="04" title="Per-tenant usage">
        {TENANTS.slice(0, 4).map(t => (
          <div key={t.id} className="grid grid-cols-[1fr_120px_60px] items-center px-6 py-4 border-b border-[var(--line)] last:border-0">
            <span>{t.name}</span>
            <div className="h-2 bg-[var(--bg-sunken)] relative overflow-hidden"><div className="absolute inset-y-0 left-0 bg-[var(--accent)]" style={{ width: `${30 + t.flats / 2}%` }} /></div>
            <span className="mono text-[0.74rem] text-right text-[var(--ink-muted)]">{(t.flats * 30).toLocaleString()}k tok</span>
          </div>
        ))}
      </Panel>
    </div>
  );
}

function Audit() {
  return (
    <div className="space-y-8">
      <Eyebrow num="04" label="Audit log" />
      <h1 className="display text-[clamp(2rem,3.6vw,3rem)] leading-none">Every change, signed</h1>
      <Panel num="05" title="Recent events">
        {[
          ['admin@gulshanheights.bd', 'Updated invoice INV-2605-008', '2m'],
          ['committee@banani.bd', 'Approved expense E-22 · Padma Diesel', '14m'],
          ['ops@fluxora.bd', 'Impersonated tenant Mirpur Mid-Rise', '1h'],
          ['system', 'AI fallback: Anthropic → Google · Gemini', '3h'],
          ['admin@gulshanheights.bd', 'Toggled Architect Mode · saved 3 unit edits', '6h'],
        ].map(([who, what, when], i) => (
          <div key={i} className="grid grid-cols-[1fr_2fr_60px] items-center px-6 py-3 border-b border-[var(--line)] last:border-0 mono text-[0.78rem]">
            <span className="text-[var(--ink-muted)] truncate">{who}</span>
            <span>{what}</span>
            <span className="text-right text-[var(--ink-muted)]">{when}</span>
          </div>
        ))}
      </Panel>
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
