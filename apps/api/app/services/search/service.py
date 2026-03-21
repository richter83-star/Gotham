from typing import List, Any
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.case import Case
from app.models.entity import Entity

def search_global(db: Session, tenant_id: uuid.UUID, query: str, limit: int = 20) -> List[Any]:
    """
    Search across cases and entities using ILIKE for basic keyword matching.
    """
    search_term = f"%{query}%"
    
    # Search Cases
    cases = db.query(Case).filter(
        Case.tenant_id == tenant_id,
        or_(
            Case.title.ilike(search_term),
            Case.description.ilike(search_term)
        )
    ).limit(limit).all()
    
    # Search Entities
    entities = db.query(Entity).filter(
        Entity.tenant_id == tenant_id,
        or_(
            Entity.display_name.ilike(search_term),
            Entity.type.ilike(search_term)
        )
    ).limit(limit).all()
    
    # Combine and return (simplified)
    results = []
    for c in cases:
        results.append({"id": c.id, "type": "CASE", "title": c.title, "description": c.description})
    for e in entities:
        results.append({"id": e.id, "type": "ENTITY", "title": e.display_name, "description": e.type})
        
    return results
