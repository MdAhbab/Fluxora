// Shared types for the Fluxora AI subsystem.
//
// The subsystem mirrors AGENTS.md: one Gateway abstracts the model provider
// (self-hosted Gemma / bring-your-own keys / Fluxora Managed AI), every agent is
// tenant-scoped, writes are human-confirmed proposals, and every run is audited.

export type AgentId = 'concierge' | 'triage' | 'pulse' | 'scribe';

export type ProviderMode = 'self' | 'byok' | 'managed';

// One bring-your-own key in the ordered fallback list (AGENTS.md mode B).
export type ProviderKey = {
  id: string;
  provider: string;      // e.g. "Google · Gemini", "Groq", "OpenRouter"
  model: string;         // model id sent to the endpoint
  label: string;         // masked display label, e.g. "ai-…f10b"
  key: string;           // raw secret (kept client-side only)
  endpoint?: string;     // optional OpenAI-compatible base URL override
  status: 'live' | 'cooldown' | 'idle';
  cooldownUntil?: number; // epoch ms; key is skipped until then
};

export type AiSettings = {
  mode: ProviderMode;
  selfHostUrl: string;        // Ollama / vLLM OpenAI-compatible base URL
  selfHostModel: string;
  keys: ProviderKey[];
  agents: Record<AgentId, boolean>;   // per-agent enable toggles
  managedQuota: { used: number; limit: number };
};

// A model invocation result from the Gateway.
export type ModelOutcome = {
  ok: boolean;
  text: string;
  mode: ProviderMode;
  model: string;        // resolved model id / "deterministic"
  keyId?: string;       // which BYOK key answered, if any
  error?: string;
};

// Human-in-the-loop write proposal surfaced in the UI before anything mutates.
export type Proposal = {
  kind: 'booking' | 'visitor' | 'ticket' | 'payment' | 'triage' | 'notice';
  summary: string;            // one-line human description
  // payload shape matches the corresponding useData() mutation argument
  payload: Record<string, any>;
  confirmLabel?: string;
};

export type ConciergeReply = {
  text: string;
  proposal?: Proposal;
  // tools the reasoner consulted — surfaced as provenance chips
  sources?: string[];
};

export type AuditEntry = {
  id: string;
  ts: number;
  agent: AgentId;
  action: string;             // human description of what happened
  tools: string[];            // tool names invoked
  mode: ProviderMode;
  model: string;
  approvedBy?: string;        // user name when a proposal was confirmed
  buildingId?: string | null;
};
