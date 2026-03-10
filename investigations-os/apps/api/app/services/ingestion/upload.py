import uuid
import boto3
from fastapi import UploadFile
from botocore.exceptions import ClientError

from app.core.config import get_settings

settings = get_settings()


def _s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint_url,
        aws_access_key_id=settings.s3_access_key,
        aws_secret_access_key=settings.s3_secret_key,
    )


async def store_upload(file: UploadFile, tenant_id: uuid.UUID) -> str:
    """Upload file to S3/MinIO and return the storage key."""
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    key = f"tenants/{tenant_id}/uploads/{uuid.uuid4()}.{ext}"
    content = await file.read()

    client = _s3_client()
    client.put_object(
        Bucket=settings.s3_bucket,
        Key=key,
        Body=content,
        ContentType=file.content_type or "application/octet-stream",
    )
    return key
