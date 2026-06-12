import { Eyebrow, Btn, Chips, Field } from '../../components/shared/ui';
import { type Visitor } from '../../../lib/mock';
import { useData } from '../../../lib/data';
import { useState, useMemo } from 'react';

type Bucket = 'TODAY · 18:00–23:00' | 'TOMORROW · 09:00–13:00' | 'LATER';

function bucketOf(v: Visitor): Bucket {
  if (v.when.toLowerCase().startsWith('today')) return 'TODAY · 18:00–23:00';
  if (v.when.toLowerCase().startsWith('tomorrow')) return 'TOMORROW · 09:00–13:00';
  return 'LATER';
}

const FILTERS = ['Today', 'Tomorrow', 'Later', 'All'];

export default function Expected() {
  const { visitors: VISITORS, checkinVisitor } = useData();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('All');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return VISITORS
      .filter(v => v.status === 'expected' || v.status === 'checked-in')
      .filter(v => {
        if (filter === 'All') return true;
        if (filter === 'Today') return v.when.toLowerCase().startsWith('today');
        if (filter === 'Tomorrow') return v.when.toLowerCase().startsWith('tomorrow');
        if (filter === 'Later') return !v.when.toLowerCase().startsWith('today') && !v.when.toLowerCase().startsWith('tomorrow');
        return true;
      })
      .filter(v => !ql || v.flat.toLowerCase().includes(ql) || v.name.toLowerCase().includes(ql));
  }, [q, filter]);

  const grouped = useMemo(() => {
    const g: Record<string, Visitor[]> = {};
    filtered.forEach(v => {
      const b = bucketOf(v);
      (g[b] ||= []).push(v);
    });
    return g;
  }, [filtered]);

  return (
    <div className="p-6 space-y-6">
      <Eyebrow num="01" label="Expected" />

      <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
        <div className="flex-1">
          <Field
            label="Search"
            placeholder="Search by flat or name…"
            value={q}
            onChange={e => setQ((e.target as HTMLInputElement).value)}
          />
        </div>
        <Chips items={FILTERS} active={filter} onChange={setFilter} />
      </div>

      <div className="space-y-8">
        {Object.keys(grouped).length === 0 && (
          <div className="py-16 text-center mono text-[0.78rem] tracking-[0.18em] uppercase text-[var(--ink-muted)]">
            No visitors match
          </div>
        )}

        {Object.entries(grouped).map(([bucket, list]) => (
          <section key={bucket}>
            <div className="flex items-center gap-3 mb-4">
              <span className="mono text-[0.72rem] tracking-[0.24em] uppercase text-[var(--accent)] whitespace-nowrap">
                {bucket}
              </span>
              <span className="flex-1 h-px bg-[var(--line)]" />
              <span className="mono text-[0.68rem] tracking-[0.18em] uppercase text-[var(--ink-muted)]">
                {list.length} visitor{list.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="divide-y divide-[var(--line)] border-y border-[var(--line)] bg-[var(--bg-raised)]">
              {list.map(v => {
                const done = checkedIds.has(v.id) || v.status === 'checked-in';
                return (
                  <div key={v.id} className="h-20 flex items-center gap-5 px-4">
                    <div className="display text-[2rem] tabular-nums w-20 leading-none text-[var(--accent)]">
                      {v.flat}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="display text-[1.2rem] truncate">{v.name}</div>
                      <div className="mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-muted)] mt-1">
                        {v.when} · Host {v.host}
                      </div>
                    </div>
                    <Btn
                      variant={done ? 'outline' : 'primary'}
                      className="!h-12 !px-6"
                      disabled={done}
                      onClick={async () => { await checkinVisitor(v); setCheckedIds(new Set([...checkedIds, v.id])); }}
                    >
                      {done ? 'Checked in' : 'Check in'}
                    </Btn>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
