"""
Load sample investigation dataset into a seeded CaseGraph instance.
Run after seed.py:  python -m app.db.load_sample_data
"""
import asyncio
import json
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import AsyncSessionLocal
from app.models.case import Case, CaseNote
from app.models.entity import Entity, EntityAlias, EntityIdentifier, EntityRelationship
from app.services.cases.numbering import generate_case_number

DATASET_PATH = Path(__file__).parents[4] / "docs" / "sample-data" / "investigation_dataset.json"


async def load():
    data = json.loads(DATASET_PATH.read_text())

    async with AsyncSessionLocal() as db:
        # Get the seeded tenant/admin
        from sqlalchemy import select, text
        from app.models.tenant import Tenant
        from app.models.user import User

        tenant = (await db.execute(select(Tenant).limit(1))).scalar_one()
        admin = (await db.execute(select(User).limit(1))).scalar_one()

        # Cases
        case_map: dict[str, Case] = {}
        for c in data["cases"]:
            case = Case(
                tenant_id=tenant.id,
                case_number=c["case_number"],
                title=c["title"],
                description=c["description"],
                status=c["status"],
                priority=c["priority"],
                risk_score=c.get("risk_score"),
                tags=c.get("tags", []),
                created_by=admin.id,
            )
            db.add(case)
            await db.flush()
            case_map[c["case_number"]] = case

            for note_body in c.get("notes", []):
                db.add(CaseNote(case_id=case.id, author_id=admin.id, body=note_body))

        await db.flush()

        # Entities
        entity_map: dict[str, Entity] = {}
        for e in data["entities"]:
            entity = Entity(
                tenant_id=tenant.id,
                entity_type=e["entity_type"],
                canonical_name=e["canonical_name"],
                risk_score=e.get("risk_score"),
                is_flagged=e.get("is_flagged", False),
                is_frozen=e.get("is_frozen", False),
                tags=e.get("tags", []),
                created_by=admin.id,
            )
            db.add(entity)
            await db.flush()
            entity_map[e["canonical_name"]] = entity

            for alias in e.get("aliases", []):
                db.add(EntityAlias(entity_id=entity.id, alias=alias))

            for ident in e.get("identifiers", []):
                db.add(EntityIdentifier(
                    entity_id=entity.id,
                    id_type=ident["id_type"],
                    id_value=ident["id_value"],
                    confidence=ident.get("confidence"),
                ))

        await db.flush()

        # Relationships
        for rel in data["relationships"]:
            src = entity_map.get(rel["source"])
            tgt = entity_map.get(rel["target"])
            if src and tgt:
                db.add(EntityRelationship(
                    tenant_id=tenant.id,
                    source_entity_id=src.id,
                    target_entity_id=tgt.id,
                    relationship_type=rel["type"],
                    confidence=rel.get("confidence"),
                    properties=rel.get("properties", {}),
                ))

        await db.commit()
        print(f"Loaded {len(data['cases'])} cases, {len(data['entities'])} entities")


if __name__ == "__main__":
    asyncio.run(load())
