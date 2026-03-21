from typing import Optional, Dict, Any
from pydantic import BaseModel
import uuid

class EntityBase(BaseModel):
    type: str
    display_name: Optional[str] = None
    confidence_score: Optional[float] = 1.0
    metadata_json: Optional[Dict[str, Any]] = None

class EntityCreate(EntityBase):
    pass

class EntityUpdate(BaseModel):
    type: Optional[str] = None
    display_name: Optional[str] = None
    confidence_score: Optional[float] = None
    metadata_json: Optional[Dict[str, Any]] = None

class Entity(EntityBase):
    id: uuid.UUID
    tenant_id: uuid.UUID

    class Config:
        from_attributes = True
