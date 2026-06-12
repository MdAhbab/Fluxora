// Agent tools — every read tool the agents in AGENTS.md are allowed to call,
// implemented as pure functions over the live useData() snapshot. They are the
// only way agents touch data, so tenancy is automatic: the snapshot is already
// scoped to the caller's building and role.

import type { Invoice, Ticket, Notice, StaffMember, Booking, Unit, Expense } from '../mock';

// The slice of useData() the agents read. Loosely typed where the source is
// already JSON passthrough.
export type AgentData = {
  building: { id: string; name: string; address: string } | null;
  metrics: Record<string, number>;
  invoices: Invoice[];
  tickets: Ticket[];
  notices: Notice[];
  staff: StaffMember[];
  bookings: Booking[];
  units: Unit[];
  expenses: Expense[];
  resources: any[];
  wasteSchedules: any[];
  emergencyContacts: any[];
};

const num = (n: number) => '৳ ' + Math.round(n).toLocaleString('en-IN');

// ── Concierge read tools ───────────────────────────────────────────────
export function get_my_invoices(d: AgentData, status?: Invoice['status']) {
  const rows = status ? d.invoices.filter(i => i.status === status) : d.invoices;
  const outstanding = d.invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);
  return { rows, outstanding, count: rows.length };
}

export function search_notices(d: AgentData, query: string, limit = 3) {
  const q = query.trim().toLowerCase();
  const hits = !q ? d.notices : d.notices.filter(n =>
    n.title.toLowerCase().includes(q) || n.bodyEn.toLowerCase().includes(q));
  return hits.slice(0, limit);
}

export function get_waste_schedule(d: AgentData) {
  // Backend waste rows are JSON passthrough; fall back to a sensible default.
  const rows = d.wasteSchedules || [];
  if (rows.length) return rows;
  return [{ day: 'Tuesday', time: '07:00', note: 'General + recyclables' }, { day: 'Friday', time: '07:00', note: 'General waste' }];
}

export function check_facility_availability(d: AgentData, facility: string, _date?: string) {
  const taken = d.bookings.filter(b => b.facility.toLowerCase().includes(facility.toLowerCase()) && b.status !== 'rejected');
  return { facility, taken, anyFree: taken.length < 8 };
}

export function get_building_kpis(d: AgentData) {
  const m = d.metrics || {};
  return {
    outstanding: m.outstanding ?? 0,
    collectionRate: m.collection_rate ?? 0,
    openTickets: m.open_tickets ?? d.tickets.filter(t => t.status !== 'resolved').length,
    occupancy: m.occupancy_rate ?? 0,
  };
}

// ── Triage read tools ──────────────────────────────────────────────────
export function get_staff_roster(d: AgentData) {
  return d.staff.map(s => ({
    ...s,
    load: d.tickets.filter(t => t.assigned && s.name.startsWith(t.assigned) && t.status !== 'resolved').length,
  }));
}

export function get_unit_history(d: AgentData, flat: string, limit = 5) {
  return d.tickets.filter(t => t.flat === flat).slice(0, limit);
}

// ── Pulse aggregation tools ────────────────────────────────────────────
export function aggregate_finance(d: AgentData) {
  const paid = d.invoices.filter(i => i.status === 'paid');
  const outstanding = d.invoices.filter(i => i.status !== 'paid');
  return {
    collected: paid.reduce((s, i) => s + i.amount, 0),
    outstanding: outstanding.reduce((s, i) => s + i.amount, 0),
    overdueCount: d.invoices.filter(i => i.status === 'overdue').length,
    collectionRate: d.invoices.length ? Math.round((paid.length / d.invoices.length) * 100) : 0,
  };
}

export function aggregate_expenses(d: AgentData) {
  const byCat: Record<string, number> = {};
  for (const e of d.expenses) byCat[e.category] = (byCat[e.category] ?? 0) + e.amount;
  const total = d.expenses.reduce((s, e) => s + e.amount, 0);
  const sorted = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  return { byCat, total, top: sorted[0], sorted };
}

export function aggregate_tickets(d: AgentData) {
  const byCat: Record<string, number> = {};
  for (const t of d.tickets) byCat[t.category] = (byCat[t.category] ?? 0) + 1;
  return {
    total: d.tickets.length,
    open: d.tickets.filter(t => t.status !== 'resolved').length,
    byCat,
    hotspot: Object.entries(byCat).sort((a, b) => b[1] - a[1])[0],
  };
}

// z-score outlier detection — the model must explain these, never invent them.
export function detect_anomalies(series: { label: string; value: number }[]) {
  if (series.length < 2) return [];
  const vals = series.map(s => s.value);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const sd = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length) || 1;
  return series
    .map(s => ({ ...s, z: (s.value - mean) / sd, pctOfMean: Math.round(((s.value - mean) / mean) * 100) }))
    .filter(s => s.z >= 1)
    .sort((a, b) => b.z - a.z);
}

export const fmtBDT = num;
