import uuid
from sqlalchemy import String, Boolean, ForeignKey, Numeric, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKey


class Entity(UUIDPrimaryKey, TimestampMixin, Base):
    __tablename__ = "entities"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    entity_type: Mapped[str] = mapped_column(String, nullable=False)
    canonical_name: Mapped[str] = mapped_column(Text, nullable=False)
    risk_score: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    is_flagged: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_frozen: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    merged_into: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("entities.id"), nullable=True
    )
    graph_node_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, nullable=False, default=dict)
    tags: Mapped[list] = mapped_column(ARRAY(String), nullable=False, default=list)
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )

    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="entities")
    aliases: Mapped[list["EntityAlias"]] = relationship("EntityAlias", back_populates="entity")
    identifiers: Mapped[list["EntityIdentifier"]] = relationship(
        "EntityIdentifier", back_populates="entity"
    )
    case_entities: Mapped[list["CaseEntity"]] = relationship(
        "CaseEntity", back_populates="entity"
    )
    outgoing_relationships: Mapped[list["EntityRelationship"]] = relationship(
        "EntityRelationship",
        foreign_keys="EntityRelationship.source_entity_id",
        back_populates="source_entity",
    )
    incoming_relationships: Mapped[list["EntityRelationship"]] = relationship(
        "EntityRelationship",
        foreign_keys="EntityRelationship.target_entity_id",
        back_populates="target_entity",
    )


class EntityAlias(UUIDPrimaryKey, Base):
    __tablename__ = "entity_aliases"

    entity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), nullable=False
    )
    alias: Mapped[str] = mapped_column(Text, nullable=False)
    source: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[str] = mapped_column(nullable=False)

    entity: Mapped["Entity"] = relationship("Entity", back_populates="aliases")


class EntityIdentifier(UUIDPrimaryKey, Base):
    __tablename__ = "entity_identifiers"

    entity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), nullable=False
    )
    id_type: Mapped[str] = mapped_column(Text, nullable=False)
    id_value: Mapped[str] = mapped_column(Text, nullable=False)
    source: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidence: Mapped[float | None] = mapped_column(Numeric(4, 3), nullable=True)
    created_at: Mapped[str] = mapped_column(nullable=False)

    entity: Mapped["Entity"] = relationship("Entity", back_populates="identifiers")


class EntityRelationship(UUIDPrimaryKey, TimestampMixin, Base):
    __tablename__ = "entity_relationships"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    source_entity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), nullable=False
    )
    target_entity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), nullable=False
    )
    relationship_type: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float | None] = mapped_column(Numeric(4, 3), nullable=True)
    valid_from: Mapped[str | None] = mapped_column(nullable=True)
    valid_to: Mapped[str | None] = mapped_column(nullable=True)
    source_record_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    properties: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    source_entity: Mapped["Entity"] = relationship(
        "Entity", foreign_keys=[source_entity_id], back_populates="outgoing_relationships"
    )
    target_entity: Mapped["Entity"] = relationship(
        "Entity", foreign_keys=[target_entity_id], back_populates="incoming_relationships"
    )
