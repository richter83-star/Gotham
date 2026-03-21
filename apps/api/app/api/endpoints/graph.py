from typing import Any, List, Dict
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.services.graph import service
from app.core.audit import audit_action

router = APIRouter()

@router.get("/cases/{id}", response_model=List[Dict[str, Any]])
@audit_action(action="READ_GRAPH", resource_type="CASE")
def read_case_graph(
    *,
    db: Session = Depends(deps.get_db),
    id: uuid.UUID
) -> Any:
    elements = service.get_case_graph(db, case_id=id)
    if not elements:
        raise HTTPException(status_code=404, detail="Case graph not found or case is empty")
    return elements
