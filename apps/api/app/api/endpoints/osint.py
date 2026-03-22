from typing import Any, List
import uuid
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.api import deps
from app.worker.tasks import osint_discovery_task
from app.models.entity import Entity

router = APIRouter()

@router.post("/scout/{entity_id}", response_model=Dict[str, Any])
def trigger_osint_scout(
    *,
    db: Session = Depends(deps.get_db),
    entity_id: uuid.UUID
) -> Any:
    """
    Trigger a background OSINT scout for a specific entity.
    """
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
        
    task = osint_discovery_task.delay(str(entity_id))
    
    return {
        "status": "QUEUED",
        "task_id": task.id,
        "message": f"OSINT Scout initialized for {entity.display_name}"
    }

@router.get("/results/{entity_id}", response_model=List[Any])
def get_discovery_results(
    *,
    db: Session = Depends(deps.get_db),
    entity_id: uuid.UUID
) -> Any:
    """
    Get all discovery results (OSINT matches) for an entity.
    """
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
        
    return entity.discovery_records
