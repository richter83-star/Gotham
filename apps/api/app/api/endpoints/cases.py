from typing import Any, List
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.case import Case, CaseCreate, CaseUpdate
from app.services.cases import crud
from app.core.audit import audit_action

router = APIRouter()

@router.get("/", response_model=List[Case])
def read_cases(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    # In a real app, get current_user here
    tenant_id = uuid.UUID("00000000-0000-0000-0000-000000000000") 
    cases = crud.get_cases(db, tenant_id=tenant_id, skip=skip, limit=limit)
    return cases

@router.post("/", response_model=Case)
@audit_action(action="CREATE_CASE", resource_type="CASE")
async def create_case(
    *,
    db: Session = Depends(deps.get_db),
    case_in: CaseCreate,
    current_user: Any = Depends(deps.get_db) # Placeholder for auth
) -> Any:
    # Mock tenant_id for now
    tenant_id = uuid.UUID("00000000-0000-0000-0000-000000000000")
    case = crud.create_case(db, obj_in=case_in, tenant_id=tenant_id)
    return case

@router.get("/{id}", response_model=Case)
def read_case(
    *,
    db: Session = Depends(deps.get_db),
    id: uuid.UUID
) -> Any:
    case = crud.get_case(db, case_id=id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@router.get("/{id}/export")
@audit_action(action="EXPORT_CASE", resource_type="CASE")
def export_case(
    *,
    db: Session = Depends(deps.get_db),
    id: uuid.UUID
) -> Any:
    from app.services.cases import export
    data = export.generate_case_export(db, case_id=id)
    if not data:
        raise HTTPException(status_code=404, detail="Case not found")
    return data

@router.get("/{id}/map")
@audit_action(action="READ_CASE_MAP", resource_type="CASE")
def read_case_map(
    *,
    db: Session = Depends(deps.get_db),
    id: uuid.UUID
) -> Any:
    case = db.query(Case).filter(Case.id == id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    geo_entities = [
        {
            "id": str(e.id),
            "display_name": e.display_name,
            "type": e.type,
            "latitude": e.latitude,
            "longitude": e.longitude,
            "confidence_score": e.confidence_score
        }
        for e in case.entities if getattr(e, "latitude", None) is not None and getattr(e, "longitude", None) is not None
    ]
    return geo_entities

@router.post("/{id}/seed-map")
def seed_case_map(
    *,
    db: Session = Depends(deps.get_db),
    id: uuid.UUID
) -> Any:
    case = db.query(Case).filter(Case.id == id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    from app.models.entity import Entity
    mock_entities = [
        Entity(tenant_id=case.tenant_id, case_id=case.id, type="LOCATION", display_name="Safehouse Alpha", latitude=40.7128, longitude=-74.0060, confidence_score=0.9),
        Entity(tenant_id=case.tenant_id, case_id=case.id, type="DEVICE", display_name="Burner Phone", latitude=40.7300, longitude=-73.9950, confidence_score=0.85),
        Entity(tenant_id=case.tenant_id, case_id=case.id, type="PERSON", display_name="Suspect Last Known", latitude=40.7500, longitude=-73.9800, confidence_score=0.7)
    ]
    db.add_all(mock_entities)
    db.commit()
    return {"message": "Geo-entities seeded", "count": len(mock_entities)}
