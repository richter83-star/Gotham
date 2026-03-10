from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from pydantic import BaseModel
from typing import Any

from app.db.database import get_db
from app.models.case import Case
from app.models.entity import Entity
from app.models.user import User
from app.api.v1.deps import get_current_user

router = APIRouter(prefix="/search", tags=["search"])


class SearchResult(BaseModel):
    kind: str  # "case" | "entity" | "document"
    id: str
    title: str
    snippet: str | None
    score: float | None
    metadata: dict = {}


class SemanticSearchRequest(BaseModel):
    query: str
    top_k: int = 10
    filters: dict[str, Any] = {}


@router.get("", response_model=list[SearchResult])
async def keyword_search(
    q: str = Query(..., min_length=1),
    kinds: list[str] = Query(default=["case", "entity"]),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    results: list[SearchResult] = []

    if "case" in kinds:
        stmt = (
            select(Case)
            .where(
                Case.tenant_id == current_user.tenant_id,
                or_(
                    Case.title.ilike(f"%{q}%"),
                    Case.description.ilike(f"%{q}%"),
                    Case.case_number.ilike(f"%{q}%"),
                ),
            )
            .limit(limit)
        )
        case_rows = (await db.execute(stmt)).scalars().all()
        for c in case_rows:
            results.append(
                SearchResult(
                    kind="case",
                    id=str(c.id),
                    title=c.title,
                    snippet=c.description[:200] if c.description else None,
                    score=None,
                    metadata={"case_number": c.case_number, "status": c.status},
                )
            )

    if "entity" in kinds:
        stmt = (
            select(Entity)
            .where(
                Entity.tenant_id == current_user.tenant_id,
                Entity.merged_into.is_(None),
                Entity.canonical_name.ilike(f"%{q}%"),
            )
            .limit(limit)
        )
        entity_rows = (await db.execute(stmt)).scalars().all()
        for e in entity_rows:
            results.append(
                SearchResult(
                    kind="entity",
                    id=str(e.id),
                    title=e.canonical_name,
                    snippet=None,
                    score=None,
                    metadata={"entity_type": e.entity_type, "is_flagged": e.is_flagged},
                )
            )

    return results[:limit]


@router.post("/semantic", response_model=list[SearchResult])
async def semantic_search(
    payload: SemanticSearchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Semantic search using pgvector embeddings on document_chunks.
    Requires the AI service to embed the query first.
    Full implementation wires into the AI assist service for embedding + similarity search.
    """
    # Placeholder — full implementation in Sprint 2
    return []
