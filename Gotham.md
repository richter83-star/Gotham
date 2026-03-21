# Investigations OS v1 Blueprint  (Palantir Gotham Model)

## North Star

Build a Gotham-like **Investigations OS** for commercial and internal teams that need to ingest messy data, resolve entities, investigate cases, collaborate, and take governed actions.

This is **not** a generic dashboard product. This is a **decision system** for investigations.

---

## v1 Product Definition

### Core job

Help investigators answer:

* What happened?
* Who is connected to whom?
* What evidence supports the case?
* What should happen next?
* Who approved the action?

### Ideal early customers

* Fraud teams
* Insurance SIU teams
* Boutique investigations firms
* Internal trust & safety / compliance teams
* Small cyber incident response teams

### v1 product name

**CaseGraph**

---

## v1 User Roles

* Analyst
* Senior Investigator
* Case Manager
* Admin
* Auditor

---

## Core v1 Workflows

### 1. Intake

* Upload CSV / Excel / PDF / email exports
* Create case manually or from alert
* Auto-tag source, time, uploader, and provenance

### 2. Entity Resolution

* Merge duplicate people, orgs, devices, accounts, locations
* Show confidence scores and merge suggestions
* Preserve source lineage for each claim

### 3. Investigation

* Search entities, documents, and cases
* Open entity profile
* Explore relationship graph
* Review timeline
* Add notes, tags, hypotheses, and tasks
* Attach evidence to case

### 4. Decision

* Recommend next best actions
* Approve / deny / escalate
* Freeze / flag / route / request more evidence / generate report
* Require human approval for governed actions

### 5. Audit

* Full action history
* Who viewed what
* Who changed what
* Why an action was taken
* Export report bundle

---

## Core Data Model

### Entity types

* Person
* Organization
* Account
* Device
* Location
* Document
* Event
* Transaction
* Case
* Alert
* Evidence
* Task
* Decision
* User

### Relationship types

* PERSON_OWNS_ACCOUNT
* PERSON_USED_DEVICE
* PERSON_ASSOCIATED_WITH_ORG
* ACCOUNT_SENT_TRANSACTION
* ACCOUNT_RECEIVED_TRANSACTION
* PERSON_PRESENT_AT_LOCATION
* DOCUMENT_REFERENCES_ENTITY
* EVIDENCE_SUPPORTS_CASE
* ALERT_TRIGGERED_CASE
* TASK_ASSIGNED_TO_USER
* DECISION_APPLIES_TO_CASE
* ENTITY_LINKED_TO_ENTITY

---

## Recommended Architecture

### Frontend

* Next.js
* TypeScript
* Tailwind
* React Query
* Zustand
* Cytoscape.js for graph visualization
* Mapbox or deck.gl for geospatial later

### Backend

* FastAPI
* Python 3.12
* SQLAlchemy
* Alembic
* Pydantic
* Celery or Temporal for async jobs

### Datastores

* PostgreSQL for operational truth
* Neo4j for graph traversal and visual exploration
* OpenSearch for keyword search
* pgvector for semantic retrieval in early versions
* S3-compatible object storage for evidence/documents
* Redis for caching and queues

### AI layer

* Extraction service for entities, dates, amounts, IDs, addresses
* Summarization service for cases and evidence
* Link suggestion service
* Next-action recommendation service
* Report drafting service

### Governance and auth

* Keycloak / Auth0 / Clerk
* RBAC + ABAC policy enforcement
* Immutable audit events
* Approval gates for sensitive actions

---

## Service Breakdown

### 1. API Gateway / App Server

Responsibilities:

* auth/session handling
* REST endpoints
* orchestration
* permission checks

### 2. Ingestion Service

Responsibilities:

* accept uploads
* parse CSV/PDF/email/documents
* create source records
* push normalized records to pipeline

### 3. Entity Resolution Service

Responsibilities:

* similarity matching
* dedupe suggestions
* merge workflows
* confidence scoring

### 4. Graph Service

Responsibilities:

* sync operational entities to graph
* traverse links
* calculate neighborhoods/path queries

### 5. Search Service

Responsibilities:

* index structured/unstructured records
* keyword + semantic search
* filtering and facets

### 6. Case Service

Responsibilities:

* create/update cases
* manage evidence, tasks, notes, assignments
* maintain case state machine

### 7. Rules / Alerting Service

Responsibilities:

* scoring
* escalation rules
* alert generation
* recommended next action templates

### 8. AI Assist Service

Responsibilities:

* extraction
* summarization
* narrative report drafting
* link suggestions
* reasoning with citations to internal evidence

### 9. Audit / Governance Service

Responsibilities:

* append-only action log
* approval workflows
* export audit bundles

---

## v1 Screen Map

### 1. Login

* auth
* tenant selection if multi-tenant

### 2. Global Search

* search bar
* facets
* entity/doc/case results

### 3. Case Queue

* sortable queue of cases
* status, assignee, risk score, updated time

### 4. Case Detail

* summary
* entities involved
* evidence panel
* timeline
* tasks
* notes
* decision buttons

### 5. Entity Profile

* identifiers
* source records
* connected entities
* risk flags
* linked cases

### 6. Graph View

* neighborhood graph
* filters by entity/edge types
* expand neighbors
* highlight suspicious paths

### 7. Timeline View

* events ordered chronologically
* filter by source/type/entity

### 8. Evidence Viewer

* original files
* extracted fields
* document snippets
* provenance

### 9. Admin / Policy

* users/roles
* action policies
* integration settings

### 10. Audit Explorer

* view access logs and decisions
* export audit package

---

## v1 Case State Machine

* New
* Triage
* Active Investigation
* Awaiting Evidence
* Pending Approval
* Closed - Confirmed
* Closed - Unsubstantiated
* Escalated

---

## v1 Sensitive Actions

All require policy checks and audit logging.

* merge entities
* close case
* escalate case
* export report
* freeze/flag external account
* send external notification
* reassign case
* delete evidence reference (soft delete only)

---

## Example PostgreSQL Tables

* tenants
* users
* roles
* permissions
* cases
* case_entities
* case_notes
* case_tasks
* alerts
* entities
* entity_aliases
* entity_identifiers
* entity_relationships
* evidence
* documents
* document_chunks
* source_records
* ingestion_jobs
* decisions
* action_logs
* approvals
* tags
* comments

---

## Example Graph Mapping

### Nodes

* Person
* Organization
* Account
* Device
* Location
* Case
* Document
* Event

### Edges

* USED
* OWNS
* WORKS_FOR
* LOCATED_AT
* SENT
* RECEIVED
* REFERENCED_IN
* RELATED_TO_CASE
* OBSERVED_AT

---

## API Surface v1

### Auth

* POST /auth/login
* GET /auth/me

### Cases

* GET /cases
* POST /cases
* GET /cases/{id}
* PATCH /cases/{id}
* POST /cases/{id}/notes
* POST /cases/{id}/tasks
* POST /cases/{id}/evidence
* POST /cases/{id}/decision

### Entities

* GET /entities
* GET /entities/{id}
* POST /entities/merge-suggest
* POST /entities/{id}/merge
* GET /entities/{id}/neighbors
* GET /entities/{id}/timeline

### Search

* GET /search?q=
* POST /search/semantic

### Ingestion

* POST /ingestion/upload
* GET /ingestion/jobs/{id}

### Alerts

* GET /alerts
* POST /alerts/{id}/create-case

### Audit

* GET /audit/actions
* GET /audit/cases/{id}

---

## Recommended Repo Layout

```text
investigations-os/
  apps/
    web/
      src/
        app/
        components/
        features/
          auth/
          search/
          cases/
          entities/
          graph/
          timeline/
          evidence/
          admin/
        lib/
        hooks/
    api/
      app/
        api/
        core/
        models/
        schemas/
        services/
          auth/
          cases/
          entities/
          search/
          ingestion/
          graph/
          ai/
          audit/
          alerts/
        workflows/
        db/
        tests/
  packages/
    shared-types/
    ui/
    config/
  infra/
    docker/
    terraform/
    k8s/
  docs/
    product/
    architecture/
    api/
```

---

## v1 Delivery Sequence

### Sprint 1

* auth
* tenants/users/roles
* case CRUD
* entity CRUD
* file upload
* audit logging foundation

### Sprint 2

* search
* evidence ingestion
* timeline
* case detail screen
* entity profile screen

### Sprint 3

* graph sync + graph UI
* merge suggestions
* rule-based alerts
* case tasks and notes

### Sprint 4

* AI extraction
* AI summaries
* recommended actions
* exportable reports
* approval flow

---

## v1 Non-Negotiables

* provenance on every extracted fact
* every sensitive action logged
* human-in-the-loop approvals
* strong permissions model
* search that works across docs and structured records
* entity resolution confidence shown to users

---

## What We Explicitly Ignore in v1

* real-time battlefield/sensor fusion
* advanced geospatial intelligence
* cross-border classified network patterns
* multi-agency federation
* custom on-prem edge deployments
* fully autonomous AI actions

---

## What Makes This Defensible

* operational ontology
* investigation workflow depth
* provenance and governance
* graph + search combined
* actionability, not just visualization
* domain packaging for a painful workflow

---

## Powerhouse Integration Value

This should become the **truth layer** for Powerhouse AI:

* agents query real cases and entities instead of loose text blobs
* recommendations become grounded in evidence
* actions require policy and approval
* audit trail enables trust with enterprise customers

---

## Immediate Next Build

Generate next:

1. SQL schema for v1
2. FastAPI backend skeleton
3. Next.js frontend skeleton
4. sample investigation dataset
5. system prompts for AI investigator assist
