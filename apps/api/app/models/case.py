from enum import Enum
import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, ForeignKey, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, IDMixin, TimestampMixin

if TYPE_CHECKING:
    from .user import User
    from .entity import Entity

class CaseStatus(str, Enum):
    NEW = "NEW"
    TRIAGE = "TRIAGE"
    ACTIVE = "ACTIVE"
    PENDING_APPROVAL = "PENDING_APPROVAL"
    CLOSED_CONFIRMED = "CLOSED_CONFIRMED"
    CLOSED_UNSUBSTANTIATED = "CLOSED_UNSUBSTANTIATED"
    ESCALATED = "ESCALATED"

class Case(Base, IDMixin, TimestampMixin):
    __tablename__ = "cases"
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[CaseStatus] = mapped_column(default=CaseStatus.NEW)
    assignee_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"))
    priority: Mapped[str] = mapped_column(String(20), default="MEDIUM")

    notes: Mapped[List["CaseNote"]] = relationship(back_populates="case", cascade="all, delete-orphan")
    tasks: Mapped[List["CaseTask"]] = relationship(back_populates="case", cascade="all, delete-orphan")

class CaseNote(Base, IDMixin, TimestampMixin):
    __tablename__ = "case_notes"
    case_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("cases.id"), nullable=False)
    author_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    case: Mapped["Case"] = relationship(back_populates="notes")

class CaseTask(Base, IDMixin, TimestampMixin):
    __tablename__ = "case_tasks"
    case_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("cases.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="PENDING")
    assignee_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"))
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    case: Mapped["Case"] = relationship(back_populates="tasks")
