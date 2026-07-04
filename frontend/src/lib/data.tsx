// Central data layer: fetches the Django dashboard summary, adapts it into the
// mock-shaped types every module already uses, and exposes mutations.
//
// When there is no real backend token (offline / demo-fallback sessions) every
// selector returns the bundled mock data so the design always renders, and
// mutations resolve as harmless no-ops.

import { createContext, useContext, useCallback, useEffect, useMemo, useState, ReactNode } from 'react';
import { useAuth } from './auth';
import { api, dashboardApi, normalizeList, type DashboardSummary, type ApiUser } from './api';
import * as adapt from './adapt';
import {
  INVOICES, TICKETS, VISITORS, NOTICES, STAFF, BOOKINGS, LISTINGS, UNITS, VEHICLES,
  POLLS, GATE_LOGS, LIFTS, ASSETS, EXPENSES, BUILDINGS, TENANTS,
  type Invoice, type Ticket, type Visitor, type Notice, type StaffMember, type Booking,
  type Listing, type Unit, type Vehicle, type Poll, type GateLog, type Lift, type Asset,
  type Expense, type Tenant,
} from './mock';

export type NormBuilding = { id: string; name: string; address: string };

type DataCtx = {
  loading: boolean;
  error: string | null;
  isLive: boolean;
  refresh: () => Promise<void>;

  building: NormBuilding | null;
  buildings: NormBuilding[];
  metrics: Record<string, number>;
  me: ApiUser | null;
  residentId: number | null;

  // adapted, mock-shaped collections
  invoices: Invoice[];
  tickets: Ticket[];
  visitors: Visitor[];
  notices: Notice[];
  staff: StaffMember[];
  bookings: Booking[];
  listings: Listing[];
  units: Unit[];
  vehicles: Vehicle[];
  polls: Poll[];
  gateLogs: GateLog[];
  lifts: Lift[];
  assets: Asset[];
  expenses: Expense[];
  tenants: Tenant[];

  // raw passthrough sections (already JSON-friendly)
  directory: any[];
  chatRooms: any[];
  messages: any[];
  parkingSlots: any[];
  parkingLayout: any;
  vendors: any[];
  services: any[];
  resources: any[];
  wasteSchedules: any[];
  emergencyContacts: any[];
  notifications: any[];

  // mutations (resolve to true on success)
  payInvoice: (invoice: any, method?: string) => Promise<boolean>;
  addExpense: (data: { category: string; amount: number; description?: string; date: string }) => Promise<boolean>;
  addNotice: (data: { title: string; body: string; is_pinned?: boolean; expiry_date?: string | null }) => Promise<boolean>;
  scanVisitor: (qrToken: string) => Promise<boolean>;
  checkinVisitor: (visitor: any) => Promise<boolean>;
  checkoutVisitor: (visitor: any) => Promise<boolean>;
  createAppointment: (data: { visitor_name: string; visitor_phone: string; scheduled_time: string }) => Promise<boolean>;
  moveTicket: (ticket: any) => Promise<boolean>;
  setTicketStatus: (ticket: any, status: string) => Promise<boolean>;
  createTicket: (data: { category: string; description: string; priority?: string }) => Promise<boolean>;
  votePoll: (poll: any, option: any) => Promise<boolean>;
  sendMessage: (roomId: number, content: string) => Promise<boolean>;
  addBooking: (data: { resource: number; start_time: string; end_time: string; purpose?: string }) => Promise<boolean>;
  applyToListing: (listing: any) => Promise<boolean>;
  checkinStaff: (staffId: number) => Promise<boolean>;
  checkoutStaff: (staffId: number) => Promise<boolean>;
};

const Ctx = createContext<DataCtx>(null as any);

const mockBuildings = (): NormBuilding[] =>
  BUILDINGS.map(b => ({ id: b.id, name: b.name, address: b.address }));

const demoMetrics = (): Record<string, number> => {
  const paid = INVOICES.filter(i => i.status === 'paid');
  const occupied = UNITS.filter(u => u.occupancy !== 'vacant').length;
  return {
    outstanding: INVOICES.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0),
    payments_total: paid.reduce((s, i) => s + i.amount, 0),
    collection_rate: INVOICES.length ? Math.round((paid.length / INVOICES.length) * 100) : 0,
    open_tickets: TICKETS.filter(t => t.status !== 'resolved').length,
    visitors_today: VISITORS.length,
    occupancy_rate: UNITS.length ? Math.round((occupied / UNITS.length) * 100) : 0,
    occupied_units: occupied,
    total_units: UNITS.length,
  };
};

export function DataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const token = session?.token;
  const buildingId = session?.buildingId;
  const role = session?.role;

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [expenseRows, setExpenseRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) { setSummary(null); setExpenseRows([]); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.summary(buildingId);
      setSummary(data);
      if (role === 'admin' || role === 'committee') {
        try {
          const bId = data.building?.id;
          const rows = await api.get(`/api/expenses/${bId ? `?building_id=${bId}` : ''}`);
          setExpenseRows(normalizeList(rows));
        } catch { setExpenseRows([]); }
      } else {
        setExpenseRows([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Could not load building data.');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [token, buildingId, role]);

  useEffect(() => { refresh(); }, [refresh]);

  const isLive = !!summary && !!token;
  const lookups = useMemo(() => adapt.buildLookups(summary), [summary]);

  // building pk + me id used by mutations
  const buildingPk = summary?.building?.id;
  const meId = session?.userId;
  const residentId = summary?.current_resident_id ?? null;

  const value = useMemo<DataCtx>(() => {
    const guard = async (fn: () => Promise<any>): Promise<boolean> => {
      if (!isLive) return true; // demo: optimistic no-op
      try { await fn(); await refresh(); return true; }
      catch (err: any) { setError(err?.message || 'Action failed.'); return false; }
    };

    return {
      loading,
      error,
      isLive,
      refresh,
      building: isLive
        ? (summary!.building ? { id: String(summary!.building.id), name: summary!.building.name, address: summary!.building.address } : null)
        : (mockBuildings().find(b => b.id === buildingId) || mockBuildings()[0] || null),
      buildings: isLive
        ? (summary!.buildings || []).map(b => ({ id: String(b.id), name: b.name, address: b.address }))
        : mockBuildings(),
      metrics: isLive ? (summary!.metrics || {}) : demoMetrics(),
      me: isLive ? summary!.me : null,
      residentId,

      invoices: isLive ? adapt.adaptInvoices(summary) : INVOICES,
      tickets: isLive ? adapt.adaptTickets(summary, lookups) : TICKETS,
      visitors: isLive ? adapt.adaptVisitors(summary, lookups) : VISITORS,
      notices: isLive ? adapt.adaptNotices(summary) : NOTICES,
      staff: isLive ? adapt.adaptStaff(summary) : STAFF,
      bookings: isLive ? adapt.adaptBookings(summary, lookups) : BOOKINGS,
      listings: isLive ? adapt.adaptListings(summary, lookups) : LISTINGS,
      units: isLive ? adapt.adaptUnits(summary, lookups) : UNITS,
      vehicles: isLive ? adapt.adaptVehicles(summary, lookups) : VEHICLES,
      polls: isLive ? adapt.adaptPolls(summary) : POLLS,
      gateLogs: isLive ? adapt.adaptGateLogs(summary) : GATE_LOGS,
      lifts: isLive ? adapt.adaptLifts(summary) : LIFTS,
      assets: isLive ? adapt.adaptAssets(summary) : ASSETS,
      expenses: isLive ? adapt.adaptExpenses(expenseRows, lookups) : EXPENSES,
      tenants: isLive
        ? (summary!.buildings || []).map((b, i) => ({
            id: `T-${b.id}`,
            name: b.name,
            plan: (['Foundation', 'Residence', 'Estate'] as const)[i % 3],
            flats: Number(b.total_units) || 0,
            mrr: (Number(b.total_units) || 0) * 120,
            health: 'green' as const,
            since: '—',
          }))
        : TENANTS,

      directory: summary?.sections?.directory ?? [],
      chatRooms: summary?.sections?.chat_rooms ?? [],
      messages: summary?.sections?.messages ?? [],
      parkingSlots: summary?.sections?.parking_slots ?? [],
      parkingLayout: summary?.sections?.parking_layout ?? { rows: 4, columns: 6, prefix: 'P' },
      vendors: summary?.sections?.vendors ?? [],
      services: summary?.sections?.services ?? [],
      resources: summary?.sections?.resources ?? [],
      wasteSchedules: summary?.sections?.waste ?? [],
      emergencyContacts: summary?.sections?.emergency_contacts ?? [],
      notifications: summary?.sections?.notifications ?? [],

      payInvoice: (invoice, method = 'bKash') =>
        guard(() => api.post('/api/payments/checkout/', { invoice_id: invoice?._pk, method })),
      addExpense: (d) =>
        guard(() => api.post('/api/expenses/', {
          building: buildingPk, category: d.category, amount: d.amount,
          description: d.description || '', date: d.date, created_by: meId,
        })),
      addNotice: (d) =>
        guard(() => api.post('/api/notices/', {
          building: buildingPk, title: d.title, body: d.body,
          is_pinned: !!d.is_pinned, publish_date: new Date().toISOString(),
          expiry_date: d.expiry_date || null, created_by: meId,
        })),
      scanVisitor: (qrToken) =>
        guard(() => api.post('/api/visitors/scan/', { qr_token: qrToken, handled_by: meId })),
      checkinVisitor: (visitor) =>
        guard(() => visitor?._visitorId
          ? api.patch(`/api/visitors/${visitor._visitorId}/checkin/`, { handled_by: meId })
          : api.post('/api/visitors/scan/', { qr_token: visitor?.qr, handled_by: meId })),
      checkoutVisitor: (visitor) =>
        guard(() => api.patch(`/api/visitors/${visitor?._visitorId}/checkout/`, { handled_by: meId })),
      createAppointment: (d) =>
        guard(() => api.post('/api/appointments/', {
          building: buildingPk, resident: residentId,
          visitor_name: d.visitor_name, visitor_phone: d.visitor_phone,
          scheduled_time: d.scheduled_time, approved: true,
        })),
      moveTicket: (ticket) => {
        const map: Record<string, string> = { open: 'in_progress', 'in-progress': 'resolved', resolved: 'closed' };
        const next = map[ticket?.status] || 'open';
        return guard(() => api.patch(`/api/tickets/${ticket?._id}/status/`, { status: next }));
      },
      setTicketStatus: (ticket, statusVal) =>
        guard(() => api.patch(`/api/tickets/${ticket?._id}/status/`, { status: statusVal })),
      createTicket: (d) =>
        guard(() => api.post('/api/tickets/', {
          building: buildingPk, resident: residentId,
          category: d.category, description: d.description, priority: d.priority || 'medium', status: 'open',
        })),
      votePoll: (poll, option) =>
        guard(() => api.post(`/api/polls/${poll?._id}/vote/`, { option_id: option?._id, resident_id: residentId })),
      sendMessage: (roomId, content) =>
        guard(() => api.post('/api/chat/messages/', { room: roomId, resident: residentId, content })),
      addBooking: (d) =>
        guard(() => api.post('/api/bookings/', {
          resource: d.resource, resident: residentId,
          start_time: d.start_time, end_time: d.end_time, purpose: d.purpose || '', status: 'pending',
        })),
      applyToListing: (listing) =>
        guard(() => api.post('/api/rental-requests/', {
          listing: listing?._pk, tenant: residentId, status: 'pending',
        })),
      checkinStaff: (staffId) =>
        guard(() => api.post('/api/attendance/checkin/', { staff_id: staffId })),
      checkoutStaff: (staffId) =>
        guard(() => api.post('/api/attendance/checkout/', { staff_id: staffId })),
    };
  }, [loading, error, isLive, refresh, summary, expenseRows, lookups, buildingId, residentId, buildingPk, meId]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useData = () => useContext(Ctx);
