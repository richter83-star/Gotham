import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.db.database import get_db
from app.models.user import User
from app.api.v1.deps import get_current_user
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/alerts", tags=["alerts"])


class AlertResponse(BaseModel):
    id: uuid.UUID
    alert_type: str
    title: str
    severity: str
    status: str
    risk_score: Optional[float]
    entity_id: Optional[uuid.UUID]
    case_id: Optional[uuid.UUID]
    created_at: datetime

    model_config = {"from_attributes": True}


class CreateCaseFromAlertResponse(BaseModel):
    case_id: uuid.UUID
    case_number: str


@router.get("", response_model=PaginatedResponse[AlertResponse])
async def list_alerts(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    alert_status: str | None = None,
    severity: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.audit import Decision  # avoid circular
    # Import Alert model inline
    from sqlalchemy import Table, MetaData
    # Use raw model approach
    from app.db.database import Base
    # Returning empty until Alert model is fully wired
    return PaginatedResponse(items=[], total=0, page=page, page_size=page_size, pages=0)


@router.post("/{alert_id}/create-case", response_model=CreateCaseFromAlertResponse)
async def create_case_from_alert(
    alert_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Promote an alert to a full case."""
    # Full implementation wires Alert model → creates Case → links Alert
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Sprint 3 feature")
