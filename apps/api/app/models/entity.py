import uuid
from typing import Optional, List, TYPE_CHECKING, Dict, Any
from sqlalchemy import String, ForeignKey, JSON, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, IDMixin, TimestampMixin

if TYPE_CHECKING:
    from .case import Case

class Entity(Base, IDMixin, TimestampMixin):
    __tablename__ = "entities"
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False) # PERSON, ORG, etc.
    display_name: Mapped[Optional[str]] = mapped_column(String(255))
    confidence_score: Mapped[float] = mapped_column(Float, default=1.0)
    metadata_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True) # Additional attributes
    
    # AI/Provenance Fields
    source_record_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("source_records.id"), nullable=True)
    extraction_confidence: Mapped[Optional[float]] = mapped_column(Float, default=1.0)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Relationships
    tenant: Mapped["Tenant"] = relationship(back_populates="entities")

    cases: Mapped[List["Case"]] = relationship(secondary="case_entities", back_populates="entities")

class CaseEntity(Base):
    __tablename__ = "case_entities"
    case_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("cases.id"), primary_key=True)
    entity_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("entities.id"), primary_key=True)

class EntityRelationship(Base, IDMixin, TimestampMixin):
    __tablename__ = "entity_relationships"
    source_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("entities.id"), nullable=False)
    target_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("entities.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    metadata_json: Mapped[Optional[dict]] = mapped_column(JSON)
