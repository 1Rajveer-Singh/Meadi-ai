# 📊 History Synthesis Agent
# Intelligent medical history analysis and risk assessment

import asyncio
import aioredis
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import os
from transformers import (
    AutoTokenizer, AutoModel, 
    pipeline, AutoModelForSequenceClassification
)
import torch
import numpy as np
from sentence_transformers import SentenceTransformer
import re
from dataclasses import dataclass
from motor.motor_asyncio import AsyncIOMotorClient

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class RiskFactor:
    factor: str
    relevance_score: float
    impact_on_diagnosis: str
    evidence_strength: str
    temporal_relevance: str

@dataclass
class TimelineEvent:
    date: datetime
    event_type: str
    description: str
    clinical_significance: str
    related_factors: List[str]

class MedicalHistorySynthesizer:
    """
    Advanced medical history synthesis using transformer models
    Analyzes patterns, risk factors, and temporal relationships
    """
    
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.sentence_model = None
        self.risk_classifier = None
        self.tokenizer = None
        self.medical_embeddings = None
        
        # Medical knowledge base
        self.condition_risk_factors = {
            'diabetes': ['age>45', 'obesity', 'family_history_diabetes', 'hypertension', 'sedentary_lifestyle'],
            'cardiovascular': ['smoking', 'hypertension', 'diabetes', 'high_cholesterol', 'family_history_cvd'],
            'respiratory': ['smoking', 'asthma', 'copd', 'occupational_exposure', 'air_pollution'],
            'cancer': ['smoking', 'family_history_cancer', 'age>50', 'radiation_exposure', 'chemical_exposure'],
            'infectious': ['immunocompromised', 'diabetes', 'chronic_illness', 'recent_travel', 'exposure_risk']
        }
        
        self.drug_interaction_categories = {
            'anticoagulants': ['warfarin', 'heparin', 'rivaroxaban', 'apixaban'],
            'antibiotics': ['penicillin', 'cephalosporin', 'fluoroquinolone', 'macrolide'],
            'cardiovascular': ['beta_blocker', 'ace_inhibitor', 'diuretic', 'statin'],
            'neurological': ['antiepileptic', 'antidepressant', 'antipsychotic', 'anxiolytic']
        }
        
    async def initialize_models(self):
        """Initialize transformer models for medical analysis"""
        try:
            logger.info("🔄 Loading medical language models...")
            
            # Load sentence transformer for medical text
            self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Load medical text classifier
            model_name = "microsoft/DialoGPT-medium"
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            
            # Add padding token if missing
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
                
            # Load risk assessment pipeline
            self.risk_classifier = pipeline(
                "text-classification",
                model="emilyalsentzer/Bio_ClinicalBERT",
                device=0 if torch.cuda.is_available() else -1
            )
            
            logger.info("✅ Medical language models loaded successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to load models: {str(e)}")
            raise
            
    async def analyze_medical_history(self, patient_data: Dict, current_symptoms: List[str]) -> Dict:
        """Comprehensive medical history analysis"""
        try:
            logger.info("🔍 Analyzing medical history...")
            
            # Extract key components
            medical_history = patient_data.get('medical_history', {})
            current_medications = medical_history.get('current_medications', [])
            chronic_conditions = medical_history.get('chronic_conditions', [])
            allergies = medical_history.get('allergies', [])
            family_history = medical_history.get('family_history', {})
            surgical_history = medical_history.get('surgical_history', [])
            
            # Analyze risk factors
            risk_factors = await self._analyze_risk_factors(
                medical_history, current_symptoms
            )
            
            # Create timeline analysis
            timeline_analysis = await self._create_timeline_analysis(
                medical_history, current_symptoms
            )
            
            # Medication interaction analysis
            medication_analysis = await self._analyze_medication_interactions(
                current_medications, current_symptoms
            )
            
            # Family history risk assessment
            genetic_risk_assessment = await self._assess_genetic_risks(
                family_history, current_symptoms
            )
            
            # Synthesize comprehensive assessment
            synthesized_assessment = await self._synthesize_medical_assessment(
                risk_factors, timeline_analysis, medication_analysis, genetic_risk_assessment
            )
            
            return {
                'risk_factors': [rf.__dict__ for rf in risk_factors],
                'timeline_analysis': timeline_analysis,
                'medication_interactions': medication_analysis,
                'genetic_risk_assessment': genetic_risk_assessment,
                'synthesized_assessment': synthesized_assessment,
                'processing_metadata': {
                    'analysis_timestamp': datetime.utcnow().isoformat(),
                    'model_version': 'HIST_SYNTHESIZER_v1.3',
                    'processing_time_seconds': 0  # Will be calculated
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Medical history analysis failed: {str(e)}")
            raise
            
    async def _analyze_risk_factors(self, medical_history: Dict, symptoms: List[str]) -> List[RiskFactor]:
        """Analyze and score medical risk factors"""
        try:
            risk_factors = []
            
            # Analyze chronic conditions
            chronic_conditions = medical_history.get('chronic_conditions', [])
            for condition in chronic_conditions:
                risk_score = await self._calculate_condition_risk(condition, symptoms)
                impact = await self._assess_condition_impact(condition, symptoms)
                
                risk_factors.append(RiskFactor(
                    factor=condition,
                    relevance_score=risk_score,
                    impact_on_diagnosis=impact,
                    evidence_strength="documented",
                    temporal_relevance="current"
                ))
                
            # Analyze age-related risks
            # Note: This would normally use patient age from personal_info
            age_risks = await self._analyze_age_related_risks(symptoms)
            risk_factors.extend(age_risks)
            
            # Analyze lifestyle factors
            lifestyle_risks = await self._infer_lifestyle_risks(medical_history, symptoms)
            risk_factors.extend(lifestyle_risks)
            
            # Sort by relevance score
            risk_factors.sort(key=lambda x: x.relevance_score, reverse=True)
            
            return risk_factors[:10]  # Top 10 most relevant
            
        except Exception as e:
            logger.error(f"❌ Risk factor analysis failed: {str(e)}")
            return []
            
    async def _calculate_condition_risk(self, condition: str, symptoms: List[str]) -> float:
        """Calculate risk score for a medical condition"""
        try:
            # Convert to embeddings for semantic similarity
            condition_embedding = self.sentence_model.encode([condition])
            symptoms_text = " ".join(symptoms)
            symptoms_embedding = self.sentence_model.encode([symptoms_text])
            
            # Calculate cosine similarity
            similarity = np.cosine(condition_embedding[0], symptoms_embedding[0])
            
            # Apply condition-specific weight modifiers
            condition_weights = {
                'diabetes': 0.9,  # High relevance for many conditions
                'hypertension': 0.8,
                'heart_disease': 0.85,
                'copd': 0.7,
                'asthma': 0.6,
                'obesity': 0.75
            }
            
            base_score = max(0.1, float(similarity))  # Minimum 0.1
            weight = condition_weights.get(condition.lower(), 0.5)
            
            return min(0.95, base_score * weight)  # Cap at 0.95
            
        except Exception as e:
            logger.error(f"❌ Risk calculation failed for {condition}: {str(e)}")
            return 0.1  # Default low risk
            
    async def _assess_condition_impact(self, condition: str, symptoms: List[str]) -> str:
        """Assess how a condition impacts current diagnosis"""
        try:
            impact_map = {
                'diabetes': 'Increases infection risk and delays healing',
                'hypertension': 'Elevates cardiovascular risk factors', 
                'heart_disease': 'May complicate respiratory or cardiac symptoms',
                'copd': 'Increases respiratory complications risk',
                'asthma': 'May exacerbate respiratory symptoms',
                'obesity': 'Complicates multiple organ systems',
                'kidney_disease': 'Affects medication dosing and clearance'
            }
            
            return impact_map.get(condition.lower(), 
                                f'Medical history of {condition} may influence current presentation')
            
        except Exception as e:
            return f"Impact assessment unavailable for {condition}"
            
    async def _analyze_age_related_risks(self, symptoms: List[str]) -> List[RiskFactor]:
        """Analyze age-related risk factors"""
        # This would normally use actual patient age
        # For demo purposes, we'll analyze general age-related patterns
        age_risks = []
        
        # Simulate age-based risk analysis
        respiratory_symptoms = ['cough', 'dyspnea', 'chest_pain', 'shortness_of_breath']
        has_respiratory = any(sym in ' '.join(symptoms).lower() for sym in respiratory_symptoms)
        
        if has_respiratory:
            age_risks.append(RiskFactor(
                factor="Age-related respiratory decline",
                relevance_score=0.65,
                impact_on_diagnosis="Age increases pneumonia and respiratory infection risk",
                evidence_strength="epidemiological",
                temporal_relevance="current"
            ))
            
        return age_risks
        
    async def _infer_lifestyle_risks(self, medical_history: Dict, symptoms: List[str]) -> List[RiskFactor]:
        """Infer lifestyle-related risk factors"""
        lifestyle_risks = []
        
        # Check for smoking history (would be in detailed history)
        medications = medical_history.get('current_medications', [])
        
        # Infer smoking if on respiratory medications
        respiratory_meds = ['albuterol', 'inhaler', 'bronchodilator', 'steroid']
        if any(med.get('name', '').lower() in respiratory_meds for med in medications):
            lifestyle_risks.append(RiskFactor(
                factor="Respiratory medication use (possible smoking history)",
                relevance_score=0.7,
                impact_on_diagnosis="May indicate chronic respiratory condition",
                evidence_strength="inferred",
                temporal_relevance="current"
            ))
            
        return lifestyle_risks
        
    async def _create_timeline_analysis(self, medical_history: Dict, symptoms: List[str]) -> Dict:
        """Create temporal analysis of medical events"""
        try:
            timeline_events = []
            
            # Process surgical history
            surgical_history = medical_history.get('surgical_history', [])
            for surgery in surgical_history:
                if isinstance(surgery, dict):
                    event_date = surgery.get('date')
                    if event_date:
                        timeline_events.append(TimelineEvent(
                            date=datetime.fromisoformat(event_date.replace('Z', '+00:00')) if isinstance(event_date, str) else event_date,
                            event_type='surgery',
                            description=surgery.get('procedure', 'Unknown procedure'),
                            clinical_significance='May affect current presentation',
                            related_factors=[surgery.get('procedure', '')]
                        ))
                        
            # Process medication history
            medications = medical_history.get('current_medications', [])
            for med in medications:
                if isinstance(med, dict) and 'start_date' in med:
                    start_date = med['start_date']
                    if start_date:
                        timeline_events.append(TimelineEvent(
                            date=datetime.fromisoformat(start_date.replace('Z', '+00:00')) if isinstance(start_date, str) else start_date,
                            event_type='medication_start',
                            description=f"Started {med.get('name', 'medication')}",
                            clinical_significance='Ongoing treatment consideration',
                            related_factors=[med.get('name', '')]
                        ))
                        
            # Sort chronologically
            timeline_events.sort(key=lambda x: x.date, reverse=True)
            
            # Analyze symptom progression (simplified)
            symptom_analysis = await self._analyze_symptom_progression(symptoms)
            
            return {
                'symptom_progression': symptom_analysis,
                'relevant_history': [
                    {
                        'date': event.date.isoformat(),
                        'type': event.event_type,
                        'description': event.description,
                        'significance': event.clinical_significance
                    } for event in timeline_events[:5]  # Most recent 5 events
                ],
                'temporal_patterns': await self._identify_temporal_patterns(timeline_events, symptoms)
            }
            
        except Exception as e:
            logger.error(f"❌ Timeline analysis failed: {str(e)}")
            return {'error': str(e)}
            
    async def _analyze_symptom_progression(self, symptoms: List[str]) -> str:
        """Analyze symptom progression patterns"""
        # Simplified symptom progression analysis
        acute_symptoms = ['fever', 'acute_pain', 'sudden_onset']
        chronic_symptoms = ['fatigue', 'chronic_pain', 'gradual_onset']
        
        symptoms_text = ' '.join(symptoms).lower()
        
        if any(sym in symptoms_text for sym in acute_symptoms):
            return "Acute onset symptoms suggest recent pathological process"
        elif any(sym in symptoms_text for sym in chronic_symptoms):
            return "Chronic symptoms suggest ongoing or progressive condition"
        else:
            return "Symptom progression pattern requires clinical correlation"
            
    async def _identify_temporal_patterns(self, events: List[TimelineEvent], symptoms: List[str]) -> List[str]:
        """Identify temporal patterns in medical history"""
        patterns = []
        
        if not events:
            return ["Insufficient historical data for pattern analysis"]
            
        # Recent events pattern
        recent_events = [e for e in events if e.date > datetime.now() - timedelta(days=365)]
        if len(recent_events) > 2:
            patterns.append("Multiple recent medical events may indicate ongoing health issues")
            
        # Surgical history pattern
        surgeries = [e for e in events if e.event_type == 'surgery']
        if len(surgeries) > 1:
            patterns.append("Previous surgical history may influence current presentation")
            
        return patterns or ["No significant temporal patterns identified"]
        
    async def _analyze_medication_interactions(self, medications: List[Dict], symptoms: List[str]) -> Dict:
        """Analyze medication interactions and effects"""
        try:
            interactions = {
                'severe_interactions': [],
                'moderate_interactions': [],
                'contraindications': [],
                'side_effects_correlation': []
            }
            
            if not medications:
                return interactions
                
            # Check for common interaction patterns
            med_names = [med.get('name', '').lower() for med in medications if isinstance(med, dict)]
            
            # Anticoagulant interactions
            anticoagulants = ['warfarin', 'heparin', 'rivaroxaban']
            if any(med in ' '.join(med_names) for med in anticoagulants):
                interactions['moderate_interactions'].append({
                    'interaction': 'Anticoagulant therapy present',
                    'clinical_significance': 'Monitor for bleeding risk, affects surgical procedures',
                    'management': 'Consider coagulation status in treatment planning'
                })
                
            # Diabetes medication interactions
            diabetes_meds = ['metformin', 'insulin', 'glyburide']
            if any(med in ' '.join(med_names) for med in diabetes_meds):
                interactions['moderate_interactions'].append({
                    'interaction': 'Diabetes medications present',
                    'clinical_significance': 'May affect glucose control and wound healing',
                    'management': 'Monitor blood glucose levels closely'
                })
                
            return interactions
            
        except Exception as e:
            logger.error(f"❌ Medication interaction analysis failed: {str(e)}")
            return {'error': str(e)}
            
    async def _assess_genetic_risks(self, family_history: Dict, symptoms: List[str]) -> Dict:
        """Assess genetic and familial risk factors"""
        try:
            genetic_risks = {
                'inherited_risk_factors': [],
                'family_pattern_analysis': '',
                'genetic_testing_recommendations': []
            }
            
            if not family_history:
                return genetic_risks
                
            # Analyze family history patterns
            for condition, relatives in family_history.items():
                if relatives:  # If there are affected relatives
                    risk_level = await self._calculate_familial_risk(condition, relatives, symptoms)
                    
                    genetic_risks['inherited_risk_factors'].append({
                        'condition': condition,
                        'affected_relatives': relatives,
                        'risk_level': risk_level,
                        'clinical_relevance': await self._assess_familial_relevance(condition, symptoms)
                    })
                    
            # Generate pattern analysis
            if genetic_risks['inherited_risk_factors']:
                genetic_risks['family_pattern_analysis'] = (
                    "Positive family history identifies increased genetic predisposition. "
                    "Consider family clustering patterns in diagnosis and prevention strategies."
                )
            else:
                genetic_risks['family_pattern_analysis'] = (
                    "No significant familial risk patterns identified in available history."
                )
                
            return genetic_risks
            
        except Exception as e:
            logger.error(f"❌ Genetic risk assessment failed: {str(e)}")
            return {'error': str(e)}
            
    async def _calculate_familial_risk(self, condition: str, relatives: List[str], symptoms: List[str]) -> str:
        """Calculate familial risk level"""
        # Simplified risk calculation
        if 'father' in relatives or 'mother' in relatives:
            return 'moderate' if len(relatives) == 1 else 'high'
        elif any(rel in relatives for rel in ['sibling', 'brother', 'sister']):
            return 'moderate'
        else:
            return 'low'
            
    async def _assess_familial_relevance(self, condition: str, symptoms: List[str]) -> str:
        """Assess clinical relevance of family history"""
        relevance_map = {
            'diabetes': 'Increases risk for metabolic disorders and infections',
            'heart_disease': 'Elevates cardiovascular risk profile',
            'cancer': 'May influence screening and diagnostic considerations',
            'hypertension': 'Genetic predisposition to blood pressure disorders'
        }
        
        return relevance_map.get(condition, f'Family history of {condition} may influence risk assessment')
        
    async def _synthesize_medical_assessment(self, risk_factors: List[RiskFactor], 
                                           timeline: Dict, medications: Dict, genetic: Dict) -> str:
        """Synthesize comprehensive medical assessment"""
        try:
            # Extract key elements
            high_risk_factors = [rf for rf in risk_factors if rf.relevance_score > 0.7]
            
            assessment_parts = []
            
            # Risk factor summary
            if high_risk_factors:
                top_risk = high_risk_factors[0]
                assessment_parts.append(
                    f"Patient's {top_risk.factor} (confidence: {top_risk.relevance_score:.2f}) "
                    f"significantly influences current presentation. {top_risk.impact_on_diagnosis}"
                )
                
            # Timeline insights
            if timeline.get('symptom_progression'):
                assessment_parts.append(timeline['symptom_progression'])
                
            # Medication considerations
            med_interactions = medications.get('moderate_interactions', [])
            if med_interactions:
                assessment_parts.append(
                    f"Current medication regimen requires consideration: {med_interactions[0].get('clinical_significance', '')}"
                )
                
            # Genetic factors
            genetic_factors = genetic.get('inherited_risk_factors', [])
            if genetic_factors:
                assessment_parts.append(
                    f"Family history of {genetic_factors[0]['condition']} contributes to risk profile."
                )
                
            # Synthesize final assessment
            if assessment_parts:
                return " ".join(assessment_parts)
            else:
                return "Medical history provides context but no major risk factors identified that significantly alter diagnostic approach."
                
        except Exception as e:
            logger.error(f"❌ Assessment synthesis failed: {str(e)}")
            return "Unable to synthesize medical assessment due to processing error."


class HistorySynthesisService:
    """Service for History Synthesis Agent"""
    
    def __init__(self):
        self.redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
        self.mongodb_url = os.getenv('MONGODB_URL', 'mongodb://localhost:27017/medical_ai_db')
        self.synthesizer = None
        self.redis = None
        self.mongodb = None
        
    async def initialize(self):
        """Initialize service components"""
        try:
            # Initialize Redis
            self.redis = await aioredis.from_url(self.redis_url)
            await self.redis.ping()
            logger.info("✅ Connected to Redis")
            
            # Initialize MongoDB
            self.mongodb = AsyncIOMotorClient(self.mongodb_url)
            await self.mongodb.admin.command('ping')
            logger.info("✅ Connected to MongoDB")
            
            # Initialize synthesizer
            self.synthesizer = MedicalHistorySynthesizer()
            await self.synthesizer.initialize_models()
            logger.info("✅ History Synthesizer initialized")
            
        except Exception as e:
            logger.error(f"❌ Initialization failed: {str(e)}")
            raise
            
    async def process_diagnosis_request(self, diagnosis_id: str):
        """Process history synthesis for a diagnosis"""
        try:
            # Update status
            await self.update_agent_status(diagnosis_id, "processing", "Analyzing medical history...")
            
            # Get patient and diagnosis data
            patient_data, diagnosis_data = await self.get_diagnosis_data(diagnosis_id)
            
            if not patient_data:
                raise ValueError("Patient data not found")
                
            # Extract current symptoms
            current_symptoms = diagnosis_data.get('input_data', {}).get('symptoms', [])
            
            # Perform history synthesis
            start_time = datetime.utcnow()
            synthesis_results = await self.synthesizer.analyze_medical_history(patient_data, current_symptoms)
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            
            # Update processing time
            synthesis_results['processing_metadata']['processing_time_seconds'] = processing_time
            
            # Store results
            results_key = f"ai_agent:results:{diagnosis_id}:history_synthesis"
            await self.redis.setex(
                results_key,
                3600,  # 1 hour TTL
                json.dumps({
                    'agent_id': 'HIST_SYNTHESIZER_v1.3',
                    'status': 'completed',
                    'started_at': start_time.isoformat(),
                    'completed_at': datetime.utcnow().isoformat(),
                    'processing_time_seconds': processing_time,
                    'results': synthesis_results
                })
            )
            
            # Update status
            await self.update_agent_status(diagnosis_id, "completed", "History synthesis complete")
            
            logger.info(f"✅ History synthesis completed for diagnosis {diagnosis_id}")
            
        except Exception as e:
            logger.error(f"❌ History synthesis failed for diagnosis {diagnosis_id}: {str(e)}")
            await self.update_agent_status(diagnosis_id, "failed", str(e))
            
    async def get_diagnosis_data(self, diagnosis_id: str) -> tuple:
        """Get patient and diagnosis data from database"""
        try:
            db = self.mongodb.medical_ai_db
            
            # Get diagnosis data
            diagnosis = await db.diagnoses.find_one({'diagnosis_id': diagnosis_id})
            if not diagnosis:
                raise ValueError(f"Diagnosis {diagnosis_id} not found")
                
            # Get patient data
            patient_id = diagnosis.get('patient_id')
            patient = await db.patients.find_one({'patient_id': patient_id})
            
            return patient, diagnosis
            
        except Exception as e:
            logger.error(f"❌ Failed to get diagnosis data: {str(e)}")
            return None, None
            
    async def update_agent_status(self, diagnosis_id: str, status: str, message: str):
        """Update agent status in Redis"""
        try:
            status_key = f"ai_agent:status:{diagnosis_id}:history_synthesis"
            status_data = {
                'agent_id': 'HIST_SYNTHESIZER_v1.3',
                'status': status,
                'message': message,
                'timestamp': datetime.utcnow().isoformat()
            }
            await self.redis.setex(status_key, 300, json.dumps(status_data))
            
        except Exception as e:
            logger.error(f"❌ Failed to update status: {str(e)}")
            
    async def start_listening(self):
        """Start listening for diagnosis requests"""
        try:
            logger.info("📊 History Synthesis Agent listening for requests...")
            
            while True:
                result = await self.redis.blpop(['diagnosis:queue:history_synthesis'], timeout=5)
                
                if result:
                    _, diagnosis_id = result
                    diagnosis_id = diagnosis_id.decode('utf-8')
                    logger.info(f"📨 Processing history synthesis request: {diagnosis_id}")
                    
                    asyncio.create_task(self.process_diagnosis_request(diagnosis_id))
                    
        except KeyboardInterrupt:
            logger.info("🔄 History Synthesis Agent shutting down...")
        except Exception as e:
            logger.error(f"❌ Listening error: {str(e)}")
            
    async def cleanup(self):
        """Cleanup resources"""
        if self.redis:
            await self.redis.close()
        if self.mongodb:
            self.mongodb.close()
        logger.info("🧹 History Synthesis Agent cleanup completed")


async def main():
    """Main entry point for History Synthesis Agent"""
    agent = HistorySynthesisService()
    
    try:
        await agent.initialize()
        await agent.start_listening()
    except KeyboardInterrupt:
        logger.info("🔄 Shutting down History Synthesis Agent...")
    finally:
        await agent.cleanup()

if __name__ == "__main__":
    asyncio.run(main())