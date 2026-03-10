import uuid
from sqlalchemy import String, Boolean, ForeignKey, BigInteger, Integer, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
import sqlalchemy as sa

from app.db.database import Base
from app.models.base import UUIDPrimaryKey


class IngestionJob(UUIDPrimaryKey, Base):
    __tablename__ = "ingestion_jobs"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    uploaded_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    file_name: Mapped[str] = mapped_column(Text, nullable=False)
    file_type: Mapped[str] = mapped_column(Text, nullable=False)
    file_size_bytes: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    storage_key: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="pending")
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    record_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    case_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cases.id"), nullable=True
    )
    started_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[str] = mapped_column(
        DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    )

    documents: Mapped[list["Document"]] = relationship("Document", back_populates="ingestion_job")
    source_records: Mapped[list["SourceRecord"]] = relationship(
        "SourceRecord", back_populates="ingestion_job"
    )


class SourceRecord(UUIDPrimaryKey, Base):
    __tablename__ = "source_records"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    ingestion_job_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ingestion_jobs.id"), nullable=True
    )
    source_name: Mapped[str] = mapped_column(Text, nullable=False)
    source_type: Mapped[str] = mapped_column(Text, nullable=False)
    raw_data: Mapped[dict] = mapped_column(JSONB, nullable=False)
    normalized_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    entity_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("entities.id"), nullable=True
    )
    created_at: Mapped[str] = mapped_column(
        DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    )

    ingestion_job: Mapped["IngestionJob"] = relationship(
        "IngestionJob", back_populates="source_records"
    )


class Document(UUIDPrimaryKey, Base):
    __tablename__ = "documents"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    ingestion_job_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ingestion_jobs.id"), nullable=True
    )
    title: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_name: Mapped[str] = mapped_column(Text, nullable=False)
    file_type: Mapped[str] = mapped_column(Text, nullable=False)
    storage_key: Mapped[str] = mapped_column(Text, nullable=False)
    extracted_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    page_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, nullable=False, default=dict)
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    created_at: Mapped[str] = mapped_column(
        DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    )

    ingestion_job: Mapped["IngestionJob"] = relationship(
        "IngestionJob", back_populates="documents"
    )
    chunks: Mapped[list["DocumentChunk"]] = relationship("DocumentChunk", back_populates="document")


class DocumentChunk(UUIDPrimaryKey, Base):
    __tablename__ = "document_chunks"

    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False
    )
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    # embedding stored as vector(1536) via pgvector — raw column for now
    page_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, nullable=False, default=dict)
    created_at: Mapped[str] = mapped_column(
        DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    )

    document: Mapped["Document"] = relationship("Document", back_populates="chunks")


class Evidence(UUIDPrimaryKey, Base):
    __tablename__ = "evidence"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    case_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False
    )
    document_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id"), nullable=True
    )
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    evidence_type: Mapped[str] = mapped_column(Text, nullable=False, default="document")
    storage_key: Mapped[str | None] = mapped_column(Text, nullable=True)
    extracted_fields: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    added_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    deleted_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    deleted_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[str] = mapped_column(
        DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    )

    case: Mapped["Case"] = relationship("Case", back_populates="evidence")
