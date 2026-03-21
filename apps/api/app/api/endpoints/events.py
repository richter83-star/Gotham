import uuid
from typing import Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.services.rules.evaluator import evaluate_event_stream

router = APIRouter()

@router.post("/stream")
def ingest_event_stream(
    *,
    db: Session = Depends(deps.get_db),
    tenant_id: uuid.UUID,
    payload: Dict[str, Any]
) -> Any:
    """
    Ingest a real-time event from an external system.
    Evaluates active rules instantly to detect specific topologies or anomalies.
    """
    triggered_rules = evaluate_event_stream(db, str(tenant_id), payload)
    
    # Returning the triggered rules for now. Next we'll write the Alert generation.
    return {
        "status": "processed",
        "triggered_rules_count": len(triggered_rules),
        "triggered_rules": [{"id": str(r.id), "name": r.name, "severity": r.severity} for r in triggered_rules]
    }
