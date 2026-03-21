import uuid
from typing import Optional, Dict, Any, TYPE_CHECKING
from sqlalchemy import String, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, IDMixin, TimestampMixin

if TYPE_CHECKING:
    from .user import User

class ApprovalRequest(Base, IDMixin, TimestampMixin):
    __tablename__ = "approval_requests"
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id"), nullable=False)
    action_type: Mapped[str] = mapped_column(String(100), nullable=False) # e.g., "MERGE_ENTITIES"
    status: Mapped[str] = mapped_column(String(20), default="PENDING") # PENDING, APPROVED, DENIED
    
    requester_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    approver_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"), nullable=True)
    
    target_resource_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    payload_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    requester: Mapped["User"] = relationship("User", foreign_keys=[requester_id])
    approver: Mapped[Optional["User"]] = relationship("User", foreign_keys=[approver_id])
