"""
Patient management routes - Full CRUD operations matching frontend requirements
"""

from fastapi import APIRouter, HTTPException, Query, Depends, status, UploadFile, File
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime
from config.database import Database
from models.schemas import (
    PatientCreate, PatientUpdate, PatientResponse, PaginatedPatients,
    PatientStats, PatientHistory, PatientNote, PatientDocument,
    ErrorResponse
)

logger = logging.getLogger(__name__)

# Database dependency
def get_db():
    return Database()

# Create router
patients_router = APIRouter(prefix="/api/patients", tags=["Patients"])

@patients_router.get("", response_model=PaginatedPatients)
async def get_patients(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    status: Optional[str] = Query(None, description="Patient status filter"),
    sortBy: str = Query("createdAt", description="Sort field"),
    sortOrder: str = Query("desc", description="Sort order"),
    db: Database = Depends(get_db)
):
    """Get all patients with pagination and filtering"""
    try:
        # Build filters
        filters = {}
        if search:
            filters["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
                {"condition": {"$regex": search, "$options": "i"}}
            ]
        if status:
            filters["status"] = status

        # Build sort
        sort_direction = -1 if sortOrder == "desc" else 1
        sort_criteria = [(sortBy, sort_direction)]

        # Get patients with pagination
        patients_data = await db.get_patients_paginated(
            page=page,
            limit=limit,
            filters=filters,
            sort=sort_criteria
        )

        return PaginatedPatients(
            success=True,
            data=patients_data["patients"],
            pagination={
                "page": page,
                "limit": limit,
                "total": patients_data["total"],
                "pages": (patients_data["total"] + limit - 1) // limit
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to get patients: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve patients"
        )

@patients_router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: str,
    db: Database = Depends(get_db)
):
    """Get single patient by ID"""
    try:
        patient = await db.get_patient(patient_id)
        
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )
        
        return PatientResponse(
            success=True,
            data=patient
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get patient {patient_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve patient"
        )

@patients_router.post("", response_model=PatientResponse)
async def create_patient(
    patient_data: PatientCreate,
    db: Database = Depends(get_db)
):
    """Create new patient"""
    try:
        # Check if patient already exists
        existing = await db.get_patient_by_email(patient_data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Patient with this email already exists"
            )

        # Create patient data
        patient_doc = {
            **patient_data.dict(),
            "patient_id": f"P-{int(datetime.utcnow().timestamp() * 1000)}",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "status": "active"
        }

        patient_id = await db.create_patient(patient_doc)
        created_patient = await db.get_patient(patient_doc["patient_id"])

        return PatientResponse(
            success=True,
            data=created_patient,
            message="Patient created successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create patient: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create patient"
        )

@patients_router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: str,
    patient_data: PatientUpdate,
    db: Database = Depends(get_db)
):
    """Update patient completely"""
    try:
        # Check if patient exists
        existing = await db.get_patient(patient_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )

        # Update patient
        update_data = {
            **patient_data.dict(exclude_unset=True),
            "updated_at": datetime.utcnow()
        }

        await db.update_patient(patient_id, update_data)
        updated_patient = await db.get_patient(patient_id)

        return PatientResponse(
            success=True,
            data=updated_patient,
            message="Patient updated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update patient {patient_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update patient"
        )

@patients_router.patch("/{patient_id}", response_model=PatientResponse)
async def patch_patient(
    patient_id: str,
    patient_data: Dict[str, Any],
    db: Database = Depends(get_db)
):
    """Partial update patient"""
    try:
        # Check if patient exists
        existing = await db.get_patient(patient_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )

        # Partial update
        update_data = {
            **patient_data,
            "updated_at": datetime.utcnow()
        }

        await db.update_patient(patient_id, update_data)
        updated_patient = await db.get_patient(patient_id)

        return PatientResponse(
            success=True,
            data=updated_patient,
            message="Patient updated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to patch patient {patient_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update patient"
        )

@patients_router.delete("/{patient_id}")
async def delete_patient(
    patient_id: str,
    db: Database = Depends(get_db)
):
    """Delete patient"""
    try:
        # Check if patient exists
        existing = await db.get_patient(patient_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )

        # Soft delete (mark as inactive)
        await db.update_patient(patient_id, {
            "status": "inactive",
            "deleted_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })

        return {
            "success": True,
            "message": "Patient deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete patient {patient_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete patient"
        )

@patients_router.get("/{patient_id}/stats", response_model=PatientStats)
async def get_patient_stats(
    patient_id: str,
    db: Database = Depends(get_db)
):
    """Get patient statistics"""
    try:
        patient = await db.get_patient(patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )

        # Get patient statistics
        stats = await db.get_patient_statistics(patient_id)

        return PatientStats(
            success=True,
            data=stats
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get patient stats {patient_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve patient statistics"
        )

@patients_router.get("/{patient_id}/history")
async def get_patient_history(
    patient_id: str,
    limit: int = Query(50, ge=1, le=200),
    db: Database = Depends(get_db)
):
    """Get patient medical history"""
    try:
        patient = await db.get_patient(patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )

        history = await db.get_patient_history(patient_id, limit)

        return {
            "success": True,
            "data": history
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get patient history {patient_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve patient history"
        )

@patients_router.get("/{patient_id}/diagnoses")
async def get_patient_diagnoses(
    patient_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Database = Depends(get_db)
):
    """Get patient diagnoses"""
    try:
        patient = await db.get_patient(patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )

        diagnoses = await db.get_patient_diagnoses(patient_id, page, limit)

        return {
            "success": True,
            "data": diagnoses
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get patient diagnoses {patient_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve patient diagnoses"
        )

# Batch operations
@patients_router.post("/batch")
async def batch_create_patients(
    patients_data: List[PatientCreate],
    db: Database = Depends(get_db)
):
    """Batch create patients"""
    try:
        created_patients = []
        
        for patient_data in patients_data:
            # Create patient doc
            patient_doc = {
                **patient_data.dict(),
                "patient_id": f"P-{int(datetime.utcnow().timestamp() * 1000)}",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "status": "active"
            }
            
            await db.create_patient(patient_doc)
            created_patient = await db.get_patient(patient_doc["patient_id"])
            created_patients.append(created_patient)

        return {
            "success": True,
            "data": created_patients,
            "message": f"Successfully created {len(created_patients)} patients"
        }
        
    except Exception as e:
        logger.error(f"Failed to batch create patients: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create patients"
        )

@patients_router.delete("/batch")
async def batch_delete_patients(
    patient_ids: List[str],
    db: Database = Depends(get_db)
):
    """Batch delete patients"""
    try:
        deleted_count = 0
        
        for patient_id in patient_ids:
            existing = await db.get_patient(patient_id)
            if existing:
                await db.update_patient(patient_id, {
                    "status": "inactive",
                    "deleted_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                })
                deleted_count += 1

        return {
            "success": True,
            "message": f"Successfully deleted {deleted_count} patients"
        }
        
    except Exception as e:
        logger.error(f"Failed to batch delete patients: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete patients"
        )

# Analytics endpoints
@patients_router.get("/analytics")
async def get_patients_analytics(
    db: Database = Depends(get_db)
):
    """Get patients analytics"""
    try:
        analytics = await db.get_patients_analytics()

        return {
            "success": True,
            "data": analytics
        }
        
    except Exception as e:
        logger.error(f"Failed to get patients analytics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve analytics"
        )