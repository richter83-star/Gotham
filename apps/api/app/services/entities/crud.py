from typing import List, Optional
import uuid
from sqlalchemy.orm import Session
from app.models.entity import Entity
from app.schemas.entity import EntityCreate, EntityUpdate

def get_entities(db: Session, tenant_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Entity]:
    return db.query(Entity).filter(Entity.tenant_id == tenant_id).offset(skip).limit(limit).all()

def get_entity(db: Session, entity_id: uuid.UUID) -> Optional[Entity]:
    return db.query(Entity).filter(Entity.id == entity_id).first()

def create_entity(db: Session, obj_in: EntityCreate, tenant_id: uuid.UUID) -> Entity:
    db_obj = Entity(
        type=obj_in.type,
        display_name=obj_in.display_name,
        confidence_score=obj_in.confidence_score,
        metadata_json=obj_in.metadata_json,
        tenant_id=tenant_id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_entity(db: Session, db_obj: Entity, obj_in: EntityUpdate) -> Entity:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field in update_data:
        setattr(db_obj, field, update_data[field])
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
