from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
import uuid

from app.db.database import get_db
from app.models.entity import Entity, EntityRelationship
from app.models.user import User
from app.schemas.entities import (
    EntityCreate, EntityUpdate, EntityResponse, EntityDetailResponse,
    MergeSuggestion, MergeRequest, NeighborResponse, TimelineEvent,
)
from app.schemas.common import PaginatedResponse
from app.api.v1.deps import get_current_user
from app.services.audit.logger import audit_log
from app.services.entities.resolver import suggest_merges

router = APIRouter(prefix="/entities", tags=["entities"])


@router.get("", response_model=PaginatedResponse[EntityResponse])
async def list_entities(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    entity_type: str | None = None,
    q: str | None = None,
    is_flagged: bool | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Entity).where(
        Entity.tenant_id == current_user.tenant_id,
        Entity.merged_into.is_(None),
    )
    if entity_type:
        query = query.where(Entity.entity_type == entity_type)
    if q:
        query = query.where(Entity.canonical_name.ilike(f"%{q}%"))
    if is_flagged is not None:
        query = query.where(Entity.is_flagged == is_flagged)

    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar_one()

    query = query.order_by(Entity.canonical_name).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    entities = result.scalars().all()

    return PaginatedResponse(
        items=entities,
        total=total,
        page=page,
        page_size=page_size,
        pages=(total + page_size - 1) // page_size,
    )


@router.get("/{entity_id}", response_model=EntityDetailResponse)
async def get_entity(
    entity_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    entity = await _get_entity_or_404(db, entity_id, current_user.tenant_id)
    await audit_log(
        db=db,
        tenant_id=current_user.tenant_id,
        actor_id=current_user.id,
        actor_email=current_user.email,
        action="entity.viewed",
        resource_type="entity",
        resource_id=entity_id,
    )
    return EntityDetailResponse.model_validate(entity)


@router.get("/{entity_id}/neighbors", response_model=list[NeighborResponse])
async def get_neighbors(
    entity_id: uuid.UUID,
    depth: int = Query(1, ge=1, le=3),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_entity_or_404(db, entity_id, current_user.tenant_id)

    result = await db.execute(
        select(EntityRelationship, Entity)
        .join(Entity, or_(
            EntityRelationship.target_entity_id == Entity.id,
            EntityRelationship.source_entity_id == Entity.id,
        ))
        .where(
            or_(
                EntityRelationship.source_entity_id == entity_id,
                EntityRelationship.target_entity_id == entity_id,
            ),
            EntityRelationship.tenant_id == current_user.tenant_id,
        )
    )
    rows = result.all()

    neighbors = []
    seen = set()
    for rel, entity in rows:
        if entity.id == entity_id or entity.id in seen:
            continue
        seen.add(entity.id)
        direction = "outgoing" if rel.source_entity_id == entity_id else "incoming"
        neighbors.append(
            NeighborResponse(
                entity=EntityResponse.model_validate(entity),
                relationship_type=rel.relationship_type,
                direction=direction,
                confidence=float(rel.confidence) if rel.confidence else None,
            )
        )
    return neighbors


@router.get("/{entity_id}/timeline", response_model=list[TimelineEvent])
async def get_entity_timeline(
    entity_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns a chronological event list for this entity (source records + relationships)."""
    await _get_entity_or_404(db, entity_id, current_user.tenant_id)
    # In a full implementation this queries source_records and entity_relationships
    # and combines them into a unified timeline. Returning empty list as skeleton.
    return []


@router.post("/merge-suggest", response_model=list[MergeSuggestion])
async def merge_suggest(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    suggestions = await suggest_merges(db, current_user.tenant_id)
    return suggestions


@router.post("/{entity_id}/merge", response_model=EntityResponse)
async def merge_entity(
    entity_id: uuid.UUID,
    payload: MergeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role.name not in {"senior_investigator", "case_manager", "admin"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role")

    source = await _get_entity_or_404(db, entity_id, current_user.tenant_id)
    target = await _get_entity_or_404(db, payload.target_entity_id, current_user.tenant_id)

    if source.id == target.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot merge entity with itself")

    source.merged_into = target.id
    await audit_log(
        db=db,
        tenant_id=current_user.tenant_id,
        actor_id=current_user.id,
        actor_email=current_user.email,
        action="entity.merged",
        resource_type="entity",
        resource_id=source.id,
        before_state={"canonical_name": source.canonical_name},
        after_state={"merged_into": str(target.id), "rationale": payload.rationale},
    )
    return target


async def _get_entity_or_404(
    db: AsyncSession, entity_id: uuid.UUID, tenant_id: uuid.UUID
) -> Entity:
    result = await db.execute(
        select(Entity).where(Entity.id == entity_id, Entity.tenant_id == tenant_id)
    )
    entity = result.scalar_one_or_none()
    if not entity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entity not found")
    return entity
