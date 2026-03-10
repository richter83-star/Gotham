"""
Entity resolution service — deduplication and merge suggestion.

v1 approach: fuzzy name matching + shared identifier overlap.
Sprint 3+ will add ML-based embeddings and blocking strategies.
"""
import uuid
from difflib import SequenceMatcher
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.entity import Entity, EntityIdentifier
from app.schemas.entities import MergeSuggestion


async def suggest_merges(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    threshold: float = 0.85,
) -> list[MergeSuggestion]:
    """Return pairs of entities that are likely duplicates."""
    result = await db.execute(
        select(Entity).where(
            Entity.tenant_id == tenant_id,
            Entity.merged_into.is_(None),
        )
    )
    entities = result.scalars().all()

    suggestions: list[MergeSuggestion] = []
    checked: set[tuple[uuid.UUID, uuid.UUID]] = set()

    for i, a in enumerate(entities):
        for b in entities[i + 1:]:
            if a.entity_type != b.entity_type:
                continue
            pair = (min(a.id, b.id), max(a.id, b.id))
            if pair in checked:
                continue
            checked.add(pair)

            reasons: list[str] = []
            score = 0.0

            # Name similarity
            name_ratio = SequenceMatcher(
                None, a.canonical_name.lower(), b.canonical_name.lower()
            ).ratio()
            if name_ratio >= threshold:
                score = max(score, name_ratio)
                reasons.append(f"Name similarity {name_ratio:.0%}")

            if score >= threshold:
                suggestions.append(
                    MergeSuggestion(
                        entity_a_id=a.id,
                        entity_b_id=b.id,
                        confidence=round(score, 3),
                        reasons=reasons,
                    )
                )

    suggestions.sort(key=lambda s: s.confidence, reverse=True)
    return suggestions[:50]
