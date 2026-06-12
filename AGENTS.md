# Fluxora Agents

This document specifies Fluxora's built-in AI agents: what each one does, the tools it is allowed to call, and how model inference is provisioned (local Gemma by default, user API keys with multi-key fallback, or Fluxora Managed AI as the paid tier). The role-scoped frontend surfaces for these agents are implemented under `frontend/src/app/` (Flux Concierge in the dashboard shell, Triage Desk in Operations, Building Pulse in Finance, Notice Scribe in Community). These surfaces currently run as manual/progressive-enhancement paths; wiring them to live inference requires the backend **AI Gateway** described below, which is not yet implemented.

---

## 1. Inference & provisioning (business model)

All agents run through one internal **AI Gateway** (backend service) that abstracts the model provider. Three modes, selectable in **Settings → AI & Intelligence**:

| Mode | Who pays | How it works |
| --- | --- | --- |
| **A. Self-hosted Gemma** (default, free) | Nobody | A locally/server-hosted **Gemma 3 (4B-instruct, quantized)** model served via Ollama/vLLM. Configurable endpoint URL. Good for Concierge & Scribe; Pulse uses the larger context variant if available. |
| **B. Bring-your-own API keys** (free tiers) | User's quotas | The workspace admin adds an **ordered list of API keys** (e.g., Google AI Studio / Groq / OpenRouter free tiers). The gateway tries key 1; on `429 / quota / auth` errors it **falls back to the next key automatically**, marks the failed key with a cooldown timestamp, and retries it after cooldown. Per-key provider + model fields; per-key live health status. |
| **C. Fluxora Managed AI** (paid — our revenue) | Subscriber | Inference runs on Fluxora's servers against our hosted models. Metered per-request with monthly quotas per plan (Foundation: none, Residence: 2,000 req/mo, Estate: 20,000 req/mo). When Mode A/B users hit failures or quota walls, the UI surfaces a one-click upgrade to Managed AI. |

Gateway guarantees (apply to every agent):
- **Tenancy:** every tool call is scoped to the caller's `building_id` and role; agents can never read or write across buildings.
- **Human-in-the-loop for writes:** any tool that mutates data returns a *proposal* the user confirms in the UI (except logging/audit tools).
- **Audit:** every agent action writes an `AgentAuditLog` row (agent, tools called, model+mode used, user who approved).
- **Budget:** per-request token cap, 2 tool-call rounds max for Concierge, 30s timeout, graceful "I couldn't complete that" failure copy.

---

## 2. Agent roster

### 2.1 Flux Concierge — resident & admin assistant (chat)

**Surface:** floating dock on the dashboard (all roles; tool access varies by role).
**Job:** answer questions and perform routine actions in natural language — "What's my balance?", "Book the rooftop Friday 7pm", "Make a gate pass for my electrician tomorrow 10am", "When is the next waste collection?"

**Tools:**

| Tool | Type | Description |
| --- | --- | --- |
| `get_my_invoices(status?)` | read | Caller's invoices & outstanding balance |
| `get_unit_summary(unit_id?)` | read | Unit residents, dues, open tickets (privacy-filtered) |
| `search_notices(query, limit)` | read | Search active + archived notices |
| `get_waste_schedule()` | read | Next collection slots |
| `check_facility_availability(facility_id, date)` | read | Free slots for a resource/facility |
| `propose_booking(facility_id, start, end, notes)` | write-proposal | Drafts a booking → user confirms inline |
| `propose_visitor_pass(name, phone, datetime)` | write-proposal | Drafts a QR gate pass → user confirms |
| `propose_ticket(category, description)` | write-proposal | Drafts a maintenance ticket → user confirms |
| `get_building_kpis()` | read | Admin/committee only: collections, occupancy, open tickets |

Role gating: residents get self-scoped tools only; guards get visitor/gate reads; admins additionally get `get_building_kpis`.

### 2.2 Triage Desk — maintenance ticket triage (background + review UI)

**Surface:** Operations module, staff/admin view.
**Job:** when a ticket arrives, classify category (plumbing/electrical/lift/common-area/…), set priority from text + photo cues (leak/fire/lift-stuck keywords escalate), pick the best assignee from the staff roster (skill tag + current load), and draft a first acknowledgment reply to the resident. Everything lands as a **proposal** a human approves or overrides; approvals/overrides are logged and exported as few-shot examples to improve future prompts.

**Tools:**

| Tool | Type | Description |
| --- | --- | --- |
| `read_ticket(ticket_id)` | read | Full ticket text + image captions/EXIF-stripped thumbnails |
| `get_staff_roster()` | read | Staff with skill tags, shift, open-ticket load |
| `get_unit_history(unit_id, limit)` | read | Past tickets for the unit (recurring-issue detection) |
| `propose_triage(ticket_id, category, priority, assignee_id, reason)` | write-proposal | The triage suggestion shown in the UI |
| `draft_reply(ticket_id, text)` | write-proposal | Acknowledgment message to the resident |
| `flag_emergency(ticket_id, reason)` | write | Only auto-write: marks for immediate human attention (never auto-dispatches SOS) |

### 2.3 Building Pulse — monthly financial & operations digest (scheduled)

**Surface:** Finance module report page, admin/committee only.
**Job:** on the 1st of each month (Celery Beat) — or on demand — produce an editorial digest: collections vs outstanding, expense category deltas vs trailing 6-month mean, anomaly call-outs ("diesel spend up 38%"), maintenance hot-spots, occupancy changes, and 3 recommended actions. Output is structured JSON (headline, sections, anomalies, charts data) that the frontend renders as the print-styled Pulse report; numbers come from tools, never from the model's imagination — the renderer cross-checks every cited figure against tool output and drops unverifiable claims.

**Tools:**

| Tool | Type | Description |
| --- | --- | --- |
| `aggregate_finance(month)` | read | Invoices, payments, collection rate, outstanding by floor |
| `aggregate_expenses(month, compare_window)` | read | Category totals + trailing-mean deltas |
| `aggregate_tickets(month)` | read | Volume by category, median resolution time, repeat units |
| `aggregate_occupancy(month)` | read | Move-ins/outs, vacancy, rental listings activity |
| `detect_anomalies(series)` | read | Statistical outliers (z-score) the model must explain, not invent |
| `save_pulse_report(month, payload)` | write | Persists the digest for the report archive |

### 2.4 Notice Scribe — bilingual notice composer (on-demand)

**Surface:** Community module composer, admin/committee only.
**Job:** turn a one-line brief ("water shut-off Tue 9–1 for tank cleaning") into a properly structured notice with tone presets (Formal / Friendly / Urgent), and produce a faithful **Bangla ⇄ English** pair published together. Also suggests category tag, pin/expiry dates, and whether it warrants push/SMS (urgent only).

**Tools:**

| Tool | Type | Description |
| --- | --- | --- |
| `get_notice_templates(category)` | read | House style + past notices of the same category |
| `get_building_facts()` | read | Building name, office hours, committee contacts (for accurate boilerplate) |
| `translate(text, target_lang)` | read | bn↔en translation pass (model-internal, but isolated as a tool for QA/eval) |
| `lint_notice(html)` | read | Sanitization + reading-level + missing-info check (date? time? contact?) |
| `propose_notice(title, body_en, body_bn, category, publish_at, expiry, urgent)` | write-proposal | Draft lands in the editor for human edit + publish |

---

## 3. Failure & fallback behavior (all agents)

1. Mode B key rotation: on provider error → next key in order → exhausted? → if Managed AI trial available, offer switch; else show the agent surface in "resting" state with retry-after time.
2. Model output that fails JSON-schema validation is retried once with the validator error appended; second failure → graceful decline, never raw model text into the UI.
3. All agent features are progressive enhancement: every agent surface has a fully manual path (Concierge actions exist as normal forms; Triage can be done by hand; Pulse falls back to plain charts; Scribe is just an editor).

---

## 4. Roadmap (not in current scope)

- Concierge voice input (Bangla/English) on mobile
- Triage learning loop: fine-tune Gemma adapter on approved triage decisions per building
- Pulse benchmark across buildings for multi-building (Estate) portfolios
