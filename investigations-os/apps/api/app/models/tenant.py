import uuid
from sqlalchemy import String, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKey


class Tenant(UUIDPrimaryKey, TimestampMixin, Base):
    __tablename__ = "tenants"

    name: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    settings: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    users: Mapped[list["User"]] = relationship("User", back_populates="tenant")
    roles: Mapped[list["Role"]] = relationship("Role", back_populates="tenant")
    cases: Mapped[list["Case"]] = relationship("Case", back_populates="tenant")
    entities: Mapped[list["Entity"]] = relationship("Entity", back_populates="tenant")
