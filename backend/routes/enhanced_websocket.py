"""
Enhanced WebSocket Handler for Real-time Medical AI Platform
Comprehensive real-time communication with AI agents status and system metrics
"""

from fastapi import WebSocket, WebSocketDisconnect, Depends
from typing import Dict, Any, List, Optional, Set
import asyncio
import json
import logging
from datetime import datetime, timezone
import uuid
from bson import ObjectId

from models.websocket import WebSocketMessage, SystemMetrics, AgentStatusMessage
from routes.enhanced_auth import get_current_user

try:
    from config.enhanced_database import enhanced_db as db
except ImportError:
    from config.database import db

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Enhanced WebSocket connection manager with room support"""
    
    def __init__(self):
        # Active connections by connection ID
        self.connections: Dict[str, WebSocket] = {}
        # User mapping to connection IDs  
        self.user_connections: Dict[str, Set[str]] = {}
        # Room subscriptions (diagnosis rooms, system monitoring, etc.)
        self.rooms: Dict[str, Set[str]] = {}
        # Connection metadata
        self.connection_metadata: Dict[str, Dict[str, Any]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: Optional[str] = None) -> str:
        """Accept WebSocket connection and return connection ID"""
        await websocket.accept()
        
        connection_id = str(uuid.uuid4())
        self.connections[connection_id] = websocket
        
        # Track user connections
        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = set()
            self.user_connections[user_id].add(connection_id)
        
        # Store metadata
        self.connection_metadata[connection_id] = {
            "user_id": user_id,
            "connected_at": datetime.now(timezone.utc),
            "last_activity": datetime.now(timezone.utc),
            "subscribed_rooms": set()
        }
        
        logger.info(f"WebSocket connected: {connection_id} (User: {user_id})")
        return connection_id
    
    def disconnect(self, connection_id: str):
        """Handle WebSocket disconnection"""
        if connection_id not in self.connections:
            return
        
        # Get metadata
        metadata = self.connection_metadata.get(connection_id, {})
        user_id = metadata.get("user_id")
        subscribed_rooms = metadata.get("subscribed_rooms", set())
        
        # Remove from user connections
        if user_id and user_id in self.user_connections:
            self.user_connections[user_id].discard(connection_id)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
        
        # Remove from rooms
        for room in subscribed_rooms:
            if room in self.rooms:
                self.rooms[room].discard(connection_id)
                if not self.rooms[room]:
                    del self.rooms[room]
        
        # Clean up
        del self.connections[connection_id]
        del self.connection_metadata[connection_id]
        
        logger.info(f"WebSocket disconnected: {connection_id} (User: {user_id})")
    
    def join_room(self, connection_id: str, room_name: str):
        """Add connection to a room"""
        if connection_id not in self.connections:
            return False
        
        if room_name not in self.rooms:
            self.rooms[room_name] = set()
        
        self.rooms[room_name].add(connection_id)
        self.connection_metadata[connection_id]["subscribed_rooms"].add(room_name)
        
        logger.info(f"Connection {connection_id} joined room: {room_name}")
        return True
    
    def leave_room(self, connection_id: str, room_name: str):
        """Remove connection from a room"""
        if room_name in self.rooms:
            self.rooms[room_name].discard(connection_id)
            if not self.rooms[room_name]:
                del self.rooms[room_name]
        
        if connection_id in self.connection_metadata:
            self.connection_metadata[connection_id]["subscribed_rooms"].discard(room_name)
        
        logger.info(f"Connection {connection_id} left room: {room_name}")
    
    async def send_personal_message(self, message: str, connection_id: str):
        """Send message to specific connection"""
        if connection_id in self.connections:
            try:
                await self.connections[connection_id].send_text(message)
                self.connection_metadata[connection_id]["last_activity"] = datetime.now(timezone.utc)
                return True
            except Exception as e:
                logger.error(f"Error sending message to {connection_id}: {e}")
                self.disconnect(connection_id)
        return False
    
    async def send_to_user(self, message: str, user_id: str):
        """Send message to all connections of a specific user"""
        if user_id in self.user_connections:
            connection_ids = list(self.user_connections[user_id])
            tasks = []
            for connection_id in connection_ids:
                tasks.append(self.send_personal_message(message, connection_id))
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            success_count = sum(1 for result in results if result is True)
            logger.info(f"Sent message to user {user_id}: {success_count}/{len(tasks)} connections")
    
    async def broadcast_to_room(self, message: str, room_name: str):
        """Broadcast message to all connections in a room"""
        if room_name in self.rooms:
            connection_ids = list(self.rooms[room_name])
            tasks = []
            for connection_id in connection_ids:
                tasks.append(self.send_personal_message(message, connection_id))
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            success_count = sum(1 for result in results if result is True)
            logger.info(f"Broadcast to room {room_name}: {success_count}/{len(tasks)} connections")
    
    async def broadcast_to_all(self, message: str):
        """Broadcast message to all active connections"""
        if not self.connections:
            return
        
        tasks = []
        for connection_id in list(self.connections.keys()):
            tasks.append(self.send_personal_message(message, connection_id))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        success_count = sum(1 for result in results if result is True)
        logger.info(f"Broadcast to all: {success_count}/{len(tasks)} connections")
    
    def get_connection_count(self) -> int:
        """Get total number of active connections"""
        return len(self.connections)
    
    def get_room_connections(self, room_name: str) -> int:
        """Get number of connections in a specific room"""
        return len(self.rooms.get(room_name, set()))
    
    def get_user_connection_count(self, user_id: str) -> int:
        """Get number of connections for a specific user"""
        return len(self.user_connections.get(user_id, set()))


# Global connection manager instance
manager = ConnectionManager()


class AIAgentsStatusBroadcaster:
    """Broadcast AI agents status updates to connected clients"""
    
    def __init__(self, connection_manager: ConnectionManager):
        self.manager = connection_manager
        self.is_running = False
        self.task = None
    
    async def start(self):
        """Start broadcasting system metrics and AI status"""
        if self.is_running:
            return
        
        self.is_running = True
        self.task = asyncio.create_task(self._broadcast_loop())
        logger.info("Started AI agents status broadcaster")
    
    async def stop(self):
        """Stop broadcasting"""
        self.is_running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
        logger.info("Stopped AI agents status broadcaster")
    
    async def _broadcast_loop(self):
        """Main broadcasting loop"""
        try:
            while self.is_running:
                # Broadcast system metrics every 5 seconds
                await self._broadcast_system_metrics()
                
                # Broadcast AI agents status every 3 seconds
                await self._broadcast_agents_status()
                
                await asyncio.sleep(3)
                
        except asyncio.CancelledError:
            logger.info("AI agents broadcaster cancelled")
        except Exception as e:
            logger.error(f"AI agents broadcaster error: {e}")
    
    async def _broadcast_system_metrics(self):
        """Broadcast current system metrics"""
        try:
            # Simulate system metrics (in production, get from actual system)
            import random
            metrics = SystemMetrics(
                cpu_usage=random.uniform(20, 80),
                memory_usage=random.uniform(40, 90),
                gpu_usage=random.uniform(0, 95),
                network_latency=random.uniform(1, 50),
                disk_io=random.uniform(10, 100),
                processing_queue=random.randint(0, 10)
            )
            
            message = WebSocketMessage(
                type="system_metrics",
                data={
                    "metrics": metrics.dict(),
                    "active_connections": self.manager.get_connection_count(),
                    "active_diagnoses": await db.get_collection("diagnoses").count_documents(
                        {"status": {"$in": ["pending", "processing"]}}
                    )
                }
            )
            
            # Broadcast to system monitoring room
            await self.manager.broadcast_to_room(
                json.dumps(message.dict(), default=str),
                "system_metrics"
            )
            
        except Exception as e:
            logger.error(f"Error broadcasting system metrics: {e}")
    
    async def _broadcast_agents_status(self):
        """Broadcast AI agents status updates"""
        try:
            # Simulate AI agents status (in production, get from actual agents)
            import random
            
            agents_status = {
                "monai": {
                    "status": "ready",
                    "progress": 0,
                    "accuracy": round(random.uniform(90, 98), 1),
                    "gpu_usage": round(random.uniform(0, 85), 1),
                    "models_loaded": 4
                },
                "history": {
                    "status": "ready", 
                    "progress": 0,
                    "confidence": 0,
                    "processing": False,
                    "queue_size": random.randint(0, 5)
                },
                "drug_checker": {
                    "status": "ready",
                    "progress": 0,
                    "interactions_found": 0,
                    "severity": "none",
                    "database_updated": datetime.now(timezone.utc)
                },
                "research": {
                    "status": "ready",
                    "progress": 0,
                    "papers_found": 0,
                    "evidence_level": 0,
                    "search_active": False
                }
            }
            
            message = WebSocketMessage(
                type="agents_status",
                data={"agents": agents_status}
            )
            
            # Broadcast to all connections
            await self.manager.broadcast_to_all(
                json.dumps(message.dict(), default=str)
            )
            
        except Exception as e:
            logger.error(f"Error broadcasting agents status: {e}")
    
    async def broadcast_diagnosis_progress(self, diagnosis_id: str, progress_data: Dict[str, Any]):
        """Broadcast diagnosis-specific progress updates"""
        try:
            message = WebSocketMessage(
                type="analysis_progress",
                data={
                    "diagnosis_id": diagnosis_id,
                    **progress_data
                }
            )
            
            # Broadcast to diagnosis-specific room
            await self.manager.broadcast_to_room(
                json.dumps(message.dict(), default=str),
                f"diagnosis_{diagnosis_id}"
            )
            
        except Exception as e:
            logger.error(f"Error broadcasting diagnosis progress: {e}")
    
    async def broadcast_diagnosis_complete(self, diagnosis_id: str, results: Dict[str, Any]):
        """Broadcast diagnosis completion"""
        try:
            message = WebSocketMessage(
                type="analysis_complete",
                data={
                    "diagnosis_id": diagnosis_id,
                    "results": results
                }
            )
            
            # Broadcast to diagnosis-specific room
            await self.manager.broadcast_to_room(
                json.dumps(message.dict(), default=str),
                f"diagnosis_{diagnosis_id}"
            )
            
        except Exception as e:
            logger.error(f"Error broadcasting diagnosis completion: {e}")


# Global broadcaster instance
broadcaster = AIAgentsStatusBroadcaster(manager)


# ========================================
# WebSocket Route Handlers
# ========================================

async def handle_websocket_connection(websocket: WebSocket, user_id: Optional[str] = None):
    """Handle main WebSocket connection for analysis updates"""
    connection_id = await manager.connect(websocket, user_id)
    
    try:
        # Send initial connection confirmation
        await manager.send_personal_message(json.dumps({
            "type": "connection_established",
            "data": {
                "connection_id": connection_id,
                "message": "Connected to Medical AI Platform",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        }), connection_id)
        
        # Auto-join system metrics room
        manager.join_room(connection_id, "system_metrics")
        
        # Start broadcaster if not running
        if not broadcaster.is_running:
            await broadcaster.start()
        
        # Listen for messages
        while True:
            try:
                data = await websocket.receive_text()
                message_data = json.loads(data)
                
                await handle_websocket_message(connection_id, message_data)
                
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON from {connection_id}: {e}")
                await manager.send_personal_message(json.dumps({
                    "type": "error",
                    "data": {"message": "Invalid JSON format"}
                }), connection_id)
            except Exception as e:
                logger.error(f"WebSocket message error for {connection_id}: {e}")
                await manager.send_personal_message(json.dumps({
                    "type": "error", 
                    "data": {"message": "Message processing error"}
                }), connection_id)
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {connection_id}")
    except Exception as e:
        logger.error(f"WebSocket connection error for {connection_id}: {e}")
    finally:
        manager.disconnect(connection_id)


async def handle_websocket_message(connection_id: str, message_data: Dict[str, Any]):
    """Handle incoming WebSocket messages"""
    try:
        message_type = message_data.get("type")
        data = message_data.get("data", {})
        
        if message_type == "join_room":
            room_name = data.get("room")
            if room_name:
                success = manager.join_room(connection_id, room_name)
                await manager.send_personal_message(json.dumps({
                    "type": "room_joined",
                    "data": {"room": room_name, "success": success}
                }), connection_id)
        
        elif message_type == "leave_room":
            room_name = data.get("room")
            if room_name:
                manager.leave_room(connection_id, room_name)
                await manager.send_personal_message(json.dumps({
                    "type": "room_left",
                    "data": {"room": room_name}
                }), connection_id)
        
        elif message_type == "join_diagnosis":
            diagnosis_id = data.get("diagnosis_id")
            if diagnosis_id:
                room_name = f"diagnosis_{diagnosis_id}"
                success = manager.join_room(connection_id, room_name)
                await manager.send_personal_message(json.dumps({
                    "type": "diagnosis_joined",
                    "data": {"diagnosis_id": diagnosis_id, "success": success}
                }), connection_id)
        
        elif message_type == "leave_diagnosis":
            diagnosis_id = data.get("diagnosis_id")
            if diagnosis_id:
                room_name = f"diagnosis_{diagnosis_id}"
                manager.leave_room(connection_id, room_name)
                await manager.send_personal_message(json.dumps({
                    "type": "diagnosis_left",
                    "data": {"diagnosis_id": diagnosis_id}
                }), connection_id)
        
        elif message_type == "ping":
            await manager.send_personal_message(json.dumps({
                "type": "pong",
                "data": {"timestamp": datetime.now(timezone.utc).isoformat()}
            }), connection_id)
        
        else:
            logger.warning(f"Unknown message type from {connection_id}: {message_type}")
            await manager.send_personal_message(json.dumps({
                "type": "error",
                "data": {"message": f"Unknown message type: {message_type}"}
            }), connection_id)
            
    except Exception as e:
        logger.error(f"Error handling message from {connection_id}: {e}")
        await manager.send_personal_message(json.dumps({
            "type": "error",
            "data": {"message": "Message handling error"}
        }), connection_id)


# ========================================
# Utility Functions
# ========================================

async def notify_diagnosis_update(diagnosis_id: str, update_data: Dict[str, Any]):
    """Notify all subscribers of a diagnosis update"""
    try:
        message = WebSocketMessage(
            type="diagnosis_update",
            data={
                "diagnosis_id": diagnosis_id,
                **update_data
            }
        )
        
        room_name = f"diagnosis_{diagnosis_id}"
        await manager.broadcast_to_room(
            json.dumps(message.dict(), default=str),
            room_name
        )
        
    except Exception as e:
        logger.error(f"Error notifying diagnosis update: {e}")


async def get_websocket_stats() -> Dict[str, Any]:
    """Get WebSocket connection statistics"""
    try:
        return {
            "total_connections": manager.get_connection_count(),
            "total_rooms": len(manager.rooms),
            "total_users": len(manager.user_connections),
            "rooms": {room: len(connections) for room, connections in manager.rooms.items()},
            "broadcaster_running": broadcaster.is_running
        }
    except Exception as e:
        logger.error(f"Error getting WebSocket stats: {e}")
        return {"error": "Failed to get statistics"}