import { ArrowRight } from 'lucide-react';
import { Eyebrow, Panel, Btn } from '../../components/shared/ui';
import { useData } from '../../../lib/data';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DUTIES: { name: string; cells: (string | null)[] }[] = [
  { name: 'Waste collection', cells: ['SA', 'SA', 'SA', 'SA', 'SA', 'SA', null] },
  { name: 'Lift inspection', cells: [null, 'MZ', null, null, 'MZ', null, null] },
  { name: 'Generator test', cells: [null, null, 'RU', null, null, null, null] },
  { name: 'Pool cleaning', cells: ['BM', null, null, 'BM', null, null, 'BM'] },
];

const QUICK_LINKS = ['Payslip', 'Leave request', 'Report incident'];

export default function Noticeboard() {
  const { notices: NOTICES } = useData();
  return (
    <div className="min-h-screen bg-[var(--bg)] pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Eyebrow num="03" label="Noticeboard" />

        <div className="mb-8">
          <h1 className="display text-[1.8rem] leading-tight">Notices &amp; duty</h1>
          <p className="mono text-[0.66rem] tracking-[0.22em] uppercase text-[var(--ink-muted)] mt-2">
            Staff-relevant · this week
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          <div className="space-y-6">
            {/* Notices */}
            <Panel title="Staff notices" num="01">
              <ul className="divide-y divide-[var(--line)]">
                {NOTICES.map(n => (
                  <li key={n.id} className="px-6 py-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="mono text-[0.66rem] tracking-[0.22em] uppercase text-[var(--accent)]">{n.id}</span>
                      <span className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)]">{n.posted}</span>
                    </div>
                    <div className="display text-[1.05rem] leading-snug mb-2">{n.title}</div>
                    <p className="text-[0.9rem] text-[var(--ink-muted)] line-clamp-2">{n.bodyEn}</p>
                    <button className="mono text-[0.66rem] tracking-[0.22em] uppercase text-[var(--accent)] mt-3 inline-flex items-center gap-2 hover:gap-3 transition-all">
                      Read more <ArrowRight size={12} strokeWidth={1.5} />
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>

            {/* Duty schedule */}
            <Panel title="This week's duty schedule" num="02">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--line)]">
                      <th className="text-left px-4 py-3 mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] font-normal">Duty</th>
                      {DAYS.map(d => (
                        <th key={d} className="px-2 py-3 mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] font-normal text-center">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DUTIES.map(row => (
                      <tr key={row.name} className="border-b border-[var(--line)] last:border-0">
                        <td className="px-4 py-3 mono text-[0.72rem] tracking-[0.14em] uppercase text-[var(--ink)]">{row.name}</td>
                        {row.cells.map((c, i) => (
                          <td key={i} className="px-2 py-3 text-center">
                            {c ? (
                              <span className="inline-block px-2 py-1 border border-[var(--line)] mono text-[0.66rem] tracking-[0.14em] uppercase text-[var(--accent)] tabular-nums">
                                {c}
                              </span>
                            ) : (
                              <span className="mono text-[0.66rem] text-[var(--ink-muted)] opacity-40">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>

          {/* Quick links */}
          <div>
            <Panel title="Quick links" num="03">
              <ul className="divide-y divide-[var(--line)]">
                {QUICK_LINKS.map(l => (
                  <li key={l}>
                    <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--bg-sunken)] transition-colors h-12">
                      <span className="mono text-[0.72rem] tracking-[0.18em] uppercase">{l}</span>
                      <ArrowRight size={14} strokeWidth={1.5} className="text-[var(--ink-muted)]" />
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>

            <div className="mt-4 hidden lg:block">
              <Btn variant="primary" className="w-full h-12">Contact supervisor</Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
