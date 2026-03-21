import uuid
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.case import Case
from app.models.entity import Entity, EntityRelationship

def get_case_graph(db: Session, case_id: uuid.UUID) -> List[Dict[str, Any]]:
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        return []

    elements = []
    
    # Add Case Node
    elements.append({
        "data": {
            "id": str(case.id),
            "label": case.title,
            "type": "Case"
        }
    })

    # Add Entity Nodes and Case-Entity Edges
    entity_ids = []
    for entity in case.entities:
        entity_ids.append(entity.id)
        elements.append({
            "data": {
                "id": str(entity.id),
                "label": entity.display_name or "Unknown Entity",
                "type": entity.type
            }
        })
        elements.append({
            "data": {
                "id": f"edge_{case.id}_{entity.id}",
                "source": str(entity.id),
                "target": str(case.id),
                "label": "INVOLVED_IN"
            }
        })

    # Fetch Relationships between these entities
    if entity_ids:
        rels = db.query(EntityRelationship).filter(
            or_(
                EntityRelationship.source_id.in_(entity_ids),
                EntityRelationship.target_id.in_(entity_ids)
            )
        ).all()
        
        # Also need to make sure we include any external entities that are linked
        # to case entities, to show the immediate neighborhood
        external_ids = set()
        for rel in rels:
            if rel.source_id not in entity_ids:
                external_ids.add(rel.source_id)
            if rel.target_id not in entity_ids:
                external_ids.add(rel.target_id)
                
        if external_ids:
            external_entities = db.query(Entity).filter(Entity.id.in_(external_ids)).all()
            for entity in external_entities:
                elements.append({
                    "data": {
                        "id": str(entity.id),
                        "label": entity.display_name or "Unknown Entity",
                        "type": entity.type
                    }
                })
        
        for rel in rels:
            elements.append({
                "data": {
                    "id": str(rel.id),
                    "source": str(rel.source_id),
                    "target": str(rel.target_id),
                    "label": rel.type
                }
            })

    return elements
