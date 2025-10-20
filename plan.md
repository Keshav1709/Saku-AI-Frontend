## Saku-AI Frontend Phased Plan (Prioritized)

### Phase A — Critical UX & Persistence
- Chat attachments: done (upload, collect `doc_id`, stream with `docIds`).
- Persist chat sessions/messages: backend conversation created and assistant final persisted; hydration on selecting a conversation: done; (pending: persist user message pre-stream).
- Docs search: done (`/api/search` UI on `docs` page with snippets).

### Phase B — Workflows Builder & Execution Surfaces
- Workflows builder UI (`/workflows/[id]/builder`): done (create/save/load/update via BFF; run stub wired).
- Trigger workflows from chat: pending.
- Workflow runs page: pending (list, status, logs; deep-link from chat).

### Phase B2 — Meetings Pages
- Meetings list page (table, filters) wired to backend `/meetings`: done.
- Meeting detail page with tabs Notes/Agenda/Action wired to backend: done.
- Upload Recording button (signed URL) and Transcribe & Analyze actions: done (stubbed processing).
- Upload button on list attaches to first meeting (demo) and saves recording URI; detail page upload saves to its meeting.

### Phase C — Storage & File UX
- Upload manager: progress, retries, error toasts; batch uploads; per-file status (pending).
- Document viewer: preview text, citations, quick actions (filter to chat, delete, re-embed) (pending).
- Bulk actions: select multiple docs, delete or re-index (now supported on backend) (pending).

---

## Meetings Frontend Plan (Detailed)
- F1: Recording upload control on detail page [done]; show processing state; poll insights [pending polling].
- F2: Notes tab: show Summary/Chapters/Highlights panels when insights present [pending rich components].
- F3: Agenda tab: editable list with reorder and link to timestamps [pending].
- F4: Action tab: add-to-calendar, assignee/due inputs with backend integration [pending].

### Phase D — Integrations Surface (Gmail/Drive/Calendar + others)
- Unify integrations data page with filters, pagination, search; export to chat context; pin as sources.
- OAuth flows: polish success/error banners; reconnect flows; status badges across app.
- Non-Google placeholders: Slack/Notion/Discord toggles call-through; hide advanced actions until backend exists.

### Phase E — Security & Settings
- Auth gating end-to-end: proper session/token usage; no sensitive data in localStorage.
- Settings tabs: wire monitoring/notifications/billing to backend when available; keep graceful fallbacks.

### Phase F — Observability & Performance
- Client logs with correlationId; surface backend errors in UI.
- Streaming resilience: auto-reconnect for transient failures; partial rendering safeguards.

Dependencies
- Backend conversation APIs (persist/load), workflows CRUD/run APIs, meetings CRUD, secure auth/session.
Milestones
- A: Persistence + search UX
- B: Workflows
- C: Storage polish
- D: Integrations polish
- E: Security/settings
- F: Observability/perf
