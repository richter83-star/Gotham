import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional

from app.db.database import get_db
from app.models.evidence import IngestionJob
from app.models.user import User
from app.api.v1.deps import get_current_user
from app.services.ingestion.upload import store_upload
from app.services.ingestion.pipeline import enqueue_ingestion_job

router = APIRouter(prefix="/ingestion", tags=["ingestion"])


class IngestionJobResponse(BaseModel):
    id: uuid.UUID
    file_name: str
    file_type: str
    status: str
    case_id: Optional[uuid.UUID]
    created_at: str

    model_config = {"from_attributes": True}


@router.post("/upload", response_model=IngestionJobResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_file(
    file: UploadFile = File(...),
    case_id: Optional[uuid.UUID] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    allowed_types = {"text/csv", "application/pdf",
                     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                     "application/json", "message/rfc822", "text/plain"}
    content_type = file.content_type or ""
    if content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported file type: {content_type}",
        )

    storage_key = await store_upload(file, current_user.tenant_id)
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()

    job = IngestionJob(
        tenant_id=current_user.tenant_id,
        uploaded_by=current_user.id,
        file_name=file.filename or "unknown",
        file_type=ext,
        storage_key=storage_key,
        case_id=case_id,
        status="pending",
    )
    db.add(job)
    await db.flush()

    # Enqueue async processing
    await enqueue_ingestion_job(str(job.id))

    return job


@router.get("/jobs/{job_id}", response_model=IngestionJobResponse)
async def get_ingestion_job(
    job_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(IngestionJob).where(
            IngestionJob.id == job_id,
            IngestionJob.tenant_id == current_user.tenant_id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return job
