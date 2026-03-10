# ADR-001: Technology Stack Choices for CaseGraph v1

**Status:** Accepted
**Date:** 2024-06-01

## Context

CaseGraph needs to handle: structured case data, graph relationships, full-text + semantic search, file evidence, async processing, and AI-assisted analysis — all with strong audit trails and RBAC.

## Decisions

### PostgreSQL as operational truth
- Handles cases, entities, users, audit logs
- pgvector extension provides semantic similarity without adding another service in v1
- Alembic migrations provide schema versioning
- Considered: MongoDB (rejected: weaker relational guarantees for case-entity links)

### Neo4j for graph traversal
- Cypher queries for multi-hop relationship traversal are far more natural than recursive SQL
- Required for: "show all entities connected within 3 hops", "find shortest path"
- Data is synced from Postgres (Postgres = source of truth, Neo4j = read optimized)
- Considered: Apache AGE (Postgres-native graph extension) — deferred to v2, less mature tooling

### OpenSearch for full-text search
- Required for: searching document content, case notes, entity names across thousands of records
- Faceted search and keyword highlighting needed for investigator UX
- In v1 we layer pgvector for semantic search; OpenSearch handles keyword+structure
- Considered: Typesense (simpler, but less powerful for document-scale search)

### Redis + Celery for async jobs
- File ingestion (PDF parsing, CSV normalization, embedding generation) must not block the API
- Celery with Redis broker is battle-tested for this pattern
- Considered: Temporal — planned for v2 when workflows become more complex

### MinIO for evidence storage
- S3-compatible; runs locally for dev; swap to S3/GCS in production with zero code change
- All evidence files stored with immutable keys (UUID-based)

### FastAPI over Django/Flask
- Async-native for high-throughput API + WebSocket support later
- Pydantic v2 for fast schema validation
- Auto-generated OpenAPI docs critical for team iteration speed

### Next.js App Router
- RSC (React Server Components) for fast initial load of case lists
- Client components for interactive graph/timeline
- Cytoscape.js for graph visualization — proven in network analysis tools

### Anthropic Claude for AI Assist
- Superior at structured extraction and reasoning with citation
- Claude's long context window handles full document ingestion
- Tool use / function calling enables agentic workflows in future sprints

## Consequences

- Two databases to keep in sync (Postgres → Neo4j); graph sync service required
- OpenSearch adds operational overhead; acceptable in v1 given search requirements
- Celery + Redis adds two more services; mitigated by Docker Compose for local dev
