"""MinIO client for object storage"""

from minio import Minio
from minio.error import S3Error
import logging
from io import BytesIO
from typing import Optional
from .settings import settings

logger = logging.getLogger(__name__)


class MinIOClient:
    """MinIO object storage manager"""
    
    def __init__(self):
        self.client: Optional[Minio] = None
        self.bucket = settings.minio_bucket
    
    async def initialize(self):
        """Initialize MinIO client"""
        try:
            self.client = Minio(
                settings.minio_endpoint,
                access_key=settings.minio_access_key,
                secret_key=settings.minio_secret_key,
                secure=settings.minio_secure
            )
            
            # Create bucket if not exists
            if not self.client.bucket_exists(self.bucket):
                self.client.make_bucket(self.bucket)
                logger.info(f"✅ Created MinIO bucket: {self.bucket}")
            
            logger.info("✅ MinIO initialized successfully")
            
        except S3Error as e:
            logger.error(f"❌ MinIO initialization failed: {e}")
            raise
    
    def check_connection(self) -> bool:
        """Check if MinIO is connected"""
        try:
            if self.client:
                self.client.bucket_exists(self.bucket)
                return True
            return False
        except Exception:
            return False
    
    def upload_file(self, object_name: str, data: bytes, content_type: str = "application/octet-stream"):
        """Upload file to MinIO"""
        try:
            self.client.put_object(
                self.bucket,
                object_name,
                BytesIO(data),
                length=len(data),
                content_type=content_type
            )
            logger.info(f"✅ Uploaded: {object_name}")
            return True
        except S3Error as e:
            logger.error(f"❌ Upload failed: {e}")
            return False
    
    def download_file(self, object_name: str) -> Optional[bytes]:
        """Download file from MinIO"""
        try:
            response = self.client.get_object(self.bucket, object_name)
            data = response.read()
            response.close()
            response.release_conn()
            return data
        except S3Error as e:
            logger.error(f"❌ Download failed: {e}")
            return None
    
    def get_presigned_url(self, object_name: str, expires: int = 3600) -> Optional[str]:
        """Get presigned URL for object"""
        try:
            from datetime import timedelta
            url = self.client.presigned_get_object(
                self.bucket,
                object_name,
                expires=timedelta(seconds=expires)
            )
            return url
        except S3Error as e:
            logger.error(f"❌ Presigned URL failed: {e}")
            return None
