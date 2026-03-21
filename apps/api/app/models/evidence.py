import uuid
from typing import Optional, Dict, Any
from sqlalchemy import String, ForeignKey, JSON, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, IDMixin, TimestampMixin

class SourceRecord(Base, IDMixin, TimestampMixin):
    __tablename__ = "source_records"
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    source_type: Mapped[str] = mapped_column(String(50)) # CSV, PDF, etc.
    raw_data_url: Mapped[Optional[str]] = mapped_column(String(1024))
    metadata_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)

class Document(Base, IDMixin, TimestampMixin):
    __tablename__ = "documents"
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id"), nullable=False)
    source_record_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("source_records.id"))
    title: Mapped[str] = mapped_column(String(255))
    content_summary: Mapped[Optional[str]] = mapped_column(String(1024))
    pages: Mapped[Optional[int]] = mapped_column(Integer)
    metadata_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)
