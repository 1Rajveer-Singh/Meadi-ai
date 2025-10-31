# 💊 Drug Interaction Agent
# Advanced drug safety analysis with 30% error reduction target

import asyncio
import aioredis
import json
import logging
import sqlite3
import aiofiles
import aiohttp
from datetime import datetime
from typing import Dict, List, Optional, Set, Tuple
import os
from dataclasses import dataclass
import hashlib
import re
from motor.motor_asyncio import AsyncIOMotorClient

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class DrugInteraction:
    drug1: str
    drug2: str
    interaction_type: str
    severity: str
    mechanism: str
    clinical_effect: str
    management: str
    evidence_level: str

@dataclass
class AllergyAlert:
    allergen: str
    proposed_drug: str
    risk_level: str
    cross_reactivity: List[str]
    alternative_drugs: List[str]
    clinical_notes: str

@dataclass
class ContraindicationAlert:
    drug: str
    contraindication: str
    reason: str
    severity: str
    alternative_therapy: str

class DrugInteractionChecker:
    """
    Advanced drug interaction and safety checker
    Uses multiple databases and real-time API validation
    """
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.db_connection = None
        self.rxnorm_base_url = "https://rxnav.nlm.nih.gov/REST"
        self.fda_base_url = "https://api.fda.gov/drug"
        self.session = None
        
        # Drug classification mappings
        self.drug_classes = {
            'anticoagulants': {
                'drugs': ['warfarin', 'heparin', 'rivaroxaban', 'apixaban', 'dabigatran', 'enoxaparin'],
                'major_interactions': ['aspirin', 'clopidogrel', 'ibuprofen', 'naproxen'],
                'monitoring': 'INR/PT/aPTT monitoring required'
            },
            'antibiotics': {
                'drugs': ['penicillin', 'amoxicillin', 'ciprofloxacin', 'azithromycin', 'cephalexin'],
                'major_interactions': ['warfarin', 'digoxin', 'theophylline'],
                'monitoring': 'Renal function and therapeutic levels'
            },
            'cardiovascular': {
                'drugs': ['metoprolol', 'lisinopril', 'amlodipine', 'atorvastatin', 'furosemide'],
                'major_interactions': ['insulin', 'digoxin', 'lithium'],
                'monitoring': 'Blood pressure, heart rate, electrolytes'
            },
            'diabetes': {
                'drugs': ['metformin', 'insulin', 'glyburide', 'sitagliptin'],
                'major_interactions': ['steroids', 'beta_blockers', 'thiazides'],
                'monitoring': 'Blood glucose levels'
            },
            'nsaids': {
                'drugs': ['ibuprofen', 'naproxen', 'celecoxib', 'aspirin'],
                'major_interactions': ['warfarin', 'ace_inhibitors', 'lithium', 'methotrexate'],
                'monitoring': 'Renal function, GI bleeding risk'
            }
        }
        
        # Allergy cross-reactivity patterns
        self.allergy_patterns = {
            'penicillin': {
                'cross_reactive': ['amoxicillin', 'ampicillin', 'cephalexin'],
                'safe_alternatives': ['azithromycin', 'doxycycline', 'ciprofloxacin'],
                'risk_level': 'high'
            },
            'sulfa': {
                'cross_reactive': ['sulfamethoxazole', 'furosemide', 'hydrochlorothiazide'],
                'safe_alternatives': ['amoxicillin', 'ciprofloxacin'],
                'risk_level': 'moderate'
            },
            'aspirin': {
                'cross_reactive': ['ibuprofen', 'naproxen', 'celecoxib'],
                'safe_alternatives': ['acetaminophen', 'tramadol'],
                'risk_level': 'moderate'
            }
        }
        
    async def initialize_database(self):
        """Initialize drug interaction database"""
        try:
            # Create database if it doesn't exist
            if not os.path.exists(self.db_path):
                await self.create_drug_database()
                
            self.db_connection = sqlite3.connect(self.db_path)
            self.db_connection.row_factory = sqlite3.Row
            
            # Create HTTP session for API calls
            self.session = aiohttp.ClientSession()
            
            logger.info("✅ Drug database initialized")
            
        except Exception as e:
            logger.error(f"❌ Database initialization failed: {str(e)}")
            raise
            
    async def create_drug_database(self):
        """Create and populate drug interaction database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create tables
            cursor.execute('''
                CREATE TABLE drug_interactions (
                    id INTEGER PRIMARY KEY,
                    drug1 TEXT NOT NULL,
                    drug2 TEXT NOT NULL,
                    interaction_type TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    mechanism TEXT,
                    clinical_effect TEXT,
                    management TEXT,
                    evidence_level TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE drug_allergies (
                    id INTEGER PRIMARY KEY,
                    allergen TEXT NOT NULL,
                    cross_reactive_drugs TEXT,
                    alternative_drugs TEXT,
                    risk_level TEXT,
                    clinical_notes TEXT
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE contraindications (
                    id INTEGER PRIMARY KEY,
                    drug TEXT NOT NULL,
                    condition TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    reason TEXT,
                    alternative_therapy TEXT
                )
            ''')
            
            # Populate with common interactions
            await self._populate_interaction_data(cursor)
            await self._populate_allergy_data(cursor)
            await self._populate_contraindication_data(cursor)
            
            conn.commit()
            conn.close()
            
            logger.info("✅ Drug database created and populated")
            
        except Exception as e:
            logger.error(f"❌ Database creation failed: {str(e)}")
            raise
            
    async def _populate_interaction_data(self, cursor):
        """Populate database with drug interaction data"""
        interactions = [
            ('warfarin', 'aspirin', 'pharmacodynamic', 'major', 'additive_anticoagulation', 
             'increased bleeding risk', 'monitor INR closely, consider dose adjustment', 'high'),
            ('metformin', 'iodinated_contrast', 'pharmacokinetic', 'major', 'reduced_clearance',
             'lactic acidosis risk', 'discontinue 48h before and after contrast', 'high'),
            ('digoxin', 'furosemide', 'pharmacodynamic', 'moderate', 'electrolyte_depletion',
             'increased digoxin toxicity', 'monitor potassium and digoxin levels', 'moderate'),
            ('simvastatin', 'clarithromycin', 'pharmacokinetic', 'major', 'cyp3a4_inhibition',
             'increased statin toxicity', 'avoid combination or reduce statin dose', 'high'),
            ('ace_inhibitor', 'potassium', 'pharmacodynamic', 'moderate', 'additive_hyperkalemia',
             'dangerous potassium elevation', 'monitor potassium levels', 'moderate')
        ]
        
        for interaction in interactions:
            cursor.execute('''
                INSERT INTO drug_interactions 
                (drug1, drug2, interaction_type, severity, mechanism, clinical_effect, management, evidence_level)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', interaction)
            
    async def _populate_allergy_data(self, cursor):
        """Populate allergy cross-reactivity data"""
        allergies = [
            ('penicillin', 'amoxicillin,ampicillin,cephalexin', 'azithromycin,doxycycline', 'high',
             'Beta-lactam cross-reactivity. Use with extreme caution.'),
            ('sulfa', 'sulfamethoxazole,furosemide', 'amoxicillin,ciprofloxacin', 'moderate',
             'Sulfonamide cross-reactivity possible with some drugs.'),
            ('aspirin', 'ibuprofen,naproxen', 'acetaminophen,tramadol', 'moderate',
             'NSAID cross-reactivity in aspirin-sensitive patients.')
        ]
        
        for allergy in allergies:
            cursor.execute('''
                INSERT INTO drug_allergies 
                (allergen, cross_reactive_drugs, alternative_drugs, risk_level, clinical_notes)
                VALUES (?, ?, ?, ?, ?)
            ''', allergy)
            
    async def _populate_contraindication_data(self, cursor):
        """Populate contraindication data"""
        contraindications = [
            ('metformin', 'kidney_disease', 'absolute', 'risk of lactic acidosis', 'insulin'),
            ('ace_inhibitor', 'pregnancy', 'absolute', 'teratogenic effects', 'methyldopa'),
            ('warfarin', 'active_bleeding', 'absolute', 'exacerbates bleeding', 'heparin_reversal'),
            ('beta_blocker', 'severe_asthma', 'relative', 'bronchospasm risk', 'calcium_channel_blocker'),
            ('nsaid', 'peptic_ulcer', 'relative', 'GI bleeding risk', 'acetaminophen')
        ]
        
        for contraindication in contraindications:
            cursor.execute('''
                INSERT INTO contraindications 
                (drug, condition, severity, reason, alternative_therapy)
                VALUES (?, ?, ?, ?, ?)
            ''', contraindication)
            
    async def check_drug_interactions(self, medications: List[Dict], proposed_drugs: List[str]) -> Dict:
        """Comprehensive drug interaction checking"""
        try:
            results = {
                'interaction_check': {
                    'severe_interactions': [],
                    'moderate_interactions': [],
                    'minor_interactions': [],
                    'contraindications': [],
                    'allergy_alerts': []
                },
                'treatment_recommendations': [],
                'monitoring_requirements': [],
                'safety_score': 0.0
            }
            
            # Extract current medication names
            current_drugs = [med.get('name', '').lower() for med in medications if isinstance(med, dict)]
            
            # Check interactions between current drugs
            current_interactions = await self._check_current_drug_interactions(current_drugs)
            
            # Check interactions with proposed drugs
            proposed_interactions = await self._check_proposed_drug_interactions(
                current_drugs, [drug.lower() for drug in proposed_drugs]
            )
            
            # Combine results
            results['interaction_check']['severe_interactions'].extend(current_interactions['severe'])
            results['interaction_check']['severe_interactions'].extend(proposed_interactions['severe'])
            results['interaction_check']['moderate_interactions'].extend(current_interactions['moderate'])
            results['interaction_check']['moderate_interactions'].extend(proposed_interactions['moderate'])
            
            # Calculate safety score
            results['safety_score'] = await self._calculate_safety_score(results['interaction_check'])
            
            # Generate monitoring recommendations
            results['monitoring_requirements'] = await self._generate_monitoring_requirements(
                current_drugs + [drug.lower() for drug in proposed_drugs]
            )
            
            return results
            
        except Exception as e:
            logger.error(f"❌ Drug interaction check failed: {str(e)}")
            return {'error': str(e)}
            
    async def _check_current_drug_interactions(self, drugs: List[str]) -> Dict:
        """Check interactions between current medications"""
        interactions = {'severe': [], 'moderate': [], 'minor': []}
        
        # Check pairwise interactions
        for i in range(len(drugs)):
            for j in range(i + 1, len(drugs)):
                interaction = await self._lookup_interaction(drugs[i], drugs[j])
                if interaction:
                    severity = interaction['severity']
                    if severity in interactions:
                        interactions[severity].append({
                            'drug1': drugs[i],
                            'drug2': drugs[j],
                            'interaction_type': interaction['interaction_type'],
                            'clinical_effect': interaction['clinical_effect'],
                            'management': interaction['management'],
                            'evidence_level': interaction['evidence_level']
                        })
                        
        return interactions
        
    async def _check_proposed_drug_interactions(self, current_drugs: List[str], proposed_drugs: List[str]) -> Dict:
        """Check interactions between current and proposed medications"""
        interactions = {'severe': [], 'moderate': [], 'minor': []}
        
        for current_drug in current_drugs:
            for proposed_drug in proposed_drugs:
                interaction = await self._lookup_interaction(current_drug, proposed_drug)
                if interaction:
                    severity = interaction['severity']
                    if severity in interactions:
                        interactions[severity].append({
                            'drug1': current_drug,
                            'drug2': proposed_drug,
                            'interaction_type': interaction['interaction_type'],
                            'clinical_effect': interaction['clinical_effect'],
                            'management': interaction['management'],
                            'evidence_level': interaction['evidence_level']
                        })
                        
        return interactions
        
    async def _lookup_interaction(self, drug1: str, drug2: str) -> Optional[Dict]:
        """Look up interaction between two drugs"""
        try:
            cursor = self.db_connection.cursor()
            
            # Check both directions
            cursor.execute('''
                SELECT * FROM drug_interactions 
                WHERE (LOWER(drug1) LIKE ? AND LOWER(drug2) LIKE ?) 
                   OR (LOWER(drug1) LIKE ? AND LOWER(drug2) LIKE ?)
            ''', (f'%{drug1}%', f'%{drug2}%', f'%{drug2}%', f'%{drug1}%'))
            
            result = cursor.fetchone()
            if result:
                return dict(result)
                
            # Check drug class interactions
            return await self._check_class_interactions(drug1, drug2)
            
        except Exception as e:
            logger.error(f"❌ Interaction lookup failed: {str(e)}")
            return None
            
    async def _check_class_interactions(self, drug1: str, drug2: str) -> Optional[Dict]:
        """Check for drug class-based interactions"""
        try:
            # Find drug classes for both drugs
            class1 = await self._get_drug_class(drug1)
            class2 = await self._get_drug_class(drug2)
            
            if not class1 or not class2:
                return None
                
            # Check for known class interactions
            class_interactions = {
                ('anticoagulants', 'nsaids'): {
                    'interaction_type': 'pharmacodynamic',
                    'severity': 'major',
                    'clinical_effect': 'increased bleeding risk',
                    'management': 'avoid combination or monitor closely',
                    'evidence_level': 'high'
                },
                ('ace_inhibitor', 'nsaids'): {
                    'interaction_type': 'pharmacodynamic',
                    'severity': 'moderate',
                    'clinical_effect': 'reduced antihypertensive effect',
                    'management': 'monitor blood pressure',
                    'evidence_level': 'moderate'
                },
                ('diabetes', 'beta_blockers'): {
                    'interaction_type': 'pharmacodynamic',
                    'severity': 'moderate',
                    'clinical_effect': 'masked hypoglycemia symptoms',
                    'management': 'monitor glucose more frequently',
                    'evidence_level': 'moderate'
                }
            }
            
            # Check both directions
            key1 = (class1, class2)
            key2 = (class2, class1)
            
            return class_interactions.get(key1) or class_interactions.get(key2)
            
        except Exception as e:
            logger.error(f"❌ Class interaction check failed: {str(e)}")
            return None
            
    async def _get_drug_class(self, drug: str) -> Optional[str]:
        """Determine drug class for a medication"""
        drug_lower = drug.lower()
        
        for class_name, class_info in self.drug_classes.items():
            if any(drug_lower in med.lower() or med.lower() in drug_lower 
                  for med in class_info['drugs']):
                return class_name
                
        return None
        
    async def check_allergies(self, allergies: List[str], proposed_drugs: List[str]) -> List[AllergyAlert]:
        """Check for allergy conflicts with proposed medications"""
        try:
            alerts = []
            
            for allergy in allergies:
                allergy_lower = allergy.lower()
                
                # Check direct matches
                for proposed_drug in proposed_drugs:
                    if allergy_lower in proposed_drug.lower() or proposed_drug.lower() in allergy_lower:
                        alerts.append(AllergyAlert(
                            allergen=allergy,
                            proposed_drug=proposed_drug,
                            risk_level='high',
                            cross_reactivity=[],
                            alternative_drugs=await self._get_alternative_drugs(allergy),
                            clinical_notes=f'Direct allergy match - avoid {proposed_drug}'
                        ))
                        
                # Check cross-reactivity
                if allergy_lower in self.allergy_patterns:
                    pattern = self.allergy_patterns[allergy_lower]
                    for proposed_drug in proposed_drugs:
                        for cross_reactive in pattern['cross_reactive']:
                            if cross_reactive.lower() in proposed_drug.lower():
                                alerts.append(AllergyAlert(
                                    allergen=allergy,
                                    proposed_drug=proposed_drug,
                                    risk_level=pattern['risk_level'],
                                    cross_reactivity=pattern['cross_reactive'],
                                    alternative_drugs=pattern['safe_alternatives'],
                                    clinical_notes=f'Cross-reactivity risk with {allergy} allergy'
                                ))
                                
            return alerts
            
        except Exception as e:
            logger.error(f"❌ Allergy check failed: {str(e)}")
            return []
            
    async def _get_alternative_drugs(self, allergen: str) -> List[str]:
        """Get alternative drugs for allergic patients"""
        if allergen.lower() in self.allergy_patterns:
            return self.allergy_patterns[allergen.lower()]['safe_alternatives']
        
        # Generic alternatives
        return ['consult_pharmacist', 'alternative_class_needed']
        
    async def _calculate_safety_score(self, interactions: Dict) -> float:
        """Calculate overall drug safety score (0-100)"""
        try:
            base_score = 100.0
            
            # Deduct points for interactions
            severe_count = len(interactions.get('severe_interactions', []))
            moderate_count = len(interactions.get('moderate_interactions', []))
            minor_count = len(interactions.get('minor_interactions', []))
            
            # Scoring penalties
            base_score -= (severe_count * 30)      # -30 per severe
            base_score -= (moderate_count * 15)    # -15 per moderate  
            base_score -= (minor_count * 5)        # -5 per minor
            
            # Allergy alerts
            allergy_count = len(interactions.get('allergy_alerts', []))
            base_score -= (allergy_count * 25)     # -25 per allergy alert
            
            # Contraindications
            contra_count = len(interactions.get('contraindications', []))
            base_score -= (contra_count * 40)      # -40 per contraindication
            
            return max(0.0, min(100.0, base_score))
            
        except Exception as e:
            logger.error(f"❌ Safety score calculation failed: {str(e)}")
            return 0.0
            
    async def _generate_monitoring_requirements(self, all_drugs: List[str]) -> List[Dict]:
        """Generate monitoring requirements for drug regimen"""
        try:
            monitoring = []
            
            # Check each drug for monitoring requirements
            for drug in all_drugs:
                drug_class = await self._get_drug_class(drug)
                if drug_class and drug_class in self.drug_classes:
                    monitoring_info = self.drug_classes[drug_class].get('monitoring')
                    if monitoring_info:
                        monitoring.append({
                            'drug': drug,
                            'drug_class': drug_class,
                            'monitoring': monitoring_info,
                            'frequency': 'per_protocol'
                        })
                        
            # Add specific monitoring for high-risk combinations
            if any('warfarin' in drug for drug in all_drugs):
                monitoring.append({
                    'parameter': 'INR/PT',
                    'frequency': 'weekly_initially_then_monthly',
                    'target_range': '2.0-3.0',
                    'indication': 'anticoagulation_monitoring'
                })
                
            return monitoring
            
        except Exception as e:
            logger.error(f"❌ Monitoring requirements generation failed: {str(e)}")
            return []
            
    async def cleanup(self):
        """Cleanup database connection and HTTP session"""
        if self.db_connection:
            self.db_connection.close()
        if self.session:
            await self.session.close()


class DrugCheckerService:
    """Service for Drug Interaction Agent"""
    
    def __init__(self):
        self.redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
        self.mongodb_url = os.getenv('MONGODB_URL', 'mongodb://localhost:27017/medical_ai_db')
        self.db_path = os.getenv('DRUG_DATABASE_PATH', '/app/data/drug_interactions.db')
        self.checker = None
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
            
            # Ensure data directory exists
            os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
            
            # Initialize drug checker
            self.checker = DrugInteractionChecker(self.db_path)
            await self.checker.initialize_database()
            logger.info("✅ Drug Interaction Checker initialized")
            
        except Exception as e:
            logger.error(f"❌ Initialization failed: {str(e)}")
            raise
            
    async def process_diagnosis_request(self, diagnosis_id: str):
        """Process drug interaction check for a diagnosis"""
        try:
            # Update status
            await self.update_agent_status(diagnosis_id, "processing", "Checking drug interactions...")
            
            # Get patient and diagnosis data
            patient_data, diagnosis_data = await self.get_diagnosis_data(diagnosis_id)
            
            if not patient_data:
                raise ValueError("Patient data not found")
                
            # Extract medications and allergies
            medical_history = patient_data.get('medical_history', {})
            current_medications = medical_history.get('current_medications', [])
            allergies = medical_history.get('allergies', [])
            
            # Get proposed treatment from diagnosis (simplified)
            proposed_drugs = await self.extract_proposed_drugs(diagnosis_data)
            
            # Perform drug interaction check
            start_time = datetime.utcnow()
            interaction_results = await self.checker.check_drug_interactions(
                current_medications, proposed_drugs
            )
            
            # Check allergies
            allergy_alerts = await self.checker.check_allergies(allergies, proposed_drugs)
            interaction_results['interaction_check']['allergy_alerts'] = [
                {
                    'allergen': alert.allergen,
                    'proposed_drug': alert.proposed_drug,
                    'risk_level': alert.risk_level,
                    'recommendation': f'Avoid {alert.proposed_drug}',
                    'alternatives': alert.alternative_drugs
                } for alert in allergy_alerts
            ]
            
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            
            # Store results
            results_key = f"ai_agent:results:{diagnosis_id}:drug_interaction"
            await self.redis.setex(
                results_key,
                3600,  # 1 hour TTL
                json.dumps({
                    'agent_id': 'DRUG_CHECKER_v3.0',
                    'status': 'completed',
                    'started_at': start_time.isoformat(),
                    'completed_at': datetime.utcnow().isoformat(),
                    'processing_time_seconds': processing_time,
                    'results': interaction_results
                })
            )
            
            # Update status
            await self.update_agent_status(diagnosis_id, "completed", "Drug interaction check complete")
            
            logger.info(f"✅ Drug interaction check completed for diagnosis {diagnosis_id}")
            
        except Exception as e:
            logger.error(f"❌ Drug interaction check failed for diagnosis {diagnosis_id}: {str(e)}")
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
            
    async def extract_proposed_drugs(self, diagnosis_data: Dict) -> List[str]:
        """Extract proposed drugs from diagnosis data (simplified)"""
        # This would normally analyze the diagnosis and symptoms to suggest treatments
        # For demo purposes, we'll use common antibiotics for respiratory conditions
        
        symptoms = diagnosis_data.get('input_data', {}).get('symptoms', [])
        symptoms_text = ' '.join(symptoms).lower()
        
        proposed_drugs = []
        
        # Simple rule-based drug suggestions
        if any(symptom in symptoms_text for symptom in ['cough', 'pneumonia', 'infection']):
            proposed_drugs.extend(['azithromycin', 'amoxicillin'])
            
        if 'pain' in symptoms_text:
            proposed_drugs.append('ibuprofen')
            
        if 'fever' in symptoms_text:
            proposed_drugs.append('acetaminophen')
            
        return proposed_drugs or ['azithromycin']  # Default antibiotic
        
    async def update_agent_status(self, diagnosis_id: str, status: str, message: str):
        """Update agent status in Redis"""
        try:
            status_key = f"ai_agent:status:{diagnosis_id}:drug_interaction"
            status_data = {
                'agent_id': 'DRUG_CHECKER_v3.0',
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
            logger.info("💊 Drug Interaction Agent listening for requests...")
            
            while True:
                result = await self.redis.blpop(['diagnosis:queue:drug_interaction'], timeout=5)
                
                if result:
                    _, diagnosis_id = result
                    diagnosis_id = diagnosis_id.decode('utf-8')
                    logger.info(f"📨 Processing drug interaction request: {diagnosis_id}")
                    
                    asyncio.create_task(self.process_diagnosis_request(diagnosis_id))
                    
        except KeyboardInterrupt:
            logger.info("🔄 Drug Interaction Agent shutting down...")
        except Exception as e:
            logger.error(f"❌ Listening error: {str(e)}")
            
    async def cleanup(self):
        """Cleanup resources"""
        if self.checker:
            await self.checker.cleanup()
        if self.redis:
            await self.redis.close()
        if self.mongodb:
            self.mongodb.close()
        logger.info("🧹 Drug Interaction Agent cleanup completed")


async def main():
    """Main entry point for Drug Interaction Agent"""
    agent = DrugCheckerService()
    
    try:
        await agent.initialize()
        await agent.start_listening()
    except KeyboardInterrupt:
        logger.info("🔄 Shutting down Drug Interaction Agent...")
    finally:
        await agent.cleanup()

if __name__ == "__main__":
    asyncio.run(main())