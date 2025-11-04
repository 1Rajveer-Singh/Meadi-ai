"""
Notifications and Alerts API Routes
Handles user notifications, alerts, and preferences
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


class NotificationType(str, Enum):
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ALERT = "alert"
    CRITICAL = "critical"


class NotificationCategory(str, Enum):
    DIAGNOSIS = "diagnosis"
    PATIENT = "patient"
    SYSTEM = "system"
    AI_UPDATE = "ai_update"
    SECURITY = "security"
    MAINTENANCE = "maintenance"
    COLLABORATION = "collaboration"


class NotificationPreferences(BaseModel):
    email_enabled: bool = True
    push_enabled: bool = True
    sms_enabled: bool = False
    diagnosis_alerts: bool = True
    critical_findings: bool = True
    ai_updates: bool = True
    system_maintenance: bool = True
    patient_updates: bool = True
    collaboration_requests: bool = True
    daily_summary: bool = True
    weekly_report: bool = False


class Notification(BaseModel):
    id: str
    type: NotificationType
    category: NotificationCategory
    title: str
    message: str
    timestamp: datetime
    read: bool = False
    priority: int = Field(default=1, ge=1, le=5)
    action_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class AlertRule(BaseModel):
    id: str
    name: str
    enabled: bool
    condition: str
    notification_type: NotificationType
    channels: List[str] = ["app", "email"]


# Mock database - In production, this would be a real database
notifications_db: List[Notification] = [
    Notification(
        id="notif-001",
        type=NotificationType.SUCCESS,
        category=NotificationCategory.DIAGNOSIS,
        title="Diagnosis Complete",
        message="Patient P-2024-1847 analysis finished with 97.2% confidence",
        timestamp=datetime.now() - timedelta(minutes=2),
        read=False,
        priority=3,
        action_url="/diagnosis/view/P-2024-1847",
        metadata={"patient_id": "P-2024-1847", "confidence": 0.972}
    ),
    Notification(
        id="notif-002",
        type=NotificationType.ALERT,
        category=NotificationCategory.PATIENT,
        title="Critical Finding",
        message="Urgent review required for Patient P-2024-1851 - Abnormal cardiac markers detected",
        timestamp=datetime.now() - timedelta(minutes=5),
        read=False,
        priority=5,
        action_url="/patients/P-2024-1851",
        metadata={"patient_id": "P-2024-1851", "finding_type": "cardiac"}
    ),
    Notification(
        id="notif-003",
        type=NotificationType.INFO,
        category=NotificationCategory.AI_UPDATE,
        title="AI Model Updated",
        message="Image Analysis agent updated to v2.1.3 with improved accuracy",
        timestamp=datetime.now() - timedelta(hours=1),
        read=False,
        priority=2,
        metadata={"version": "2.1.3", "agent": "image_analysis"}
    ),
    Notification(
        id="notif-004",
        type=NotificationType.WARNING,
        category=NotificationCategory.MAINTENANCE,
        title="System Maintenance Scheduled",
        message="Scheduled maintenance in 2 hours. System will be unavailable for 30 minutes.",
        timestamp=datetime.now() - timedelta(hours=2),
        read=False,
        priority=3,
        metadata={"maintenance_start": (datetime.now() + timedelta(hours=2)).isoformat()}
    ),
    Notification(
        id="notif-005",
        type=NotificationType.SUCCESS,
        category=NotificationCategory.PATIENT,
        title="Patient Record Updated",
        message="Lab results uploaded for Patient P-2024-1845",
        timestamp=datetime.now() - timedelta(hours=3),
        read=True,
        priority=2,
        action_url="/patients/P-2024-1845",
        metadata={"patient_id": "P-2024-1845", "update_type": "lab_results"}
    ),
    Notification(
        id="notif-006",
        type=NotificationType.INFO,
        category=NotificationCategory.COLLABORATION,
        title="Consultation Request",
        message="Dr. Smith requested your opinion on a complex case",
        timestamp=datetime.now() - timedelta(hours=4),
        read=True,
        priority=3,
        action_url="/collaboration/requests",
        metadata={"from_doctor": "Dr. Smith", "case_id": "CASE-2024-0123"}
    ),
    Notification(
        id="notif-007",
        type=NotificationType.CRITICAL,
        category=NotificationCategory.SECURITY,
        title="Security Alert",
        message="Unusual login activity detected from new location",
        timestamp=datetime.now() - timedelta(days=1),
        read=True,
        priority=5,
        action_url="/settings/security",
        metadata={"location": "New York, USA", "ip": "192.168.1.100"}
    ),
    Notification(
        id="notif-008",
        type=NotificationType.SUCCESS,
        category=NotificationCategory.DIAGNOSIS,
        title="Imaging Analysis Complete",
        message="CT Scan analysis completed for Patient P-2024-1843",
        timestamp=datetime.now() - timedelta(days=1),
        read=True,
        priority=2,
        action_url="/diagnosis/imaging/P-2024-1843",
        metadata={"patient_id": "P-2024-1843", "scan_type": "CT"}
    ),
]

alert_rules_db: List[AlertRule] = [
    AlertRule(
        id="rule-001",
        name="Critical Lab Values",
        enabled=True,
        condition="lab_value > threshold",
        notification_type=NotificationType.CRITICAL,
        channels=["app", "email", "sms"]
    ),
    AlertRule(
        id="rule-002",
        name="AI Confidence Low",
        enabled=True,
        condition="confidence < 0.70",
        notification_type=NotificationType.WARNING,
        channels=["app", "email"]
    ),
    AlertRule(
        id="rule-003",
        name="Patient Deterioration",
        enabled=True,
        condition="vital_signs_declining",
        notification_type=NotificationType.ALERT,
        channels=["app", "email", "sms"]
    ),
    AlertRule(
        id="rule-004",
        name="Drug Interaction Warning",
        enabled=True,
        condition="drug_interaction_detected",
        notification_type=NotificationType.WARNING,
        channels=["app", "email"]
    ),
    AlertRule(
        id="rule-005",
        name="Appointment Reminder",
        enabled=True,
        condition="appointment_24h_before",
        notification_type=NotificationType.INFO,
        channels=["app", "email"]
    ),
]

user_preferences_db: Dict[str, NotificationPreferences] = {
    "default": NotificationPreferences()
}


@router.get("/list", response_model=Dict[str, Any])
async def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    unread_only: bool = Query(False),
    category: Optional[NotificationCategory] = Query(None),
    priority_min: Optional[int] = Query(None, ge=1, le=5)
):
    """
    Get list of notifications with filtering and pagination
    """
    try:
        filtered_notifications = notifications_db.copy()
        
        # Apply filters
        if unread_only:
            filtered_notifications = [n for n in filtered_notifications if not n.read]
        
        if category:
            filtered_notifications = [n for n in filtered_notifications if n.category == category]
        
        if priority_min:
            filtered_notifications = [n for n in filtered_notifications if n.priority >= priority_min]
        
        # Sort by timestamp (newest first)
        filtered_notifications.sort(key=lambda x: x.timestamp, reverse=True)
        
        # Pagination
        total = len(filtered_notifications)
        paginated = filtered_notifications[skip:skip + limit]
        
        # Calculate statistics
        unread_count = len([n for n in notifications_db if not n.read])
        critical_count = len([n for n in notifications_db if n.type == NotificationType.CRITICAL and not n.read])
        
        return {
            "success": True,
            "notifications": [n.dict() for n in paginated],
            "pagination": {
                "total": total,
                "skip": skip,
                "limit": limit,
                "has_more": skip + limit < total
            },
            "stats": {
                "total": len(notifications_db),
                "unread": unread_count,
                "critical": critical_count
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching notifications: {str(e)}")


@router.get("/alerts", response_model=Dict[str, Any])
async def get_alerts():
    """
    Get active alerts and alert rules
    """
    try:
        # Get recent critical/alert notifications
        active_alerts = [
            n for n in notifications_db 
            if n.type in [NotificationType.ALERT, NotificationType.CRITICAL] 
            and not n.read
        ]
        
        active_alerts.sort(key=lambda x: x.timestamp, reverse=True)
        
        return {
            "success": True,
            "active_alerts": [a.dict() for a in active_alerts],
            "alert_rules": [r.dict() for r in alert_rules_db],
            "summary": {
                "total_alerts": len(active_alerts),
                "critical": len([a for a in active_alerts if a.type == NotificationType.CRITICAL]),
                "warning": len([a for a in active_alerts if a.type == NotificationType.WARNING]),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching alerts: {str(e)}")


@router.post("/mark-read/{notification_id}")
async def mark_notification_read(notification_id: str):
    """
    Mark a notification as read
    """
    try:
        notification = next((n for n in notifications_db if n.id == notification_id), None)
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        notification.read = True
        
        return {
            "success": True,
            "message": "Notification marked as read"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error marking notification: {str(e)}")


@router.post("/mark-all-read")
async def mark_all_read():
    """
    Mark all notifications as read
    """
    try:
        for notification in notifications_db:
            notification.read = True
        
        return {
            "success": True,
            "message": "All notifications marked as read"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error marking notifications: {str(e)}")


@router.delete("/{notification_id}")
async def delete_notification(notification_id: str):
    """
    Delete a notification
    """
    try:
        global notifications_db
        initial_count = len(notifications_db)
        notifications_db = [n for n in notifications_db if n.id != notification_id]
        
        if len(notifications_db) == initial_count:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return {
            "success": True,
            "message": "Notification deleted"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting notification: {str(e)}")


@router.get("/preferences", response_model=NotificationPreferences)
async def get_notification_preferences(user_id: str = "default"):
    """
    Get user notification preferences
    """
    try:
        preferences = user_preferences_db.get(user_id, NotificationPreferences())
        return preferences
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching preferences: {str(e)}")


@router.put("/preferences", response_model=Dict[str, Any])
async def update_notification_preferences(
    preferences: NotificationPreferences,
    user_id: str = "default"
):
    """
    Update user notification preferences
    """
    try:
        user_preferences_db[user_id] = preferences
        
        return {
            "success": True,
            "message": "Notification preferences updated",
            "preferences": preferences.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating preferences: {str(e)}")


@router.put("/alert-rules/{rule_id}")
async def update_alert_rule(rule_id: str, enabled: bool):
    """
    Enable or disable an alert rule
    """
    try:
        rule = next((r for r in alert_rules_db if r.id == rule_id), None)
        if not rule:
            raise HTTPException(status_code=404, detail="Alert rule not found")
        
        rule.enabled = enabled
        
        return {
            "success": True,
            "message": f"Alert rule {'enabled' if enabled else 'disabled'}",
            "rule": rule.dict()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating alert rule: {str(e)}")


@router.get("/stats", response_model=Dict[str, Any])
async def get_notification_stats():
    """
    Get notification statistics and analytics
    """
    try:
        now = datetime.now()
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_ago = now - timedelta(days=7)
        
        # Calculate stats
        total = len(notifications_db)
        unread = len([n for n in notifications_db if not n.read])
        today_count = len([n for n in notifications_db if n.timestamp >= today])
        week_count = len([n for n in notifications_db if n.timestamp >= week_ago])
        
        by_type = {}
        for notif_type in NotificationType:
            by_type[notif_type.value] = len([n for n in notifications_db if n.type == notif_type])
        
        by_category = {}
        for category in NotificationCategory:
            by_category[category.value] = len([n for n in notifications_db if n.category == category])
        
        return {
            "success": True,
            "stats": {
                "total": total,
                "unread": unread,
                "read": total - unread,
                "today": today_count,
                "this_week": week_count,
                "by_type": by_type,
                "by_category": by_category,
                "critical_unread": len([n for n in notifications_db if n.type == NotificationType.CRITICAL and not n.read])
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")
