"""
Multi-Agent AI Medical Analysis System with Enhanced Visualizations
Coordinates specialized agents for comprehensive medical analysis with real-time charts
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import json
import uuid
import sys
import os

from motor.motor_asyncio import AsyncIOMotorClient
import redis.asyncio as redis
from minio import Minio

# Add utils path for visualization engine
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'utils'))

from .image_analysis import ImageAnalysisAgent
from .drug_interaction import DrugInteractionAgent
from .clinical_decision_support import ClinicalDecisionSupportAgent
from .research import ResearchAgent  
from .history_synthesis import HistorySynthesisAgent

# Import visualization engine
try:
    from medical_visualization_engine import medical_viz
    VISUALIZATION_AVAILABLE = True
except ImportError:
    VISUALIZATION_AVAILABLE = False
    medical_viz = None

logger = logging.getLogger(__name__)

class MultiAgentMedicalSystem:
    """
    Orchestrates specialized AI agents for comprehensive medical analysis
    
    Agents:
    - Image Analysis Agent: MONAI-powered X-ray/MRI processing
    - History Synthesis Agent: Patient records and lab data integration
    - Drug Interaction Agent: Real-time prescription safety
    - Research Agent: Clinical trials and evidence-based medicine
    - Clinical Decision Support: Evidence-based recommendations
    """
    
    def __init__(self, mongodb_client, redis_client, minio_client, settings):
        self.mongodb = mongodb_client
        self.redis = redis_client
        self.minio = minio_client
        self.settings = settings
        self.db = mongodb_client[settings.MONGODB_DATABASE]
        
        # Initialize specialized agents
        self.image_agent = ImageAnalysisAgent(mongodb_client, minio_client, settings)
        self.drug_agent = DrugInteractionAgent(mongodb_client, redis_client, settings)
        self.clinical_agent = ClinicalDecisionSupportAgent(mongodb_client, redis_client, settings)
        self.research_agent = ResearchAgent(mongodb_client, redis_client, settings)
        self.history_agent = HistorySynthesisAgent(mongodb_client, redis_client, settings)
        
        # Initialize visualization capabilities
        self.visualization_enabled = VISUALIZATION_AVAILABLE
        self.analysis_metrics = {
            "image_analysis": {"response_time": 0, "confidence_history": [], "success_rate": 0, "memory_mb": 0, "queue_size": 0, "error_rate": 0},
            "drug_interaction": {"response_time": 0, "confidence_history": [], "success_rate": 0, "memory_mb": 0, "queue_size": 0, "error_rate": 0},
            "clinical_decision": {"response_time": 0, "confidence_history": [], "success_rate": 0, "memory_mb": 0, "queue_size": 0, "error_rate": 0},
            "research": {"response_time": 0, "confidence_history": [], "success_rate": 0, "memory_mb": 0, "queue_size": 0, "error_rate": 0},
            "history_synthesis": {"response_time": 0, "confidence_history": [], "success_rate": 0, "memory_mb": 0, "queue_size": 0, "error_rate": 0}
        }
        
        logger.info(f"🤖 Multi-Agent Medical AI System initialized (Visualizations: {'✅' if self.visualization_enabled else '❌'})")
        
    async def comprehensive_analysis(self, analysis_request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform comprehensive multi-agent medical analysis
        
        Args:
            analysis_request: {
                "patient_id": str,
                "analysis_type": str,  # comprehensive, clinical, imaging, drug_safety
                "medical_images": List[str],  # Image file paths
                "medications": List[Dict],
                "symptoms": List[str],
                "lab_results": Dict,
                "medical_history": Dict
            }
        """
        analysis_id = str(uuid.uuid4())
        start_time = datetime.now(timezone.utc)
        
        try:
            logger.info(f"🚀 Starting comprehensive analysis {analysis_id}")
            
            # Initialize analysis session
            analysis_session = {
                "analysis_id": analysis_id,
                "patient_id": analysis_request.get("patient_id"),
                "analysis_type": analysis_request.get("analysis_type", "comprehensive"),
                "start_time": start_time,
                "status": "processing",
                "agents_completed": [],
                "results": {}
            }
            
            # Save initial session
            await self.db.analysis_sessions.insert_one(analysis_session)
            
            # Run agents in parallel where possible
            agent_tasks = []
            
            # 1. History Synthesis Agent (run first for context)
            if analysis_request.get("patient_id"):
                logger.info("📋 Starting History Synthesis Agent")
                history_task = asyncio.create_task(
                    self._run_history_agent(analysis_id, analysis_request)
                )
                agent_tasks.append(("history", history_task))
            
            # 2. Image Analysis Agent (if images provided)
            if analysis_request.get("medical_images"):
                logger.info("🏥 Starting Image Analysis Agent")
                image_task = asyncio.create_task(
                    self._run_image_agent(analysis_id, analysis_request)
                )
                agent_tasks.append(("imaging", image_task))
            
            # 3. Drug Interaction Agent (if medications provided)
            if analysis_request.get("medications"):
                logger.info("💊 Starting Drug Interaction Agent")
                drug_task = asyncio.create_task(
                    self._run_drug_agent(analysis_id, analysis_request)
                )
                agent_tasks.append(("drug_safety", drug_task))
            
            # 4. Research Agent (for rare conditions and trials)
            research_task = asyncio.create_task(
                self._run_research_agent(analysis_id, analysis_request)
            )
            agent_tasks.append(("research", research_task))
            
            # Wait for all agents to complete
            logger.info("⏳ Waiting for agent completion...")
            agent_results = {}
            
            for agent_name, task in agent_tasks:
                try:
                    result = await task
                    agent_results[agent_name] = result
                    logger.info(f"✅ {agent_name.title()} Agent completed")
                except Exception as e:
                    logger.error(f"❌ {agent_name.title()} Agent failed: {e}")
                    agent_results[agent_name] = {"error": str(e), "status": "failed"}
            
            # 5. Clinical Decision Support Agent (runs last with all context)
            logger.info("🏥 Starting Clinical Decision Support Agent")
            clinical_result = await self._run_clinical_agent(analysis_id, analysis_request, agent_results)
            agent_results["clinical_decision"] = clinical_result
            
            # Generate comprehensive report
            comprehensive_report = await self._generate_comprehensive_report(
                analysis_id, analysis_request, agent_results
            )
            
            # Update session with final results
            end_time = datetime.now(timezone.utc)
            await self.db.analysis_sessions.update_one(
                {"analysis_id": analysis_id},
                {
                    "$set": {
                        "status": "completed",
                        "end_time": end_time,
                        "processing_time": (end_time - start_time).total_seconds(),
                        "agent_results": agent_results,
                        "comprehensive_report": comprehensive_report
                    }
                }
            )
            
            logger.info(f"🎉 Analysis {analysis_id} completed successfully")
            return comprehensive_report
            
        except Exception as e:
            logger.error(f"❌ Analysis {analysis_id} failed: {e}")
            await self.db.analysis_sessions.update_one(
                {"analysis_id": analysis_id},
                {"$set": {"status": "failed", "error": str(e)}}
            )
            raise
    
    async def _run_history_agent(self, analysis_id: str, request: Dict[str, Any]) -> Dict[str, Any]:
        """Run History Synthesis Agent"""
        patient_id = request.get("patient_id")
        if not patient_id:
            return {"error": "No patient ID provided"}
        
        return await self.history_agent.synthesize_history(patient_id)
    
    async def _run_image_agent(self, analysis_id: str, request: Dict[str, Any]) -> Dict[str, Any]:
        """Run Image Analysis Agent"""
        images = request.get("medical_images", [])
        image_results = []
        
        for image_path in images:
            try:
                # Mock file upload object for existing files
                result = await self.image_agent.analyze_medical_image(image_path)
                image_results.append(result)
            except Exception as e:
                logger.error(f"Image analysis failed for {image_path}: {e}")
                image_results.append({"image": image_path, "error": str(e)})
        
        return {
            "total_images": len(images),
            "successful_analyses": len([r for r in image_results if "error" not in r]),
            "results": image_results
        }
    
    async def _run_drug_agent(self, analysis_id: str, request: Dict[str, Any]) -> Dict[str, Any]:
        """Run Drug Interaction Agent"""
        medications = request.get("medications", [])
        patient_id = request.get("patient_id")
        
        return await self.drug_agent.comprehensive_drug_analysis(
            medications=medications,
            patient_id=patient_id,
            analysis_context=request
        )
    
    async def _run_research_agent(self, analysis_id: str, request: Dict[str, Any]) -> Dict[str, Any]:
        """Run Research Agent"""
        symptoms = request.get("symptoms", [])
        diagnosis_keywords = request.get("diagnosis_keywords", [])
        
        # Combine symptoms and potential diagnoses for research
        research_terms = symptoms + diagnosis_keywords
        
        return await self.research_agent.comprehensive_research_analysis(
            patient_profile=request,
            research_terms=research_terms
        )
    
    async def _run_clinical_agent(self, analysis_id: str, request: Dict[str, Any], 
                                 agent_results: Dict[str, Any]) -> Dict[str, Any]:
        """Run Clinical Decision Support Agent with context from other agents"""
        
        return await self.clinical_agent.comprehensive_clinical_analysis(
            patient_data=request,
            agent_context=agent_results,
            analysis_id=analysis_id
        )
    
    async def _generate_comprehensive_report(self, analysis_id: str, request: Dict[str, Any], 
                                           agent_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive medical analysis report"""
        
        report = {
            "analysis_id": analysis_id,
            "patient_id": request.get("patient_id"),
            "analysis_type": request.get("analysis_type"),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "summary": {},
            "detailed_findings": {},
            "recommendations": {},
            "risk_assessment": {},
            "clinical_insights": {},
            "research_findings": {},
            "visual_analytics": {},
            "confidence_scores": {}
        }
        
        # Extract key findings from each agent
        if "history" in agent_results:
            history_data = agent_results["history"]
            report["summary"]["medical_history"] = history_data.get("summary", {})
            report["detailed_findings"]["patient_timeline"] = history_data.get("timeline", [])
        
        if "imaging" in agent_results:
            imaging_data = agent_results["imaging"]
            report["summary"]["imaging_findings"] = imaging_data.get("summary", {})
            report["detailed_findings"]["image_analysis"] = imaging_data.get("results", [])
            report["visual_analytics"]["heatmaps"] = [
                r.get("heatmap_url") for r in imaging_data.get("results", []) 
                if r.get("heatmap_url")
            ]
        
        if "drug_safety" in agent_results:
            drug_data = agent_results["drug_safety"]
            report["summary"]["drug_interactions"] = drug_data.get("interaction_summary", {})
            report["detailed_findings"]["drug_analysis"] = drug_data.get("detailed_analysis", {})
            report["risk_assessment"]["medication_risks"] = drug_data.get("risk_assessment", {})
        
        if "research" in agent_results:
            research_data = agent_results["research"]
            report["research_findings"] = research_data.get("clinical_trials", {})
            report["summary"]["evidence_base"] = research_data.get("evidence_summary", {})
        
        if "clinical_decision" in agent_results:
            clinical_data = agent_results["clinical_decision"]
            report["clinical_insights"] = clinical_data.get("insights", {})
            report["recommendations"]["clinical"] = clinical_data.get("recommendations", [])
            report["confidence_scores"] = clinical_data.get("confidence_scores", {})
        
        # Generate overall risk assessment
        report["risk_assessment"]["overall"] = self._calculate_overall_risk(agent_results)
        
        # Generate summary statistics
        report["summary"]["analysis_metrics"] = {
            "agents_completed": len([r for r in agent_results.values() if "error" not in r]),
            "total_agents": len(agent_results),
            "processing_success_rate": len([r for r in agent_results.values() if "error" not in r]) / len(agent_results) * 100
        }
        
        return report
    
    def _calculate_overall_risk(self, agent_results: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate overall patient risk based on all agent findings"""
        
        risk_factors = []
        risk_scores = []
        
        # Collect risk indicators from each agent
        if "drug_safety" in agent_results:
            drug_risks = agent_results["drug_safety"].get("risk_assessment", {})
            if drug_risks.get("high_risk_interactions"):
                risk_factors.append("High-risk drug interactions detected")
                risk_scores.append(0.8)
        
        if "imaging" in agent_results:
            imaging_results = agent_results["imaging"].get("results", [])
            for result in imaging_results:
                if result.get("abnormalities_detected"):
                    risk_factors.append(f"Imaging abnormalities: {result.get('primary_finding')}")
                    confidence = result.get("confidence", 0.5)
                    risk_scores.append(confidence * 0.7)  # Adjust for imaging confidence
        
        if "clinical_decision" in agent_results:
            clinical_risks = agent_results["clinical_decision"].get("risk_stratification", {})
            overall_risk = clinical_risks.get("overall_risk_score", 0.3)
            risk_scores.append(overall_risk)
        
        # Calculate composite risk score
        if risk_scores:
            average_risk = sum(risk_scores) / len(risk_scores)
            max_risk = max(risk_scores)
            # Use weighted combination of average and max risk
            composite_risk = (average_risk * 0.6) + (max_risk * 0.4)
        else:
            composite_risk = 0.2  # Low baseline risk
        
        # Categorize risk level
        if composite_risk >= 0.8:
            risk_level = "Critical"
            risk_color = "#DC2626"  # Red
        elif composite_risk >= 0.6:
            risk_level = "High"
            risk_color = "#EA580C"  # Orange
        elif composite_risk >= 0.4:
            risk_level = "Moderate"
            risk_color = "#D97706"  # Amber
        elif composite_risk >= 0.2:
            risk_level = "Low"
            risk_color = "#16A34A"  # Green
        else:
            risk_level = "Minimal"
            risk_color = "#059669"  # Emerald
        
        return {
            "composite_score": round(composite_risk, 2),
            "risk_level": risk_level,
            "risk_color": risk_color,
            "risk_factors": risk_factors,
            "risk_breakdown": {
                "medication_risk": next((s for i, s in enumerate(risk_scores) if "drug" in str(agent_results)), 0.0),
                "imaging_risk": next((s for i, s in enumerate(risk_scores) if "imaging" in str(agent_results)), 0.0),
                "clinical_risk": next((s for i, s in enumerate(risk_scores) if "clinical" in str(agent_results)), 0.0)
            }
        }
    
    async def get_analysis_status(self, analysis_id: str) -> Dict[str, Any]:
        """Get real-time analysis status"""
        session = await self.db.analysis_sessions.find_one({"analysis_id": analysis_id})
        if not session:
            return {"error": "Analysis not found"}
        
        return {
            "analysis_id": analysis_id,
            "status": session.get("status"),
            "progress": len(session.get("agents_completed", [])) / 5 * 100,  # 5 total agents
            "agents_completed": session.get("agents_completed", []),
            "start_time": session.get("start_time"),
            "estimated_completion": session.get("estimated_completion")
        }
    
    async def generate_demo_data(self) -> Dict[str, Any]:
        """Generate comprehensive demo data for testing"""
        
        demo_patient = {
            "patient_id": "demo_patient_001",
            "analysis_type": "comprehensive",
            "medical_images": [
                "/uploads/chest_xray_001.jpg",
                "/uploads/mri_brain_001.nii"
            ],
            "medications": [
                {"name": "Warfarin", "dosage": "5mg", "frequency": "daily"},
                {"name": "Aspirin", "dosage": "81mg", "frequency": "daily"},
                {"name": "Metformin", "dosage": "500mg", "frequency": "twice daily"}
            ],
            "symptoms": [
                "Chest pain", "Shortness of breath", "Fatigue", "Dizziness"
            ],
            "diagnosis_keywords": [
                "Atrial fibrillation", "Diabetes mellitus", "Hypertension"
            ],
            "lab_results": {
                "CBC": {"WBC": 7.2, "RBC": 4.5, "Hemoglobin": 12.8},
                "Chemistry": {"Glucose": 145, "Creatinine": 1.1, "BUN": 18},
                "Cardiac": {"Troponin": 0.02, "BNP": 125},
                "Coagulation": {"INR": 2.8, "PT": 28.5, "PTT": 35.2}
            },
            "medical_history": {
                "conditions": ["Atrial Fibrillation", "Type 2 Diabetes", "Hypertension"],
                "surgeries": ["Appendectomy (2010)"],
                "allergies": ["Penicillin", "Shellfish"],
                "family_history": ["CAD - Father", "Diabetes - Mother"]
            }
        }
        
        return demo_patient
    
    # ============ ENHANCED VISUALIZATION METHODS ============
    
    def create_agent_performance_dashboard(self) -> str:
        """
        Create real-time agent performance visualization
        """
        if not self.visualization_enabled:
            return {"error": "Visualization engine not available"}
        
        try:
            # Create performance dashboard
            fig = medical_viz.create_agent_performance_dashboard(self.analysis_metrics)
            return medical_viz.save_chart_as_base64(fig)
        except Exception as e:
            logger.error(f"Visualization error: {e}")
            return {"error": str(e)}
    
    def create_system_network_graph(self) -> str:
        """
        Create network graph showing system architecture
        """
        if not self.visualization_enabled:
            return {"error": "Visualization engine not available"}
        
        try:
            # Define system connections
            connections = {
                "Multi-Agent Controller": ["Image Analysis", "Drug Safety", "Clinical Decision", "Research", "History"],
                "Image Analysis": ["Clinical Decision", "History"],
                "Drug Safety": ["Clinical Decision", "History"],
                "Clinical Decision": ["Research"],
                "Research": ["Clinical Decision"]
            }
            
            # Define node data
            node_data = {
                "Multi-Agent Controller": {"type": "agent", "importance": 3},
                "Image Analysis": {"type": "agent", "importance": 2},
                "Drug Safety": {"type": "agent", "importance": 2},
                "Clinical Decision": {"type": "agent", "importance": 3},
                "Research": {"type": "agent", "importance": 2},
                "History": {"type": "agent", "importance": 1},
                "MongoDB": {"type": "database", "importance": 2},
                "Redis": {"type": "database", "importance": 1},
                "MinIO": {"type": "database", "importance": 1}
            }
            
            fig = medical_viz.create_medical_network_graph(connections, node_data)
            return medical_viz.save_chart_as_base64(fig)
            
        except Exception as e:
            logger.error(f"Network graph error: {e}")
            return {"error": str(e)}
    
    def create_analysis_timeline_viz(self, analysis_id: str) -> str:
        """
        Create timeline visualization for specific analysis
        """
        if not self.visualization_enabled:
            return {"error": "Visualization engine not available"}
        
        try:
            # Generate sample timeline data (in real implementation, fetch from database)
            timeline_data = [
                {"timestamp": "2025-10-11T09:00:00", "confidence": 1.0, "type": "system"},
                {"timestamp": "2025-10-11T09:01:00", "confidence": 0.95, "type": "image"},
                {"timestamp": "2025-10-11T09:02:00", "confidence": 0.87, "type": "clinical"},
                {"timestamp": "2025-10-11T09:03:00", "confidence": 0.92, "type": "drug"},
                {"timestamp": "2025-10-11T09:04:00", "confidence": 0.89, "type": "research"}
            ]
            
            fig = medical_viz.create_real_time_analysis_chart(timeline_data)
            return medical_viz.save_chart_as_base64(fig)
            
        except Exception as e:
            logger.error(f"Timeline visualization error: {e}")
            return {"error": str(e)}
    
    def update_agent_metrics(self, agent_name: str, metrics: Dict[str, Any]):
        """
        Update real-time metrics for visualization
        """
        if agent_name in self.analysis_metrics:
            self.analysis_metrics[agent_name].update(metrics)
            
            # Update confidence history (keep last 20 entries)
            if 'confidence' in metrics:
                confidence_history = self.analysis_metrics[agent_name]['confidence_history']
                confidence_history.append(metrics['confidence'])
                if len(confidence_history) > 20:
                    confidence_history.pop(0)
    
    async def get_visualization_dashboard(self, analysis_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Get comprehensive visualization dashboard
        """
        if not self.visualization_enabled:
            return {"error": "Visualization engine not available", "visualizations": []}
        
        dashboard = {
            "performance_dashboard": self.create_agent_performance_dashboard(),
            "system_network": self.create_system_network_graph(),
            "analysis_timeline": self.create_analysis_timeline_viz(analysis_id) if analysis_id else None,
            "timestamp": datetime.now().isoformat(),
            "visualization_enabled": True
        }
        
        return dashboard
        
        return demo_patient