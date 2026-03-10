# CaseGraph — Investigations OS v1

A decision system for investigations: ingest messy data, resolve entities, investigate cases, collaborate, and take governed actions.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, React Query, Zustand, Cytoscape.js |
| Backend | FastAPI, Python 3.12, SQLAlchemy, Alembic, Pydantic |
| Graph DB | Neo4j |
| Search | OpenSearch |
| Vector | pgvector |
| Queue | Redis + Celery |
| Storage | S3-compatible (MinIO for local) |
| Auth | Clerk / Auth0 (pluggable) |

## Quick Start

```bash
# Backend
cd apps/api
cp .env.example .env
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd apps/web
cp .env.local.example .env.local
npm install
npm run dev
```

## Services

```
investigations-os/
  apps/
    web/          Next.js frontend
    api/          FastAPI backend
  packages/
    shared-types/ Shared TypeScript types
    ui/           Shared UI components
    config/       Shared config (ESLint, TSConfig)
  infra/
    docker/       Docker Compose for local dev
    terraform/    Cloud infra (AWS/GCP)
    k8s/          Kubernetes manifests
  docs/
    product/      Product specs
    architecture/ Architecture decision records
    api/          OpenAPI docs
```

## User Roles

- **Analyst** — Read cases, create notes, search entities
- **Senior Investigator** — All analyst actions + close/escalate cases, merge entities
- **Case Manager** — All investigator actions + assign cases, manage team tasks
- **Admin** — Full access including user/role management, policy configuration
- **Auditor** — Read-only access to all audit logs and exported reports

## Case State Machine

```
New → Triage → Active Investigation → Awaiting Evidence → Pending Approval
                                                               ↓
                                         Closed (Confirmed) / Closed (Unsubstantiated) / Escalated
```
