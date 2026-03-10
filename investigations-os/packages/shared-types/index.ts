// =============================================================
// CaseGraph Shared TypeScript Types
// =============================================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// ── Auth ──────────────────────────────────────────────────────

export interface CurrentUser {
  id: string;
  tenant_id: string;
  email: string;
  display_name: string;
  role: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// ── Cases ─────────────────────────────────────────────────────

export type CaseStatus =
  | "new"
  | "triage"
  | "active_investigation"
  | "awaiting_evidence"
  | "pending_approval"
  | "closed_confirmed"
  | "closed_unsubstantiated"
  | "escalated";

export type CasePriority = "low" | "medium" | "high" | "critical";

export interface Case {
  id: string;
  tenant_id: string;
  case_number: string;
  title: string;
  description: string | null;
  status: CaseStatus;
  priority: CasePriority;
  risk_score: number | null;
  assigned_to: string | null;
  created_by: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CaseCreate {
  title: string;
  description?: string;
  priority?: CasePriority;
  tags?: string[];
  assigned_to?: string;
}

export interface CaseUpdate {
  title?: string;
  description?: string;
  status?: CaseStatus;
  priority?: CasePriority;
  assigned_to?: string;
  tags?: string[];
}

export interface CaseNote {
  id: string;
  case_id: string;
  author_id: string;
  body: string;
  is_pinned: boolean;
  created_at: string;
}

export interface CaseTask {
  id: string;
  case_id: string;
  title: string;
  description: string | null;
  status: string;
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
}

// ── Entities ──────────────────────────────────────────────────

export type EntityType =
  | "person"
  | "organization"
  | "account"
  | "device"
  | "location"
  | "document"
  | "event"
  | "transaction";

export interface Entity {
  id: string;
  tenant_id: string;
  entity_type: EntityType;
  canonical_name: string;
  risk_score: number | null;
  is_flagged: boolean;
  is_frozen: boolean;
  tags: string[];
  created_at: string;
}

export interface EntityDetail extends Entity {
  aliases: { alias: string; source: string | null }[];
  identifiers: { id_type: string; id_value: string; confidence: number | null }[];
  metadata: Record<string, unknown>;
}

export interface NeighborResponse {
  entity: Entity;
  relationship_type: string;
  direction: "outgoing" | "incoming";
  confidence: number | null;
}

export interface MergeSuggestion {
  entity_a_id: string;
  entity_b_id: string;
  confidence: number;
  reasons: string[];
}

// ── Evidence ──────────────────────────────────────────────────

export interface Evidence {
  id: string;
  case_id: string;
  title: string;
  description: string | null;
  evidence_type: string;
  added_by: string;
  created_at: string;
}

export interface IngestionJob {
  id: string;
  file_name: string;
  file_type: string;
  status: "pending" | "processing" | "done" | "failed";
  case_id: string | null;
  created_at: string;
}

// ── Search ────────────────────────────────────────────────────

export interface SearchResult {
  kind: "case" | "entity" | "document";
  id: string;
  title: string;
  snippet: string | null;
  score: number | null;
  metadata: Record<string, unknown>;
}

// ── Audit ─────────────────────────────────────────────────────

export interface ActionLog {
  id: string;
  actor_email: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown> | null;
  ip_address: string | null;
  reason: string | null;
  created_at: string;
}

// ── Decisions ─────────────────────────────────────────────────

export type DecisionType =
  | "close_confirmed"
  | "close_unsubstantiated"
  | "escalate"
  | "freeze_account"
  | "flag_entity"
  | "send_notification"
  | "request_more_evidence"
  | "reassign"
  | "merge_entities"
  | "export_report"
  | "delete_evidence";

export interface Decision {
  id: string;
  case_id: string;
  decision_type: DecisionType;
  rationale: string | null;
  decided_by: string;
  requires_approval: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}
