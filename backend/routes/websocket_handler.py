"""
🔌 Real-time WebSocket Handler for AI Analysis Engine
Provides real-time communication between frontend and AI agents
"""

from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
import asyncio
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class WebSocketManager:
    """Manages WebSocket connections and real-time AI agent communication"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.analysis_sessions: Dict[str, dict] = {}
        self.agent_status: Dict[str, dict] = {
            'monai': {'status': 'ready', 'progress': 0, 'accuracy': 94.2, 'gpu_usage': 0},
            'history': {'status': 'ready', 'progress': 0, 'confidence': 0, 'processing': False},
            'drug_checker': {'status': 'ready', 'progress': 0, 'interactions_found': 0, 'severity': 'none'},
            'research': {'status': 'ready', 'progress': 0, 'papers_found': 0, 'evidence_level': 0}
        }
    
    async def connect(self, websocket: WebSocket):
        """Accept new WebSocket connection"""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
        
        # Send initial status
        await self.send_agent_status(websocket)
        await self.send_system_metrics(websocket)
    
    def disconnect(self, websocket: WebSocket):
        """Remove WebSocket connection"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to specific WebSocket"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            self.disconnect(websocket)
    
    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error broadcasting to connection: {e}")
                disconnected.append(connection)
        
        # Remove failed connections
        for connection in disconnected:
            self.disconnect(connection)
    
    async def send_agent_status(self, websocket: WebSocket = None):
        """Send current agent status"""
        for agent_name, status in self.agent_status.items():
            message = {
                'type': 'agent_status',
                'agent': agent_name,
                'status': status,
                'timestamp': datetime.now().isoformat()
            }
            
            if websocket:
                await self.send_personal_message(message, websocket)
            else:
                await self.broadcast(message)
    
    async def send_system_metrics(self, websocket: WebSocket = None):
        """Send system performance metrics"""
        import psutil
        import GPUtil
        
        try:
            # Get GPU info if available
            gpu_usage = 0
            try:
                gpus = GPUtil.getGPUs()
                if gpus:
                    gpu_usage = gpus[0].load * 100
            except:
                gpu_usage = 0
            
            metrics = {
                'cpu_usage': psutil.cpu_percent(interval=1),
                'memory_usage': psutil.virtual_memory().percent,
                'gpu_usage': gpu_usage,
                'network_latency': 15,  # Mock latency
                'disk_io': psutil.disk_usage('/').percent,
                'processing_queue': len(self.analysis_sessions)
            }
            
            message = {
                'type': 'system_metrics',
                'metrics': metrics,
                'timestamp': datetime.now().isoformat()
            }
            
            if websocket:
                await self.send_personal_message(message, websocket)
            else:
                await self.broadcast(message)
                
        except Exception as e:
            logger.error(f"Error getting system metrics: {e}")
    
    async def start_analysis(self, session_id: str, analysis_data: dict):
        """Start AI analysis and send progress updates"""
        self.analysis_sessions[session_id] = {
            'start_time': datetime.now(),
            'status': 'processing',
            'data': analysis_data
        }
        
        # Simulate AI agent coordination
        await self.simulate_agent_processing(session_id, analysis_data)
    
    async def simulate_agent_processing(self, session_id: str, analysis_data: dict):
        """Simulate real-time AI agent processing with progress updates"""
        stages = [
            {'stage': 'initializing', 'progress': 0, 'duration': 2},
            {'stage': 'preprocessing', 'progress': 15, 'duration': 3},
            {'stage': 'monai_analysis', 'progress': 35, 'duration': 8},
            {'stage': 'history_synthesis', 'progress': 60, 'duration': 4},
            {'stage': 'drug_checking', 'progress': 75, 'duration': 3},
            {'stage': 'research_analysis', 'progress': 90, 'duration': 5},
            {'stage': 'finalizing', 'progress': 95, 'duration': 2},
            {'stage': 'completed', 'progress': 100, 'duration': 1}
        ]
        
        for stage_info in stages:
            # Update agent status based on current stage
            if stage_info['stage'] == 'monai_analysis':
                self.agent_status['monai']['status'] = 'processing'
                self.agent_status['monai']['progress'] = min(100, stage_info['progress'] * 2)
                
            elif stage_info['stage'] == 'history_synthesis':
                self.agent_status['history']['status'] = 'analyzing'
                self.agent_status['history']['processing'] = True
                self.agent_status['history']['progress'] = min(100, (stage_info['progress'] - 35) * 3)
                
            elif stage_info['stage'] == 'drug_checking':
                self.agent_status['drug_checker']['status'] = 'checking'
                self.agent_status['drug_checker']['progress'] = min(100, (stage_info['progress'] - 60) * 5)
                
            elif stage_info['stage'] == 'research_analysis':
                self.agent_status['research']['status'] = 'searching'
                self.agent_status['research']['progress'] = min(100, (stage_info['progress'] - 75) * 4)
                self.agent_status['research']['papers_found'] = min(150, stage_info['progress'] * 2)
            
            # Send progress update
            await self.broadcast({
                'type': 'analysis_progress',
                'session_id': session_id,
                'stage': stage_info['stage'],
                'progress': stage_info['progress'],
                'timestamp': datetime.now().isoformat()
            })
            
            # Send agent status updates
            await self.send_agent_status()
            
            # Send real-time metrics
            await self.broadcast({
                'type': 'real_time_metrics',
                'metrics': {
                    'accuracy': min(94 + stage_info['progress'] * 0.05, 99.2),
                    'confidence': min(80 + stage_info['progress'] * 0.2, 99),
                    'processing_speed': min(70 + stage_info['progress'] * 0.3, 100),
                    'models_active': 4,
                    'gpu_utilization': min(60 + stage_info['progress'] * 0.35, 95),
                    'memory_usage': min(45 + stage_info['progress'] * 0.25, 80),
                    'network_latency': max(10, 60 - stage_info['progress'] * 0.5)
                },
                'timestamp': datetime.now().isoformat()
            })
            
            await asyncio.sleep(stage_info['duration'])
        
        # Send completion message with results
        await self.send_analysis_complete(session_id)
        
        # Reset agent status
        for agent in self.agent_status:
            self.agent_status[agent]['status'] = 'ready'
            self.agent_status[agent]['progress'] = 0
        
        # Clean up session
        if session_id in self.analysis_sessions:
            del self.analysis_sessions[session_id]
    
    async def send_analysis_complete(self, session_id: str):
        """Send analysis completion with results"""
        results = {
            'session_id': session_id,
            'diagnosis': {
                'primary': 'Advanced Pneumonia Detection - AI Confidence 96.7%',
                'secondary': ['Pleural effusion (MONAI)', 'Consolidation pattern'],
                'confidence': 96.7,
                'severity': 'Moderate-High Risk'
            },
            'findings': [
                {
                    'region': 'Right lower lobe',
                    'finding': 'Consolidation with air bronchograms',
                    'confidence': 96.7,
                    'agent': 'MONAI'
                }
            ],
            'ai_performance': {
                'monai_accuracy': 94.2,
                'processing_time': '12.3 seconds',
                'agents_coordinated': 4,
                'gpu_utilization': 87
            }
        }
        
        await self.broadcast({
            'type': 'analysis_complete',
            'session_id': session_id,
            'results': results,
            'timestamp': datetime.now().isoformat()
        })

# Global WebSocket manager instance
manager = WebSocketManager()

# Background task for periodic updates
async def periodic_updates():
    """Send periodic system updates"""
    while True:
        try:
            await manager.send_system_metrics()
            await asyncio.sleep(5)  # Update every 5 seconds
        except Exception as e:
            logger.error(f"Error in periodic updates: {e}")
            await asyncio.sleep(10)