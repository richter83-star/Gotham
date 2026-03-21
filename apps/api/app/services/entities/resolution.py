import uuid
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.entity import Entity

def get_merge_suggestions(db: Session, entity_id: uuid.UUID) -> List[Entity]:
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity or not entity.display_name:
        return []
    
    # Simplified string matching for duplicate detection
    words = entity.display_name.split()
    conditions = [Entity.display_name.ilike(f"%{word}%") for word in words if len(word) > 2]
    
    if not conditions:
        return []

    suggestions = db.query(Entity).filter(
        Entity.tenant_id == entity.tenant_id,
        Entity.type == entity.type,
        Entity.id != entity.id,
        or_(*conditions)
    ).limit(5).all()

    return suggestions
