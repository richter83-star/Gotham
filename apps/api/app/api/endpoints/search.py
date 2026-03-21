from typing import Any, List
import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.services.search import service

router = APIRouter()

@router.get("/")
def search(
    *,
    db: Session = Depends(deps.get_db),
    q: str = Query(..., min_length=2),
    limit: int = 20
) -> Any:
    # Placeholder for current_user tenant_id
    tenant_id = uuid.UUID("00000000-0000-0000-0000-000000000000")
    results = service.search_global(db, tenant_id=tenant_id, query=q, limit=limit)
    return results
