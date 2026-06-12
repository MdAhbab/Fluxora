import { useState } from 'react';
import { Download } from 'lucide-react';
import { Eyebrow, Panel, Chips, Btn, MiniBars } from '../../components/shared/ui';
import { formatBDT } from '../../../lib/mock';

const MONTHS = ['Apr', 'May', 'Jun', 'Jul'];

const BREAKDOWN = [
  { label: 'Base salary', amount: 28_000 },
  { label: 'Overtime pay', amount: 4_800 },
  { label: 'Bonus', amount: 2_000 },
  { label: 'Deductions — gas', amount: -200 },
  { label: 'Deductions — insurance', amount: -200 },
];

const YTD = [
  { label: 'Jan', value: 30_400 },
  { label: 'Feb', value: 31_200 },
  { label: 'Mar', value: 32_000 },
  { label: 'Apr', value: 33_600 },
  { label: 'May', value: 34_400 },
];

export default function Payroll() {
  const [month, setMonth] = useState('May');
  const net = BREAKDOWN.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Eyebrow num="02" label="Payroll" />

        <div className="mb-6">
          <h1 className="display text-[1.8rem] leading-tight">My monthly statements</h1>
          <p className="mono text-[0.66rem] tracking-[0.22em] uppercase text-[var(--ink-muted)] mt-2">
            Slips · history · YTD
          </p>
        </div>

        <div className="mb-6">
          <Chips items={MONTHS} active={month} onChange={setMonth} />
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-5 border border-[var(--line)] bg-[var(--bg-raised)]">
            <div className="mono text-[0.6rem] tracking-[0.22em] uppercase text-[var(--ink-muted)] mb-2">Hours</div>
            <div className="display text-[1.8rem] tabular-nums leading-none">184</div>
          </div>
          <div className="p-5 border border-[var(--line)] bg-[var(--bg-raised)]">
            <div className="mono text-[0.6rem] tracking-[0.22em] uppercase text-[var(--ink-muted)] mb-2">Overtime</div>
            <div className="display text-[1.8rem] tabular-nums leading-none">12</div>
          </div>
          <div className="p-5 border border-[var(--line)] bg-[var(--bg-raised)]">
            <div className="mono text-[0.6rem] tracking-[0.22em] uppercase text-[var(--ink-muted)] mb-2">Gross</div>
            <div className="display text-[1.4rem] tabular-nums leading-none">{formatBDT(34_400)}</div>
          </div>
        </div>

        {/* Breakdown */}
        <Panel title={`${month} 2026 · breakdown`} num="01" className="mb-6">
          <ul className="divide-y divide-[var(--line)]">
            {BREAKDOWN.map(r => (
              <li key={r.label} className="flex items-center justify-between px-6 py-4">
                <span className="mono text-[0.78rem] tracking-[0.12em] uppercase text-[var(--ink-muted)]">{r.label}</span>
                <span className={`mono tabular-nums text-[0.95rem] ${r.amount < 0 ? 'text-[var(--critical)]' : 'text-[var(--ink)]'}`}>
                  {r.amount < 0 ? '−' : ''}{formatBDT(Math.abs(r.amount))}
                </span>
              </li>
            ))}
            <li className="flex items-center justify-between px-6 py-5 bg-[var(--bg-sunken)]">
              <span className="mono text-[0.78rem] tracking-[0.18em] uppercase text-[var(--accent)]">Net pay</span>
              <span className="display tabular-nums text-[1.6rem]">{formatBDT(net)}</span>
            </li>
          </ul>
          <div className="px-6 py-4 border-t border-[var(--line)] flex justify-end">
            <Btn variant="outline" className="h-12">
              <Download size={14} strokeWidth={1.5} />
              Download slip PDF
            </Btn>
          </div>
        </Panel>

        {/* YTD */}
        <Panel title="Year to date · gross pay" num="02">
          <div className="p-6">
            <MiniBars data={YTD} />
          </div>
        </Panel>
      </div>
    </div>
  );
}
