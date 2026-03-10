# CaseGraph v1 Sprint Plan

## Sprint 1 — Foundation ✅ (scaffolded)
- [x] Auth (JWT, roles, RBAC)
- [x] Tenant + user + role CRUD
- [x] Case CRUD with state machine
- [x] Entity CRUD
- [x] File upload endpoint
- [x] Audit logging foundation (append-only)
- [x] Postgres schema + Alembic setup
- [x] Docker Compose local dev stack

## Sprint 2 — Evidence & Search
- [ ] OpenSearch index setup + document indexing
- [ ] Full-text search endpoint wired to OpenSearch
- [ ] PDF / CSV / email parsing pipeline (Celery tasks)
- [ ] Evidence ingestion: create Document + DocumentChunk records
- [ ] pgvector embedding generation (document chunks)
- [ ] Semantic search endpoint
- [ ] Case detail: entities panel + evidence panel
- [ ] Entity profile page with identifiers + aliases
- [ ] Timeline view (source records + relationships)

## Sprint 3 — Graph & Intelligence
- [ ] Neo4j sync service (entity + relationship writes)
- [ ] Graph View: pull live data from Neo4j
- [ ] Expand-neighbors UI in graph view
- [ ] Entity merge UI (suggestions + confirm flow)
- [ ] Rule-based alert engine (configurable rules)
- [ ] Alert queue + "Create Case from Alert" flow
- [ ] Case tasks + assignment notifications

## Sprint 4 — AI & Governance
- [ ] AI extraction: run on every ingested document
- [ ] AI case summarization (on-demand + auto on status change)
- [ ] AI next-action recommendations in case detail
- [ ] Report drafting endpoint + PDF export
- [ ] Approval workflow UI (pending approvals queue)
- [ ] Audit Explorer UI (action log viewer + export)
- [ ] Admin panel: users, roles, policy configuration
- [ ] Export audit bundle (ZIP: case JSON + action logs + evidence manifest)
