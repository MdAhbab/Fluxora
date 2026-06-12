import { useState } from 'react';
import { motion } from 'motion/react';
import { Eyebrow, Panel, KPI, StatusDot, Btn, Drawer, Chips, MiniBars, Field } from '../../components/shared/ui';
import { formatBDT, type Invoice } from '../../../lib/mock';
import { useData } from '../../../lib/data';
import { Paperclip, Download } from 'lucide-react';

const TABS = ['Invoices', 'Expenses', 'Pulse'];
const INV_FILTERS = ['All', 'Pending', 'Overdue', 'Paid'];

export default function AdminFinance() {
  const { invoices: INVOICES, expenses: EXPENSES, payInvoice, addExpense } = useData();
  const [tab, setTab] = useState('Invoices');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [method, setMethod] = useState('bKash');
  const [expDate, setExpDate] = useState('');
  const [expVendor, setExpVendor] = useState('');
  const [expCategory, setExpCategory] = useState('');
  const [expAmount, setExpAmount] = useState('');

  const outstanding = INVOICES.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);
  const cleared = INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const rate = INVOICES.length ? Math.round((INVOICES.filter(i => i.status === 'paid').length / INVOICES.length) * 100) : 0;

  const filteredInv = INVOICES.filter(i =>
    filter === 'All' ? true : i.status === filter.toLowerCase()
  );

  const expenseByCat = Object.entries(
    EXPENSES.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    }, {}),
  ).map(([label, value]) => ({ label: label.slice(0, 3), value }));

  return (
    <div className="space-y-12">
      <header>
        <Eyebrow num="00" label="Ledger" />
        <h1 className="display text-[3rem] leading-[1.05] tracking-tight">
          The <span className="italic text-[var(--accent)]">finances</span>.
        </h1>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[var(--line)]">
        <KPI label="Outstanding" value={(outstanding / 1000).toFixed(0) + 'K'} unit="৳" hint="3 invoices unpaid" />
        <KPI label="Cleared this month" value={(cleared / 1_000_000).toFixed(2) + 'M'} unit="৳" hint="21 settled" />
        <KPI label="Collection rate" value={String(rate)} unit="%" hint="+2pp vs April" />
      </section>

      <Chips items={TABS} active={tab} onChange={setTab} />

      {tab === 'Invoices' && (
        <section className="space-y-6">
          <Chips items={INV_FILTERS} active={filter} onChange={setFilter} />
          <Panel title="Ledger" num="01" action={<span className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">{filteredInv.length} rows</span>}>
            <div className="hidden md:grid grid-cols-12 px-6 py-3 mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] border-b border-[var(--line)]">
              <div className="col-span-2">Invoice</div>
              <div className="col-span-1">Flat</div>
              <div className="col-span-3">Resident</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-2">Due</div>
              <div className="col-span-2">Status</div>
            </div>
            <ul className="divide-y divide-[var(--line)]">
              {filteredInv.map((inv, i) => (
                <motion.li
                  key={inv.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.02 }}
                  onClick={() => setSelected(inv)}
                  className="grid grid-cols-2 md:grid-cols-12 gap-2 px-6 py-4 hover:bg-[var(--bg-sunken)] cursor-pointer transition-colors"
                >
                  <div className="md:col-span-2 mono text-[0.78rem]">{inv.id}</div>
                  <div className="md:col-span-1 mono text-[0.78rem]">{inv.flat}</div>
                  <div className="md:col-span-3 text-[0.92rem] truncate">{inv.resident}</div>
                  <div className="md:col-span-2 mono tabular-nums text-right text-[0.86rem]">{formatBDT(inv.amount)}</div>
                  <div className="md:col-span-2 mono text-[0.78rem] text-[var(--ink-muted)]">{inv.due}</div>
                  <div className="md:col-span-2 flex items-center gap-2">
                    <StatusDot v={inv.status === 'paid' ? 'positive' : inv.status === 'pending' ? 'pending' : 'overdue'} pulse={inv.status === 'overdue'} />
                    <span className="mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">{inv.status}</span>
                  </div>
                </motion.li>
              ))}
            </ul>
          </Panel>
        </section>
      )}

      {tab === 'Expenses' && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Panel title="Record expense" num="02">
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Date" type="date" value={expDate} onChange={e => setExpDate(e.target.value)} />
                <Field label="Vendor" placeholder="Padma Diesel" value={expVendor} onChange={e => setExpVendor(e.target.value)} />
                <Field label="Category" placeholder="Generator" value={expCategory} onChange={e => setExpCategory(e.target.value)} />
                <Field label="Amount (BDT)" type="number" placeholder="84000" value={expAmount} onChange={e => setExpAmount(e.target.value)} />
                <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                  <Btn variant="outline"><Paperclip size={12} strokeWidth={1.5} /> Attach receipt</Btn>
                  <Btn variant="primary" onClick={async () => {
                    if (!expCategory || !expAmount || !expDate) return;
                    await addExpense({ category: expCategory, amount: Number(expAmount), description: expVendor, date: expDate });
                    setExpDate(''); setExpVendor(''); setExpCategory(''); setExpAmount('');
                  }}>Save</Btn>
                </div>
              </div>
            </Panel>

            <Panel title="Recent" num="03">
              <ul className="divide-y divide-[var(--line)]">
                {EXPENSES.map((e, i) => (
                  <motion.li
                    key={e.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="grid grid-cols-12 gap-2 px-6 py-4"
                  >
                    <div className="col-span-2 mono text-[0.78rem] text-[var(--ink-muted)]">{e.date}</div>
                    <div className="col-span-4 text-[0.92rem]">{e.vendor}</div>
                    <div className="col-span-3 mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--ink-muted)]">{e.category}</div>
                    <div className="col-span-3 mono tabular-nums text-right">{formatBDT(e.amount)}</div>
                  </motion.li>
                ))}
              </ul>
            </Panel>
          </div>

          <Panel title="By category" num="04">
            <div className="p-6">
              <MiniBars data={expenseByCat} />
              <div className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] mt-6">
                Total · {formatBDT(EXPENSES.reduce((s, e) => s + e.amount, 0))}
              </div>
            </div>
          </Panel>
        </section>
      )}

      {tab === 'Pulse' && (
        <article className="max-w-3xl mx-auto bg-[var(--bg-raised)] border border-[var(--line)] p-10 md:p-16 relative">
          <div className="mono text-[0.66rem] uppercase tracking-[0.22em] text-[var(--accent)]">Flux Pulse · Issue 05</div>
          <h2 className="display text-[3.4rem] leading-[1.02] tracking-tight mt-4">
            May 2026 · The <span className="italic text-[var(--accent)]">diesel</span> month.
          </h2>
          <p className="mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] mt-4">
            By Flux Pulse · printed on demand
          </p>

          <div className="h-px bg-[var(--line)] my-10" />

          <p className="text-[1.05rem] leading-[1.7] text-[var(--ink)]">
            Collection rate held above 87% for the fourth consecutive month, but the headline this period is generator
            diesel — load-shedding ran 38% longer than April, pushing fuel to <span className="mono">৳ 84,000</span>, a
            22% jump. The committee's 4% service-charge revision, effective June, was approved in time.
          </p>

          <blockquote className="my-10 border-y border-[var(--line)] py-8">
            <p className="display italic text-[2rem] leading-[1.2] text-[var(--accent)]">
              "Diesel is no longer a line item. It is the line item."
            </p>
          </blockquote>

          <p className="text-[1.05rem] leading-[1.7]">
            Lift B service is overdue and water-treatment contracts renew in July. We project surplus at month-end of
            <span className="mono"> ৳ 412,000</span> — comfortable, but narrower than the trailing average.
          </p>

          <div className="my-10">
            <div className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] mb-4">
              Spend by category · May
            </div>
            <MiniBars data={expenseByCat} />
          </div>

          <blockquote className="my-10 border-y border-[var(--line)] py-8">
            <p className="display italic text-[2rem] leading-[1.2] text-[var(--accent)]">
              "Three flats remain overdue. Two have spoken with the office. One has not."
            </p>
          </blockquote>

          <div className="flex items-center justify-between pt-8 border-t border-[var(--line)]">
            <span className="mono text-[0.66rem] uppercase tracking-[0.22em] text-[var(--ink-muted)]">
              Continues on page 02 →
            </span>
            <Btn variant="outline"><Download size={12} strokeWidth={1.5} /> Download PDF</Btn>
          </div>
        </article>
      )}

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.id ?? ''}>
        {selected && (
          <div className="space-y-8">
            <div>
              <div className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">Flat · Resident</div>
              <div className="display text-[1.6rem] mt-1">{selected.flat} · <span className="italic text-[var(--accent)]">{selected.resident}</span></div>
            </div>

            <div>
              <div className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] mb-3">Line items</div>
              <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {selected.items.map(it => (
                  <li key={it.label} className="flex justify-between py-3">
                    <span className="text-[0.92rem]">{it.label}</span>
                    <span className="mono tabular-nums">{formatBDT(it.amount)}</span>
                  </li>
                ))}
                <li className="flex justify-between py-3">
                  <span className="mono uppercase tracking-[0.16em] text-[0.72rem] text-[var(--ink-muted)]">Total</span>
                  <span className="display text-[1.2rem] tabular-nums">{formatBDT(selected.amount)}</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] mb-3">Payment history</div>
              <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {[
                  { d: '12 Apr 2026', m: 'bKash', a: 18400 },
                  { d: '14 Mar 2026', m: 'Bank', a: 18400 },
                  { d: '11 Feb 2026', m: 'Cash', a: 18000 },
                ].map(p => (
                  <li key={p.d} className="grid grid-cols-3 py-3 mono text-[0.78rem]">
                    <span className="text-[var(--ink-muted)]">{p.d}</span>
                    <span>{p.m}</span>
                    <span className="text-right tabular-nums">{formatBDT(p.a)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">Record payment</div>
              <Field label="Amount" type="number" defaultValue={selected.amount} />
              <div>
                <div className="mono text-[0.66rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mb-2">Method</div>
                <Chips items={['bKash', 'Cash', 'Bank']} active={method} onChange={setMethod} />
              </div>
              <Btn variant="primary" className="w-full" onClick={async () => { await payInvoice(selected, method); setSelected(null); }}>Mark settled</Btn>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
