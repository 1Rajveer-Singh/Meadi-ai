"""
WebSocket and Real-time Models
"""

from datetime import datetime, timezone
from typing import Dict, Any, Literal
from pydantic import BaseModel, Field
from .base import AgentStatus


class SystemMetrics(BaseModel):
    """System performance metrics"""
    cpu_usage: float = Field(..., ge=0.0, le=100.0)
    memory_usage: float = Field(..., ge=0.0, le=100.0)
    gpu_usage: float = Field(0.0, ge=0.0, le=100.0)
    network_latency: float = Field(0.0, ge=0.0)
    disk_io: float = Field(0.0, ge=0.0)
    processing_queue: int = Field(0, ge=0)


class SystemMetricsLog(BaseModel):
    """System metrics log entry"""
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metrics: SystemMetrics
    active_sessions: int = Field(0, ge=0)
    active_diagnoses: int = Field(0, ge=0)


class WebSocketMessage(BaseModel):
    """WebSocket message structure"""
    type: Literal[
        "agent_status", 
        "system_metrics", 
        "analysis_progress", 
        "analysis_complete", 
        "real_time_metrics", 
        "error"
    ]
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AgentStatusMessage(BaseModel):
    """Agent status update message"""
    agent: Literal["monai", "history", "drug_checker", "research"]
    status: Dict[str, Any]


class AnalysisProgressMessage(BaseModel):
    """Analysis progress update message"""
    diagnosis_id: str
    progress: float = Field(..., ge=0.0, le=100.0)
    stage: str
    estimated_completion: datetime = None