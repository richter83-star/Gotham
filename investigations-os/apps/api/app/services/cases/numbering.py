import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.case import Case


async def generate_case_number(db: AsyncSession, tenant_id: uuid.UUID) -> str:
    """Generate a sequential case number like CG-2024-00042."""
    year = datetime.now(timezone.utc).year
    result = await db.execute(
        select(func.count(Case.id)).where(
            Case.tenant_id == tenant_id,
            func.extract("year", Case.created_at) == year,
        )
    )
    count = result.scalar_one() + 1
    return f"CG-{year}-{count:05d}"
