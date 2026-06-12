// Public surface of the Fluxora AI subsystem.

export * from './types';
export { aiSettings, useAiSettings } from './settings';
export { aiAudit, useAiAudit } from './audit';
export { complete, completeJson } from './gateway';
export { runConcierge, enhanceReply } from './concierge';
export { runTriage, type TriageResult } from './triage';
export { runPulse, type PulseDigest } from './pulse';
export { runScribe, type NoticeDraft, type Tone } from './scribe';
export type { AgentData } from './tools';

import type { AgentData } from './tools';

// Build the read-only agent snapshot from a useData() value. Tenancy is inherited:
// the snapshot already contains only the active building's rows.
export function toAgentData(d: any): AgentData {
  return {
    building: d.building ?? null,
    metrics: d.metrics ?? {},
    invoices: d.invoices ?? [],
    tickets: d.tickets ?? [],
    notices: d.notices ?? [],
    staff: d.staff ?? [],
    bookings: d.bookings ?? [],
    units: d.units ?? [],
    expenses: d.expenses ?? [],
    resources: d.resources ?? [],
    wasteSchedules: d.wasteSchedules ?? [],
    emergencyContacts: d.emergencyContacts ?? [],
  };
}
