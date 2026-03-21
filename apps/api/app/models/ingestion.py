import uuid
from sqlalchemy import String, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, TYPE_CHECKING
from .base import Base, IDMixin, TimestampMixin

if TYPE_CHECKING:
    from .user import User
    from .case import Case

class IngestionJob(Base, IDMixin, TimestampMixin):
    __tablename__ = "ingestion_jobs"
    
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    case_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("cases.id"), nullable=False)
    
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    
    status: Mapped[str] = mapped_column(String(20), default="PENDING") # PENDING, PROCESSING, COMPLETED, FAILED
    progress_percent: Mapped[int] = mapped_column(Integer, default=0)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    celery_task_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])
    case: Mapped["Case"] = relationship("Case", foreign_keys=[case_id])
