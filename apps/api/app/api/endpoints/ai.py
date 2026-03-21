from typing import Any, List
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.services.ai.service import ai_service

router = APIRouter()

@router.post("/cases/{case_id}/summarize")
async def summarize_case(
    *,
    db: Session = Depends(deps.get_db),
    case_id: uuid.UUID
) -> Any:
    # Fetch case details (mocked for now)
    summary = await ai_service.summarize_case("Operation Midnight Prowl", ["Unauthorized access detected", "Ping at Docklands"])
    return {"summary": summary}

@router.post("/cases/{case_id}/recommendations")
async def get_recommendations(
    *,
    db: Session = Depends(deps.get_db),
    case_id: uuid.UUID
) -> Any:
    recs = await ai_service.recommend_actions(case_id, "Active Phase: Intelligence Gathering")
    return {"recommendations": recs}

@router.post("/documents/{doc_id}/extract")
async def extract_from_document(
    *,
    db: Session = Depends(deps.get_db),
    doc_id: uuid.UUID
) -> Any:
    # In a real app, fetch doc content from S3/DB
    entities = await ai_service.extract_entities("Selina Kyle was seen near Wayne Enterprises Hub 4.")
    return {"entities": entities, "provenance_id": doc_id}
