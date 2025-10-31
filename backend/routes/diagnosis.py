"""
Diagnosis management routes - Complete workflow matching frontend requirements
"""

from fastapi import APIRouter, HTTPException, Query, Depends, status, UploadFile, File, BackgroundTasks
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime
import asyncio
from config.database import Database
from services.coordinator import AgentCoordinator
from models.schemas import (
    DiagnosisRequest, DiagnosisResponse, DiagnosisStatus,
    DiagnosisResults, PaginatedDiagnoses, DiagnosisTimeline,
    DiagnosisComment, ErrorResponse
)

logger = logging.getLogger(__name__)

# Dependencies
def get_db():
    return Database()

def get_coordinator():
    return AgentCoordinator()

# Create router
diagnosis_router = APIRouter(prefix="/api/diagnosis", tags=["Diagnosis"])

@diagnosis_router.post("/new", response_model=DiagnosisResponse)
async def create_diagnosis(
    diagnosis_data: DiagnosisRequest,
    background_tasks: BackgroundTasks,
    db: Database = Depends(get_db),
    coordinator: AgentCoordinator = Depends(get_coordinator)
):
    """Create new diagnosis and start AI processing"""
    try:
        # Generate unique diagnosis ID
        diagnosis_id = f"D-{int(datetime.utcnow().timestamp() * 1000)}"
        
        # Create diagnosis document
        diagnosis_doc = {
            "diagnosis_id": diagnosis_id,
            "patient_id": diagnosis_data.patient_id,
            "image_ids": diagnosis_data.image_ids,
            "symptoms": diagnosis_data.symptoms,
            "medical_history": diagnosis_data.medical_history,
            "current_medications": diagnosis_data.current_medications,
            "vital_signs": diagnosis_data.vital_signs,
            "priority": diagnosis_data.priority,
            "status": "processing",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "processing_start": datetime.utcnow()
        }
        
        # Save to database
        await db.create_diagnosis(diagnosis_doc)
        
        # Start AI processing in background
        background_tasks.add_task(
            coordinator.process_diagnosis, 
            diagnosis_id, 
            diagnosis_data.dict()
        )
        
        return DiagnosisResponse(
            success=True,
            diagnosis_id=diagnosis_id,
            status="processing",
            message="Diagnosis started successfully"
        )
        
    except Exception as e:
        logger.error(f"Failed to create diagnosis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create diagnosis"
        )

@diagnosis_router.get("", response_model=PaginatedDiagnoses)
async def get_diagnoses(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    patient_id: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    sortBy: str = Query("created_at"),
    sortOrder: str = Query("desc"),
    db: Database = Depends(get_db)
):
    """Get all diagnoses with pagination and filtering"""
    try:
        # Build filters
        filters = {}
        if status_filter:
            filters["status"] = status_filter
        if patient_id:
            filters["patient_id"] = patient_id
        if priority:
            filters["priority"] = priority
        
        # Build sort
        sort_direction = -1 if sortOrder == "desc" else 1
        sort_criteria = [(sortBy, sort_direction)]
        
        # Get diagnoses with pagination
        diagnoses_data = await db.get_diagnoses_paginated(
            page=page,
            limit=limit,
            filters=filters,
            sort=sort_criteria
        )
        
        return PaginatedDiagnoses(
            success=True,
            data=diagnoses_data["diagnoses"],
            pagination={
                "page": page,
                "limit": limit,
                "total": diagnoses_data["total"],
                "pages": (diagnoses_data["total"] + limit - 1) // limit
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to get diagnoses: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve diagnoses"
        )

@diagnosis_router.get("/{diagnosis_id}")
async def get_diagnosis(
    diagnosis_id: str,
    db: Database = Depends(get_db)
):
    """Get diagnosis by ID"""
    try:
        diagnosis = await db.get_diagnosis(diagnosis_id)
        
        if not diagnosis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis not found"
            )
        
        return {
            "success": True,
            "data": diagnosis
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get diagnosis {diagnosis_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve diagnosis"
        )

@diagnosis_router.get("/{diagnosis_id}/status")
async def get_diagnosis_status(
    diagnosis_id: str,
    db: Database = Depends(get_db),
    coordinator: AgentCoordinator = Depends(get_coordinator)
):
    """Get real-time diagnosis status"""
    try:
        diagnosis = await db.get_diagnosis(diagnosis_id)
        
        if not diagnosis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis not found"
            )
        
        # Get detailed status from coordinator
        detailed_status = await coordinator.get_diagnosis_status(diagnosis_id)
        
        return {
            "success": True,
            "data": {
                "diagnosis_id": diagnosis_id,
                "status": diagnosis.get("status", "unknown"),
                "progress": detailed_status.get("progress", 0),
                "current_step": detailed_status.get("current_step", ""),
                "agents_status": detailed_status.get("agents", {}),
                "estimated_completion": detailed_status.get("estimated_completion"),
                "updated_at": diagnosis.get("updated_at")
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get diagnosis status {diagnosis_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get diagnosis status"
        )

@diagnosis_router.get("/{diagnosis_id}/results")
async def get_diagnosis_results(
    diagnosis_id: str,
    db: Database = Depends(get_db)
):
    """Get complete diagnosis results"""
    try:
        diagnosis = await db.get_diagnosis(diagnosis_id)
        
        if not diagnosis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis not found"
            )
        
        # Get results from database
        results = await db.get_diagnosis_results(diagnosis_id)
        
        return {
            "success": True,
            "data": results
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get diagnosis results {diagnosis_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve diagnosis results"
        )

@diagnosis_router.post("/{diagnosis_id}/cancel")
async def cancel_diagnosis(
    diagnosis_id: str,
    reason: str,
    db: Database = Depends(get_db),
    coordinator: AgentCoordinator = Depends(get_coordinator)
):
    """Cancel diagnosis processing"""
    try:
        diagnosis = await db.get_diagnosis(diagnosis_id)
        
        if not diagnosis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis not found"
            )
        
        if diagnosis["status"] not in ["processing", "pending"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel diagnosis in current state"
            )
        
        # Cancel processing
        await coordinator.cancel_diagnosis(diagnosis_id)
        
        # Update database
        await db.update_diagnosis(diagnosis_id, {
            "status": "cancelled",
            "cancelled_at": datetime.utcnow(),
            "cancellation_reason": reason,
            "updated_at": datetime.utcnow()
        })
        
        return {
            "success": True,
            "message": "Diagnosis cancelled successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to cancel diagnosis {diagnosis_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel diagnosis"
        )

@diagnosis_router.post("/{diagnosis_id}/retry")
async def retry_diagnosis(
    diagnosis_id: str,
    background_tasks: BackgroundTasks,
    db: Database = Depends(get_db),
    coordinator: AgentCoordinator = Depends(get_coordinator)
):
    """Retry failed diagnosis"""
    try:
        diagnosis = await db.get_diagnosis(diagnosis_id)
        
        if not diagnosis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis not found"
            )
        
        if diagnosis["status"] not in ["failed", "error"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot retry diagnosis in current state"
            )
        
        # Reset status and retry
        await db.update_diagnosis(diagnosis_id, {
            "status": "processing",
            "retry_count": diagnosis.get("retry_count", 0) + 1,
            "retry_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        
        # Start processing again
        background_tasks.add_task(
            coordinator.process_diagnosis, 
            diagnosis_id, 
            diagnosis
        )
        
        return {
            "success": True,
            "message": "Diagnosis retry started successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to retry diagnosis {diagnosis_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retry diagnosis"
        )

@diagnosis_router.get("/{diagnosis_id}/timeline")
async def get_diagnosis_timeline(
    diagnosis_id: str,
    db: Database = Depends(get_db)
):
    """Get diagnosis processing timeline"""
    try:
        diagnosis = await db.get_diagnosis(diagnosis_id)
        
        if not diagnosis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis not found"
            )
        
        timeline = await db.get_diagnosis_timeline(diagnosis_id)
        
        return {
            "success": True,
            "data": timeline
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get diagnosis timeline {diagnosis_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve diagnosis timeline"
        )

@diagnosis_router.get("/{diagnosis_id}/agents")
async def get_agent_reports(
    diagnosis_id: str,
    db: Database = Depends(get_db)
):
    """Get all agent reports for diagnosis"""
    try:
        diagnosis = await db.get_diagnosis(diagnosis_id)
        
        if not diagnosis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis not found"
            )
        
        agent_reports = await db.get_agent_reports(diagnosis_id)
        
        return {
            "success": True,
            "data": agent_reports
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get agent reports {diagnosis_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve agent reports"
        )

@diagnosis_router.get("/{diagnosis_id}/agents/{agent_name}")
async def get_agent_report(
    diagnosis_id: str,
    agent_name: str,
    db: Database = Depends(get_db)
):
    """Get specific agent report"""
    try:
        diagnosis = await db.get_diagnosis(diagnosis_id)
        
        if not diagnosis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis not found"
            )
        
        agent_report = await db.get_agent_report(diagnosis_id, agent_name)
        
        if not agent_report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent report not found"
            )
        
        return {
            "success": True,
            "data": agent_report
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get agent report {diagnosis_id}/{agent_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve agent report"
        )

@diagnosis_router.post("/{diagnosis_id}/images")
async def upload_medical_images(
    diagnosis_id: str,
    images: List[UploadFile] = File(...),
    db: Database = Depends(get_db)
):
    """Upload medical images for diagnosis"""
    try:
        diagnosis = await db.get_diagnosis(diagnosis_id)
        
        if not diagnosis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis not found"
            )
        
        uploaded_images = []
        
        for image in images:
            # Save image and get image_id
            image_id = await db.save_medical_image(diagnosis_id, image)
            uploaded_images.append({
                "image_id": image_id,
                "filename": image.filename,
                "size": image.size
            })
        
        # Update diagnosis with new image IDs
        current_images = diagnosis.get("image_ids", [])
        updated_images = current_images + [img["image_id"] for img in uploaded_images]
        
        await db.update_diagnosis(diagnosis_id, {
            "image_ids": updated_images,
            "updated_at": datetime.utcnow()
        })
        
        return {
            "success": True,
            "data": uploaded_images,
            "message": f"Successfully uploaded {len(uploaded_images)} images"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to upload images for diagnosis {diagnosis_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload images"
        )

@diagnosis_router.get("/stats")
async def get_diagnosis_stats(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    db: Database = Depends(get_db)
):
    """Get diagnosis statistics"""
    try:
        stats = await db.get_diagnosis_statistics(date_from, date_to)
        
        return {
            "success": True,
            "data": stats
        }
        
    except Exception as e:
        logger.error(f"Failed to get diagnosis stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve diagnosis statistics"
        )

@diagnosis_router.get("/analytics")
async def get_diagnosis_analytics(
    period: str = Query("30d"),
    db: Database = Depends(get_db)
):
    """Get diagnosis analytics"""
    try:
        analytics = await db.get_diagnosis_analytics(period)
        
        return {
            "success": True,
            "data": analytics
        }
        
    except Exception as e:
        logger.error(f"Failed to get diagnosis analytics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve diagnosis analytics"
        )