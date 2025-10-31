"""
Enhanced MinIO Client Configuration
Comprehensive object storage management for medical images and documents
"""

import asyncio
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import os
import io
from urllib.parse import urljoin

try:
    from minio import Minio
    from minio.error import S3Error
    MINIO_AVAILABLE = True
except ImportError:
    MINIO_AVAILABLE = False
    logging.warning("MinIO client not available. Install with: pip install minio")

logger = logging.getLogger(__name__)


# ========================================
# Configuration
# ========================================

class MinIOConfig:
    """MinIO configuration settings"""
    
    def __init__(self):
        # MinIO server settings
        self.endpoint = os.getenv("MINIO_ENDPOINT", "localhost:9000")
        self.access_key = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
        self.secret_key = os.getenv("MINIO_SECRET_KEY", "minioadmin")
        self.secure = os.getenv("MINIO_SECURE", "false").lower() == "true"
        self.region = os.getenv("MINIO_REGION", "us-east-1")
        
        # Bucket configuration
        self.bucket_names = {
            "medical_images": "medical-images",
            "documents": "patient-documents", 
            "processed": "processed-images",
            "exports": "data-exports",
            "backups": "system-backups"
        }
        
        # Upload settings
        self.max_file_size = 100 * 1024 * 1024  # 100MB
        self.allowed_content_types = [
            "image/jpeg", "image/png", "image/tiff", "image/bmp", "image/webp",
            "application/pdf", "application/dicom", "text/plain", "application/json"
        ]
        
        # Retention policies (days)
        self.retention_policies = {
            "medical_images": 3650,  # 10 years
            "documents": 2555,       # 7 years  
            "processed": 365,        # 1 year
            "exports": 90,           # 3 months
            "backups": 30            # 1 month
        }


BUCKET_NAMES = MinIOConfig().bucket_names


# ========================================
# Enhanced MinIO Client
# ========================================

class EnhancedMinIOClient:
    """Enhanced MinIO client with comprehensive medical data management"""
    
    def __init__(self, config: Optional[MinIOConfig] = None):
        self.config = config or MinIOConfig()
        self.client = None
        self.initialized = False
        
        if MINIO_AVAILABLE:
            try:
                self.client = Minio(
                    self.config.endpoint,
                    access_key=self.config.access_key,
                    secret_key=self.config.secret_key,
                    secure=self.config.secure,
                    region=self.config.region
                )
                logger.info(f"MinIO client initialized: {self.config.endpoint}")
            except Exception as e:
                logger.error(f"Failed to initialize MinIO client: {e}")
                self.client = None
        else:
            logger.warning("MinIO not available, using mock client")
    
    async def initialize(self) -> bool:
        """Initialize MinIO client and create required buckets"""
        if not self.client:
            logger.error("MinIO client not available")
            return False
        
        try:
            # Test connection
            self.client.list_buckets()
            
            # Create required buckets
            for bucket_name in self.config.bucket_names.values():
                try:
                    if not self.client.bucket_exists(bucket_name):
                        self.client.make_bucket(bucket_name, location=self.config.region)
                        logger.info(f"Created MinIO bucket: {bucket_name}")
                        
                        # Set bucket policy for medical images (private)
                        await self._set_bucket_policy(bucket_name)
                        
                except S3Error as e:
                    logger.error(f"Error creating bucket {bucket_name}: {e}")
            
            self.initialized = True
            logger.info("MinIO client initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"MinIO initialization failed: {e}")
            return False
    
    async def upload_file(
        self,
        bucket_name: str,
        object_name: str,
        file_data: bytes,
        content_type: str = "application/octet-stream",
        metadata: Optional[Dict[str, str]] = None
    ) -> str:
        """Upload file to MinIO with metadata"""
        
        if not self.client:
            # Return mock URL for development
            return f"mock:///{bucket_name}/{object_name}"
        
        try:
            # Validate content type
            if content_type not in self.config.allowed_content_types:
                raise ValueError(f"Content type {content_type} not allowed")
            
            # Validate file size
            if len(file_data) > self.config.max_file_size:
                raise ValueError(f"File size exceeds limit of {self.config.max_file_size} bytes")
            
            # Prepare metadata
            file_metadata = {
                "upload-timestamp": datetime.utcnow().isoformat(),
                "content-type": content_type,
                "file-size": str(len(file_data))
            }
            if metadata:
                file_metadata.update(metadata)
            
            # Upload file
            self.client.put_object(
                bucket_name,
                object_name,
                io.BytesIO(file_data),
                length=len(file_data),
                content_type=content_type,
                metadata=file_metadata
            )
            
            # Generate file URL
            file_url = f"https://{self.config.endpoint}/{bucket_name}/{object_name}"
            if not self.config.secure:
                file_url = f"http://{self.config.endpoint}/{bucket_name}/{object_name}"
            
            logger.info(f"File uploaded successfully: {bucket_name}/{object_name}")
            return file_url
            
        except Exception as e:
            logger.error(f"File upload failed: {e}")
            raise
    
    async def get_file(self, bucket_name: str, object_name: str) -> bytes:
        """Download file from MinIO"""
        
        if not self.client:
            raise RuntimeError("MinIO client not available")
        
        try:
            response = self.client.get_object(bucket_name, object_name)
            file_data = response.read()
            response.close()
            response.release_conn()
            
            logger.info(f"File downloaded: {bucket_name}/{object_name}")
            return file_data
            
        except Exception as e:
            logger.error(f"File download failed: {e}")
            raise
    
    async def get_file_url(
        self,
        bucket_name: str,
        object_name: str,
        expires: timedelta = timedelta(hours=1)
    ) -> str:
        """Generate presigned URL for file access"""
        
        if not self.client:
            return f"mock:///{bucket_name}/{object_name}"
        
        try:
            url = self.client.presigned_get_object(
                bucket_name,
                object_name,
                expires=expires
            )
            
            return url
            
        except Exception as e:
            logger.error(f"Failed to generate presigned URL: {e}")
            raise
    
    async def delete_file(self, bucket_name: str, object_name: str) -> bool:
        """Delete file from MinIO"""
        
        if not self.client:
            return True  # Mock deletion success
        
        try:
            self.client.remove_object(bucket_name, object_name)
            logger.info(f"File deleted: {bucket_name}/{object_name}")
            return True
            
        except Exception as e:
            logger.error(f"File deletion failed: {e}")
            return False
    
    async def list_files(
        self,
        bucket_name: str,
        prefix: str = "",
        max_keys: int = 1000
    ) -> List[Dict[str, Any]]:
        """List files in bucket with metadata"""
        
        if not self.client:
            return []  # Mock empty list
        
        try:
            objects = self.client.list_objects(
                bucket_name,
                prefix=prefix,
                recursive=True
            )
            
            files = []
            count = 0
            
            for obj in objects:
                if count >= max_keys:
                    break
                
                # Get file metadata
                stat = self.client.stat_object(bucket_name, obj.object_name)
                
                files.append({
                    "name": obj.object_name,
                    "size": obj.size,
                    "last_modified": obj.last_modified,
                    "etag": obj.etag,
                    "content_type": stat.content_type,
                    "metadata": stat.metadata
                })
                
                count += 1
            
            return files
            
        except Exception as e:
            logger.error(f"Failed to list files: {e}")
            return []
    
    async def get_file_info(self, bucket_name: str, object_name: str) -> Dict[str, Any]:
        """Get detailed file information"""
        
        if not self.client:
            return {}
        
        try:
            stat = self.client.stat_object(bucket_name, object_name)
            
            return {
                "object_name": object_name,
                "size": stat.size,
                "last_modified": stat.last_modified,
                "etag": stat.etag,
                "content_type": stat.content_type,
                "metadata": dict(stat.metadata) if stat.metadata else {},
                "version_id": stat.version_id
            }
            
        except Exception as e:
            logger.error(f"Failed to get file info: {e}")
            return {}
    
    async def copy_file(
        self,
        source_bucket: str,
        source_object: str,
        dest_bucket: str,
        dest_object: str
    ) -> bool:
        """Copy file between buckets"""
        
        if not self.client:
            return True
        
        try:
            from minio.commonconfig import CopySource
            
            copy_source = CopySource(source_bucket, source_object)
            self.client.copy_object(dest_bucket, dest_object, copy_source)
            
            logger.info(f"File copied: {source_bucket}/{source_object} -> {dest_bucket}/{dest_object}")
            return True
            
        except Exception as e:
            logger.error(f"File copy failed: {e}")
            return False
    
    async def _set_bucket_policy(self, bucket_name: str):
        """Set bucket policy for security"""
        
        # Private policy for medical data
        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Deny",
                    "Principal": "*",
                    "Action": "s3:GetObject",
                    "Resource": f"arn:aws:s3:::{bucket_name}/*"
                }
            ]
        }
        
        try:
            import json
            self.client.set_bucket_policy(bucket_name, json.dumps(policy))
        except Exception as e:
            logger.warning(f"Failed to set bucket policy for {bucket_name}: {e}")
    
    async def cleanup_expired_files(self):
        """Clean up expired files based on retention policies"""
        
        if not self.client:
            return
        
        try:
            for bucket_key, bucket_name in self.config.bucket_names.items():
                retention_days = self.config.retention_policies.get(bucket_key, 365)
                cutoff_date = datetime.utcnow() - timedelta(days=retention_days)
                
                objects = self.client.list_objects(bucket_name, recursive=True)
                
                for obj in objects:
                    if obj.last_modified < cutoff_date:
                        try:
                            await self.delete_file(bucket_name, obj.object_name)
                            logger.info(f"Cleaned up expired file: {bucket_name}/{obj.object_name}")
                        except Exception as e:
                            logger.error(f"Failed to cleanup {obj.object_name}: {e}")
                            
        except Exception as e:
            logger.error(f"Cleanup process failed: {e}")
    
    async def get_storage_stats(self) -> Dict[str, Any]:
        """Get storage usage statistics"""
        
        if not self.client:
            return {"error": "MinIO not available"}
        
        try:
            stats = {}
            
            for bucket_key, bucket_name in self.config.bucket_names.items():
                try:
                    objects = list(self.client.list_objects(bucket_name, recursive=True))
                    
                    total_size = sum(obj.size for obj in objects)
                    file_count = len(objects)
                    
                    stats[bucket_key] = {
                        "bucket_name": bucket_name,
                        "file_count": file_count,
                        "total_size_bytes": total_size,
                        "total_size_mb": round(total_size / (1024 * 1024), 2)
                    }
                    
                except Exception as e:
                    logger.error(f"Failed to get stats for bucket {bucket_name}: {e}")
                    stats[bucket_key] = {"error": str(e)}
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get storage stats: {e}")
            return {"error": str(e)}


# ========================================
# Global MinIO Client Instance
# ========================================

# Initialize global MinIO client
config = MinIOConfig()
minio_client = EnhancedMinIOClient(config)


# ========================================
# Initialization Function
# ========================================

async def initialize_minio() -> bool:
    """Initialize MinIO client and buckets"""
    return await minio_client.initialize()


# ========================================
# Utility Functions
# ========================================

async def upload_medical_image(
    image_data: bytes,
    filename: str,
    patient_id: str,
    content_type: str = "image/jpeg",
    metadata: Optional[Dict[str, str]] = None
) -> str:
    """Convenience function to upload medical image"""
    
    object_name = f"patient_{patient_id}/{filename}"
    
    upload_metadata = {
        "patient-id": patient_id,
        "image-type": "medical",
        **(metadata or {})
    }
    
    return await minio_client.upload_file(
        BUCKET_NAMES["medical_images"],
        object_name,
        image_data,
        content_type,
        upload_metadata
    )


async def upload_patient_document(
    document_data: bytes,
    filename: str,
    patient_id: str,
    document_type: str = "general",
    content_type: str = "application/pdf"
) -> str:
    """Convenience function to upload patient document"""
    
    object_name = f"patient_{patient_id}/documents/{filename}"
    
    metadata = {
        "patient-id": patient_id,
        "document-type": document_type
    }
    
    return await minio_client.upload_file(
        BUCKET_NAMES["documents"],
        object_name,
        document_data,
        content_type,
        metadata
    )