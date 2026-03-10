from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


class CaseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    tags: list[str] = []
    assigned_to: Optional[uuid.UUID] = None


class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[uuid.UUID] = None
    tags: Optional[list[str]] = None


class CaseResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    case_number: str
    title: str
    description: Optional[str]
    status: str
    priority: str
    risk_score: Optional[float]
    assigned_to: Optional[uuid.UUID]
    created_by: uuid.UUID
    tags: list[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class NoteCreate(BaseModel):
    body: str
    is_pinned: bool = False


class NoteResponse(BaseModel):
    id: uuid.UUID
    case_id: uuid.UUID
    author_id: uuid.UUID
    body: str
    is_pinned: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: Optional[uuid.UUID] = None
    due_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    id: uuid.UUID
    case_id: uuid.UUID
    title: str
    description: Optional[str]
    status: str
    assigned_to: Optional[uuid.UUID]
    due_date: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


class DecisionCreate(BaseModel):
    decision_type: str
    rationale: Optional[str] = None
    requires_approval: bool = False


class DecisionResponse(BaseModel):
    id: uuid.UUID
    case_id: uuid.UUID
    decision_type: str
    rationale: Optional[str]
    decided_by: uuid.UUID
    requires_approval: bool
    approved_by: Optional[uuid.UUID]
    approved_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


class EvidenceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    evidence_type: str = "document"
    document_id: Optional[uuid.UUID] = None


class EvidenceResponse(BaseModel):
    id: uuid.UUID
    case_id: uuid.UUID
    title: str
    description: Optional[str]
    evidence_type: str
    added_by: uuid.UUID
    created_at: str

    model_config = {"from_attributes": True}
