// Single source of truth for mock data. Every component reads from here.
// TODO(api): replace with real API calls per claude-design/api-contract-notes.md

import type { Role } from './roles';

export type Building = {
  id: string;
  name: string;
  address: string;
  floors: number;
  unitsPerFloor: number;
  occupancyRate: number;
  monthlyDues: number;
};

export const BUILDINGS: Building[] = [
  { id: 'gh', name: 'Gulshan Heights', address: 'Road 7, Gulshan-1, Dhaka', floors: 14, unitsPerFloor: 6, occupancyRate: 94, monthlyDues: 2_400_000 },
  { id: 'br', name: 'Banani Reserve', address: 'Road 11, Banani, Dhaka', floors: 18, unitsPerFloor: 4, occupancyRate: 88, monthlyDues: 3_120_000 },
  { id: 'dr', name: 'Dhanmondi Row', address: 'Road 5/A, Dhanmondi', floors: 10, unitsPerFloor: 8, occupancyRate: 91, monthlyDues: 1_980_000 },
];

export type Unit = {
  id: string;
  flat: string;
  floor: number;
  size: string;
  occupancy: 'owner' | 'rented' | 'vacant' | 'common';
  resident?: string;
  balance: number;
  openTickets: number;
};

export const UNITS: Unit[] = (() => {
  const units: Unit[] = [];
  const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
  const residents = ['N. Rahman', 'S. Choudhury', 'A. Karim', 'F. Hossain', 'T. Ahmed', 'R. Islam', 'M. Begum', 'K. Hossain', 'J. Akter', 'I. Khan', 'P. Sultana', 'L. Chowdhury'];
  let ri = 0;
  for (let f = 14; f >= 1; f--) {
    for (let u = 0; u < 6; u++) {
      const seed = (f * 7 + u * 3) % 17;
      const occ: Unit['occupancy'] = seed < 3 ? 'vacant' : seed < 7 ? 'rented' : 'owner';
      units.push({
        id: `${f}${cols[u]}`,
        flat: `${f}${cols[u]}`,
        floor: f,
        size: u % 2 === 0 ? '1,820 sqft · 3BR' : '2,140 sqft · 4BR',
        occupancy: occ,
        resident: occ === 'vacant' ? undefined : residents[(ri++) % residents.length],
        balance: occ === 'vacant' ? 0 : (seed * 1200 + 16000),
        openTickets: seed === 5 ? 1 : seed === 11 ? 2 : 0,
      });
    }
  }
  return units;
})();

export type Invoice = {
  id: string;
  flat: string;
  resident: string;
  amount: number;
  due: string;
  status: 'paid' | 'pending' | 'overdue';
  items: { label: string; amount: number }[];
};

export const INVOICES: Invoice[] = UNITS.filter(u => u.occupancy !== 'vacant').slice(0, 24).map((u, i) => ({
  id: `INV-2605-${String(i + 1).padStart(3, '0')}`,
  flat: u.flat,
  resident: u.resident || '—',
  amount: 18_400 + (i * 350) % 8000,
  due: '12 May 2026',
  status: i === 5 ? 'overdue' : i % 9 === 0 ? 'pending' : 'paid',
  items: [
    { label: 'Service charge', amount: 12_000 },
    { label: 'Utility — water', amount: 2_400 },
    { label: 'Lift maintenance', amount: 1_600 },
    { label: 'Security fee', amount: 2_400 },
  ],
}));

export type Ticket = {
  id: string;
  title: string;
  flat: string;
  category: 'plumbing' | 'electric' | 'lift' | 'security' | 'cleaning' | 'general';
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'med' | 'high';
  assigned?: string;
  opened: string;
  aiConfidence?: number;
};

export const TICKETS: Ticket[] = [
  { id: 'T-014', title: 'Kitchen sink leaking', flat: '7C', category: 'plumbing', status: 'open', priority: 'med', opened: '2h ago', aiConfidence: 96 },
  { id: 'T-013', title: 'Lift B making grinding noise', flat: '—', category: 'lift', status: 'in-progress', priority: 'high', assigned: 'Rahim', opened: '5h ago', aiConfidence: 88 },
  { id: 'T-012', title: 'Hallway light out, floor 9', flat: '9D', category: 'electric', status: 'in-progress', priority: 'low', assigned: 'Mizan', opened: '1d ago' },
  { id: 'T-011', title: 'Intercom not connecting', flat: '12A', category: 'electric', status: 'open', priority: 'med', opened: '1d ago', aiConfidence: 74 },
  { id: 'T-010', title: 'Parking gate stuck', flat: '—', category: 'security', status: 'resolved', priority: 'high', assigned: 'Karim', opened: '3d ago' },
  { id: 'T-009', title: 'Garbage chute jammed, F11', flat: '11B', category: 'cleaning', status: 'in-progress', priority: 'low', assigned: 'Salma', opened: '2d ago' },
  { id: 'T-008', title: 'AC drain leaking onto F6', flat: '6B', category: 'plumbing', status: 'open', priority: 'high', opened: '6h ago', aiConfidence: 91 },
];

export type GateLog = {
  time: string;
  gate: 'A' | 'B';
  type: 'verified' | 'manual' | 'denied' | 'sos';
  flat: string;
  detail: string;
};

export const GATE_LOGS: GateLog[] = [
  { time: '19:42', gate: 'A', type: 'verified', flat: '7C', detail: 'Visitor · F. Hasan' },
  { time: '19:38', gate: 'A', type: 'verified', flat: '12A', detail: 'Delivery · Daraz' },
  { time: '19:31', gate: 'A', type: 'manual', flat: '14B', detail: 'Vendor · AC Service' },
  { time: '19:24', gate: 'B', type: 'verified', flat: '9D', detail: 'Visitor · R. Begum' },
  { time: '19:18', gate: 'A', type: 'denied', flat: '—', detail: 'Pass expired · pre-reg required' },
  { time: '19:11', gate: 'A', type: 'verified', flat: '5A', detail: 'Visitor · K. Karim' },
  { time: '18:47', gate: 'B', type: 'verified', flat: '11B', detail: 'Pickup · Foodi' },
  { time: '18:30', gate: 'A', type: 'verified', flat: '3D', detail: 'Resident' },
  { time: '17:55', gate: 'A', type: 'manual', flat: '8A', detail: 'Maid · daily entry' },
  { time: '17:12', gate: 'B', type: 'verified', flat: '14B', detail: 'Visitor · T. Anwar' },
];

export type Notice = {
  id: string;
  title: string;
  bodyEn: string;
  bodyBn: string;
  tone: 'formal' | 'friendly' | 'urgent';
  posted: string;
  byScribe?: boolean;
};

export const NOTICES: Notice[] = [
  {
    id: 'N-08',
    title: 'Lift B planned maintenance — 14 May, 06:00–10:00',
    bodyEn: 'Lift B will be unavailable for routine annual service. Lift A remains operational. Please plan ahead, particularly residents on upper floors and those expecting deliveries.',
    bodyBn: 'বার্ষিক রক্ষণাবেক্ষণের জন্য লিফট বি ১৪ মে সকাল ৬টা থেকে ১০টা পর্যন্ত বন্ধ থাকবে। লিফট এ চালু থাকবে।',
    tone: 'formal',
    posted: '2 hours ago',
    byScribe: true,
  },
  {
    id: 'N-07',
    title: 'Rooftop event — Eid get-together',
    bodyEn: 'Join us on the rooftop for a community Eid gathering, 18 May from 6 PM. Light dinner and tea provided. Children welcome.',
    bodyBn: 'রুফটপে ১৮ মে সন্ধ্যা ৬টা থেকে কমিউনিটি ঈদ মিলনমেলা। হালকা খাবার ও চা থাকবে।',
    tone: 'friendly',
    posted: '1 day ago',
  },
  {
    id: 'N-06',
    title: 'Service-charge rate revision — effective June',
    bodyEn: 'The committee has approved a 4% increase to monthly service charges effective 1 June, reflecting increased generator diesel and security costs.',
    bodyBn: 'কমিটি ১ জুন থেকে মাসিক সার্ভিস চার্জে ৪% বৃদ্ধি অনুমোদন করেছে।',
    tone: 'formal',
    posted: '4 days ago',
  },
];

export type Visitor = {
  id: string;
  name: string;
  flat: string;
  host: string;
  when: string;
  status: 'expected' | 'checked-in' | 'checked-out' | 'cancelled';
  phone: string;
  qr: string;
};

export const VISITORS: Visitor[] = [
  { id: 'V-901', name: 'F. Hasan', flat: '7C', host: 'N. Rahman', when: 'Today · 19:30', status: 'checked-in', phone: '+880 1722 ...', qr: 'FLX-V901' },
  { id: 'V-902', name: 'R. Begum (Mother)', flat: '9D', host: 'F. Hossain', when: 'Today · 19:00', status: 'checked-in', phone: '+880 1612 ...', qr: 'FLX-V902' },
  { id: 'V-903', name: 'Daraz Courier', flat: '12A', host: 'S. Choudhury', when: 'Today · 18:30', status: 'checked-out', phone: '+880 1900 ...', qr: 'FLX-V903' },
  { id: 'V-904', name: 'T. Anwar', flat: '14B', host: 'M. Begum', when: 'Today · 20:30', status: 'expected', phone: '+880 1733 ...', qr: 'FLX-V904' },
  { id: 'V-905', name: 'K. Karim', flat: '5A', host: 'T. Ahmed', when: 'Tomorrow · 11:00', status: 'expected', phone: '+880 1819 ...', qr: 'FLX-V905' },
];

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  shift: string;
  status: 'on-duty' | 'off-duty' | 'leave';
  hoursMonth: number;
  payMonth: number;
};

export const STAFF: StaffMember[] = [
  { id: 'S-01', name: 'Rahim Uddin', role: 'Maintenance Lead', shift: 'Day · 08–17', status: 'on-duty', hoursMonth: 184, payMonth: 32_000 },
  { id: 'S-02', name: 'Mizan Hossain', role: 'Electrician', shift: 'Day · 08–17', status: 'on-duty', hoursMonth: 176, payMonth: 28_000 },
  { id: 'S-03', name: 'Salma Akter', role: 'Cleaner', shift: 'Day · 06–14', status: 'on-duty', hoursMonth: 168, payMonth: 18_000 },
  { id: 'S-04', name: 'Karim Sheikh', role: 'Guard · Gate A', shift: 'Night · 20–06', status: 'on-duty', hoursMonth: 192, payMonth: 22_000 },
  { id: 'S-05', name: 'Babul Mia', role: 'Guard · Gate B', shift: 'Day · 06–18', status: 'off-duty', hoursMonth: 188, payMonth: 22_000 },
  { id: 'S-06', name: 'Jamal Khan', role: 'Lift Technician', shift: 'On-call', status: 'leave', hoursMonth: 92, payMonth: 14_000 },
];

export type Booking = {
  id: string;
  facility: string;
  flat: string;
  resident: string;
  when: string;
  status: 'confirmed' | 'pending' | 'rejected';
};

export const BOOKINGS: Booking[] = [
  { id: 'B-44', facility: 'Rooftop', flat: '9D', resident: 'F. Hossain', when: '18 May · 18:00–22:00', status: 'confirmed' },
  { id: 'B-43', facility: 'Community Hall', flat: '14B', resident: 'M. Begum', when: '20 May · 11:00–15:00', status: 'pending' },
  { id: 'B-42', facility: 'Gym', flat: '7C', resident: 'N. Rahman', when: 'Today · 06:00–07:00', status: 'confirmed' },
];

export type Listing = {
  id: string;
  flat: string;
  size: string;
  rent: number;
  type: 'rent' | 'sale';
  posted: string;
  status: 'active' | 'applied' | 'leased';
};

export const LISTINGS: Listing[] = [
  { id: 'L-04', flat: '11B', size: '1,820 sqft · 3BR', rent: 62_000, type: 'rent', posted: '3 days', status: 'active' },
  { id: 'L-03', flat: '3D', size: '2,140 sqft · 4BR', rent: 78_000, type: 'rent', posted: '1 week', status: 'applied' },
  { id: 'L-02', flat: '14B', size: '2,400 sqft · 4BR + study', rent: 95_000, type: 'rent', posted: '2 weeks', status: 'active' },
  { id: 'L-01', flat: '5A', size: '1,820 sqft · 3BR', rent: 8_900_000, type: 'sale', posted: '1 month', status: 'active' },
];

export type Asset = { id: string; name: string; location: string; warrantyEnds: string; status: 'ok' | 'service-soon' | 'attention' };
export const ASSETS: Asset[] = [
  { id: 'A-01', name: 'Otis Lift A', location: 'Core', warrantyEnds: '12 mo', status: 'ok' },
  { id: 'A-02', name: 'Otis Lift B', location: 'Core', warrantyEnds: '12 mo', status: 'service-soon' },
  { id: 'A-03', name: 'Cummins Generator 250kW', location: 'Ground', warrantyEnds: '4 mo', status: 'service-soon' },
  { id: 'A-04', name: 'Pedrollo Water Pump', location: 'Roof', warrantyEnds: '8 mo', status: 'ok' },
  { id: 'A-05', name: 'CCTV NVR · 32 ch', location: 'Gate A', warrantyEnds: '2 mo', status: 'attention' },
];

export type Expense = { id: string; date: string; vendor: string; category: string; amount: number };
export const EXPENSES: Expense[] = [
  { id: 'E-22', date: '08 May', vendor: 'Padma Diesel', category: 'Generator', amount: 84_000 },
  { id: 'E-21', date: '06 May', vendor: 'AquaPure', category: 'Water Treatment', amount: 22_500 },
  { id: 'E-20', date: '04 May', vendor: 'CleanWorks BD', category: 'Cleaning', amount: 38_000 },
  { id: 'E-19', date: '02 May', vendor: 'Otis Services', category: 'Lift AMC', amount: 56_000 },
  { id: 'E-18', date: '01 May', vendor: 'DPDC', category: 'Utility', amount: 124_000 },
];

export type Lift = { id: string; label: string; status: 'operational' | 'service' | 'offline'; floor: number };
export const LIFTS: Lift[] = [
  { id: 'lift-a', label: 'Lift A', status: 'operational', floor: 9 },
  { id: 'lift-b', label: 'Lift B', status: 'service', floor: 1 },
];

export type Vehicle = { id: string; reg: string; flat: string; owner: string; bay: string };
export const VEHICLES: Vehicle[] = [
  { id: 'V-01', reg: 'DM-GA-1234', flat: '7C', owner: 'N. Rahman', bay: 'B-12' },
  { id: 'V-02', reg: 'DM-MA-9988', flat: '12A', owner: 'S. Choudhury', bay: 'B-08' },
  { id: 'V-03', reg: 'DM-CHA-4421', flat: '9D', owner: 'F. Hossain', bay: 'B-03' },
];

export type Poll = { id: string; question: string; options: { label: string; votes: number }[]; closes: string };
export const POLLS: Poll[] = [
  { id: 'P-03', question: 'Should we add EV charging stations in B-bay?', options: [{ label: 'Yes', votes: 42 }, { label: 'No', votes: 12 }, { label: 'Abstain', votes: 6 }], closes: '17 May' },
  { id: 'P-02', question: 'Pool maintenance: weekly or biweekly?', options: [{ label: 'Weekly', votes: 28 }, { label: 'Biweekly', votes: 31 }], closes: '20 May' },
];

export type Tenant = { id: string; name: string; plan: 'Foundation' | 'Residence' | 'Estate'; flats: number; mrr: number; health: 'green' | 'amber' | 'red'; since: string };
export const TENANTS: Tenant[] = [
  { id: 'T-001', name: 'Gulshan Heights', plan: 'Estate', flats: 84, mrr: 24_000, health: 'green', since: 'Jan 2024' },
  { id: 'T-002', name: 'Banani Reserve', plan: 'Residence', flats: 72, mrr: 9_800, health: 'green', since: 'Mar 2024' },
  { id: 'T-003', name: 'Dhanmondi Row', plan: 'Residence', flats: 80, mrr: 9_800, health: 'amber', since: 'Jul 2024' },
  { id: 'T-004', name: 'Uttara Court', plan: 'Foundation', flats: 32, mrr: 4_500, health: 'green', since: 'Oct 2024' },
  { id: 'T-005', name: 'Bashundhara Lake', plan: 'Estate', flats: 124, mrr: 24_000, health: 'green', since: 'Dec 2024' },
  { id: 'T-006', name: 'Mirpur Mid-Rise', plan: 'Foundation', flats: 40, mrr: 4_500, health: 'red', since: 'Feb 2026' },
];

// Demo accounts for login pre-fill. The five building roles are real seeded backend
// accounts (run `python manage.py seed_demo_data`); `software` is a client-only ops
// console with no backend user, so it always lands on the offline demo fallback.
export const DEMO_ACCOUNTS: { role: Role; email: string; pass: string; name: string; flat?: string }[] = [
  { role: 'admin', email: 'admin1@fluxora.bd', pass: 'Fluxora@2026', name: 'Nusrat Jahan', flat: '—' },
  { role: 'committee', email: 'committee1@fluxora.bd', pass: 'Fluxora@2026', name: 'Farhana Islam' },
  { role: 'resident', email: 'resident1@fluxora.bd', pass: 'Fluxora@2026', name: 'Aisha Rahman', flat: '01A' },
  { role: 'guard', email: 'guard1@fluxora.bd', pass: 'Fluxora@2026', name: 'Rafiq Uddin' },
  { role: 'staff', email: 'staff1@fluxora.bd', pass: 'Fluxora@2026', name: 'Mina Akter' },
  { role: 'software', email: 'ops@fluxora.bd', pass: 'Fluxora@2026', name: 'Platform Ops' },
];

export const formatBDT = (n: number) => '৳ ' + n.toLocaleString('en-IN');
