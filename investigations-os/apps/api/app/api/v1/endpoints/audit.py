import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.db.database import get_db
from app.models.audit import ActionLog
from app.models.user import User
from app.api.v1.deps import get_current_user, require_roles
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/audit", tags=["audit"])


class ActionLogResponse(BaseModel):
    id: uuid.UUID
    actor_email: Optional[str]
    action: str
    resource_type: str
    resource_id: Optional[uuid.UUID]
    before_state: Optional[dict]
    after_state: Optional[dict]
    ip_address: Optional[str]
    reason: Optional[str]
    created_at: str

    model_config = {"from_attributes": True}


@router.get(
    "/actions",
    response_model=PaginatedResponse[ActionLogResponse],
    dependencies=[Depends(require_roles("admin", "auditor", "case_manager"))],
)
async def list_actions(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    action: str | None = None,
    resource_type: str | None = None,
    actor_id: uuid.UUID | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(ActionLog).where(ActionLog.tenant_id == current_user.tenant_id)
    if action:
        q = q.where(ActionLog.action == action)
    if resource_type:
        q = q.where(ActionLog.resource_type == resource_type)
    if actor_id:
        q = q.where(ActionLog.actor_id == actor_id)

    total_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_result.scalar_one()

    q = q.order_by(ActionLog.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    logs = result.scalars().all()

    return PaginatedResponse(
        items=logs,
        total=total,
        page=page,
        page_size=page_size,
        pages=(total + page_size - 1) // page_size,
    )


@router.get(
    "/cases/{case_id}",
    response_model=list[ActionLogResponse],
    dependencies=[Depends(require_roles("admin", "auditor", "case_manager", "senior_investigator"))],
)
async def get_case_audit(
    case_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ActionLog)
        .where(
            ActionLog.tenant_id == current_user.tenant_id,
            ActionLog.resource_type == "case",
            ActionLog.resource_id == case_id,
        )
        .order_by(ActionLog.created_at.desc())
    )
    return result.scalars().all()
