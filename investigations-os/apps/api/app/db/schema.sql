-- =============================================================
-- CaseGraph v1 — PostgreSQL Schema
-- =============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";       -- pgvector for semantic search

-- =============================================================
-- TENANTS & USERS
-- =============================================================

CREATE TABLE tenants (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    settings    JSONB NOT NULL DEFAULT '{}',
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,  -- analyst, senior_investigator, case_manager, admin, auditor
    permissions JSONB NOT NULL DEFAULT '[]',
    is_system   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, name)
);

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    external_id     TEXT,                        -- Auth0 / Clerk sub
    email           TEXT NOT NULL,
    display_name    TEXT NOT NULL,
    role_id         UUID NOT NULL REFERENCES roles(id),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, email)
);

CREATE TABLE permissions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role_id     UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    resource    TEXT NOT NULL,    -- e.g. "case", "entity", "audit"
    action      TEXT NOT NULL,    -- e.g. "read", "write", "delete", "approve"
    conditions  JSONB DEFAULT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (role_id, resource, action)
);

-- =============================================================
-- CASES
-- =============================================================

CREATE TYPE case_status AS ENUM (
    'new',
    'triage',
    'active_investigation',
    'awaiting_evidence',
    'pending_approval',
    'closed_confirmed',
    'closed_unsubstantiated',
    'escalated'
);

CREATE TYPE case_priority AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE cases (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    case_number     TEXT NOT NULL,               -- human-readable e.g. CG-2024-00042
    title           TEXT NOT NULL,
    description     TEXT,
    status          case_status NOT NULL DEFAULT 'new',
    priority        case_priority NOT NULL DEFAULT 'medium',
    risk_score      NUMERIC(5,2),
    assigned_to     UUID REFERENCES users(id),
    created_by      UUID NOT NULL REFERENCES users(id),
    closed_at       TIMESTAMPTZ,
    closed_reason   TEXT,
    tags            TEXT[] NOT NULL DEFAULT '{}',
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, case_number)
);

CREATE TABLE case_notes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id     UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    author_id   UUID NOT NULL REFERENCES users(id),
    body        TEXT NOT NULL,
    is_pinned   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE case_tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id         UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    created_by      UUID NOT NULL REFERENCES users(id),
    assigned_to     UUID REFERENCES users(id),
    title           TEXT NOT NULL,
    description     TEXT,
    status          TEXT NOT NULL DEFAULT 'open',  -- open, in_progress, done, cancelled
    due_date        TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- ENTITIES
-- =============================================================

CREATE TYPE entity_type AS ENUM (
    'person',
    'organization',
    'account',
    'device',
    'location',
    'document',
    'event',
    'transaction'
);

CREATE TABLE entities (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entity_type     entity_type NOT NULL,
    canonical_name  TEXT NOT NULL,
    risk_score      NUMERIC(5,2),
    is_flagged      BOOLEAN NOT NULL DEFAULT FALSE,
    is_frozen       BOOLEAN NOT NULL DEFAULT FALSE,
    merged_into     UUID REFERENCES entities(id),  -- null = canonical record
    graph_node_id   TEXT,                           -- Neo4j node element id
    metadata        JSONB NOT NULL DEFAULT '{}',
    tags            TEXT[] NOT NULL DEFAULT '{}',
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE entity_aliases (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id   UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    alias       TEXT NOT NULL,
    source      TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE entity_identifiers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id       UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    id_type         TEXT NOT NULL,     -- ssn, passport, iban, ip_address, mac_address, phone, email, etc.
    id_value        TEXT NOT NULL,
    source          TEXT,
    confidence      NUMERIC(4,3),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (entity_id, id_type, id_value)
);

CREATE TABLE entity_relationships (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    source_entity_id    UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    target_entity_id    UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    relationship_type   TEXT NOT NULL,  -- PERSON_OWNS_ACCOUNT, SENT_TRANSACTION, etc.
    confidence          NUMERIC(4,3),
    valid_from          TIMESTAMPTZ,
    valid_to            TIMESTAMPTZ,
    source_record_id    UUID,
    properties          JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE case_entities (
    case_id     UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    entity_id   UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    role        TEXT,       -- subject, victim, witness, associate, unknown
    added_by    UUID REFERENCES users(id),
    added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (case_id, entity_id)
);

-- =============================================================
-- ALERTS
-- =============================================================

CREATE TABLE alerts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    alert_type      TEXT NOT NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    severity        TEXT NOT NULL DEFAULT 'medium',  -- low, medium, high, critical
    risk_score      NUMERIC(5,2),
    status          TEXT NOT NULL DEFAULT 'open',    -- open, reviewed, dismissed, case_created
    source_system   TEXT,
    raw_payload     JSONB,
    entity_id       UUID REFERENCES entities(id),
    case_id         UUID REFERENCES cases(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- EVIDENCE & DOCUMENTS
-- =============================================================

CREATE TABLE ingestion_jobs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    uploaded_by     UUID NOT NULL REFERENCES users(id),
    file_name       TEXT NOT NULL,
    file_type       TEXT NOT NULL,    -- csv, pdf, email, xlsx, json
    file_size_bytes BIGINT,
    storage_key     TEXT NOT NULL,    -- S3 object key
    status          TEXT NOT NULL DEFAULT 'pending',  -- pending, processing, done, failed
    error_message   TEXT,
    record_count    INT,
    case_id         UUID REFERENCES cases(id),
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE source_records (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    ingestion_job_id UUID REFERENCES ingestion_jobs(id),
    source_name     TEXT NOT NULL,
    source_type     TEXT NOT NULL,
    raw_data        JSONB NOT NULL,
    normalized_data JSONB,
    entity_id       UUID REFERENCES entities(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    ingestion_job_id UUID REFERENCES ingestion_jobs(id),
    title           TEXT,
    file_name       TEXT NOT NULL,
    file_type       TEXT NOT NULL,
    storage_key     TEXT NOT NULL,
    extracted_text  TEXT,
    page_count      INT,
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE document_chunks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index     INT NOT NULL,
    content         TEXT NOT NULL,
    embedding       vector(1536),        -- OpenAI ada-002 / text-embedding-3-small
    page_number     INT,
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE evidence (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    case_id         UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    document_id     UUID REFERENCES documents(id),
    title           TEXT NOT NULL,
    description     TEXT,
    evidence_type   TEXT NOT NULL DEFAULT 'document',  -- document, note, screenshot, log, transaction
    storage_key     TEXT,
    extracted_fields JSONB NOT NULL DEFAULT '{}',
    added_by        UUID NOT NULL REFERENCES users(id),
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,    -- soft delete only
    deleted_by      UUID REFERENCES users(id),
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- DECISIONS & APPROVALS
-- =============================================================

CREATE TYPE decision_type AS ENUM (
    'close_confirmed',
    'close_unsubstantiated',
    'escalate',
    'freeze_account',
    'flag_entity',
    'send_notification',
    'request_more_evidence',
    'reassign',
    'merge_entities',
    'export_report',
    'delete_evidence'
);

CREATE TABLE decisions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    case_id         UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    decision_type   decision_type NOT NULL,
    rationale       TEXT,
    outcome         TEXT,
    decided_by      UUID NOT NULL REFERENCES users(id),
    requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
    approved_by     UUID REFERENCES users(id),
    approved_at     TIMESTAMPTZ,
    rejected_by     UUID REFERENCES users(id),
    rejected_at     TIMESTAMPTZ,
    rejection_reason TEXT,
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE approvals (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    decision_id     UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    requested_by    UUID NOT NULL REFERENCES users(id),
    approver_id     UUID REFERENCES users(id),
    status          TEXT NOT NULL DEFAULT 'pending',  -- pending, approved, rejected, expired
    due_at          TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at     TIMESTAMPTZ
);

-- =============================================================
-- AUDIT / GOVERNANCE
-- =============================================================

CREATE TABLE action_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    actor_id        UUID REFERENCES users(id),
    actor_email     TEXT,                  -- denormalized for audit durability
    action          TEXT NOT NULL,         -- e.g. "case.viewed", "entity.merged", "decision.approved"
    resource_type   TEXT NOT NULL,
    resource_id     UUID,
    before_state    JSONB,
    after_state     JSONB,
    ip_address      INET,
    user_agent      TEXT,
    reason          TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- IMMUTABLE: no update or delete on this table
);

CREATE TABLE tags (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    color       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, name)
);

CREATE TABLE comments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    resource_type   TEXT NOT NULL,   -- case, entity, evidence, alert
    resource_id     UUID NOT NULL,
    author_id       UUID NOT NULL REFERENCES users(id),
    body            TEXT NOT NULL,
    parent_id       UUID REFERENCES comments(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- INDEXES
-- =============================================================

-- Cases
CREATE INDEX idx_cases_tenant_status ON cases(tenant_id, status);
CREATE INDEX idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX idx_cases_tags ON cases USING GIN(tags);

-- Entities
CREATE INDEX idx_entities_tenant_type ON entities(tenant_id, entity_type);
CREATE INDEX idx_entities_canonical_name ON entities(tenant_id, lower(canonical_name));
CREATE INDEX idx_entities_tags ON entities USING GIN(tags);

-- Entity identifiers (fast lookup by value)
CREATE INDEX idx_entity_identifiers_value ON entity_identifiers(id_type, id_value);

-- Entity relationships
CREATE INDEX idx_entity_relationships_source ON entity_relationships(source_entity_id);
CREATE INDEX idx_entity_relationships_target ON entity_relationships(target_entity_id);

-- Alerts
CREATE INDEX idx_alerts_tenant_status ON alerts(tenant_id, status);
CREATE INDEX idx_alerts_severity ON alerts(severity, created_at DESC);

-- Action logs (immutable, append only)
CREATE INDEX idx_action_logs_tenant_created ON action_logs(tenant_id, created_at DESC);
CREATE INDEX idx_action_logs_actor ON action_logs(actor_id, created_at DESC);
CREATE INDEX idx_action_logs_resource ON action_logs(resource_type, resource_id);

-- Document chunks (vector similarity search)
CREATE INDEX idx_document_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- =============================================================
-- TRIGGERS — updated_at
-- =============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cases_updated_at
    BEFORE UPDATE ON cases
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_entities_updated_at
    BEFORE UPDATE ON entities
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_entity_relationships_updated_at
    BEFORE UPDATE ON entity_relationships
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_case_notes_updated_at
    BEFORE UPDATE ON case_notes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_case_tasks_updated_at
    BEFORE UPDATE ON case_tasks
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
