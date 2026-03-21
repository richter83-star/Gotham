import uuid
import time
from app.core.celery_app import celery_app
from app.api.deps import SessionLocal
from app.models.ingestion import IngestionJob
from app.models.case import Case

@celery_app.task(bind=True, name="app.worker.tasks.process_evidence_task")
def process_evidence_task(self, job_id: str):
    db = SessionLocal()
    try:
        job = db.query(IngestionJob).filter(IngestionJob.id == uuid.UUID(job_id)).first()
        if not job:
            return {"status": "FAILED", "reason": "Job not found"}
        
        job.status = "PROCESSING"
        job.progress_percent = 10
        job.celery_task_id = self.request.id
        db.commit()
        
        # Simulate heavy OCR and AI extraction delays
        time.sleep(2)
        job.progress_percent = 40
        db.commit()
        
        # Call the existing AI Extraction service
        from app.services.ai import service as ai_service
        # For prototype, we'll just mock the extraction call since the actual
        # evidence file reading isn't fully robust here yet.
        time.sleep(3)
        
        job.progress_percent = 80
        db.commit()
        
        # Mock finalization
        job.status = "COMPLETED"
        job.progress_percent = 100
        db.commit()
        
        return {"status": "SUCCESS", "job_id": job_id}
        
    except Exception as e:
        db.rollback()
        job = db.query(IngestionJob).filter(IngestionJob.id == uuid.UUID(job_id)).first()
        if job:
            job.status = "FAILED"
            job.error_message = str(e)
            db.commit()
        raise e
    finally:
        db.close()
