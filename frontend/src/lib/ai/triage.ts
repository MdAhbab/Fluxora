// Triage Desk — maintenance ticket triage (AGENTS.md §2.2).
//
// Classifies category, escalates priority from text cues, picks the best assignee
// by skill tag + current load, and drafts a resident acknowledgment. The result is
// a proposal a human approves or overrides.

import type { Ticket, StaffMember } from '../mock';
import type { AgentData } from './tools';
import { get_staff_roster, get_unit_history } from './tools';

export type TriageResult = {
  category: Ticket['category'];
  priority: Ticket['priority'];
  assignee: string;
  reason: string;
  reply: string;
  confidence: number;     // 0–100
  recurring: boolean;
};

const ESCALATORS = /\b(leak|flood|fire|smoke|spark|stuck|trapped|burst|gas|short|no power|overflow|emergency)\b/i;

// Map a ticket category to the staff skill that should own it.
const SKILL: Record<Ticket['category'], (s: StaffMember) => boolean> = {
  plumbing: s => /maintenance|plumb/i.test(s.role),
  electric: s => /electric/i.test(s.role),
  lift: s => /lift|technician/i.test(s.role),
  security: s => /guard|security/i.test(s.role),
  cleaning: s => /clean/i.test(s.role),
  general: s => /maintenance/i.test(s.role),
};

function classify(title: string, fallback: Ticket['category']): Ticket['category'] {
  const t = title.toLowerCase();
  if (/leak|water|drain|sink|tap|pipe|toilet/.test(t)) return 'plumbing';
  if (/light|power|electric|socket|wiring|intercom|fan/.test(t)) return 'electric';
  if (/lift|elevator/.test(t)) return 'lift';
  if (/lock|gate|cctv|camera|security|alarm/.test(t)) return 'security';
  if (/clean|garbage|waste|chute|trash/.test(t)) return 'cleaning';
  return fallback || 'general';
}

export function runTriage(ticket: Ticket, data: AgentData): TriageResult {
  const category = classify(ticket.title, ticket.category);
  const escalated = ESCALATORS.test(ticket.title);
  const priority: Ticket['priority'] = escalated ? 'high' : ticket.priority || 'med';

  // assignee: matching skill, lowest current open load, on-duty preferred
  const roster = get_staff_roster(data).filter(s => s.status !== 'leave');
  const eligible = roster.filter(SKILL[category]);
  const pool = (eligible.length ? eligible : roster)
    .sort((a, b) => (a.status === 'on-duty' ? -1 : 1) - (b.status === 'on-duty' ? -1 : 1) || a.load - b.load);
  const pick = pool[0];
  const assignee = pick ? pick.name.split(' ')[0] : 'Unassigned';

  const history = ticket.flat && ticket.flat !== '—' ? get_unit_history(data, ticket.flat) : [];
  const recurring = history.length > 1;

  // confidence: strong keyword match → high; generic → lower
  const confidence = Math.min(98, 70 + (category !== 'general' ? 18 : 0) + (escalated ? 8 : 0) + (pick && eligible.length ? 4 : 0));

  const reason = [
    `Classified ${category}${escalated ? ' with an escalation keyword' : ''}`,
    pick ? `→ ${assignee} (${eligible.length ? 'skill match' : 'fallback'}, ${pick.load} open)` : '→ no staff available',
    recurring ? `· recurring at ${ticket.flat} (${history.length} prior)` : '',
  ].filter(Boolean).join(' ');

  const reply = `Hi — we've logged "${ticket.title}". This has been classified as ${category} (${priority} priority) and assigned to ${assignee}. ` +
    (priority === 'high' ? 'Given the urgency, someone will attend shortly.' : 'You\'ll get an update as work progresses.') +
    ' — Fluxora Operations';

  return { category, priority, assignee, reason, reply, confidence, recurring };
}
