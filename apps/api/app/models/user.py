import uuid
from typing import Optional, List
from sqlalchemy import String, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, IDMixin, TimestampMixin

class Tenant(Base, IDMixin, TimestampMixin):
    __tablename__ = "tenants"
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    users: Mapped[List["User"]] = relationship(back_populates="tenant")

class Role(Base, IDMixin):
    __tablename__ = "roles"
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    permissions: Mapped[Optional[dict]] = mapped_column(JSON)

class User(Base, IDMixin, TimestampMixin):
    __tablename__ = "users"
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id"), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255))
    role_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("roles.id"))
    is_active: Mapped[bool] = mapped_column(default=True)

    tenant: Mapped["Tenant"] = relationship(back_populates="users")
