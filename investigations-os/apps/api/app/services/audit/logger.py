from typing import Any
import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import ActionLog


async def audit_log(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    action: str,
    resource_type: str,
    actor_id: uuid.UUID | None = None,
    actor_email: str | None = None,
    resource_id: uuid.UUID | None = None,
    before_state: dict | None = None,
    after_state: dict | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
    reason: str | None = None,
) -> ActionLog:
    log = ActionLog(
        tenant_id=tenant_id,
        actor_id=actor_id,
        actor_email=actor_email,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        before_state=before_state,
        after_state=after_state,
        ip_address=ip_address,
        user_agent=user_agent,
        reason=reason,
    )
    db.add(log)
    # Do not flush here — caller controls transaction boundaries
    return log
