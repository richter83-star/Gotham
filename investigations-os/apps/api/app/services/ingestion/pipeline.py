"""
Ingestion pipeline — Celery tasks for async processing.
Each task updates the IngestionJob status and creates source records / entities.
"""
from celery import Celery
from app.core.config import get_settings

settings = get_settings()

celery_app = Celery("casegraph", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.task_serializer = "json"
celery_app.conf.result_serializer = "json"
celery_app.conf.accept_content = ["json"]


async def enqueue_ingestion_job(job_id: str) -> None:
    """Push ingestion job onto the Celery queue."""
    celery_app.send_task("casegraph.tasks.process_ingestion_job", args=[job_id])


@celery_app.task(name="casegraph.tasks.process_ingestion_job", bind=True, max_retries=3)
def process_ingestion_job(self, job_id: str):
    """
    1. Load file from S3
    2. Parse CSV / PDF / email
    3. Extract entities and source records
    4. Create/update Entity records
    5. Update IngestionJob status
    """
    # Full implementation in Sprint 2
    pass
