from __future__ import annotations
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid


class EntityCreate(BaseModel):
    entity_type: str
    canonical_name: str
    tags: list[str] = []
    metadata: dict = {}


class EntityUpdate(BaseModel):
    canonical_name: Optional[str] = None
    tags: Optional[list[str]] = None
    metadata: Optional[dict] = None
    is_flagged: Optional[bool] = None


class EntityIdentifierCreate(BaseModel):
    id_type: str
    id_value: str
    source: Optional[str] = None
    confidence: Optional[float] = None


class EntityResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    entity_type: str
    canonical_name: str
    risk_score: Optional[float]
    is_flagged: bool
    is_frozen: bool
    tags: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class EntityDetailResponse(EntityResponse):
    aliases: list[dict] = []
    identifiers: list[dict] = []
    metadata: dict = {}


class MergeSuggestion(BaseModel):
    entity_a_id: uuid.UUID
    entity_b_id: uuid.UUID
    confidence: float
    reasons: list[str]


class MergeRequest(BaseModel):
    target_entity_id: uuid.UUID  # entity to merge INTO (canonical survives)
    rationale: Optional[str] = None


class NeighborResponse(BaseModel):
    entity: EntityResponse
    relationship_type: str
    direction: str  # "outgoing" | "incoming"
    confidence: Optional[float]


class TimelineEvent(BaseModel):
    timestamp: datetime
    event_type: str
    description: str
    source: Optional[str]
    entity_ids: list[uuid.UUID] = []
