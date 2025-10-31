"""
Local Development Settings
Configuration for running Python backend locally with Docker services
"""

import os
from pydantic_settings import BaseSettings
from typing import Optional, List


class LocalSettings(BaseSettings):
    """Settings for local development environment"""
    
    # ========================================
    # Application Configuration
    # ========================================
    APP_NAME: str = "Medical AI Platform (Local Dev)"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    HOST: str = "localhost"
    PORT: int = 8000
    
    # ========================================
    # Security Configuration
    # ========================================
    JWT_SECRET_KEY: str = "medical_ai_jwt_secret_key_local_dev_2024"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # ========================================
    # MongoDB Configuration (Docker Service)
    # ========================================
    MONGODB_HOST: str = "localhost"
    MONGODB_PORT: int = 27017
    MONGODB_USERNAME: str = "admin"
    MONGODB_PASSWORD: str = "medical_ai_2024"
    MONGODB_DATABASE: str = "medical_ai_platform"
    
    @property
    def mongodb_url(self) -> str:
        return f"mongodb://{self.MONGODB_USERNAME}:{self.MONGODB_PASSWORD}@{self.MONGODB_HOST}:{self.MONGODB_PORT}/{self.MONGODB_DATABASE}?authSource=admin"
    
    # ========================================
    # Redis Configuration (Docker Service)
    # ========================================
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = "medical_redis_2024"
    REDIS_DB: int = 0
    
    @property
    def redis_url(self) -> str:
        return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
    
    # ========================================
    # MinIO Configuration (Docker Service)
    # ========================================
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "medical_minio_2024"
    MINIO_SECURE: bool = False
    
    # MinIO Bucket Configuration
    MINIO_BUCKET_MEDICAL_IMAGES: str = "medical-images"
    MINIO_BUCKET_DOCUMENTS: str = "medical-documents"
    MINIO_BUCKET_REPORTS: str = "medical-reports"
    
    # ========================================
    # CORS Configuration
    # ========================================
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://localhost:8080,http://127.0.0.1:3000,http://127.0.0.1:5173,http://127.0.0.1:8080"
    
    def get_cors_origins(self) -> List[str]:
        """Convert CORS_ORIGINS string to list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    # ========================================
    # File Upload Configuration
    # ========================================
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    UPLOAD_DIR: str = "uploads"
    ALLOWED_IMAGE_TYPES: str = "image/jpeg,image/png,image/dicom,application/dicom,image/tiff"
    
    def get_allowed_image_types(self) -> List[str]:
        """Convert ALLOWED_IMAGE_TYPES string to list"""
        return [img_type.strip() for img_type in self.ALLOWED_IMAGE_TYPES.split(",")]
    
    # ========================================
    # Logging Configuration
    # ========================================
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields from .env file


# Create settings instance
local_settings = LocalSettings()