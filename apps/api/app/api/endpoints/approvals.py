from typing import Any, List, Dict
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.approval import ApprovalRequest
from app.core.audit import audit_action
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class ApprovalRequestCreate(BaseModel):
    action_type: str
    target_resource_id: str
    payload_json: Dict[str, Any]
    notes: str | None = None

class ApprovalRequestResponse(BaseModel):
    id: uuid.UUID
    action_type: str
    status: str
    target_resource_id: str | None
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.post("/", response_model=ApprovalRequestResponse)
@audit_action(action="CREATE_APPROVAL_REQUEST", resource_type="APPROVAL")
def create_approval_request(
    *,
    db: Session = Depends(deps.get_db),
    req_in: ApprovalRequestCreate,
    current_user_id: uuid.UUID = uuid.UUID("11111111-1111-1111-1111-111111111111") # Mocked user
) -> Any:
    tenant_id = uuid.UUID("00000000-0000-0000-0000-000000000000") # Mocked tenant
    db_obj = ApprovalRequest(
        tenant_id=tenant_id,
        requester_id=current_user_id,
        action_type=req_in.action_type,
        target_resource_id=req_in.target_resource_id,
        payload_json=req_in.payload_json,
        notes=req_in.notes,
        status="PENDING"
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/", response_model=List[ApprovalRequestResponse])
def list_approval_requests(
    db: Session = Depends(deps.get_db),
    status: str | None = None
) -> Any:
    query = db.query(ApprovalRequest)
    if status:
        query = query.filter(ApprovalRequest.status == status)
    return query.all()

@router.post("/{id}/approve", response_model=ApprovalRequestResponse)
@audit_action(action="APPROVE_ACTION", resource_type="APPROVAL")
def approve_request(
    *,
    db: Session = Depends(deps.get_db),
    id: uuid.UUID,
    current_user_id: uuid.UUID = uuid.UUID("22222222-2222-2222-2222-222222222222") # Mocked admin
) -> Any:
    obj = db.query(ApprovalRequest).filter(ApprovalRequest.id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Approval Request not found")
    
    obj.status = "APPROVED"
    obj.approver_id = current_user_id
    db.commit()
    db.refresh(obj)
    
    # In a real system, you would execute the action (e.g., MERGE_ENTITIES) here using the payload
    # logic...
    
    return obj

@router.post("/{id}/deny", response_model=ApprovalRequestResponse)
@audit_action(action="DENY_ACTION", resource_type="APPROVAL")
def deny_request(
    *,
    db: Session = Depends(deps.get_db),
    id: uuid.UUID,
    current_user_id: uuid.UUID = uuid.UUID("22222222-2222-2222-2222-222222222222") # Mocked admin
) -> Any:
    obj = db.query(ApprovalRequest).filter(ApprovalRequest.id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Approval Request not found")
    
    obj.status = "DENIED"
    obj.approver_id = current_user_id
    db.commit()
    db.refresh(obj)
    return obj
