import uuid
from sqlalchemy import String, Boolean, ForeignKey, Numeric, DateTime, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
import sqlalchemy as sa

from app.db.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKey


class Case(UUIDPrimaryKey, TimestampMixin, Base):
    __tablename__ = "cases"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    case_number: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False, default="new")
    priority: Mapped[str] = mapped_column(String, nullable=False, default="medium")
    risk_score: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    closed_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    closed_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    tags: Mapped[list] = mapped_column(ARRAY(String), nullable=False, default=list)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, nullable=False, default=dict)

    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="cases")
    notes: Mapped[list["CaseNote"]] = relationship("CaseNote", back_populates="case")
    tasks: Mapped[list["CaseTask"]] = relationship("CaseTask", back_populates="case")
    evidence: Mapped[list["Evidence"]] = relationship("Evidence", back_populates="case")
    case_entities: Mapped[list["CaseEntity"]] = relationship(
        "CaseEntity", back_populates="case"
    )
    decisions: Mapped[list["Decision"]] = relationship("Decision", back_populates="case")


class CaseNote(UUIDPrimaryKey, TimestampMixin, Base):
    __tablename__ = "case_notes"

    case_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False
    )
    author_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)
    is_pinned: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    case: Mapped["Case"] = relationship("Case", back_populates="notes")


class CaseTask(UUIDPrimaryKey, TimestampMixin, Base):
    __tablename__ = "case_tasks"

    case_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False, default="open")
    due_date: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)

    case: Mapped["Case"] = relationship("Case", back_populates="tasks")


class CaseEntity(Base):
    __tablename__ = "case_entities"

    case_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), primary_key=True
    )
    entity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), primary_key=True
    )
    role: Mapped[str | None] = mapped_column(String, nullable=True)
    added_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    added_at: Mapped[str] = mapped_column(
        DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    )

    case: Mapped["Case"] = relationship("Case", back_populates="case_entities")
    entity: Mapped["Entity"] = relationship("Entity", back_populates="case_entities")
