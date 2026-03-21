from typing import Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import uuid
import os
import tempfile
from app.api import deps
from app.core.audit import audit_action
from app.models.ingestion import IngestionJob
from app.worker.tasks import process_evidence_task

router = APIRouter()

@router.post("/upload")
@audit_action(action="UPLOAD_FILE", resource_type="EVIDENCE")
async def upload_evidence(
    *,
    db: Session = Depends(deps.get_db),
    file: UploadFile = File(...),
    case_id: uuid.UUID = Form(default=uuid.UUID("33333333-3333-3333-3333-333333333333"))
) -> Any:
    tenant_id = uuid.UUID("00000000-0000-0000-0000-000000000000")
    user_id = uuid.UUID("11111111-1111-1111-1111-111111111111")
    
    # Save the file locally
    temp_dir = tempfile.gettempdir()
    file_path = os.path.join(temp_dir, file.filename)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    # Create the IngestionJob record
    job = IngestionJob(
        tenant_id=tenant_id,
        user_id=user_id,
        case_id=case_id,
        file_path=file_path,
        file_name=file.filename,
        status="PENDING",
        progress_percent=0
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    
    # Dispatch to Celery worker
    process_evidence_task.delay(str(job.id))
    
    return {
        "job_id": str(job.id),
        "filename": job.file_name,
        "status": job.status,
        "message": "File queued for asynchronous processing"
    }

@router.get("/jobs/{job_id}")
def read_job_status(
    *,
    db: Session = Depends(deps.get_db),
    job_id: uuid.UUID
) -> Any:
    job = db.query(IngestionJob).filter(IngestionJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Ingestion job not found")
    
    return {
        "job_id": str(job.id),
        "status": job.status,
        "progress_percent": job.progress_percent,
        "error_message": job.error_message,
        "file_name": job.file_name
    }
