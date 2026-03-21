import uuid
from typing import Any
from sqlalchemy.orm import Session
from app.models.evidence import SourceRecord, Document

def process_upload(db: Session, tenant_id: uuid.UUID, filename: str, content_type: str, size: int) -> SourceRecord:
    """
    Parse metadata and create a source record for the uploaded file.
    """
    source = SourceRecord(
        tenant_id=tenant_id,
        name=filename,
        source_type=content_type,
        metadata_json={
            "size_bytes": size,
            "original_filename": filename
        }
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    
    # Create an initial document entry for the source
    doc = Document(
        tenant_id=tenant_id,
        source_record_id=source.id,
        title=filename,
        metadata_json={"ingestion_status": "PENDING_EXTRACTION"}
    )
    db.add(doc)
    db.commit()
    
    return source
