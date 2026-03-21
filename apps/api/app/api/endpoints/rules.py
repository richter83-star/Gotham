import uuid
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.rule import Rule
from app.models.user import Tenant

router = APIRouter()

@router.get("/")
def list_rules(
    db: Session = Depends(deps.get_db),
) -> Any:
    """Get all rules for the default tenant."""
    tenant = db.query(Tenant).first()
    if not tenant:
        return []
    rules = db.query(Rule).filter(Rule.tenant_id == tenant.id).all()
    return rules

@router.post("/")
def create_rule(
    *,
    db: Session = Depends(deps.get_db),
    rule_in: dict
) -> Any:
    """Create a new real-time alert rule."""
    tenant = db.query(Tenant).first()
    
    rule = Rule(
        tenant_id=tenant.id,
        name=rule_in.get("name"),
        description=rule_in.get("description"),
        condition_json=rule_in.get("condition_json"),
        severity=rule_in.get("severity", "MEDIUM"),
        is_active=rule_in.get("is_active", True)
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule

@router.delete("/{id}")
def delete_rule(
    *,
    db: Session = Depends(deps.get_db),
    id: uuid.UUID
) -> Any:
    """Delete a rule."""
    rule = db.query(Rule).filter(Rule.id == id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    db.delete(rule)
    db.commit()
    return {"status": "success"}
