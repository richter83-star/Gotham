"""
Seed script — creates a default tenant, roles, and admin user.
Run: python -m app.db.seed
"""
import asyncio
import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import AsyncSessionLocal
from app.models.tenant import Tenant
from app.models.user import Role, User
from app.core.security import hash_password

DEFAULT_ROLES = [
    ("analyst", False),
    ("senior_investigator", False),
    ("case_manager", False),
    ("admin", True),
    ("auditor", True),
]


async def seed():
    async with AsyncSessionLocal() as db:
        # Tenant
        tenant = Tenant(
            name="Acme Investigations",
            slug="acme",
            settings={},
        )
        db.add(tenant)
        await db.flush()

        # Roles
        roles: dict[str, Role] = {}
        for role_name, is_system in DEFAULT_ROLES:
            role = Role(
                tenant_id=tenant.id,
                name=role_name,
                permissions=[],
                is_system=is_system,
                created_at=str(uuid.uuid4()),  # placeholder — use server_default in migration
            )
            db.add(role)
            await db.flush()
            roles[role_name] = role

        # Admin user
        admin = User(
            tenant_id=tenant.id,
            email="admin@acme.example",
            display_name="Admin User",
            hashed_password=hash_password("changeme123!"),
            role_id=roles["admin"].id,
        )
        db.add(admin)
        await db.commit()
        print(f"Seeded tenant: {tenant.slug} | admin: {admin.email}")


if __name__ == "__main__":
    asyncio.run(seed())
