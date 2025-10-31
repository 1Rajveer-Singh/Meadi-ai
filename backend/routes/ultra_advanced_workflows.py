"""
Ultra-Advanced Medical AI Workflow API Endpoints
Comprehensive REST API for medical AI workflows with real-world implementation
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from typing import Dict, List, Any, Optional
from datetime import datetime
import json
import asyncio
import logging
from pydantic import BaseModel, Field
from enum import Enum

from ..workflows.ultra_advanced_workflow_coordinator import (
    UltraAdvancedWorkflowCoordinator, 
    WorkflowRequest, 
    WorkflowResult, 
    WorkflowType, 
    WorkflowStatus
)
from ..config.database import get_database
from ..config.redis_client import get_redis_client
from ..config.settings import settings

logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter(prefix="/api/v1/workflows", tags=["Ultra-Advanced Medical AI Workflows"])

# Pydantic models for API
class CreateWorkflowRequest(BaseModel):
    """Request model for creating new workflow"""
    workflow_type: str = Field(..., description="Type of workflow to execute")
    patient_id: str = Field(..., description="Patient identifier")
    priority: str = Field(default="routine", description="Workflow priority (routine, urgent, emergent, critical)")
    clinical_context: Optional[Dict[str, Any]] = Field(default=None, description="Clinical context and patient data")
    imaging_data: Optional[List[Dict[str, Any]]] = Field(default=None, description="Medical imaging data")
    medical_history: Optional[Dict[str, Any]] = Field(default=None, description="Patient medical history")
    medications: Optional[List[Dict[str, Any]]] = Field(default=None, description="Current medications")
    symptoms: Optional[List[str]] = Field(default=None, description="Presenting symptoms")
    vital_signs: Optional[Dict[str, Any]] = Field(default=None, description="Vital signs")
    laboratory_results: Optional[Dict[str, Any]] = Field(default=None, description="Laboratory test results")
    preferences: Optional[Dict[str, Any]] = Field(default=None, description="Analysis preferences")
    specialty_focus: Optional[str] = Field(default=None, description="Medical specialty focus")
    second_opinion_required: bool = Field(default=False, description="Require second opinion")
    research_protocols_enabled: bool = Field(default=True, description="Enable research protocols")
    explainable_ai_enabled: bool = Field(default=True, description="Enable explainable AI features")

class WorkflowResponse(BaseModel):
    """Response model for workflow operations"""
    workflow_id: str
    status: str
    message: str
    created_at: datetime
    estimated_completion_time: Optional[str] = None

class WorkflowStatusResponse(BaseModel):
    """Response model for workflow status"""
    workflow_id: str
    status: str
    progress: float
    current_step: str
    agents_used: List[str]
    processing_time_ms: Optional[float]
    error_message: Optional[str]

class SystemStatusResponse(BaseModel):
    """Response model for system status"""
    active_workflows: int
    queue_lengths: Dict[str, int]
    agent_status: Dict[str, Any]
    connected_clients: int
    system_health: str
    timestamp: str

# Global workflow coordinator instance
workflow_coordinator: Optional[UltraAdvancedWorkflowCoordinator] = None

async def get_workflow_coordinator() -> UltraAdvancedWorkflowCoordinator:
    """Dependency to get workflow coordinator instance"""
    global workflow_coordinator
    
    if workflow_coordinator is None:
        mongodb_client = await get_database()
        redis_client = await get_redis_client()
        
        workflow_coordinator = UltraAdvancedWorkflowCoordinator(
            mongodb_client=mongodb_client,
            redis_client=redis_client,
            settings=settings
        )
        
        # Initialize agents
        await workflow_coordinator.initialize_agents()
    
    return workflow_coordinator

@router.post("/create", response_model=WorkflowResponse)
async def create_workflow(
    request: CreateWorkflowRequest,
    background_tasks: BackgroundTasks,
    coordinator: UltraAdvancedWorkflowCoordinator = Depends(get_workflow_coordinator)
):
    """
    Create and start a new medical AI workflow
    
    This endpoint creates a comprehensive medical AI workflow that coordinates
    multiple AI agents for analysis, diagnosis, and treatment recommendations.
    
    **Workflow Types:**
    - `ai_diagnosis`: Complete AI-powered diagnosis workflow
    - `image_analysis`: Medical image analysis with MONAI
    - `clinical_decision_support`: Evidence-based clinical recommendations
    - `drug_interaction_analysis`: Comprehensive drug interaction checking
    - `research_synthesis`: Research evidence synthesis
    - `precision_medicine`: Personalized medicine recommendations
    - `emergency_triage`: Emergency department triage support
    - `population_health`: Population health analytics
    
    **Priority Levels:**
    - `routine`: Standard processing (default)
    - `urgent`: High priority processing
    - `emergent`: Very high priority
    - `critical`: Immediate processing
    """
    try:
        # Validate workflow type
        try:
            workflow_type_enum = WorkflowType(request.workflow_type)
        except ValueError:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid workflow type: {request.workflow_type}"
            )
        
        # Create workflow request
        workflow_request = WorkflowRequest(
            workflow_type=workflow_type_enum,
            patient_id=request.patient_id,
            user_id="api_user",  # In real implementation, get from auth
            priority=request.priority,
            clinical_context=request.clinical_context,
            imaging_data=request.imaging_data,
            medical_history=request.medical_history,
            medications=request.medications,
            symptoms=request.symptoms,
            vital_signs=request.vital_signs,
            laboratory_results=request.laboratory_results,
            preferences=request.preferences,
            specialty_focus=request.specialty_focus,
            second_opinion_required=request.second_opinion_required,
            research_protocols_enabled=request.research_protocols_enabled,
            explainable_ai_enabled=request.explainable_ai_enabled
        )
        
        # Start workflow
        workflow_id = await coordinator.start_workflow(workflow_request)
        
        # Estimate completion time based on workflow type and priority
        completion_estimates = {
            "routine": "5-10 minutes",
            "urgent": "2-5 minutes", 
            "emergent": "1-3 minutes",
            "critical": "30 seconds - 2 minutes"
        }
        
        return WorkflowResponse(
            workflow_id=workflow_id,
            status="started",
            message=f"Workflow {workflow_id} created successfully and processing started",
            created_at=datetime.now(),
            estimated_completion_time=completion_estimates.get(request.priority, "5-10 minutes")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to create workflow: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create workflow: {str(e)}")

@router.get("/{workflow_id}/status", response_model=WorkflowStatusResponse)
async def get_workflow_status(
    workflow_id: str,
    coordinator: UltraAdvancedWorkflowCoordinator = Depends(get_workflow_coordinator)
):
    """
    Get current status of a workflow
    
    Returns real-time status information including:
    - Current processing stage
    - Progress percentage
    - Active AI agents
    - Processing time
    - Any errors or warnings
    """
    try:
        workflow_result = await coordinator.get_workflow_status(workflow_id)
        
        if not workflow_result:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        return WorkflowStatusResponse(
            workflow_id=workflow_id,
            status=workflow_result.status.value,
            progress=coordinator._calculate_progress(workflow_result),
            current_step=coordinator._get_current_step(workflow_result),
            agents_used=workflow_result.agents_used or [],
            processing_time_ms=workflow_result.processing_time_ms,
            error_message=workflow_result.error_message
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to get workflow status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get workflow status")

@router.get("/{workflow_id}/results")
async def get_workflow_results(
    workflow_id: str,
    coordinator: UltraAdvancedWorkflowCoordinator = Depends(get_workflow_coordinator)
):
    """
    Get comprehensive results from completed workflow
    
    Returns detailed analysis results including:
    - Primary and differential diagnoses
    - Treatment recommendations
    - Risk assessments
    - Safety alerts
    - Evidence levels
    - Quality metrics
    """
    try:
        workflow_result = await coordinator.get_workflow_status(workflow_id)
        
        if not workflow_result:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        if workflow_result.status != WorkflowStatus.COMPLETED:
            raise HTTPException(
                status_code=400, 
                detail=f"Workflow not completed yet. Current status: {workflow_result.status.value}"
            )
        
        # Prepare comprehensive results
        results = {
            "workflow_id": workflow_id,
            "workflow_type": workflow_result.workflow_type.value,
            "patient_id": workflow_result.patient_id,
            "processing_summary": {
                "start_time": workflow_result.start_time.isoformat(),
                "end_time": workflow_result.end_time.isoformat() if workflow_result.end_time else None,
                "processing_time_ms": workflow_result.processing_time_ms,
                "agents_used": workflow_result.agents_used,
                "processing_steps": workflow_result.processing_steps
            },
            "clinical_analysis": {
                "primary_diagnosis": workflow_result.primary_diagnosis,
                "differential_diagnosis": workflow_result.differential_diagnosis,
                "confidence_scores": workflow_result.confidence_scores,
                "risk_assessment": workflow_result.risk_assessment
            },
            "treatment_recommendations": workflow_result.treatment_recommendations,
            "follow_up_recommendations": workflow_result.follow_up_recommendations,
            "quality_metrics": {
                "ai_confidence": workflow_result.ai_confidence,
                "evidence_level": workflow_result.evidence_level,
                "clinical_guidelines_adherence": workflow_result.clinical_guidelines_adherence
            },
            "safety_alerts": workflow_result.safety_alerts,
            "warnings": workflow_result.warnings,
            "agent_results": {
                "image_analysis": workflow_result.image_analysis_results,
                "history_synthesis": workflow_result.history_synthesis_results,
                "drug_interaction": workflow_result.drug_interaction_results,
                "research": workflow_result.research_results,
                "clinical_decision": workflow_result.clinical_decision_results,
                "precision_medicine": workflow_result.precision_medicine_results
            },
            "resource_utilization": workflow_result.resource_utilization
        }
        
        return results
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to get workflow results: {e}")
        raise HTTPException(status_code=500, detail="Failed to get workflow results")

@router.delete("/{workflow_id}")
async def cancel_workflow(
    workflow_id: str,
    coordinator: UltraAdvancedWorkflowCoordinator = Depends(get_workflow_coordinator)
):
    """
    Cancel a running workflow
    
    Safely cancels a workflow that is currently in progress.
    Already completed processing will be preserved.
    """
    try:
        # In real implementation, get user_id from authentication
        user_id = "api_user"
        
        success = await coordinator.cancel_workflow(workflow_id, user_id)
        
        if not success:
            raise HTTPException(status_code=400, detail="Unable to cancel workflow")
        
        return {"message": f"Workflow {workflow_id} cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to cancel workflow: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel workflow")

@router.get("/system/status", response_model=SystemStatusResponse)
async def get_system_status(
    coordinator: UltraAdvancedWorkflowCoordinator = Depends(get_workflow_coordinator)
):
    """
    Get comprehensive system status
    
    Returns information about:
    - Active workflows and queue lengths
    - AI agent status and performance
    - System health and resource utilization
    - Connected clients and real-time metrics
    """
    try:
        status = await coordinator.get_system_status()
        
        return SystemStatusResponse(
            active_workflows=status["active_workflows"],
            queue_lengths=status["queue_lengths"],
            agent_status=status["agent_status"],
            connected_clients=status["connected_clients"],
            system_health=status["system_health"],
            timestamp=status["timestamp"]
        )
        
    except Exception as e:
        logger.error(f"❌ Failed to get system status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get system status")

@router.get("/workflows/active")
async def get_active_workflows(
    coordinator: UltraAdvancedWorkflowCoordinator = Depends(get_workflow_coordinator),
    limit: int = 50
):
    """
    Get list of active workflows
    
    Returns information about currently running workflows including
    status, progress, and estimated completion times.
    """
    try:
        active_workflows = []
        
        for workflow_id, workflow_result in coordinator.active_workflows.items():
            active_workflows.append({
                "workflow_id": workflow_id,
                "workflow_type": workflow_result.workflow_type.value,
                "patient_id": workflow_result.patient_id,
                "status": workflow_result.status.value,
                "progress": coordinator._calculate_progress(workflow_result),
                "current_step": coordinator._get_current_step(workflow_result),
                "start_time": workflow_result.start_time.isoformat(),
                "agents_used": workflow_result.agents_used
            })
        
        # Sort by start time (most recent first) and limit results
        active_workflows.sort(key=lambda x: x["start_time"], reverse=True)
        active_workflows = active_workflows[:limit]
        
        return {
            "active_workflows": active_workflows,
            "total_count": len(coordinator.active_workflows),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get active workflows: {e}")
        raise HTTPException(status_code=500, detail="Failed to get active workflows")

@router.websocket("/ws/realtime/{user_id}")
async def websocket_realtime_updates(
    websocket: WebSocket,
    user_id: str,
    coordinator: UltraAdvancedWorkflowCoordinator = Depends(get_workflow_coordinator)
):
    """
    WebSocket endpoint for real-time workflow updates
    
    Provides real-time updates for:
    - Workflow progress and status changes
    - AI agent coordination and results
    - System metrics and performance
    - Safety alerts and notifications
    """
    await websocket.accept()
    
    try:
        # Register WebSocket connection
        await coordinator.register_websocket(user_id, websocket)
        
        # Send initial system status
        initial_status = await coordinator.get_system_status()
        await websocket.send_text(json.dumps({
            "type": "initial_status",
            "data": initial_status,
            "timestamp": datetime.now().isoformat()
        }))
        
        # Keep connection alive and handle messages
        while True:
            try:
                # Wait for messages from client
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                if message.get("type") == "ping":
                    await websocket.send_text(json.dumps({
                        "type": "pong",
                        "timestamp": datetime.now().isoformat()
                    }))
                
                elif message.get("type") == "subscribe_workflow":
                    workflow_id = message.get("workflow_id")
                    if workflow_id:
                        # Send current workflow status
                        workflow_status = await coordinator.get_workflow_status(workflow_id)
                        if workflow_status:
                            await websocket.send_text(json.dumps({
                                "type": "workflow_status",
                                "workflow_id": workflow_id,
                                "status": workflow_status.status.value,
                                "progress": coordinator._calculate_progress(workflow_status),
                                "timestamp": datetime.now().isoformat()
                            }))
                
                # Small delay to prevent excessive CPU usage
                await asyncio.sleep(0.1)
                
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"WebSocket message handling error: {e}")
                break
    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for user {user_id}")
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
    finally:
        # Unregister WebSocket connection
        await coordinator.unregister_websocket(user_id)

@router.get("/agents/status")
async def get_agents_status(
    coordinator: UltraAdvancedWorkflowCoordinator = Depends(get_workflow_coordinator)
):
    """
    Get detailed status of all AI agents
    
    Returns comprehensive information about each AI agent including:
    - Current status and availability
    - Performance metrics and accuracy
    - Queue lengths and processing times
    - Resource utilization
    """
    try:
        agents_status = {}
        
        for agent_name, agent_status in coordinator.agent_status.items():
            agents_status[agent_name] = {
                "name": agent_name.replace("_", " ").title(),
                "status": agent_status["status"],
                "active_tasks": agent_status["active_tasks"],
                "queue_length": agent_status["queue_length"],
                "performance_metrics": agent_status["performance_metrics"],
                "capabilities": await get_agent_capabilities(agent_name),
                "last_updated": datetime.now().isoformat()
            }
        
        return {
            "agents": agents_status,
            "total_agents": len(agents_status),
            "healthy_agents": len([a for a in agents_status.values() if a["status"] == "ready"]),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get agents status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get agents status")

async def get_agent_capabilities(agent_name: str) -> List[str]:
    """Get capabilities for specific agent"""
    capabilities = {
        "image_analysis": [
            "MONAI medical image analysis",
            "Multi-modal imaging support",
            "Real-time heatmap generation",
            "DICOM processing",
            "Quality assessment"
        ],
        "history_synthesis": [
            "EHR data integration",
            "Medical history timeline",
            "Risk factor analysis",
            "FHIR compliance",
            "Predictive analytics"
        ],
        "drug_interaction": [
            "Real-time interaction checking",
            "Pharmacogenomic analysis",
            "Contraindication detection",
            "Dosage optimization",
            "Safety monitoring"
        ],
        "research": [
            "PubMed integration",
            "Clinical trial matching",
            "Evidence synthesis",
            "Guideline adherence",
            "Systematic review analysis"
        ],
        "clinical_decision": [
            "Evidence-based recommendations",
            "Risk stratification",
            "Protocol adherence",
            "Quality metrics",
            "Safety alerts"
        ],
        "precision_medicine": [
            "Genomic analysis",
            "Biomarker interpretation",
            "Personalized therapy",
            "Pharmacogenomics",
            "Clinical trial matching"
        ]
    }
    
    return capabilities.get(agent_name, ["General medical AI capabilities"])

@router.get("/templates/workflow-types")
async def get_workflow_types():
    """
    Get available workflow types and their descriptions
    
    Returns information about all supported workflow types including:
    - Workflow type identifiers
    - Descriptions and use cases
    - Required input parameters
    - Expected outputs
    """
    workflow_types = {
        "ai_diagnosis": {
            "name": "AI Diagnosis",
            "description": "Complete AI-powered diagnostic workflow with multi-agent coordination",
            "use_cases": [
                "Comprehensive patient analysis",
                "Multi-system disorder evaluation",
                "Complex case consultation"
            ],
            "required_inputs": ["patient_id"],
            "optional_inputs": ["imaging_data", "medical_history", "symptoms", "vital_signs", "lab_results"],
            "outputs": ["primary_diagnosis", "differential_diagnosis", "treatment_recommendations", "risk_assessment"],
            "typical_duration": "5-15 minutes",
            "agents_involved": ["image_analysis", "history_synthesis", "drug_interaction", "research", "clinical_decision"]
        },
        "image_analysis": {
            "name": "Medical Image Analysis",
            "description": "Advanced medical imaging analysis using MONAI and deep learning",
            "use_cases": [
                "Radiological interpretation",
                "Pathology detection",
                "Image quality assessment"
            ],
            "required_inputs": ["patient_id", "imaging_data"],
            "optional_inputs": ["clinical_context", "comparison_studies"],
            "outputs": ["image_findings", "annotations", "quality_metrics", "recommendations"],
            "typical_duration": "2-5 minutes",
            "agents_involved": ["image_analysis", "research"]
        },
        "clinical_decision_support": {
            "name": "Clinical Decision Support",
            "description": "Evidence-based clinical decision support and recommendations",
            "use_cases": [
                "Treatment protocol guidance",
                "Risk stratification",
                "Quality improvement"
            ],
            "required_inputs": ["patient_id", "clinical_context"],
            "optional_inputs": ["medical_history", "symptoms", "vital_signs", "lab_results"],
            "outputs": ["clinical_recommendations", "risk_scores", "monitoring_plans", "guidelines_adherence"],
            "typical_duration": "3-8 minutes",
            "agents_involved": ["history_synthesis", "drug_interaction", "clinical_decision", "research"]
        },
        "precision_medicine": {
            "name": "Precision Medicine",
            "description": "Personalized medicine recommendations based on genomics and biomarkers",
            "use_cases": [
                "Pharmacogenomic guidance",
                "Targeted therapy selection",
                "Genetic risk assessment"
            ],
            "required_inputs": ["patient_id"],
            "optional_inputs": ["genomic_data", "biomarkers", "family_history", "medications"],
            "outputs": ["personalized_recommendations", "genetic_risk", "targeted_therapies", "clinical_trials"],
            "typical_duration": "4-10 minutes",
            "agents_involved": ["precision_medicine", "drug_interaction", "research"]
        }
    }
    
    return {
        "workflow_types": workflow_types,
        "total_types": len(workflow_types),
        "timestamp": datetime.now().isoformat()
    }

# Health check endpoint
@router.get("/health")
async def health_check():
    """Health check for workflow service"""
    return {
        "status": "healthy",
        "service": "Ultra-Advanced Medical AI Workflows",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }