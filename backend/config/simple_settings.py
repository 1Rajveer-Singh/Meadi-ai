"""
Simple Local Development Settings
Configuration for running Python backend locally with simple Docker services (no auth)
"""

import os
from pydantic_settings import BaseSettings
from typing import Optional, List


class SimpleLocalSettings(BaseSettings):
    """Settings for simple local development environment"""
    
    # ========================================
    # Application Configuration
    # ========================================
    APP_NAME: str = "Medical AI Platform (Simple Dev)"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    HOST: str = "localhost"
    PORT: int = 8000
    
    # ========================================
    # Security Configuration
    # ========================================
    JWT_SECRET_KEY: str = "medical_ai_jwt_secret_key_simple_dev_2024"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # ========================================
    # MongoDB Configuration (Docker Service - Try with and without auth)
    # ========================================
    MONGODB_HOST: str = "localhost"
    MONGODB_PORT: int = 27017
    MONGODB_DATABASE: str = "medical_ai_platform"
    MONGODB_USERNAME: str = "admin"
    MONGODB_PASSWORD: str = "medical_ai_2024"
    
    @property
    def mongodb_url(self) -> str:
        # Try without auth first for simple development
        return f"mongodb://{self.MONGODB_HOST}:{self.MONGODB_PORT}/{self.MONGODB_DATABASE}"
    
    @property
    def mongodb_url_with_auth(self) -> str:
        return f"mongodb://{self.MONGODB_USERNAME}:{self.MONGODB_PASSWORD}@{self.MONGODB_HOST}:{self.MONGODB_PORT}/{self.MONGODB_DATABASE}"
    
    # ========================================
    # Redis Configuration (Docker Service - Try with and without auth)
    # ========================================
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str = "medical_redis_2024"
    
    @property
    def redis_url(self) -> str:
        # Try without auth first for simple development
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
    
    @property
    def redis_url_with_auth(self) -> str:
        return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
    
    # ========================================
    # MinIO Configuration (Docker Service) - Fixed credentials
    # ========================================
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "medical_minio_2024"
    MINIO_SECURE: bool = False    # MinIO Bucket Configuration
    MINIO_BUCKET_MEDICAL_IMAGES: str = "medical-images"
    MINIO_BUCKET_DOCUMENTS: str = "medical-documents"
    MINIO_BUCKET_REPORTS: str = "medical-reports"
    MINIO_BUCKET_XRAY_DATASET: str = "nih-chest-xrays"  # For NIH dataset
    
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
    # AI Model Configuration
    # ========================================
    OPENAI_API_KEY: str = "your-openai-key-here"  # Optional for development
    ANTHROPIC_API_KEY: str = "your-anthropic-key-here"  # Optional for development
    
    # ========================================
    # Multi-Agent System Configuration
    # ========================================
    
    # Image Analysis Agent Configuration
    MONAI_MODEL_PATH: str = "models/monai_chest_xray"
    NIH_DATASET_PATH: str = "data/nih_chest_xrays"
    IMAGE_ANALYSIS_CONFIDENCE_THRESHOLD: float = 0.7
    
    # History Synthesis Agent Configuration
    EHR_INTEGRATION_ENABLED: bool = True
    LAB_DATA_RETENTION_DAYS: int = 365
    
    # Drug Interaction Agent Configuration
    DRUG_DATABASE_UPDATE_INTERVAL: int = 24  # hours
    CRITICAL_INTERACTION_THRESHOLD: float = 0.8
    
    # Research Agent Configuration
    CLINICAL_TRIALS_API_ENABLED: bool = True
    PUBMED_API_KEY: str = ""  # Optional
    RESEARCH_CACHE_TTL: int = 3600  # seconds
    
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
simple_settings = SimpleLocalSettings()