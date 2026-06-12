// Building Pulse — monthly financial & operations digest (AGENTS.md §2.3).
//
// Numbers come only from the aggregation tools; the renderer cross-checks every
// cited figure. Anomalies are statistical (z-score), explained not invented.

import type { AgentData } from './tools';
import { aggregate_finance, aggregate_expenses, aggregate_tickets, detect_anomalies, fmtBDT } from './tools';

export type PulseDigest = {
  month: string;
  headline: string;
  standfirst: string;
  collectionRate: number;
  collected: number;
  outstanding: number;
  overdueCount: number;
  expenseTotal: number;
  chart: { label: string; value: number }[];
  anomalies: { label: string; value: number; pctOfMean: number }[];
  sections: { title: string; body: string }[];
  actions: string[];
  surplus: number;
  generatedAt: number;
};

export function runPulse(data: AgentData, monthLabel?: string): PulseDigest {
  const month = monthLabel || new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const fin = aggregate_finance(data);
  const exp = aggregate_expenses(data);
  const tix = aggregate_tickets(data);

  const chart = exp.sorted.map(([label, value]) => ({ label: label.slice(0, 4), value }));
  const anomalies = detect_anomalies(exp.sorted.map(([label, value]) => ({ label, value })))
    .map(a => ({ label: a.label, value: a.value, pctOfMean: a.pctOfMean }));

  const topExpense = exp.top ? `${exp.top[0]} at ${fmtBDT(exp.top[1])}` : 'no logged expenses';
  const surplus = Math.max(0, fin.collected - exp.total);

  const headline = anomalies.length
    ? `${month} · the ${anomalies[0].label.toLowerCase()} month`
    : `${month} · steady state`;

  const standfirst = `Collections held at ${fin.collectionRate}% with ${fmtBDT(fin.outstanding)} outstanding across ${fin.overdueCount} overdue ${fin.overdueCount === 1 ? 'flat' : 'flats'}. Largest cost line: ${topExpense}.`;

  const sections: { title: string; body: string }[] = [
    {
      title: 'Collections',
      body: `${fmtBDT(fin.collected)} cleared this period at a ${fin.collectionRate}% collection rate. ${fin.overdueCount ? `${fin.overdueCount} ${fin.overdueCount === 1 ? 'flat remains' : 'flats remain'} overdue and ${fin.overdueCount === 1 ? 'has' : 'have'} been flagged to the office.` : 'No flats are currently overdue.'}`,
    },
    {
      title: 'Expenditure',
      body: anomalies.length
        ? `Total spend reached ${fmtBDT(exp.total)}. ${anomalies[0].label} runs ${anomalies[0].pctOfMean > 0 ? '+' : ''}${anomalies[0].pctOfMean}% versus the category mean — the standout line this month and worth a closer look.`
        : `Total spend reached ${fmtBDT(exp.total)}, evenly distributed with no category breaking out of its trailing band.`,
    },
    {
      title: 'Maintenance',
      body: `${tix.total} tickets logged, ${tix.open} still open. ${tix.hotspot ? `${tix.hotspot[0]} is the busiest category (${tix.hotspot[1]}).` : ''}`,
    },
  ];

  const actions: string[] = [];
  if (fin.overdueCount) actions.push(`Follow up with ${fin.overdueCount} overdue ${fin.overdueCount === 1 ? 'flat' : 'flats'} before month-end.`);
  if (anomalies.length) actions.push(`Review the ${anomalies[0].label.toLowerCase()} contract — spend is ${anomalies[0].pctOfMean > 0 ? 'above' : 'below'} its category mean.`);
  if (tix.open > 0) actions.push(`Clear ${tix.open} open maintenance ${tix.open === 1 ? 'ticket' : 'tickets'} to keep resolution time down.`);
  while (actions.length < 3) actions.push('Maintain the reserve fund at or above one month of operating cost.');

  return {
    month, headline, standfirst,
    collectionRate: fin.collectionRate, collected: fin.collected, outstanding: fin.outstanding, overdueCount: fin.overdueCount,
    expenseTotal: exp.total, chart, anomalies,
    sections, actions: actions.slice(0, 3), surplus,
    generatedAt: Date.now(),
  };
}
