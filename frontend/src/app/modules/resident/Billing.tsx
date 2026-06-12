import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Eyebrow, Panel, KPI, Chips, Drawer, StatusTag, EmptyState } from '../../components/shared/ui';
import { formatBDT, type Invoice } from '../../../lib/mock';
import { useAuth } from '../../../lib/auth';
import { useData } from '../../../lib/data';

const FILTERS = ['All', 'Pending', 'Overdue', 'Paid'];

export default function ResidentBilling() {
  const { invoices: INVOICES, payInvoice } = useData();
  const { session } = useAuth();
  const flat = session?.flat ?? '7C';
  const [filter, setFilter] = useState('All');
  const [open, setOpen] = useState<Invoice | null>(null);

  const myInvoices = useMemo(() => {
    const mine = INVOICES.filter(i => i.flat === flat);
    return mine.length ? mine : INVOICES.slice(0, 8);
  }, [INVOICES, flat]);

  const filtered = useMemo(() => {
    if (filter === 'All') return myInvoices;
    const map: Record<string, Invoice['status']> = { Pending: 'pending', Overdue: 'overdue', Paid: 'paid' };
    return myInvoices.filter(i => i.status === map[filter]);
  }, [myInvoices, filter]);

  const outstanding = myInvoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);
  const ytd = myInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const avg = Math.round(ytd / Math.max(1, myInvoices.filter(i => i.status === 'paid').length));

  return (
    <div className="p-5 lg:p-10 space-y-10 max-w-[1280px] mx-auto">
      <header>
        <Eyebrow num="01" label="Billing" />
        <h1 className="display text-[2.2rem] lg:text-[3rem] leading-[1.05]">
          The <span className="italic text-[var(--accent)]">Ledger</span>.
        </h1>
        <p className="mono text-[0.7rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] mt-3">
          Service charges · utilities · receipts
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-[var(--line)]">
        <KPI label="Outstanding" value={formatBDT(outstanding).replace('৳ ', '')} unit="৳" hint="Due 12 May 2026" />
        <KPI label="YTD paid" value={formatBDT(ytd).replace('৳ ', '')} unit="৳" hint="Jan – May 2026" />
        <KPI label="Average month" value={formatBDT(avg).replace('৳ ', '')} unit="৳" hint="Over 5 months" />
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <Eyebrow label="Invoice ledger" dense />
          <Chips items={FILTERS} active={filter} onChange={setFilter} />
        </div>
        <Panel>
          {filtered.length === 0 ? (
            <EmptyState title="Nothing to show" hint="Try a different filter" />
          ) : (
            <ul className="divide-y divide-[var(--line)]">
              {filtered.map((inv, i) => (
                <motion.li
                  key={inv.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setOpen(inv)}
                  className="px-6 py-4 grid grid-cols-12 items-center gap-3 cursor-pointer hover:bg-[var(--bg-sunken)]/40 transition-colors"
                >
                  <span className="col-span-3 mono text-[0.72rem] tracking-[0.14em] uppercase text-[var(--ink-muted)]">{inv.id}</span>
                  <span className="col-span-4 mono text-[0.78rem]">{inv.due}</span>
                  <span className="col-span-3 text-right display text-[1.05rem] tabular-nums">{formatBDT(inv.amount)}</span>
                  <span className="col-span-2 flex justify-end">
                    <StatusTag v={inv.status === 'paid' ? 'positive' : inv.status === 'overdue' ? 'overdue' : 'pending'}>{inv.status}</StatusTag>
                  </span>
                </motion.li>
              ))}
            </ul>
          )}
        </Panel>
        <div className="mt-3 flex flex-wrap gap-4">
          <a className="mono text-[0.7rem] tracking-[0.18em] uppercase text-[var(--accent)] hover:underline" href="#">Download all invoices · PDF →</a>
          <a className="mono text-[0.7rem] tracking-[0.18em] uppercase text-[var(--ink-muted)] hover:text-[var(--accent)]" href="#">Annual statement →</a>
        </div>
      </section>

      <section>
        <Eyebrow label="Payment methods" />
        <Panel>
          <ul className="divide-y divide-[var(--line)]">
            <li className="px-6 py-4 flex items-center justify-between">
              <div>
                <div className="display text-[1.05rem]">bKash · *** 4427</div>
                <div className="mono text-[0.66rem] tracking-[0.16em] uppercase text-[var(--ink-muted)] mt-1">Linked · primary</div>
              </div>
              <StatusTag v="positive">Active</StatusTag>
            </li>
            <li className="px-6 py-4 flex items-center justify-between">
              <div>
                <div className="display text-[1.05rem]">City Bank · A/C 1003 ****</div>
                <div className="mono text-[0.66rem] tracking-[0.16em] uppercase text-[var(--ink-muted)] mt-1">Bank transfer · backup</div>
              </div>
              <StatusTag v="info">Verified</StatusTag>
            </li>
          </ul>
        </Panel>
      </section>

      <Drawer open={!!open} onClose={() => setOpen(null)} title={open ? `Invoice · ${open.id}` : ''} width={520}>
        {open && (
          <div className="space-y-8">
            <div>
              <div className="eyebrow mb-2">Total due</div>
              <div className="display text-[2.4rem] tabular-nums">{formatBDT(open.amount)}</div>
              <div className="mono text-[0.7rem] tracking-[0.16em] uppercase text-[var(--ink-muted)] mt-1">Due {open.due}</div>
              <div className="mt-3"><StatusTag v={open.status === 'paid' ? 'positive' : open.status === 'overdue' ? 'overdue' : 'pending'}>{open.status}</StatusTag></div>
            </div>

            <div>
              <div className="eyebrow mb-3">Line items</div>
              <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {open.items.map(it => (
                  <li key={it.label} className="py-3 flex items-center justify-between">
                    <span className="text-[0.92rem]">{it.label}</span>
                    <span className="mono tabular-nums text-[0.85rem]">{formatBDT(it.amount)}</span>
                  </li>
                ))}
                <li className="py-3 flex items-center justify-between">
                  <span className="mono text-[0.7rem] tracking-[0.18em] uppercase">Total</span>
                  <span className="display tabular-nums text-[1.2rem]">{formatBDT(open.amount)}</span>
                </li>
              </ul>
            </div>

            <button
              className="w-full h-12 mono uppercase tracking-[0.2em] text-[0.72rem] bg-[var(--accent)] text-[var(--bg-raised)]"
              onClick={async () => { await payInvoice(open); setOpen(null); }}
            >
              Pay via bKash
            </button>

            <div>
              <div className="eyebrow mb-3">Recent payments</div>
              <ul className="divide-y divide-[var(--line)] border-t border-[var(--line)]">
                {[
                  { d: '12 Apr 2026', a: 18_400, m: 'bKash' },
                  { d: '12 Mar 2026', a: 18_400, m: 'bKash' },
                  { d: '14 Feb 2026', a: 19_120, m: 'Bank transfer' },
                ].map(p => (
                  <li key={p.d} className="py-3 grid grid-cols-3 mono text-[0.78rem]">
                    <span className="tabular-nums">{p.d}</span>
                    <span className="text-[var(--ink-muted)]">{p.m}</span>
                    <span className="text-right tabular-nums">{formatBDT(p.a)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
