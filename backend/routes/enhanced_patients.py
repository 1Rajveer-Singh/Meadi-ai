"""
Enhanced Patients Management Routes
Comprehensive CRUD operations for patient data with advanced search and analytics
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query, File, UploadFile
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import logging
from bson import ObjectId
import uuid

from models.patient import (
    Patient, PatientCreate, PatientUpdate, PatientResponse, PaginatedPatients
)
from models.base import PaginationParams
from routes.enhanced_auth import get_current_active_user

try:
    from config.enhanced_database import enhanced_db as db
except ImportError:
    from config.database import db

logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter(prefix="/patients", tags=["Patients"])
patients_router = router  # Keep backward compatibility


def generate_patient_id() -> str:
    """Generate unique patient ID"""
    return f"P-{datetime.now().year}-{str(uuid.uuid4())[:8].upper()}"


# ========================================
# Patient CRUD Operations
# ========================================

@patients_router.get("", response_model=PaginatedPatients)
async def get_patients(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    status: Optional[str] = Query(None, description="Filter by status"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level"),
    sort_by: Optional[str] = Query("created_at", description="Sort field"),
    sort_order: Optional[str] = Query("desc", description="Sort order"),
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Get paginated list of patients with search and filters"""
    try:
        # Build query
        query = {}
        
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"patient_id": {"$regex": search, "$options": "i"}},
                {"contact_info.email": {"$regex": search, "$options": "i"}}
            ]
        
        if status:
            query["status"] = status
            
        if risk_level:
            query["risk_level"] = risk_level
        
        # Calculate skip
        skip = (page - 1) * per_page
        
        # Sort direction
        sort_direction = -1 if sort_order.lower() == "desc" else 1
        
        # Get total count
        total = await db.get_collection("patients").count_documents(query)
        
        # Get patients
        cursor = db.get_collection("patients").find(query)
        cursor = cursor.sort(sort_by, sort_direction).skip(skip).limit(per_page)
        
        patients_docs = await cursor.to_list(length=per_page)
        
        # Convert to response format
        patients = []
        for doc in patients_docs:
            doc["id"] = str(doc["_id"])
            patients.append(PatientResponse(
                id=doc["id"],
                patient_id=doc["patient_id"],
                name=doc["name"],
                age=doc.get("age"),
                gender=doc.get("gender"),
                contact_info=doc.get("contact_info"),
                risk_level=doc["risk_level"],
                status=doc["status"],
                created_at=doc["created_at"],
                updated_at=doc["updated_at"]
            ))
        
        # Calculate pagination info
        total_pages = (total + per_page - 1) // per_page
        
        return PaginatedPatients(
            patients=patients,
            total=total,
            page=page,
            per_page=per_page,
            pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )
        
    except Exception as e:
        logger.error(f"Get patients error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve patients"
        )


@patients_router.post("", response_model=PatientResponse)
async def create_patient(
    patient_data: PatientCreate,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Create a new patient"""
    try:
        # Generate unique patient ID
        patient_id = generate_patient_id()
        
        # Create patient document
        patient_doc = {
            "patient_id": patient_id,
            "name": patient_data.name,
            "age": patient_data.age,
            "gender": patient_data.gender,
            "date_of_birth": patient_data.date_of_birth,
            "contact_info": patient_data.contact_info.dict() if patient_data.contact_info else None,
            "emergency_contact": patient_data.emergency_contact.dict() if patient_data.emergency_contact else None,
            "medical_history": patient_data.medical_history.dict() if patient_data.medical_history else None,
            "risk_level": patient_data.risk_level,
            "status": "active",
            "created_by": ObjectId(current_user["id"]),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        # Insert patient
        result = await db.get_collection("patients").insert_one(patient_doc)
        created_id = str(result.inserted_id)
        
        # Return response
        return PatientResponse(
            id=created_id,
            patient_id=patient_id,
            name=patient_data.name,
            age=patient_data.age,
            gender=patient_data.gender,
            contact_info=patient_data.contact_info,
            risk_level=patient_data.risk_level,
            status="active",
            created_at=patient_doc["created_at"],
            updated_at=patient_doc["updated_at"]
        )
        
    except Exception as e:
        logger.error(f"Create patient error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create patient"
        )


@patients_router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: str,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Get patient by ID"""
    try:
        # Try to find by ObjectId first, then by patient_id
        patient_doc = None
        
        if ObjectId.is_valid(patient_id):
            patient_doc = await db.get_collection("patients").find_one({"_id": ObjectId(patient_id)})
        
        if not patient_doc:
            patient_doc = await db.get_collection("patients").find_one({"patient_id": patient_id})
        
        if not patient_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )
        
        patient_doc["id"] = str(patient_doc["_id"])
        
        return PatientResponse(
            id=patient_doc["id"],
            patient_id=patient_doc["patient_id"],
            name=patient_doc["name"],
            age=patient_doc.get("age"),
            gender=patient_doc.get("gender"),
            contact_info=patient_doc.get("contact_info"),
            risk_level=patient_doc["risk_level"],
            status=patient_doc["status"],
            created_at=patient_doc["created_at"],
            updated_at=patient_doc["updated_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get patient error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve patient"
        )


@patients_router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: str,
    patient_update: PatientUpdate,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Update patient information"""
    try:
        # Find patient
        patient_doc = None
        
        if ObjectId.is_valid(patient_id):
            patient_doc = await db.get_collection("patients").find_one({"_id": ObjectId(patient_id)})
        
        if not patient_doc:
            patient_doc = await db.get_collection("patients").find_one({"patient_id": patient_id})
        
        if not patient_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )
        
        # Build update data
        update_data = {}
        update_fields = [
            "name", "age", "gender", "date_of_birth", "contact_info", 
            "emergency_contact", "medical_history", "risk_level", "status"
        ]
        
        for field in update_fields:
            value = getattr(patient_update, field, None)
            if value is not None:
                if hasattr(value, 'dict'):
                    update_data[field] = value.dict()
                else:
                    update_data[field] = value
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields to update"
            )
        
        update_data["updated_at"] = datetime.now(timezone.utc)
        
        # Update patient
        await db.get_collection("patients").update_one(
            {"_id": patient_doc["_id"]},
            {"$set": update_data}
        )
        
        # Get updated patient
        updated_doc = await db.get_collection("patients").find_one({"_id": patient_doc["_id"]})
        updated_doc["id"] = str(updated_doc["_id"])
        
        return PatientResponse(
            id=updated_doc["id"],
            patient_id=updated_doc["patient_id"],
            name=updated_doc["name"],
            age=updated_doc.get("age"),
            gender=updated_doc.get("gender"),
            contact_info=updated_doc.get("contact_info"),
            risk_level=updated_doc["risk_level"],
            status=updated_doc["status"],
            created_at=updated_doc["created_at"],
            updated_at=updated_doc["updated_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update patient error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update patient"
        )


@patients_router.delete("/{patient_id}")
async def delete_patient(
    patient_id: str,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Delete patient"""
    try:
        # Find patient
        patient_doc = None
        
        if ObjectId.is_valid(patient_id):
            patient_doc = await db.get_collection("patients").find_one({"_id": ObjectId(patient_id)})
        
        if not patient_doc:
            patient_doc = await db.get_collection("patients").find_one({"patient_id": patient_id})
        
        if not patient_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )
        
        # Delete patient (soft delete - set status to inactive)
        await db.get_collection("patients").update_one(
            {"_id": patient_doc["_id"]},
            {"$set": {"status": "inactive", "updated_at": datetime.now(timezone.utc)}}
        )
        
        return {"message": "Patient deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete patient error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete patient"
        )


# ========================================
# Advanced Patient Operations
# ========================================

@patients_router.get("/{patient_id}/history")
async def get_patient_history(
    patient_id: str,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Get patient medical history and timeline"""
    try:
        # Find patient
        patient_doc = await db.get_collection("patients").find_one({"patient_id": patient_id})
        if not patient_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )
        
        # Get patient diagnoses
        diagnoses_cursor = db.get_collection("diagnoses").find(
            {"patient_id": patient_doc["_id"]}
        ).sort("created_at", -1)
        
        diagnoses = await diagnoses_cursor.to_list(length=None)
        
        # Convert ObjectId to string
        for diagnosis in diagnoses:
            diagnosis["id"] = str(diagnosis["_id"])
        
        return {
            "patient_id": patient_id,
            "medical_history": patient_doc.get("medical_history", {}),
            "diagnoses": diagnoses,
            "total_diagnoses": len(diagnoses)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get patient history error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve patient history"
        )


@patients_router.get("/{patient_id}/diagnoses")
async def get_patient_diagnoses(
    patient_id: str,
    limit: int = Query(10, ge=1, le=50),
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Get patient diagnoses"""
    try:
        # Find patient
        patient_doc = await db.get_collection("patients").find_one({"patient_id": patient_id})
        if not patient_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )
        
        # Get diagnoses
        diagnoses_cursor = db.get_collection("diagnoses").find(
            {"patient_id": patient_doc["_id"]}
        ).sort("created_at", -1).limit(limit)
        
        diagnoses = await diagnoses_cursor.to_list(length=limit)
        
        # Convert ObjectId to string and format response
        formatted_diagnoses = []
        for diagnosis in diagnoses:
            diagnosis["id"] = str(diagnosis["_id"])
            formatted_diagnoses.append({
                "id": diagnosis["id"],
                "diagnosis_id": diagnosis["diagnosis_id"],
                "status": diagnosis["status"],
                "priority": diagnosis["priority"],
                "created_at": diagnosis["created_at"],
                "results": diagnosis.get("results")
            })
        
        return {
            "patient_id": patient_id,
            "diagnoses": formatted_diagnoses,
            "total": len(formatted_diagnoses)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get patient diagnoses error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve patient diagnoses"
        )


@patients_router.post("/{patient_id}/documents")
async def upload_patient_document(
    patient_id: str,
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Upload patient document"""
    try:
        # Find patient
        patient_doc = await db.get_collection("patients").find_one({"patient_id": patient_id})
        if not patient_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )
        
        # For now, return a placeholder response
        # In production, integrate with MinIO for file storage
        return {
            "message": "Document upload functionality will be implemented with MinIO integration",
            "filename": file.filename,
            "size": file.size,
            "content_type": file.content_type
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload document error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload document"
        )


@patients_router.get("/search")
async def search_patients(
    query: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(10, ge=1, le=50, description="Max results"),
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Advanced patient search"""
    try:
        # Build search query
        search_query = {
            "$or": [
                {"name": {"$regex": query, "$options": "i"}},
                {"patient_id": {"$regex": query, "$options": "i"}},
                {"contact_info.email": {"$regex": query, "$options": "i"}},
                {"contact_info.phone": {"$regex": query, "$options": "i"}}
            ]
        }
        
        # Find patients
        cursor = db.get_collection("patients").find(search_query).limit(limit)
        patients = await cursor.to_list(length=limit)
        
        # Format results
        results = []
        for patient in patients:
            patient["id"] = str(patient["_id"])
            results.append({
                "id": patient["id"],
                "patient_id": patient["patient_id"],
                "name": patient["name"],
                "status": patient["status"],
                "risk_level": patient["risk_level"]
            })
        
        return {
            "query": query,
            "results": results,
            "total": len(results)
        }
        
    except Exception as e:
        logger.error(f"Search patients error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search patients"
        )


@patients_router.get("/analytics")
async def get_patient_analytics(
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Get patient analytics and statistics"""
    try:
        # Get basic counts
        total_patients = await db.get_collection("patients").count_documents({})
        active_patients = await db.get_collection("patients").count_documents({"status": "active"})
        
        # Get risk level distribution
        risk_pipeline = [
            {"$group": {"_id": "$risk_level", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        risk_distribution = await db.get_collection("patients").aggregate(risk_pipeline).to_list(None)
        
        # Get recent patients (last 7 days)
        from datetime import timedelta
        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        recent_patients = await db.get_collection("patients").count_documents({
            "created_at": {"$gte": week_ago}
        })
        
        return {
            "total_patients": total_patients,
            "active_patients": active_patients,
            "inactive_patients": total_patients - active_patients,
            "recent_patients": recent_patients,
            "risk_distribution": risk_distribution
        }
        
    except Exception as e:
        logger.error(f"Get analytics error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve analytics"
        )

# Export the router for import compatibility
router = patients_router