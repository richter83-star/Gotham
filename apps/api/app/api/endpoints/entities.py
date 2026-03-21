from typing import Any, List
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.entity import Entity, EntityCreate, EntityUpdate
from app.services.entities import crud
from app.core.audit import audit_action

router = APIRouter()

@router.get("/", response_model=List[Entity])
def read_entities(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    tenant_id = uuid.UUID("00000000-0000-0000-0000-000000000000")
    entities = crud.get_entities(db, tenant_id=tenant_id, skip=skip, limit=limit)
    return entities

@router.post("/", response_model=Entity)
@audit_action(action="CREATE_ENTITY", resource_type="ENTITY")
async def create_entity(
    *,
    db: Session = Depends(deps.get_db),
    entity_in: EntityCreate,
    current_user: Any = Depends(deps.get_db) # Placeholder for auth
) -> Any:
    tenant_id = uuid.UUID("00000000-0000-0000-0000-000000000000")
    entity = crud.create_entity(db, obj_in=entity_in, tenant_id=tenant_id)
    return entity

@router.get("/{id}/timeline")
def read_entity_timeline(
    *,
    db: Session = Depends(deps.get_db),
    id: uuid.UUID
) -> Any:
    from app.services.timeline import service as timeline_service
    events = timeline_service.get_entity_timeline(db, entity_id=id)
    return events

@router.get("/{id}/merge-suggestions", response_model=List[Entity])
def read_merge_suggestions(
    *,
    db: Session = Depends(deps.get_db),
    id: uuid.UUID
) -> Any:
    from app.services.entities import resolution
    suggestions = resolution.get_merge_suggestions(db, entity_id=id)
    return suggestions
