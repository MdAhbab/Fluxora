import { useState } from 'react';
import { motion } from 'motion/react';
import { Download } from 'lucide-react';
import { Eyebrow, Panel, KPI, Btn, HoldButton, Drawer, Chips, MiniBars } from '../../components/shared/ui';
import { type Expense, formatBDT } from '../../../lib/mock';
import { useData } from '../../../lib/data';

const PULSE_MONTHS = ['May', 'Apr', 'Mar', 'Feb'];

const CATEGORY_BARS = [
  { label: 'GEN', value: 84 },
  { label: 'UTIL', value: 124 },
  { label: 'LIFT', value: 56 },
  { label: 'CLEAN', value: 38 },
  { label: 'WATER', value: 22 },
  { label: 'SEC', value: 44 },
  { label: 'STAFF', value: 96 },
  { label: 'MAINT', value: 31 },
  { label: 'PEST', value: 8 },
  { label: 'GARDEN', value: 12 },
  { label: 'MISC', value: 19 },
  { label: 'AMC', value: 41 },
];

const COLLECTION = [
  { m: 'Feb 2026', pct: 96 },
  { m: 'Mar 2026', pct: 94 },
  { m: 'Apr 2026', pct: 98 },
  { m: 'May 2026', pct: 91 },
];

export default function CommitteeFinance() {
  const { expenses: EXPENSES } = useData();
  const [month, setMonth] = useState('May');
  const [selected, setSelected] = useState<Expense | null>(null);

  const mtd = EXPENSES.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="p-6 lg:p-10 space-y-12">
      <header>
        <Eyebrow num="02" label="Finance" />
        <h1 className="display text-[2.8rem] lg:text-[3.4rem] leading-[1.05]">
          The <span className="italic text-[var(--accent)]">ledger</span>, examined
        </h1>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--line)]">
        <KPI label="Cleared this month" value="৳ 1.84 M" hint="42 of 84 invoices" />
        <KPI label="Outstanding" value="৳ 562 K" hint="14 flats with balance" />
        <KPI label="Expenses (MTD)" value={formatBDT(mtd)} unit="BDT" hint="5 line items" />
      </section>

      {/* PULSE — editorial */}
      <section className="border border-[var(--line)] bg-[var(--bg-raised)]">
        <header className="px-8 lg:px-12 pt-10 pb-6 border-b border-[var(--line)] flex flex-wrap items-baseline justify-between gap-6">
          <div>
            <div className="mono text-[0.66rem] tracking-[0.22em] uppercase text-[var(--accent)] mb-3">Flux Pulse · Vol. 5 · No. 5</div>
            <h2 className="display text-[2.6rem] lg:text-[3.6rem] leading-[1.02]">
              May 2026 — <span className="italic text-[var(--accent)]">the diesel month</span>
            </h2>
            <p className="mono text-[0.7rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mt-3">By Flux Pulse · 11 June 2026</p>
          </div>
          <Chips items={PULSE_MONTHS} active={month} onChange={setMonth} />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-8 lg:px-12 py-10">
          <div className="lg:col-span-7 space-y-6 text-[0.98rem] leading-[1.75] text-[var(--ink)]">
            <p className="first-letter:display first-letter:text-[3.4rem] first-letter:float-left first-letter:leading-[0.85] first-letter:mr-2 first-letter:mt-1 first-letter:text-[var(--accent)]">
              May was steady, then it was not. A pair of unscheduled power dips on the night of the 6th pushed the generator
              into eight extra runtime hours, and the diesel line — ordinarily a quiet third of the energy budget — became the
              month's headline. Service collection held above ninety percent through the second week and softened on the
              twelfth, an unremarkable tail of late-paying flats now familiar enough to predict.
            </p>
            <p>
              Lift B's annual service landed on the 14th without incident. Vendor cost came in 6% under the prior cycle,
              owed to a renegotiated AMC the committee approved in March. Cleaning held flat. Water treatment ticked up,
              tracking the building's gradually warmer rooftop tanks.
            </p>
            <p>
              The committee's standing question — when to revisit service-charge bands — remains open. Three months of
              4–7% diesel inflation suggest the answer should arrive before the monsoon.
            </p>
          </div>

          <aside className="lg:col-span-5 space-y-8">
            <blockquote className="pl-6 border-l border-[var(--accent)]">
              <p className="display italic text-[1.6rem] leading-[1.25] text-[var(--ink)]">
                "Diesel quietly became the headline."
              </p>
              <footer className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mt-3">On energy</footer>
            </blockquote>
            <blockquote className="pl-6 border-l border-[var(--accent)]">
              <p className="display italic text-[1.6rem] leading-[1.25] text-[var(--ink)]">
                "Collection above ninety, but the tail is familiar."
              </p>
              <footer className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mt-3">On collections</footer>
            </blockquote>
          </aside>
        </div>

        <div className="px-8 lg:px-12 pb-10">
          <div className="mono text-[0.66rem] tracking-[0.2em] uppercase text-[var(--ink-muted)] mb-4">Category spend · BDT thousands</div>
          <MiniBars data={CATEGORY_BARS} />
        </div>

        <footer className="px-8 lg:px-12 py-6 border-t border-[var(--line)] flex items-center justify-between">
          <span className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)]">— end of report —</span>
          <Btn variant="outline"><Download size={14} strokeWidth={1.5} /> Download PDF</Btn>
        </footer>
      </section>

      {/* SCRUTINY */}
      <section>
        <Eyebrow num="·" label="Expense scrutiny" />
        <Panel num="·" title="May 2026 ledger">
          <ul className="divide-y divide-[var(--line)]">
            {EXPENSES.map((e, i) => (
              <motion.li
                key={e.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                onClick={() => setSelected(e)}
                className="px-6 py-4 grid grid-cols-[80px,80px,1fr,1fr,auto] gap-4 items-baseline cursor-pointer hover:bg-[var(--bg-sunken)] transition-colors"
              >
                <span className="mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">{e.id}</span>
                <span className="mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">{e.date}</span>
                <span className="text-[0.92rem] text-[var(--ink)]">{e.vendor}</span>
                <span className="mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">{e.category}</span>
                <span className="mono text-[0.88rem] tabular-nums text-[var(--ink)]">{formatBDT(e.amount)}</span>
              </motion.li>
            ))}
          </ul>
        </Panel>
      </section>

      {/* COLLECTION */}
      <section>
        <Eyebrow num="·" label="Collection summary · last 4 months" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--line)]">
          {COLLECTION.map(c => (
            <div key={c.m} className="bg-[var(--bg-raised)] p-6">
              <div className="mono text-[0.62rem] tracking-[0.2em] uppercase text-[var(--ink-muted)] mb-3">{c.m}</div>
              <div className="display text-[2.4rem] tabular-nums leading-none">
                {c.pct}<span className="mono text-[0.9rem] text-[var(--ink-muted)] ml-1">%</span>
              </div>
              <div className="mt-4 h-1 bg-[var(--bg-sunken)] relative">
                <div className="absolute inset-y-0 left-0 bg-[var(--accent)]" style={{ width: `${c.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected ? `Expense ${selected.id}` : ''}>
        {selected && (
          <div className="space-y-6">
            <div className="border border-[var(--line)] bg-[var(--bg-sunken)] p-6 space-y-4">
              <div className="text-center pb-4 border-b border-dashed border-[var(--line)]">
                <div className="mono text-[0.66rem] tracking-[0.3em] uppercase text-[var(--ink-muted)]">RECEIPT</div>
                <div className="display text-[1.4rem] mt-2">{selected.vendor}</div>
                <div className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mt-1">Invoice {selected.id} · {selected.date} 2026</div>
              </div>
              {[
                { k: 'Category', v: selected.category },
                { k: 'Vendor TIN', v: 'BD-3289-1147' },
                { k: 'Subtotal', v: formatBDT(Math.round(selected.amount / 1.05)) },
                { k: 'VAT (5%)', v: formatBDT(selected.amount - Math.round(selected.amount / 1.05)) },
              ].map(row => (
                <div key={row.k} className="flex justify-between mono text-[0.72rem] uppercase tracking-[0.16em]">
                  <span className="text-[var(--ink-muted)]">{row.k}</span>
                  <span className="text-[var(--ink)]">{row.v}</span>
                </div>
              ))}
              <div className="flex justify-between pt-4 border-t border-dashed border-[var(--line)]">
                <span className="mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">Total</span>
                <span className="display text-[1.4rem] tabular-nums">{formatBDT(selected.amount)}</span>
              </div>
              <div className="text-center pt-3 mono text-[0.6rem] tracking-[0.24em] uppercase text-[var(--ink-muted)]">
                · authorised by admin office ·
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--line)]">
              <Btn variant="primary" onClick={() => setSelected(null)}>Approve</Btn>
              <HoldButton variant="critical" label="Hold to reject" duration={1200} onConfirm={() => setSelected(null)} />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
