from typing import Optional
from pydantic import BaseModel
import uuid

class CaseBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "MEDIUM"

class CaseCreate(CaseBase):
    pass

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee_id: Optional[uuid.UUID] = None

class Case(CaseBase):
    id: uuid.UUID
    status: str
    tenant_id: uuid.UUID

    class Config:
        from_attributes = True
