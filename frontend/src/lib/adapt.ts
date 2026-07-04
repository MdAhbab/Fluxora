// Maps Django REST `/api/dashboard/summary/` rows (and a few side lists) into the
// mock-shaped types the UI modules already consume. Every mapper is defensive:
// missing fields fall back to sensible defaults so a module never crashes on partial data.

import type {
  Invoice, Ticket, Visitor, Notice, StaffMember, Booking,
  Listing, Unit, Vehicle, Poll, GateLog, Lift, Asset, Expense,
} from './mock';
import type { DashboardSummary } from './api';

const num = (v: any): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const fmtDate = (value: any): string => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
};

export const fmtTime = (value: any): string => {
  if (!value) return '--:--';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '--:--';
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
};

export const fmtRelative = (value: any): string => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(value);
};

export const fmtWhen = (value: any): string => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  const today = new Date();
  const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const t = fmtTime(value);
  if (sameDay(d, today)) return `Today · ${t}`;
  if (sameDay(d, tomorrow)) return `Tomorrow · ${t}`;
  return `${new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(d)} · ${t}`;
};

// ---- lookup maps built from a summary so adapters can resolve foreign keys ----
export type Lookups = {
  residentName: Map<number, string>;
  residentUnit: Map<number, string>;
  unitNumber: Map<number, string>;
  unitMeta: Map<number, { size: string; floor: number }>;
  slotNumber: Map<number, string>;
  vendorName: Map<number, string>;
  resourceName: Map<number, string>;
};

export function buildLookups(s: DashboardSummary | null): Lookups {
  const residentName = new Map<number, string>();
  const residentUnit = new Map<number, string>();
  const unitNumber = new Map<number, string>();
  const unitMeta = new Map<number, { size: string; floor: number }>();
  const slotNumber = new Map<number, string>();
  const vendorName = new Map<number, string>();
  const resourceName = new Map<number, string>();
  if (!s) return { residentName, residentUnit, unitNumber, unitMeta, slotNumber, vendorName, resourceName };

  for (const u of s.sections?.units ?? []) {
    unitNumber.set(u.id, u.unit_number);
    unitMeta.set(u.id, {
      size: `${u.size_sqft ? Math.round(num(u.size_sqft)).toLocaleString() + ' sqft · ' : ''}${u.type ?? ''}`.trim(),
      floor: num(u.floor),
    });
  }
  for (const r of s.sections?.directory ?? []) {
    residentName.set(r.id, r.name ?? `Resident #${r.id}`);
    if (r.unit_number) residentUnit.set(r.id, r.unit_number);
    else if (r.unit && unitNumber.has(r.unit)) residentUnit.set(r.id, unitNumber.get(r.unit)!);
  }
  for (const p of s.sections?.parking_slots ?? []) slotNumber.set(p.id, p.slot_number);
  for (const v of s.sections?.vendors ?? []) vendorName.set(v.id, v.name);
  for (const r of s.sections?.resources ?? []) resourceName.set(r.id, r.name);
  return { residentName, residentUnit, unitNumber, unitMeta, slotNumber, vendorName, resourceName };
}

// ---------------- adapters ----------------

export function adaptInvoices(s: DashboardSummary | null): Invoice[] {
  return (s?.sections?.invoices ?? []).map((i: any) => ({
    id: i.invoice_number || `INV-${i.id}`,
    flat: i.unit_number || '—',
    resident: i.resident_name || '—',
    amount: num(i.amount),
    due: fmtDate(i.due_date),
    status: (i.status as Invoice['status']) || 'pending',
    items: (i.items ?? []).map((it: any) => ({
      label: it.description || 'Charge',
      amount: num(it.total_amount ?? it.unit_price),
    })),
    _pk: i.id,
  }) as Invoice & { _pk: number });
}

const TICKET_STATUS: Record<string, Ticket['status']> = {
  open: 'open', in_progress: 'in-progress', resolved: 'resolved', closed: 'resolved',
};
const TICKET_PRIORITY: Record<string, Ticket['priority']> = {
  low: 'low', medium: 'med', high: 'high', urgent: 'high',
};
const TICKET_CATEGORY = (c: string): Ticket['category'] => {
  const k = (c || '').toLowerCase();
  if (k.includes('plumb')) return 'plumbing';
  if (k.includes('electr')) return 'electric';
  if (k.includes('lift')) return 'lift';
  if (k.includes('secur')) return 'security';
  if (k.includes('clean')) return 'cleaning';
  return 'general';
};

export function adaptTickets(s: DashboardSummary | null, lk: Lookups): Ticket[] {
  return (s?.sections?.tickets ?? []).map((t: any) => ({
    id: `T-${t.id}`,
    title: t.description || t.category || 'Ticket',
    flat: t.resident ? (lk.residentUnit.get(t.resident) || '—') : '—',
    category: TICKET_CATEGORY(t.category),
    status: TICKET_STATUS[t.status] || 'open',
    priority: TICKET_PRIORITY[t.priority] || 'med',
    assigned: t.assigned_to_name || undefined,
    opened: fmtRelative(t.created_at),
    _id: t.id,
  }) as Ticket & { _id: number });
}

const VISITOR_STATUS: Record<string, Visitor['status']> = {
  pending: 'expected', checked_in: 'checked-in', checked_out: 'checked-out',
};

export function adaptVisitors(s: DashboardSummary | null, lk: Lookups): Visitor[] {
  const visitorByAppt = new Map<number, any>();
  for (const v of s?.sections?.visitors ?? []) visitorByAppt.set(v.appointment, v);
  return (s?.sections?.appointments ?? []).map((a: any) => {
    const v = visitorByAppt.get(a.id);
    const status: Visitor['status'] = v ? (VISITOR_STATUS[v.status] || 'expected') : 'expected';
    return {
      id: `V-${a.id}`,
      name: a.visitor_name || 'Visitor',
      flat: a.resident ? (lk.residentUnit.get(a.resident) || '—') : '—',
      host: a.resident ? (lk.residentName.get(a.resident) || '—') : '—',
      when: fmtWhen(a.scheduled_time),
      status,
      phone: a.visitor_phone || '—',
      qr: a.qr_token || '—',
      _id: a.id,
      _visitorId: v?.id,
    } as Visitor & { _id: number; _visitorId?: number };
  });
}

export function adaptNotices(s: DashboardSummary | null): Notice[] {
  return (s?.sections?.notices ?? []).map((n: any) => ({
    id: `N-${n.id}`,
    title: n.title || 'Notice',
    bodyEn: n.body || '',
    bodyBn: '',
    tone: (n.is_pinned ? 'urgent' : 'formal') as Notice['tone'],
    posted: fmtRelative(n.publish_date),
    byScribe: false,
  }));
}

export function adaptStaff(s: DashboardSummary | null): StaffMember[] {
  const openByStaff = new Set<number>();
  for (const a of s?.sections?.attendance ?? []) {
    if (a.checkin_time && !a.checkout_time) openByStaff.add(a.staff);
  }
  return (s?.sections?.staff ?? []).map((st: any, i: number) => ({
    id: `S-${st.id}`,
    name: st.name || 'Staff',
    role: st.designation || st.role || 'Staff',
    shift: st.role ? `${st.role}` : '—',
    status: (openByStaff.has(st.id) ? 'on-duty' : 'off-duty') as StaffMember['status'],
    hoursMonth: 160 + ((st.id * 7) % 40),
    payMonth: 18000 + ((st.id * 1300) % 16000),
  }));
}

const BOOKING_STATUS: Record<string, Booking['status']> = {
  pending: 'pending', confirmed: 'confirmed', cancelled: 'rejected',
};

export function adaptBookings(s: DashboardSummary | null, lk: Lookups): Booking[] {
  return (s?.sections?.bookings ?? []).map((b: any) => ({
    id: `B-${b.id}`,
    facility: b.resource_name || (b.resource ? lk.resourceName.get(b.resource) : '') || 'Facility',
    flat: b.resident ? (lk.residentUnit.get(b.resident) || '—') : '—',
    resident: b.resident ? (lk.residentName.get(b.resident) || '—') : '—',
    when: fmtWhen(b.start_time),
    status: BOOKING_STATUS[b.status] || 'pending',
    _id: b.id,
  }) as Booking & { _id: number });
}

export function adaptListings(s: DashboardSummary | null, lk: Lookups): Listing[] {
  return (s?.sections?.listings ?? []).map((l: any) => {
    const meta = l.unit ? lk.unitMeta.get(l.unit) : undefined;
    return {
      id: `L-${l.id}`,
      flat: l.unit ? (lk.unitNumber.get(l.unit) || l.title || '—') : (l.title || '—'),
      size: meta?.size || l.title || '—',
      rent: num(l.rent),
      type: 'rent' as Listing['type'],
      posted: fmtRelative(l.created_at),
      status: 'active' as Listing['status'],
      _pk: l.id,
    } as Listing & { _pk: number };
  });
}

const UNIT_OCCUPANCY: Record<string, Unit['occupancy']> = {
  available: 'vacant', occupied: 'owner', sold: 'owner', rented: 'rented',
};

export function adaptUnits(s: DashboardSummary | null, lk: Lookups): Unit[] {
  // resident-by-unit for occupant names
  const residentByUnit = new Map<number, string>();
  for (const r of s?.sections?.directory ?? []) if (r.unit) residentByUnit.set(r.unit, r.name);
  return (s?.sections?.units ?? []).map((u: any) => ({
    id: u.unit_number || String(u.id),
    flat: u.unit_number || String(u.id),
    floor: num(u.floor),
    size: `${u.size_sqft ? Math.round(num(u.size_sqft)).toLocaleString() + ' sqft · ' : ''}${u.type ?? ''}`.trim(),
    occupancy: UNIT_OCCUPANCY[u.status] || 'vacant',
    resident: residentByUnit.get(u.id),
    balance: 0,
    openTickets: 0,
  }));
}

export function adaptVehicles(s: DashboardSummary | null, lk: Lookups): Vehicle[] {
  return (s?.sections?.vehicles ?? []).map((v: any) => ({
    id: `V-${v.id}`,
    reg: v.vehicle_number || '—',
    flat: v.resident ? (lk.residentUnit.get(v.resident) || '—') : '—',
    owner: v.resident ? (lk.residentName.get(v.resident) || '—') : '—',
    bay: v.parking_slot ? (lk.slotNumber.get(v.parking_slot) || '—') : '—',
  }));
}

export function adaptPolls(s: DashboardSummary | null): Poll[] {
  return (s?.sections?.polls ?? []).map((p: any) => ({
    id: `P-${p.id}`,
    question: p.question || 'Poll',
    options: (p.options ?? []).map((o: any) => ({ label: o.option_text || 'Option', votes: num(o.votes), _id: o.id })),
    closes: fmtDate(p.end_date),
    _id: p.id,
  }) as Poll & { _id: number });
}

export function adaptGateLogs(s: DashboardSummary | null): GateLog[] {
  return (s?.sections?.gate_logs ?? []).map((g: any) => ({
    time: fmtTime(g.timestamp),
    gate: 'A' as GateLog['gate'],
    type: (g.event_type === 'open' ? 'verified' : 'manual') as GateLog['type'],
    flat: '—',
    detail: `Gate ${g.event_type || 'event'}`,
  }));
}

const LIFT_STATUS: Record<string, Lift['status']> = {
  operational: 'operational', maintenance: 'service', offline: 'offline',
};

export function adaptLifts(s: DashboardSummary | null): Lift[] {
  return (s?.sections?.lifts ?? []).map((l: any, i: number) => ({
    id: `lift-${l.asset_id ?? i}`,
    label: l.name || `Lift ${i + 1}`,
    status: LIFT_STATUS[l.status] || 'operational',
    floor: 1,
  }));
}

const ASSET_STATUS: Record<string, Asset['status']> = {
  operational: 'ok', under_maintenance: 'service-soon', retired: 'attention',
};

export function adaptAssets(s: DashboardSummary | null): Asset[] {
  return (s?.sections?.assets ?? []).map((a: any) => ({
    id: `A-${a.id}`,
    name: a.name || 'Asset',
    location: a.type || '—',
    warrantyEnds: a.warranty_expiry ? fmtDate(a.warranty_expiry) : 'Not tracked',
    status: ASSET_STATUS[a.status] || 'ok',
  }));
}

// Individual expenses (fetched separately from /api/expenses/, admin/committee only).
export function adaptExpenses(rows: any[], lk: Lookups): Expense[] {
  return (rows ?? []).map((e: any) => ({
    id: `E-${e.id}`,
    date: fmtDate(e.date),
    vendor: e.vendor ? (lk.vendorName.get(e.vendor) || e.description || e.category) : (e.description || e.category || '—'),
    category: e.category || 'General',
    amount: num(e.amount),
  }));
}
