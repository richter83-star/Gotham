from typing import List, Optional
import uuid
from sqlalchemy.orm import Session
from app.models.case import Case, CaseStatus
from app.schemas.case import CaseCreate, CaseUpdate

def get_cases(db: Session, tenant_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Case]:
    return db.query(Case).filter(Case.tenant_id == tenant_id).offset(skip).limit(limit).all()

def get_case(db: Session, case_id: uuid.UUID) -> Optional[Case]:
    return db.query(Case).filter(Case.id == case_id).first()

def create_case(db: Session, obj_in: CaseCreate, tenant_id: uuid.UUID) -> Case:
    db_obj = Case(
        title=obj_in.title,
        description=obj_in.description,
        status=CaseStatus.NEW,
        tenant_id=tenant_id,
        priority=obj_in.priority
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_case(db: Session, db_obj: Case, obj_in: CaseUpdate) -> Case:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field in update_data:
        setattr(db_obj, field, update_data[field])
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
