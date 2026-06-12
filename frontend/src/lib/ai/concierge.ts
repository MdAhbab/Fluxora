// Flux Concierge — natural-language assistant (AGENTS.md §2.1).
//
// The deterministic reasoner classifies intent, calls the allowed read tools, and
// either answers or returns a human-confirmed write proposal. It works with zero
// model configured; enhanceReply() optionally refines the prose via the Gateway.

import type { ConciergeReply, Proposal } from './types';
import type { AgentData } from './tools';
import {
  get_my_invoices, search_notices, get_waste_schedule,
  check_facility_availability, get_building_kpis, fmtBDT,
} from './tools';
import { complete } from './gateway';

type Role = 'admin' | 'committee' | 'resident' | 'guard' | 'staff' | 'software';

// Loose natural-time parse → ISO string + human label.
function parseWhen(text: string): { iso: string; label: string } {
  const now = new Date();
  const d = new Date(now);
  const t = text.toLowerCase();
  if (/tomorrow/.test(t)) d.setDate(d.getDate() + 1);
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const di = days.findIndex(name => t.includes(name));
  if (di >= 0) { const delta = (di - d.getDay() + 7) % 7 || 7; d.setDate(d.getDate() + delta); }
  const m = t.match(/(\d{1,2})\s*(?::(\d{2}))?\s*(am|pm)?/);
  let h = 10, min = 0;
  if (m) {
    h = parseInt(m[1], 10);
    min = m[2] ? parseInt(m[2], 10) : 0;
    if (m[3] === 'pm' && h < 12) h += 12;
    if (m[3] === 'am' && h === 12) h = 0;
  }
  d.setHours(h, min, 0, 0);
  if (!/tomorrow|day|\d/.test(t) && d.getTime() < now.getTime()) d.setHours(now.getHours() + 2);
  const label = d.toLocaleString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  return { iso: d.toISOString(), label };
}

const PHONE_RE = /(\+?\d[\d\s-]{6,}\d)/;
const FACILITIES = ['rooftop', 'community hall', 'hall', 'gym', 'mosque', 'pool'];

export function runConcierge(prompt: string, role: Role, data: AgentData): ConciergeReply {
  const t = prompt.toLowerCase().trim();
  if (!t) return { text: 'Ask me about your balance, a booking, a visitor pass, or a notice.', sources: [] };

  // ── Admin / committee building KPIs (checked first so "any overdue invoices?"
  // returns building-wide figures for managers, not a personal balance) ──
  if ((role === 'admin' || role === 'committee') && /\b(kpi|collection|occupancy|overdue|outstanding|on duty|duty|pulse|how many)\b/.test(t) && !/\bmy\b/.test(t)) {
    const k = get_building_kpis(data);
    if (/duty/.test(t)) {
      const on = data.staff.filter(s => s.status === 'on-duty').map(s => s.name.split(' ')[0]);
      return { text: `On duty now: ${on.join(', ') || 'no one logged in'}.`, sources: ['get_staff_roster'] };
    }
    return { text: `Collections at ${k.collectionRate}%, ${fmtBDT(k.outstanding)} outstanding, ${k.openTickets} open tickets, occupancy ${k.occupancy}%.`, sources: ['get_building_kpis'] };
  }

  // ── Balance / invoices / payment ──
  if (/\b(balance|bill|invoice|owe|due|pay|outstanding)\b/.test(t)) {
    const { rows, outstanding } = get_my_invoices(data);
    const unpaid = rows.filter(i => i.status !== 'paid');
    if (/\bpay\b/.test(t) && unpaid.length) {
      const target = unpaid.sort((a, b) => (a.status === 'overdue' ? -1 : 1))[0];
      const proposal: Proposal = {
        kind: 'payment',
        summary: `Pay ${target.id} — ${fmtBDT(target.amount)} via bKash`,
        payload: { invoice: target, method: 'bKash' },
        confirmLabel: 'Confirm payment',
      };
      return { text: `Your nearest unpaid invoice is ${target.id} for ${fmtBDT(target.amount)} (${target.status}). I can settle it now.`, proposal, sources: ['get_my_invoices'] };
    }
    if (!unpaid.length) return { text: `You're all clear — no outstanding invoices. Total settled looks healthy.`, sources: ['get_my_invoices'] };
    return { text: `You have ${unpaid.length} unpaid invoice${unpaid.length > 1 ? 's' : ''} totalling ${fmtBDT(outstanding)}. Say "pay my bill" and I'll draft the payment.`, sources: ['get_my_invoices'] };
  }

  // ── Visitor / gate pass ──
  if (/\b(visitor|guest|gate pass|electrician|courier|register a|invite)\b/.test(t)) {
    const when = parseWhen(t);
    const phone = (t.match(PHONE_RE)?.[1] || '').trim();
    // crude name capture: words after "for"/"make a pass for"
    const nameM = prompt.match(/for (?:my )?([A-Za-z][A-Za-z .]{1,30})/);
    const name = (nameM?.[1] || 'Guest').replace(/\b(tomorrow|today|at|on)\b.*$/i, '').trim() || 'Guest';
    const proposal: Proposal = {
      kind: 'visitor',
      summary: `Gate pass for ${name} · ${when.label}`,
      payload: { visitor_name: name, visitor_phone: phone || '+880', scheduled_time: when.iso },
      confirmLabel: 'Create pass',
    };
    return { text: `I'll draft a QR gate pass for ${name} at ${when.label}. Confirm and the guard desk will expect them.`, proposal, sources: ['propose_visitor_pass'] };
  }

  // ── Booking / facility ──
  if (/\b(book|booking|reserve|rooftop|hall|gym|facility|mosque)\b/.test(t)) {
    const facility = FACILITIES.find(f => t.includes(f)) || 'rooftop';
    const when = parseWhen(t);
    const avail = check_facility_availability(data, facility, when.iso);
    const end = new Date(new Date(when.iso).getTime() + 60 * 60_000).toISOString();
    const proposal: Proposal = {
      kind: 'booking',
      summary: `Book the ${facility} · ${when.label} (1h)`,
      payload: { facility, start_time: when.iso, end_time: end, purpose: '' },
      confirmLabel: 'Request booking',
    };
    const note = avail.anyFree ? 'that slot looks open' : 'that window is busy — I can still request it';
    return { text: `For the ${facility}, ${note}. I've drafted a one-hour booking at ${when.label}.`, proposal, sources: ['check_facility_availability', 'propose_booking'] };
  }

  // ── Maintenance ticket ──
  if (/\b(leak|broken|not working|repair|fix|ticket|complaint|electric|plumb|lift|noise)\b/.test(t)) {
    const category = /leak|water|drain|plumb|sink|tap/.test(t) ? 'plumbing'
      : /light|power|electric|socket|wiring/.test(t) ? 'electric'
      : /lift|elevator/.test(t) ? 'lift'
      : /lock|gate|cctv|security/.test(t) ? 'security'
      : /clean|garbage|waste|chute/.test(t) ? 'cleaning' : 'general';
    const priority = /urgent|flood|fire|stuck|emergency|sparks/.test(t) ? 'high' : 'medium';
    const proposal: Proposal = {
      kind: 'ticket',
      summary: `${category} ticket · ${priority} priority`,
      payload: { category, description: prompt.trim(), priority },
      confirmLabel: 'File ticket',
    };
    return { text: `Sounds like a ${category} issue. I've drafted a ${priority}-priority ticket — confirm and it routes to the right staff member.`, proposal, sources: ['propose_ticket'] };
  }

  // ── Waste schedule ──
  if (/\b(waste|garbage|collection|dumpster|recycl)\b/.test(t)) {
    const sched = get_waste_schedule(data);
    const next = sched[0];
    return { text: `Next waste collection: ${next.day || next.day_of_week || 'Tuesday'} at ${next.time || '07:00'}. ${next.note || ''}`.trim(), sources: ['get_waste_schedule'] };
  }

  // ── Notice search / fallback ──
  const hits = search_notices(data, t, 2);
  if (hits.length) {
    return { text: `From the notice board: "${hits[0].title}". ${hits[0].bodyEn.slice(0, 140)}…`, sources: ['search_notices'] };
  }
  return {
    text: `I can check your balance, draft a payment, register a visitor, book a facility, file a maintenance ticket, or look up a notice. What would you like?`,
    sources: [],
  };
}

// Optional model enrichment of the reply prose. Numbers/proposals are unchanged;
// only the natural-language surface is refined. Falls back to the input on any failure.
export async function enhanceReply(reply: ConciergeReply, prompt: string, enabled: boolean): Promise<string> {
  if (!enabled) return reply.text;
  const outcome = await complete([
    { role: 'system', content: 'You are Flux Concierge for a Dhaka apartment building. Rephrase the given answer in one warm, concise sentence. Do not invent facts, numbers, names, or dates. Keep any figures exactly as written.' },
    { role: 'user', content: `Resident asked: "${prompt}". Draft answer: "${reply.text}". Rephrase:` },
  ]);
  return outcome.ok && outcome.text ? outcome.text.replace(/^["']|["']$/g, '') : reply.text;
}
