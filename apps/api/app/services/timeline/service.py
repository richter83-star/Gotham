from typing import List, Any
import uuid
from sqlalchemy.orm import Session
from app.models.audit import ActionLog
from app.models.case import CaseNote

def get_entity_timeline(db: Session, entity_id: uuid.UUID) -> List[Any]:
    """
    Retrieve all actions related to an entity, ordered by time.
    """
    # Simplified: Find logs where resource_id matches entity_id
    logs = db.query(ActionLog).filter(
        ActionLog.resource_id == entity_id
    ).order_by(ActionLog.created_at.desc()).all()
    
    events = []
    for log in logs:
        events.append({
            "id": log.id,
            "timestamp": log.created_at,
            "type": log.action,
            "description": f"Action {log.action} performed by user {log.user_id}",
            "resource_type": log.resource_type
        })
        
    return events

def get_case_timeline(db: Session, case_id: uuid.UUID) -> List[Any]:
    """
    Combine case notes and audit logs into a single timeline.
    """
    logs = db.query(ActionLog).filter(
        ActionLog.resource_id == case_id
    ).all()
    
    notes = db.query(CaseNote).filter(
        CaseNote.case_id == case_id
    ).all()
    
    # Merge and sort
    combined = []
    for log in logs:
        combined.append({
            "timestamp": log.created_at,
            "type": "ACTION",
            "content": log.action
        })
    for note in notes:
        combined.append({
            "timestamp": note.created_at,
            "type": "NOTE",
            "content": note.content
        })
        
    combined.sort(key=lambda x: x["timestamp"], reverse=True)
    return combined
