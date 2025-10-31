"""
Enhanced Medical Images Routes with MinIO Integration
Comprehensive medical image management, upload, processing, and AI analysis
"""

from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form, BackgroundTasks
from fastapi.security import HTTPBearer
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import logging
import io
import uuid
from PIL import Image, ImageEnhance, ImageFilter
from bson import ObjectId
import asyncio
import base64

from models.image import MedicalImage, ImageMetadata, ImageAnalysisResult
from models.schemas import PyObjectId
from routes.enhanced_auth import get_current_user

try:
    from config.enhanced_database import enhanced_db as db
    from config.minio_client import minio_client, BUCKET_NAMES
except ImportError:
    from config.database import db
    # Mock MinIO client for development
    class MockMinIOClient:
        async def upload_file(self, bucket: str, filename: str, file_data: bytes) -> str:
            return f"mock:///{bucket}/{filename}"
        
        async def get_file_url(self, bucket: str, filename: str) -> str:
            return f"mock:///{bucket}/{filename}"
        
        async def delete_file(self, bucket: str, filename: str) -> bool:
            return True
    
    minio_client = MockMinIOClient()
    BUCKET_NAMES = {
        "medical_images": "medical-images",
        "documents": "documents",
        "processed": "processed-images"
    }

logger = logging.getLogger(__name__)
security = HTTPBearer()
router = APIRouter()


# ========================================
# Configuration and Constants
# ========================================

SUPPORTED_IMAGE_FORMATS = {
    "image/jpeg": "JPEG",
    "image/png": "PNG", 
    "image/tiff": "TIFF",
    "image/bmp": "BMP",
    "image/webp": "WEBP"
}

MEDICAL_IMAGE_TYPES = [
    "xray", "ct_scan", "mri", "ultrasound", "mammogram",
    "pet_scan", "ecg", "eeg", "microscopy", "endoscopy",
    "dermatology", "retinal", "pathology", "other"
]

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
MAX_FILES_PER_UPLOAD = 10


# ========================================
# Image Processing Utilities
# ========================================

class ImageProcessor:
    """Advanced medical image processing utilities"""
    
    @staticmethod
    async def validate_medical_image(file: UploadFile) -> Dict[str, Any]:
        """Validate uploaded medical image"""
        try:
            # Check file size
            file.file.seek(0, 2)  # Seek to end
            file_size = file.file.tell()
            file.file.seek(0)  # Reset to beginning
            
            if file_size > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=413,
                    detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
                )
            
            # Check content type
            if file.content_type not in SUPPORTED_IMAGE_FORMATS:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported format. Supported: {list(SUPPORTED_IMAGE_FORMATS.keys())}"
                )
            
            # Read and validate image
            image_data = await file.read()
            image = Image.open(io.BytesIO(image_data))
            
            # Extract metadata
            metadata = {
                "filename": file.filename,
                "content_type": file.content_type,
                "file_size": file_size,
                "format": image.format,
                "mode": image.mode,
                "width": image.width,
                "height": image.height,
                "has_transparency": image.mode in ("RGBA", "LA"),
                "exif_data": dict(image.getexif()) if hasattr(image, 'getexif') else {}
            }
            
            # Reset file pointer
            file.file.seek(0)
            
            return {
                "valid": True,
                "metadata": metadata,
                "image_data": image_data
            }
            
        except Exception as e:
            logger.error(f"Image validation error: {e}")
            raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")
    
    @staticmethod
    async def process_medical_image(image_data: bytes, processing_options: Dict[str, Any]) -> Dict[str, bytes]:
        """Process medical image with various enhancements"""
        try:
            image = Image.open(io.BytesIO(image_data))
            processed_images = {"original": image_data}
            
            # Convert to RGB if necessary
            if image.mode != "RGB":
                image = image.convert("RGB")
            
            # Apply processing options
            if processing_options.get("enhance_contrast"):
                enhancer = ImageEnhance.Contrast(image)
                enhanced = enhancer.enhance(1.5)
                processed_images["contrast_enhanced"] = ImageProcessor._image_to_bytes(enhanced)
            
            if processing_options.get("enhance_brightness"):
                enhancer = ImageEnhance.Brightness(image)
                enhanced = enhancer.enhance(1.2)
                processed_images["brightness_enhanced"] = ImageProcessor._image_to_bytes(enhanced)
            
            if processing_options.get("enhance_sharpness"):
                enhancer = ImageEnhance.Sharpness(image)
                enhanced = enhancer.enhance(1.3)
                processed_images["sharpness_enhanced"] = ImageProcessor._image_to_bytes(enhanced)
            
            if processing_options.get("apply_filters"):
                # Apply various medical imaging filters
                filtered = image.filter(ImageFilter.UnsharpMask())
                processed_images["unsharp_mask"] = ImageProcessor._image_to_bytes(filtered)
                
                filtered = image.filter(ImageFilter.EDGE_ENHANCE)
                processed_images["edge_enhanced"] = ImageProcessor._image_to_bytes(filtered)
            
            if processing_options.get("create_thumbnails"):
                # Create different thumbnail sizes
                for size in [(150, 150), (300, 300), (600, 600)]:
                    thumbnail = image.copy()
                    thumbnail.thumbnail(size, Image.Resampling.LANCZOS)
                    processed_images[f"thumbnail_{size[0]}"] = ImageProcessor._image_to_bytes(thumbnail)
            
            return processed_images
            
        except Exception as e:
            logger.error(f"Image processing error: {e}")
            raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")
    
    @staticmethod
    def _image_to_bytes(image: Image.Image) -> bytes:
        """Convert PIL Image to bytes"""
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='JPEG', quality=95)
        return img_byte_arr.getvalue()
    
    @staticmethod
    async def extract_dicom_metadata(file_path: str) -> Dict[str, Any]:
        """Extract DICOM metadata (placeholder for pydicom integration)"""
        # In production, use pydicom library
        return {
            "patient_name": "Patient Name",
            "study_date": datetime.now(timezone.utc).isoformat(),
            "modality": "CT",
            "institution": "Medical Center",
            "manufacturer": "Equipment Manufacturer",
            "study_description": "Medical Study"
        }


# ========================================
# Medical Images Routes
# ========================================

@router.post("/upload", response_model=Dict[str, Any])
async def upload_medical_images(
    background_tasks: BackgroundTasks,
    patient_id: str = Form(...),
    image_type: str = Form(...),
    diagnosis_id: Optional[str] = Form(None),
    description: Optional[str] = Form(""),
    processing_options: str = Form("{}"),
    files: List[UploadFile] = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Upload multiple medical images with processing options"""
    
    try:
        # Validate inputs
        if len(files) > MAX_FILES_PER_UPLOAD:
            raise HTTPException(
                status_code=400,
                detail=f"Too many files. Maximum {MAX_FILES_PER_UPLOAD} files per upload"
            )
        
        if image_type not in MEDICAL_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid image type. Supported: {MEDICAL_IMAGE_TYPES}"
            )
        
        # Parse processing options
        try:
            processing_opts = eval(processing_options) if processing_options else {}
        except:
            processing_opts = {}
        
        # Verify patient exists
        patient = await db.get_collection("patients").find_one({"_id": ObjectId(patient_id)})
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        uploaded_images = []
        
        for file in files:
            try:
                # Validate image
                validation_result = await ImageProcessor.validate_medical_image(file)
                image_data = validation_result["image_data"]
                metadata = validation_result["metadata"]
                
                # Generate unique filename
                file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
                unique_filename = f"{uuid.uuid4()}.{file_extension}"
                
                # Upload original to MinIO
                original_url = await minio_client.upload_file(
                    BUCKET_NAMES["medical_images"],
                    f"original/{unique_filename}",
                    image_data
                )
                
                # Process image if requested
                processed_urls = {}
                if processing_opts:
                    processed_images = await ImageProcessor.process_medical_image(image_data, processing_opts)
                    
                    for process_type, processed_data in processed_images.items():
                        if process_type != "original":
                            processed_filename = f"{process_type}_{unique_filename}"
                            url = await minio_client.upload_file(
                                BUCKET_NAMES["processed"],
                                processed_filename,
                                processed_data
                            )
                            processed_urls[process_type] = url
                
                # Create medical image document
                image_doc = MedicalImage(
                    filename=file.filename,
                    unique_filename=unique_filename,
                    patient_id=PyObjectId(patient_id),
                    diagnosis_id=PyObjectId(diagnosis_id) if diagnosis_id else None,
                    image_type=image_type,
                    description=description,
                    metadata=ImageMetadata(**metadata),
                    storage_urls={
                        "original": original_url,
                        **processed_urls
                    },
                    upload_timestamp=datetime.now(timezone.utc),
                    uploaded_by=PyObjectId(current_user["_id"]),
                    analysis_status="pending"
                )
                
                # Insert into database
                result = await db.get_collection("medical_images").insert_one(image_doc.dict())
                image_doc.id = result.inserted_id
                
                uploaded_images.append({
                    "id": str(image_doc.id),
                    "filename": image_doc.filename,
                    "image_type": image_doc.image_type,
                    "size": metadata["file_size"],
                    "dimensions": f"{metadata['width']}x{metadata['height']}",
                    "urls": image_doc.storage_urls,
                    "processing_applied": list(processed_urls.keys()) if processed_urls else []
                })
                
                # Schedule AI analysis in background
                if processing_opts.get("auto_analyze", True):
                    background_tasks.add_task(
                        schedule_image_analysis,
                        str(image_doc.id),
                        image_type
                    )
                
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"Error uploading image {file.filename}: {e}")
                continue
        
        if not uploaded_images:
            raise HTTPException(status_code=400, detail="No images were successfully uploaded")
        
        return {
            "success": True,
            "message": f"Successfully uploaded {len(uploaded_images)} medical images",
            "uploaded_images": uploaded_images,
            "patient_id": patient_id,
            "diagnosis_id": diagnosis_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload medical images error: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload medical images")


@router.get("/patient/{patient_id}", response_model=Dict[str, Any])
async def get_patient_medical_images(
    patient_id: str,
    image_type: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get all medical images for a specific patient"""
    
    try:
        # Verify patient exists and user has access
        patient = await db.get_collection("patients").find_one({"_id": ObjectId(patient_id)})
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Build query
        query = {"patient_id": ObjectId(patient_id)}
        if image_type:
            query["image_type"] = image_type
        
        # Get images with pagination
        images_cursor = db.get_collection("medical_images").find(query).skip(skip).limit(limit)
        images = await images_cursor.to_list(length=limit)
        
        # Get total count
        total_count = await db.get_collection("medical_images").count_documents(query)
        
        # Format response
        formatted_images = []
        for image in images:
            formatted_images.append({
                "id": str(image["_id"]),
                "filename": image["filename"],
                "image_type": image["image_type"],
                "description": image.get("description", ""),
                "upload_timestamp": image["upload_timestamp"],
                "analysis_status": image.get("analysis_status", "pending"),
                "metadata": {
                    "width": image["metadata"]["width"],
                    "height": image["metadata"]["height"],
                    "file_size": image["metadata"]["file_size"],
                    "format": image["metadata"]["format"]
                },
                "urls": image["storage_urls"],
                "has_analysis": bool(image.get("analysis_results"))
            })
        
        return {
            "images": formatted_images,
            "total_count": total_count,
            "page_info": {
                "skip": skip,
                "limit": limit,
                "has_more": skip + limit < total_count
            },
            "patient_info": {
                "id": str(patient["_id"]),
                "name": f"{patient['first_name']} {patient['last_name']}"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get patient medical images error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve medical images")


@router.get("/diagnosis/{diagnosis_id}", response_model=Dict[str, Any])
async def get_diagnosis_medical_images(
    diagnosis_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get all medical images associated with a specific diagnosis"""
    
    try:
        # Verify diagnosis exists
        diagnosis = await db.get_collection("diagnoses").find_one({"_id": ObjectId(diagnosis_id)})
        if not diagnosis:
            raise HTTPException(status_code=404, detail="Diagnosis not found")
        
        # Get images
        images_cursor = db.get_collection("medical_images").find({"diagnosis_id": ObjectId(diagnosis_id)})
        images = await images_cursor.to_list(length=None)
        
        # Format response
        formatted_images = []
        for image in images:
            analysis_results = image.get("analysis_results")
            
            formatted_images.append({
                "id": str(image["_id"]),
                "filename": image["filename"],
                "image_type": image["image_type"],
                "description": image.get("description", ""),
                "upload_timestamp": image["upload_timestamp"],
                "analysis_status": image.get("analysis_status", "pending"),
                "urls": image["storage_urls"],
                "analysis_summary": {
                    "confidence": analysis_results.get("confidence", 0) if analysis_results else 0,
                    "findings": len(analysis_results.get("findings", [])) if analysis_results else 0,
                    "abnormalities_detected": analysis_results.get("abnormalities_detected", False) if analysis_results else False
                } if analysis_results else None
            })
        
        return {
            "images": formatted_images,
            "total_count": len(formatted_images),
            "diagnosis_info": {
                "id": str(diagnosis["_id"]),
                "patient_id": str(diagnosis["patient_id"]),
                "status": diagnosis["status"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get diagnosis medical images error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve diagnosis medical images")


@router.get("/{image_id}", response_model=Dict[str, Any])
async def get_medical_image_details(
    image_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get detailed information about a specific medical image"""
    
    try:
        image = await db.get_collection("medical_images").find_one({"_id": ObjectId(image_id)})
        if not image:
            raise HTTPException(status_code=404, detail="Medical image not found")
        
        # Get patient info
        patient = await db.get_collection("patients").find_one({"_id": image["patient_id"]})
        
        # Format response
        return {
            "id": str(image["_id"]),
            "filename": image["filename"],
            "unique_filename": image["unique_filename"],
            "image_type": image["image_type"],
            "description": image.get("description", ""),
            "upload_timestamp": image["upload_timestamp"],
            "analysis_status": image.get("analysis_status", "pending"),
            "metadata": image["metadata"],
            "storage_urls": image["storage_urls"],
            "analysis_results": image.get("analysis_results"),
            "patient_info": {
                "id": str(patient["_id"]),
                "name": f"{patient['first_name']} {patient['last_name']}"
            } if patient else None,
            "diagnosis_id": str(image["diagnosis_id"]) if image.get("diagnosis_id") else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get medical image details error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve medical image details")


@router.post("/{image_id}/analyze", response_model=Dict[str, Any])
async def analyze_medical_image(
    image_id: str,
    background_tasks: BackgroundTasks,
    analysis_options: Dict[str, Any] = {},
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Trigger AI analysis for a specific medical image"""
    
    try:
        # Verify image exists
        image = await db.get_collection("medical_images").find_one({"_id": ObjectId(image_id)})
        if not image:
            raise HTTPException(status_code=404, detail="Medical image not found")
        
        # Update analysis status
        await db.get_collection("medical_images").update_one(
            {"_id": ObjectId(image_id)},
            {
                "$set": {
                    "analysis_status": "processing",
                    "analysis_started_at": datetime.now(timezone.utc)
                }
            }
        )
        
        # Schedule analysis in background
        background_tasks.add_task(
            perform_image_analysis,
            image_id,
            image["image_type"],
            analysis_options
        )
        
        return {
            "success": True,
            "message": "Medical image analysis started",
            "image_id": image_id,
            "analysis_status": "processing",
            "estimated_completion": "2-5 minutes"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analyze medical image error: {e}")
        raise HTTPException(status_code=500, detail="Failed to start image analysis")


@router.delete("/{image_id}", response_model=Dict[str, Any])
async def delete_medical_image(
    image_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a medical image and its associated files"""
    
    try:
        # Verify image exists
        image = await db.get_collection("medical_images").find_one({"_id": ObjectId(image_id)})
        if not image:
            raise HTTPException(status_code=404, detail="Medical image not found")
        
        # Delete files from MinIO
        storage_urls = image.get("storage_urls", {})
        for url_type, url in storage_urls.items():
            try:
                # Extract filename from URL for deletion
                filename = url.split('/')[-1] if url.startswith('mock://') else image["unique_filename"]
                bucket = BUCKET_NAMES["medical_images"] if url_type == "original" else BUCKET_NAMES["processed"]
                await minio_client.delete_file(bucket, filename)
            except Exception as e:
                logger.warning(f"Failed to delete file {url}: {e}")
        
        # Delete from database
        delete_result = await db.get_collection("medical_images").delete_one({"_id": ObjectId(image_id)})
        
        if delete_result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Medical image not found")
        
        return {
            "success": True,
            "message": "Medical image deleted successfully",
            "deleted_image_id": image_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete medical image error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete medical image")


# ========================================
# Background Analysis Functions
# ========================================

async def schedule_image_analysis(image_id: str, image_type: str):
    """Schedule AI analysis for uploaded image"""
    try:
        await asyncio.sleep(2)  # Simulate processing delay
        await perform_image_analysis(image_id, image_type, {})
    except Exception as e:
        logger.error(f"Scheduled analysis error for {image_id}: {e}")


async def perform_image_analysis(image_id: str, image_type: str, options: Dict[str, Any]):
    """Perform AI analysis on medical image (simulation)"""
    try:
        # Simulate AI analysis processing time
        await asyncio.sleep(5)
        
        # Generate mock analysis results based on image type
        import random
        
        confidence = random.uniform(0.75, 0.95)
        
        # Image-type specific analysis results
        analysis_results = ImageAnalysisResult(
            analysis_type="ai_detection",
            confidence=confidence,
            findings=[
                f"Finding 1 for {image_type}",
                f"Finding 2 for {image_type}",
                f"Finding 3 for {image_type}"
            ],
            abnormalities_detected=random.choice([True, False]),
            severity_score=random.uniform(0.1, 0.8),
            recommendations=[
                "Follow-up recommended",
                "Additional imaging may be needed",
                "Consult with specialist"
            ],
            analysis_timestamp=datetime.now(timezone.utc),
            processing_time_seconds=random.uniform(3, 8),
            model_version="v2.1.0",
            additional_data={
                "regions_of_interest": [
                    {"x": 100, "y": 150, "width": 50, "height": 75, "confidence": 0.89},
                    {"x": 200, "y": 250, "width": 60, "height": 80, "confidence": 0.76}
                ],
                "technical_quality": "good",
                "contrast_adequacy": "sufficient"
            }
        )
        
        # Update image with analysis results
        await db.get_collection("medical_images").update_one(
            {"_id": ObjectId(image_id)},
            {
                "$set": {
                    "analysis_status": "completed",
                    "analysis_results": analysis_results.dict(),
                    "analysis_completed_at": datetime.now(timezone.utc)
                }
            }
        )
        
        logger.info(f"Completed AI analysis for image {image_id}")
        
        # TODO: Send WebSocket notification about completion
        # await notify_analysis_complete(image_id, analysis_results.dict())
        
    except Exception as e:
        logger.error(f"AI analysis error for {image_id}: {e}")
        
        # Update status to failed
        await db.get_collection("medical_images").update_one(
            {"_id": ObjectId(image_id)},
            {
                "$set": {
                    "analysis_status": "failed",
                    "analysis_error": str(e),
                    "analysis_failed_at": datetime.now(timezone.utc)
                }
            }
        )