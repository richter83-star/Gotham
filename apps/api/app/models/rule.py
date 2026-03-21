import uuid
from sqlalchemy import String, ForeignKey, JSON, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, Dict, Any, TYPE_CHECKING
from .base import Base, IDMixin, TimestampMixin

if TYPE_CHECKING:
    from .tenant import Tenant

class Rule(Base, IDMixin, TimestampMixin):
    __tablename__ = "rules"
    
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Store the JSON payload definition (e.g. {"field": "amount", "operator": ">", "value": 10000})
    condition_json: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False) 
    
    # LOW, MEDIUM, HIGH, CRITICAL
    severity: Mapped[str] = mapped_column(String(50), default="MEDIUM")
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # We won't strictly enforce a bidirectional relationship from Tenant unless needed
    tenant: Mapped["Tenant"] = relationship(foreign_keys=[tenant_id])
