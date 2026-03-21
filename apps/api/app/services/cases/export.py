import uuid
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.case import Case

def generate_case_export(db: Session, case_id: uuid.UUID) -> Dict[str, Any]:
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        return {}
    
    export_data = {
        "case_id": str(case.id),
        "title": case.title,
        "status": case.status,
        "priority": case.priority,
        "description": case.description,
        "entities_involved": [
            {
                "id": str(e.id),
                "name": e.display_name,
                "type": e.type,
                "risk_score": e.confidence_score
            } for e in case.entities
        ],
        "governance_disclaimer": "This document contains sensitive material. Do not distribute."
    }
    
    return export_data
