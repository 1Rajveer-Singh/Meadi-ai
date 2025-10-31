"""Configuration settings for Python AI services"""

from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # MongoDB
    mongodb_uri: str = "mongodb://admin:healthguard2025@localhost:27017/healthguard?authSource=admin"
    database_name: str = "healthguard"
    
    # Redis
    redis_uri: str = "redis://:healthguard2025@localhost:6379"
    redis_db: int = 0
    
    # MinIO Object Storage
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "healthguard2025"
    minio_secure: bool = False
    minio_bucket: str = "healthguard"
    
    # Security
    secret_key: str = "your-secret-key-here-change-in-production"
    access_token_expire_minutes: int = 30
    algorithm: str = "HS256"
    
    # AI API Keys
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    
    # Application
    environment: str = "development"
    debug: bool = True
    app_name: str = "AgenticAI HealthGuard"
    version: str = "1.0.0"
    
    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:5175"
    
    # File Upload
    max_file_size: int = 50 * 1024 * 1024  # 50MB
    allowed_image_types: str = "image/jpeg,image/png,image/dicom,application/dicom"
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


    @property
    def cors_origins_list(self) -> list:
        """Convert CORS origins string to list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    @property
    def allowed_image_types_list(self) -> list:
        """Convert allowed image types string to list"""
        return [img_type.strip() for img_type in self.allowed_image_types.split(",")]


settings = Settings()
