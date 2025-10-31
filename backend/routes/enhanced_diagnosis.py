"""
Enhanced Diagnosis Management Routes
Comprehensive AI diagnosis workflow with real-time updates and agent coordination
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query, File, UploadFile, BackgroundTasks
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import logging
from bson import ObjectId
import uuid
import asyncio

from models.diagnosis import (
    Diagnosis, DiagnosisCreate, DiagnosisUpdate, DiagnosisResponse, 
    DiagnosisRequest, AgentsReports, ProgressTracking, DiagnosisResults
)
from routes.enhanced_auth import get_current_active_user

try:
    from config.enhanced_database import enhanced_db as db
except ImportError:
    from config.database import db

logger = logging.getLogger(__name__)

# Initialize router
diagnosis_router = APIRouter(prefix="/diagnosis", tags=["Diagnosis"])
router = diagnosis_router  # Export for compatibility


def generate_diagnosis_id() -> str:
    """Generate unique diagnosis ID"""
    return f"D-{datetime.now().year}-{str(uuid.uuid4())[:8].upper()}"


# ========================================
# Diagnosis CRUD Operations
# ========================================

@diagnosis_router.get("", response_model=List[DiagnosisResponse])
async def get_diagnoses(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    patient_id: Optional[str] = Query(None, description="Filter by patient ID"),
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Get paginated list of diagnoses with filters"""
    try:
        # Build query
        query = {}
        
        if status:
            query["status"] = status
        if priority:
            query["priority"] = priority
        if patient_id:
            # Try to find patient first
            patient_doc = await db.get_collection("patients").find_one({"patient_id": patient_id})
            if patient_doc:
                query["patient_id"] = patient_doc["_id"]
        
        # Calculate skip
        skip = (page - 1) * per_page
        
        # Get diagnoses
        cursor = db.get_collection("diagnoses").find(query)
        cursor = cursor.sort("created_at", -1).skip(skip).limit(per_page)
        
        diagnoses_docs = await cursor.to_list(length=per_page)
        
        # Convert to response format
        diagnoses = []
        for doc in diagnoses_docs:
            doc["id"] = str(doc["_id"])
            diagnoses.append(DiagnosisResponse(
                id=doc["id"],
                diagnosis_id=doc["diagnosis_id"],
                patient_id=str(doc["patient_id"]),
                status=doc["status"],
                priority=doc["priority"],
                progress=doc.get("progress"),
                results=doc.get("results"),
                created_at=doc["created_at"],
                updated_at=doc["updated_at"]
            ))
        
        return diagnoses
        
    except Exception as e:
        logger.error(f"Get diagnoses error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve diagnoses"
        )


@diagnosis_router.post("/new", response_model=DiagnosisResponse)
async def create_diagnosis(
    diagnosis_data: DiagnosisCreate,
    background_tasks: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Create a new diagnosis and start AI analysis"""
    try:
        # Validate patient exists
        patient_doc = await db.get_collection("patients").find_one({"patient_id": diagnosis_data.patient_id})
        if not patient_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )
        
        # Generate unique diagnosis ID
        diagnosis_id = generate_diagnosis_id()
        
        # Create initial progress tracking
        initial_progress = ProgressTracking(
            percentage=0.0,
            current_stage="initialized",
            stages_completed=[],
            estimated_completion=None
        )
        
        # Create diagnosis document
        diagnosis_doc = {
            "diagnosis_id": diagnosis_id,
            "patient_id": patient_doc["_id"],
            "status": "pending",
            "priority": diagnosis_data.priority,
            "patient_data": diagnosis_data.patient_data.dict() if diagnosis_data.patient_data else None,
            "ai_config": diagnosis_data.ai_config.dict() if diagnosis_data.ai_config else None,
            "progress": initial_progress.dict(),
            "agents_reports": {},
            "results": None,
            "created_by": ObjectId(current_user["id"]),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        # Insert diagnosis
        result = await db.get_collection("diagnoses").insert_one(diagnosis_doc)
        created_id = str(result.inserted_id)
        
        # Start AI analysis in background
        background_tasks.add_task(start_ai_analysis, diagnosis_id, diagnosis_data.ai_config)
        
        # Return response
        return DiagnosisResponse(
            id=created_id,
            diagnosis_id=diagnosis_id,
            patient_id=diagnosis_data.patient_id,
            status="pending",
            priority=diagnosis_data.priority,
            progress=initial_progress,
            results=None,
            created_at=diagnosis_doc["created_at"],
            updated_at=diagnosis_doc["updated_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create diagnosis error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create diagnosis"
        )


@diagnosis_router.get("/{diagnosis_id}", response_model=DiagnosisResponse)
async def get_diagnosis(
    diagnosis_id: str,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Get diagnosis by ID"""
    try:
        # Try to find by ObjectId first, then by diagnosis_id
        diagnosis_doc = None
        
        if ObjectId.is_valid(diagnosis_id):
            diagnosis_doc = await db.get_collection("diagnoses").find_one({"_id": ObjectId(diagnosis_id)})
        
        if not diagnosis_doc:
            diagnosis_doc = await db.get_collection("diagnoses").find_one({"diagnosis_id": diagnosis_id})
        
        if not diagnosis_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis not found"
            )
        
        diagnosis_doc["id"] = str(diagnosis_doc["_id"])
        
        return DiagnosisResponse(
            id=diagnosis_doc["id"],
            diagnosis_id=diagnosis_doc["diagnosis_id"],
            patient_id=str(diagnosis_doc["patient_id"]),
            status=diagnosis_doc["status"],
            priority=diagnosis_doc["priority"],
            progress=diagnosis_doc.get("progress"),
            results=diagnosis_doc.get("results"),
            created_at=diagnosis_doc["created_at"],
            updated_at=diagnosis_doc["updated_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get diagnosis error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve diagnosis"
        )


@diagnosis_router.get("/{diagnosis_id}/status")
async def get_diagnosis_status(
    diagnosis_id: str,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Get real-time diagnosis status for polling"""
    try:
        diagnosis_doc = await db.get_collection("diagnoses").find_one({"diagnosis_id": diagnosis_id})
        if not diagnosis_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis not found"
            )
        
        return {
            "diagnosis_id": diagnosis_id,
            "status": diagnosis_doc["status"],
            "progress": diagnosis_doc.get("progress", {}),
            "agents_reports": diagnosis_doc.get("agents_reports", {}),
            "updated_at": diagnosis_doc["updated_at"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get diagnosis status error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get diagnosis status"
        )


@diagnosis_router.get("/{diagnosis_id}/results")
async def get_diagnosis_results(
    diagnosis_id: str,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Get comprehensive diagnosis results"""
    try:
        diagnosis_doc = await db.get_collection("diagnoses").find_one({"diagnosis_id": diagnosis_id})
        if not diagnosis_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis not found"
            )
        
        if diagnosis_doc["status"] != "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Diagnosis not yet completed"
            )
        
        return {
            "diagnosis_id": diagnosis_id,
            "status": diagnosis_doc["status"],
            "results": diagnosis_doc.get("results", {}),
            "agents_reports": diagnosis_doc.get("agents_reports", {}),
            "completed_at": diagnosis_doc.get("completed_at"),
            "processing_time": diagnosis_doc.get("processing_time")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get diagnosis results error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get diagnosis results"
        )


@diagnosis_router.get("/{diagnosis_id}/agents")
async def get_agents_reports(
    diagnosis_id: str,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Get AI agents reports for diagnosis"""
    try:
        diagnosis_doc = await db.get_collection("diagnoses").find_one({"diagnosis_id": diagnosis_id})
        if not diagnosis_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis not found"
            )
        
        agents_reports = diagnosis_doc.get("agents_reports", {})
        
        return {
            "diagnosis_id": diagnosis_id,
            "agents_reports": agents_reports,
            "last_updated": diagnosis_doc["updated_at"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get agents reports error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get agents reports"
        )


@diagnosis_router.get("/{diagnosis_id}/agents/{agent_name}")
async def get_agent_report(
    diagnosis_id: str,
    agent_name: str,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Get specific AI agent report"""
    try:
        valid_agents = ["monai", "history", "drug_checker", "research"]
        if agent_name not in valid_agents:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid agent name. Valid agents: {valid_agents}"
            )
        
        diagnosis_doc = await db.get_collection("diagnoses").find_one({"diagnosis_id": diagnosis_id})
        if not diagnosis_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis not found"
            )
        
        agents_reports = diagnosis_doc.get("agents_reports", {})
        agent_report = agents_reports.get(agent_name)
        
        if not agent_report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent report not found for {agent_name}"
            )
        
        return {
            "diagnosis_id": diagnosis_id,
            "agent_name": agent_name,
            "report": agent_report,
            "last_updated": diagnosis_doc["updated_at"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get agent report error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get agent report"
        )


@diagnosis_router.post("/{diagnosis_id}/images")
async def upload_medical_images(
    diagnosis_id: str,
    files: List[UploadFile] = File(...),
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Upload medical images for diagnosis"""
    try:
        # Validate diagnosis exists
        diagnosis_doc = await db.get_collection("diagnoses").find_one({"diagnosis_id": diagnosis_id})
        if not diagnosis_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis not found"
            )
        
        # For now, return placeholder response
        # In production, integrate with MinIO for image storage and MONAI for analysis
        uploaded_files = []
        for file in files:
            uploaded_files.append({
                "filename": file.filename,
                "size": file.size,
                "content_type": file.content_type
            })
        
        return {
            "diagnosis_id": diagnosis_id,
            "message": "Images uploaded successfully (MinIO integration pending)",
            "uploaded_files": uploaded_files,
            "total_files": len(uploaded_files)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload images error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload images"
        )


@diagnosis_router.delete("/{diagnosis_id}")
async def cancel_diagnosis(
    diagnosis_id: str,
    reason: Optional[str] = Query(None, description="Cancellation reason"),
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Cancel diagnosis"""
    try:
        # Find diagnosis
        diagnosis_doc = await db.get_collection("diagnoses").find_one({"diagnosis_id": diagnosis_id})
        if not diagnosis_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis not found"
            )
        
        # Check if diagnosis can be cancelled
        if diagnosis_doc["status"] in ["completed", "cancelled"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel completed or already cancelled diagnosis"
            )
        
        # Update diagnosis status
        update_data = {
            "status": "cancelled",
            "cancelled_at": datetime.now(timezone.utc),
            "cancelled_by": ObjectId(current_user["id"]),
            "updated_at": datetime.now(timezone.utc)
        }
        
        if reason:
            update_data["cancellation_reason"] = reason
        
        await db.get_collection("diagnoses").update_one(
            {"diagnosis_id": diagnosis_id},
            {"$set": update_data}
        )
        
        return {"message": "Diagnosis cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Cancel diagnosis error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel diagnosis"
        )


# ========================================
# Advanced Diagnosis Operations
# ========================================

@diagnosis_router.get("/{diagnosis_id}/timeline")
async def get_diagnosis_timeline(
    diagnosis_id: str,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Get diagnosis timeline and history"""
    try:
        diagnosis_doc = await db.get_collection("diagnoses").find_one({"diagnosis_id": diagnosis_id})
        if not diagnosis_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis not found"
            )
        
        # Build timeline from progress stages and agent reports
        timeline = []
        
        # Add creation event
        timeline.append({
            "timestamp": diagnosis_doc["created_at"],
            "event": "diagnosis_created",
            "description": "Diagnosis created and initialized",
            "actor": "system"
        })
        
        # Add progress events
        progress = diagnosis_doc.get("progress", {})
        stages_completed = progress.get("stages_completed", [])
        
        for stage in stages_completed:
            timeline.append({
                "timestamp": diagnosis_doc["updated_at"],  # Placeholder - would need actual timestamps
                "event": f"stage_{stage}",
                "description": f"Completed stage: {stage}",
                "actor": "ai_system"
            })
        
        # Add completion event if applicable
        if diagnosis_doc["status"] == "completed":
            timeline.append({
                "timestamp": diagnosis_doc.get("completed_at", diagnosis_doc["updated_at"]),
                "event": "diagnosis_completed",
                "description": "AI diagnosis analysis completed",
                "actor": "ai_system"
            })
        
        # Sort timeline by timestamp
        timeline.sort(key=lambda x: x["timestamp"])
        
        return {
            "diagnosis_id": diagnosis_id,
            "timeline": timeline,
            "total_events": len(timeline)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get diagnosis timeline error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get diagnosis timeline"
        )


@diagnosis_router.get("/stats")
async def get_diagnosis_stats(
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Get diagnosis statistics and analytics"""
    try:
        # Get basic counts
        total_diagnoses = await db.get_collection("diagnoses").count_documents({})
        completed_diagnoses = await db.get_collection("diagnoses").count_documents({"status": "completed"})
        pending_diagnoses = await db.get_collection("diagnoses").count_documents({"status": "pending"})
        processing_diagnoses = await db.get_collection("diagnoses").count_documents({"status": "processing"})
        
        # Get priority distribution
        priority_pipeline = [
            {"$group": {"_id": "$priority", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        priority_distribution = await db.get_collection("diagnoses").aggregate(priority_pipeline).to_list(None)
        
        # Get recent diagnoses (last 7 days)
        from datetime import timedelta
        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        recent_diagnoses = await db.get_collection("diagnoses").count_documents({
            "created_at": {"$gte": week_ago}
        })
        
        return {
            "total_diagnoses": total_diagnoses,
            "completed_diagnoses": completed_diagnoses,
            "pending_diagnoses": pending_diagnoses,
            "processing_diagnoses": processing_diagnoses,
            "recent_diagnoses": recent_diagnoses,
            "priority_distribution": priority_distribution,
            "completion_rate": (completed_diagnoses / total_diagnoses * 100) if total_diagnoses > 0 else 0
        }
        
    except Exception as e:
        logger.error(f"Get diagnosis stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get diagnosis statistics"
        )


# ========================================
# Background AI Analysis Simulation
# ========================================

async def start_ai_analysis(diagnosis_id: str, ai_config: Optional[Dict[str, Any]]):
    """
    Start AI analysis in background (simulation)
    In production, this would coordinate with actual AI agents
    """
    try:
        logger.info(f"Starting AI analysis for diagnosis: {diagnosis_id}")
        
        # Update status to processing
        await db.get_collection("diagnoses").update_one(
            {"diagnosis_id": diagnosis_id},
            {"$set": {
                "status": "processing",
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        
        # Simulate AI processing stages
        stages = ["upload", "preprocessing", "analysis", "validation", "complete"]
        
        for i, stage in enumerate(stages):
            await asyncio.sleep(2)  # Simulate processing time
            
            progress_percentage = ((i + 1) / len(stages)) * 100
            
            # Update progress
            await db.get_collection("diagnoses").update_one(
                {"diagnosis_id": diagnosis_id},
                {"$set": {
                    "progress.percentage": progress_percentage,
                    "progress.current_stage": stage,
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
            
            logger.info(f"Diagnosis {diagnosis_id}: Stage {stage} - {progress_percentage}%")
        
        # Simulate final results
        mock_results = {
            "primary_diagnosis": "Advanced Pneumonia Detection - AI Confidence 94.2%",
            "secondary_diagnoses": ["Pleural effusion (MONAI)", "Consolidation pattern"],
            "confidence": 94.2,
            "severity": "Moderate-High Risk",
            "findings": [
                {
                    "region": "Right lower lobe",
                    "finding": "Consolidation with air bronchograms",
                    "confidence": 94.2,
                    "agent": "MONAI"
                }
            ],
            "recommendations": [
                "Immediate antibiotic therapy",
                "Follow-up chest X-ray in 48 hours",
                "Monitor oxygen saturation"
            ]
        }
        
        # Update final results
        await db.get_collection("diagnoses").update_one(
            {"diagnosis_id": diagnosis_id},
            {"$set": {
                "status": "completed",
                "results": mock_results,
                "completed_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        
        logger.info(f"AI analysis completed for diagnosis: {diagnosis_id}")
        
    except Exception as e:
        logger.error(f"AI analysis error for {diagnosis_id}: {e}")
        
        # Update status to failed
        await db.get_collection("diagnoses").update_one(
            {"diagnosis_id": diagnosis_id},
            {"$set": {
                "status": "failed",
                "error_message": str(e),
                "updated_at": datetime.now(timezone.utc)
            }}
        )