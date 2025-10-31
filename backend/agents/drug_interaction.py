"""
Drug Interaction Agent
Flags risky prescriptions in real-time
Comprehensive drug interaction checking and safety monitoring
"""

import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
import asyncio
import json

from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)

class DrugInteractionAgent:
    """
    Specialized AI Agent for Drug Interaction Checking
    - Real-time prescription safety monitoring
    - Drug-drug interaction detection
    - Allergy and contraindication checking
    - Dosage and administration guidance
    - Clinical decision support
    """
    
    def __init__(self, mongodb_client: AsyncIOMotorClient, redis_client, settings):
        self.mongodb = mongodb_client
        self.redis = redis_client
        self.settings = settings
        self.db = mongodb_client[settings.MONGODB_DATABASE]
        
        # Drug interaction database (in production, this would be a comprehensive database)
        self.drug_interactions = self._initialize_drug_database()
        self.severity_levels = ["Minor", "Moderate", "Major", "Contraindicated"]
        
    def _initialize_drug_database(self) -> Dict[str, Any]:
        """Initialize drug interaction database"""
        return {
            # Major interactions
            "warfarin": {
                "interactions": [
                    {"drug": "aspirin", "severity": "Major", "mechanism": "Increased bleeding risk"},
                    {"drug": "amiodarone", "severity": "Major", "mechanism": "Increased INR"},
                    {"drug": "fluconazole", "severity": "Major", "mechanism": "CYP2C9 inhibition"},
                    {"drug": "metronidazole", "severity": "Major", "mechanism": "Anticoagulant enhancement"}
                ],
                "contraindications": ["Active bleeding", "Severe liver disease"],
                "monitoring": ["INR", "PT/PTT", "Signs of bleeding"]
            },
            
            "digoxin": {
                "interactions": [
                    {"drug": "amiodarone", "severity": "Major", "mechanism": "Increased digoxin levels"},
                    {"drug": "verapamil", "severity": "Major", "mechanism": "Decreased clearance"},
                    {"drug": "quinidine", "severity": "Major", "mechanism": "Displacement from binding"},
                    {"drug": "furosemide", "severity": "Moderate", "mechanism": "Hypokalemia increases toxicity"}
                ],
                "contraindications": ["Heart block", "Ventricular fibrillation"],
                "monitoring": ["Digoxin levels", "Electrolytes", "Kidney function"]
            },
            
            "metformin": {
                "interactions": [
                    {"drug": "contrast_media", "severity": "Major", "mechanism": "Lactic acidosis risk"},
                    {"drug": "furosemide", "severity": "Moderate", "mechanism": "Increased metformin levels"},
                    {"drug": "alcohol", "severity": "Moderate", "mechanism": "Enhanced lactic acidosis risk"}
                ],
                "contraindications": ["Severe kidney disease", "Metabolic acidosis"],
                "monitoring": ["Kidney function", "Lactate levels", "B12 levels"]
            },
            
            "insulin": {
                "interactions": [
                    {"drug": "beta_blockers", "severity": "Moderate", "mechanism": "Masks hypoglycemia"},
                    {"drug": "ace_inhibitors", "severity": "Moderate", "mechanism": "Enhanced hypoglycemia"},
                    {"drug": "alcohol", "severity": "Moderate", "mechanism": "Unpredictable glucose effects"}
                ],
                "contraindications": ["Hypoglycemia"],
                "monitoring": ["Blood glucose", "HbA1c", "Hypoglycemic symptoms"]
            },
            
            "simvastatin": {
                "interactions": [
                    {"drug": "amiodarone", "severity": "Major", "mechanism": "Increased statin levels"},
                    {"drug": "diltiazem", "severity": "Moderate", "mechanism": "CYP3A4 inhibition"},
                    {"drug": "grapefruit_juice", "severity": "Moderate", "mechanism": "CYP3A4 inhibition"}
                ],
                "contraindications": ["Active liver disease", "Pregnancy"],
                "monitoring": ["Liver enzymes", "CK levels", "Muscle symptoms"]
            },
            
            "lisinopril": {
                "interactions": [
                    {"drug": "spironolactone", "severity": "Moderate", "mechanism": "Hyperkalemia risk"},
                    {"drug": "nsaids", "severity": "Moderate", "mechanism": "Reduced efficacy, kidney damage"},
                    {"drug": "lithium", "severity": "Moderate", "mechanism": "Increased lithium levels"}
                ],
                "contraindications": ["Angioedema history", "Pregnancy"],
                "monitoring": ["Kidney function", "Electrolytes", "Blood pressure"]
            },
            
            "amiodarone": {
                "interactions": [
                    {"drug": "warfarin", "severity": "Major", "mechanism": "Increased anticoagulation"},
                    {"drug": "digoxin", "severity": "Major", "mechanism": "Increased digoxin toxicity"},
                    {"drug": "simvastatin", "severity": "Major", "mechanism": "Increased rhabdomyolysis risk"}
                ],
                "contraindications": ["Severe sinus node dysfunction", "AV block"],
                "monitoring": ["Thyroid function", "Liver function", "Pulmonary function"]
            }
        }
    
    async def check_interactions(self, medications: List[str], patient_id: str = None) -> Dict[str, Any]:
        """
        Main drug interaction checking pipeline
        """
        try:
            interaction_result = {
                "check_timestamp": datetime.now().isoformat(),
                "check_id": f"DRUG_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "medications_checked": medications,
                "patient_id": patient_id,
                "interactions_found": [],
                "contraindications": [],
                "monitoring_requirements": [],
                "severity_summary": {"Minor": 0, "Moderate": 0, "Major": 0, "Contraindicated": 0},
                "clinical_alerts": [],
                "recommendations": []
            }
            
            # Get patient-specific information if available
            patient_data = None
            if patient_id:
                patient_data = await self._get_patient_data(patient_id)
                interaction_result["patient_allergies"] = patient_data.get("allergies", [])
                interaction_result["patient_conditions"] = patient_data.get("conditions", [])
            
            # Check drug-drug interactions
            interactions = await self._check_drug_drug_interactions(medications)
            interaction_result["interactions_found"] = interactions
            
            # Check contraindications
            contraindications = await self._check_contraindications(medications, patient_data)
            interaction_result["contraindications"] = contraindications
            
            # Generate monitoring requirements
            monitoring = await self._generate_monitoring_requirements(medications)
            interaction_result["monitoring_requirements"] = monitoring
            
            # Calculate severity summary
            for interaction in interactions:
                severity = interaction.get("severity", "Minor")
                if severity in interaction_result["severity_summary"]:
                    interaction_result["severity_summary"][severity] += 1
            
            # Generate clinical alerts
            interaction_result["clinical_alerts"] = await self._generate_clinical_alerts(
                interactions, contraindications, patient_data
            )
            
            # Generate recommendations
            interaction_result["recommendations"] = await self._generate_recommendations(
                interactions, contraindications, medications, patient_data
            )
            
            # Store interaction check result
            await self._store_interaction_check(interaction_result)
            
            # Cache for real-time monitoring
            if patient_id:
                await self._cache_interaction_check(patient_id, interaction_result)
            
            logger.info(f"Drug interaction check completed for {len(medications)} medications")
            return interaction_result
            
        except Exception as e:
            logger.error(f"Drug interaction check failed: {e}")
            raise
    
    async def _get_patient_data(self, patient_id: str) -> Dict[str, Any]:
        """Get relevant patient data for interaction checking"""
        try:
            patient_data = {
                "allergies": [],
                "conditions": [],
                "kidney_function": "Normal",
                "liver_function": "Normal",
                "age": None,
                "pregnancy_status": False
            }
            
            # Get patient record
            patients_collection = self.db["patients"]
            patient = await patients_collection.find_one({"patient_id": patient_id})
            
            if patient:
                patient_data["allergies"] = patient.get("allergies", [])
                patient_data["age"] = patient.get("age")
                if patient.get("gender") == "Female":
                    patient_data["pregnancy_status"] = patient.get("pregnant", False)
            
            # Get active diagnoses
            diagnoses_collection = self.db["diagnoses"]
            async for diagnosis in diagnoses_collection.find({"patient_id": patient_id, "status": "active"}):
                patient_data["conditions"].append(diagnosis.get("condition"))
            
            # Get latest lab results for organ function
            labs_collection = self.db["lab_results"]
            recent_labs = []
            async for lab in labs_collection.find({"patient_id": patient_id}).sort("date", -1).limit(10):
                recent_labs.append(lab)
            
            # Assess kidney function
            creatinine_results = [lab for lab in recent_labs if "creatinine" in lab.get("test_name", "").lower()]
            if creatinine_results and creatinine_results[0].get("value", 0) > 1.5:
                patient_data["kidney_function"] = "Impaired"
            
            # Assess liver function
            alt_results = [lab for lab in recent_labs if "alt" in lab.get("test_name", "").lower()]
            if alt_results and alt_results[0].get("value", 0) > 40:
                patient_data["liver_function"] = "Impaired"
            
            return patient_data
            
        except Exception as e:
            logger.error(f"Failed to get patient data: {e}")
            return {}
    
    async def _check_drug_drug_interactions(self, medications: List[str]) -> List[Dict[str, Any]]:
        """Check for drug-drug interactions"""
        interactions = []
        
        # Normalize medication names for matching
        normalized_meds = [med.lower().strip() for med in medications]
        
        for i, med1 in enumerate(normalized_meds):
            for j, med2 in enumerate(normalized_meds[i+1:], i+1):
                
                # Check if med1 has interactions with med2
                if med1 in self.drug_interactions:
                    med1_interactions = self.drug_interactions[med1]["interactions"]
                    
                    for interaction in med1_interactions:
                        if interaction["drug"] in med2 or med2 in interaction["drug"]:
                            interactions.append({
                                "drug_1": medications[i],
                                "drug_2": medications[j],
                                "severity": interaction["severity"],
                                "mechanism": interaction["mechanism"],
                                "clinical_significance": self._assess_clinical_significance(interaction),
                                "management": self._get_interaction_management(interaction),
                                "references": ["DrugBank", "Lexicomp", "Clinical Guidelines"]
                            })
                
                # Check reverse interaction (med2 with med1)
                if med2 in self.drug_interactions:
                    med2_interactions = self.drug_interactions[med2]["interactions"]
                    
                    for interaction in med2_interactions:
                        if interaction["drug"] in med1 or med1 in interaction["drug"]:
                            # Avoid duplicate interactions
                            if not any(i["drug_1"] == medications[j] and i["drug_2"] == medications[i] 
                                     for i in interactions):
                                interactions.append({
                                    "drug_1": medications[j],
                                    "drug_2": medications[i],
                                    "severity": interaction["severity"],
                                    "mechanism": interaction["mechanism"],
                                    "clinical_significance": self._assess_clinical_significance(interaction),
                                    "management": self._get_interaction_management(interaction),
                                    "references": ["DrugBank", "Lexicomp", "Clinical Guidelines"]
                                })
        
        return interactions
    
    async def _check_contraindications(self, medications: List[str], patient_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Check for drug contraindications based on patient conditions"""
        contraindications = []
        
        if not patient_data:
            return contraindications
        
        patient_conditions = [cond.lower() for cond in patient_data.get("conditions", [])]
        patient_allergies = [allergy.lower() for allergy in patient_data.get("allergies", [])]
        
        for medication in medications:
            med_lower = medication.lower().strip()
            
            # Check allergies
            for allergy in patient_allergies:
                if allergy in med_lower or med_lower in allergy:
                    contraindications.append({
                        "medication": medication,
                        "type": "allergy",
                        "condition": allergy,
                        "severity": "Contraindicated",
                        "action": "Do not administer - patient has known allergy",
                        "alternative_suggested": True
                    })
            
            # Check disease contraindications
            if med_lower in self.drug_interactions:
                drug_contraindications = self.drug_interactions[med_lower].get("contraindications", [])
                
                for contraindication in drug_contraindications:
                    for condition in patient_conditions:
                        if any(keyword in condition for keyword in contraindication.lower().split()):
                            contraindications.append({
                                "medication": medication,
                                "type": "disease_contraindication",
                                "condition": condition,
                                "contraindication_description": contraindication,
                                "severity": "Major",
                                "action": "Use with extreme caution or avoid",
                                "monitoring_required": True
                            })
            
            # Special population checks
            if patient_data.get("pregnancy_status"):
                pregnancy_risk = self._get_pregnancy_risk(med_lower)
                if pregnancy_risk in ["D", "X"]:
                    contraindications.append({
                        "medication": medication,
                        "type": "pregnancy_risk",
                        "condition": "Pregnancy",
                        "risk_category": pregnancy_risk,
                        "severity": "Major" if pregnancy_risk == "D" else "Contraindicated",
                        "action": "Avoid in pregnancy" if pregnancy_risk == "X" else "Use only if benefit outweighs risk",
                        "counseling_required": True
                    })
            
            # Organ function contraindications
            if patient_data.get("kidney_function") == "Impaired":
                if med_lower in ["metformin", "digoxin", "lithium"]:
                    contraindications.append({
                        "medication": medication,
                        "type": "renal_impairment",
                        "condition": "Kidney impairment", 
                        "severity": "Major",
                        "action": "Dose adjustment required or avoid",
                        "monitoring_required": True
                    })
        
        return contraindications
    
    async def _generate_monitoring_requirements(self, medications: List[str]) -> List[Dict[str, Any]]:
        """Generate monitoring requirements for medications"""
        monitoring_requirements = []
        
        for medication in medications:
            med_lower = medication.lower().strip()
            
            if med_lower in self.drug_interactions:
                monitoring_params = self.drug_interactions[med_lower].get("monitoring", [])
                
                for param in monitoring_params:
                    monitoring_requirements.append({
                        "medication": medication,
                        "parameter": param,
                        "frequency": self._get_monitoring_frequency(med_lower, param),
                        "target_range": self._get_target_range(param),
                        "clinical_significance": self._get_monitoring_significance(param),
                        "action_if_abnormal": self._get_abnormal_action(param)
                    })
        
        return monitoring_requirements
    
    def _assess_clinical_significance(self, interaction: Dict[str, Any]) -> str:
        """Assess clinical significance of interaction"""
        severity = interaction.get("severity", "Minor")
        
        significance_map = {
            "Minor": "Monitor for minor effects, no dose adjustment typically needed",
            "Moderate": "Monitor closely, may require dose adjustment or timing separation",
            "Major": "Avoid combination if possible, or use with intensive monitoring",
            "Contraindicated": "Do not use together - serious adverse effects likely"
        }
        
        return significance_map.get(severity, "Clinical significance unknown")
    
    def _get_interaction_management(self, interaction: Dict[str, Any]) -> str:
        """Get management recommendation for interaction"""
        severity = interaction.get("severity", "Minor")
        mechanism = interaction.get("mechanism", "")
        
        if "bleeding" in mechanism.lower():
            return "Monitor for signs of bleeding, check coagulation parameters"
        elif "levels" in mechanism.lower():
            return "Monitor drug levels and adjust dose as needed"
        elif "toxicity" in mechanism.lower():
            return "Monitor for signs of toxicity, consider dose reduction"
        elif severity == "Major":
            return "Consider alternative therapy or intensive monitoring"
        else:
            return "Monitor patient response and adjust therapy as needed"
    
    def _get_pregnancy_risk(self, medication: str) -> str:
        """Get pregnancy risk category for medication"""
        pregnancy_risks = {
            "warfarin": "X",
            "methotrexate": "X", 
            "isotretinoin": "X",
            "lisinopril": "D",
            "atenolol": "D",
            "phenytoin": "D"
        }
        
        return pregnancy_risks.get(medication, "B")
    
    def _get_monitoring_frequency(self, medication: str, parameter: str) -> str:
        """Get recommended monitoring frequency"""
        frequency_map = {
            "warfarin": {"INR": "Weekly initially, then monthly when stable"},
            "digoxin": {"digoxin levels": "1 week after initiation, then every 6 months"},
            "metformin": {"kidney function": "Every 3-6 months"},
            "simvastatin": {"liver enzymes": "Baseline, 12 weeks, then annually"}
        }
        
        med_frequencies = frequency_map.get(medication, {})
        return med_frequencies.get(parameter, "As clinically indicated")
    
    def _get_target_range(self, parameter: str) -> str:
        """Get target range for monitoring parameter"""
        target_ranges = {
            "INR": "2.0-3.0 (most indications)",
            "digoxin levels": "1.0-2.0 ng/mL",
            "kidney function": "eGFR >60 mL/min/1.73m²",
            "liver enzymes": "<3x upper limit of normal"
        }
        
        return target_ranges.get(parameter, "Within normal limits")
    
    def _get_monitoring_significance(self, parameter: str) -> str:
        """Get clinical significance of monitoring parameter"""
        significance_map = {
            "INR": "Prevents thrombosis while minimizing bleeding risk",
            "digoxin levels": "Prevents toxicity while maintaining efficacy",
            "kidney function": "Prevents drug accumulation and toxicity",
            "liver enzymes": "Early detection of hepatotoxicity"
        }
        
        return significance_map.get(parameter, "Important for safe medication use")
    
    def _get_abnormal_action(self, parameter: str) -> str:
        """Get action to take if parameter is abnormal"""
        action_map = {
            "INR": "Adjust warfarin dose, check for bleeding",
            "digoxin levels": "Adjust dose, check for toxicity signs",
            "kidney function": "Adjust dose or discontinue if severe",
            "liver enzymes": "Consider dose reduction or discontinuation"
        }
        
        return action_map.get(parameter, "Consult clinical guidelines")
    
    async def _generate_clinical_alerts(self, interactions: List[Dict], contraindications: List[Dict], patient_data: Dict) -> List[Dict[str, Any]]:
        """Generate clinical alerts based on findings"""
        alerts = []
        
        # High severity interaction alerts
        major_interactions = [i for i in interactions if i.get("severity") == "Major"]
        if major_interactions:
            alerts.append({
                "type": "major_interaction",
                "priority": "High",
                "message": f"{len(major_interactions)} major drug interaction(s) detected",
                "action_required": "Review medications immediately",
                "details": major_interactions
            })
        
        # Contraindication alerts
        if contraindications:
            alerts.append({
                "type": "contraindication",
                "priority": "Critical",
                "message": f"{len(contraindications)} contraindication(s) identified",
                "action_required": "Do not administer or modify therapy",
                "details": contraindications
            })
        
        # Patient-specific alerts
        if patient_data:
            age = patient_data.get("age")
            if age and age > 65:
                alerts.append({
                    "type": "geriatric_alert", 
                    "priority": "Medium",
                    "message": "Elderly patient - consider dose adjustments and increased monitoring",
                    "action_required": "Review dosing for age appropriateness"
                })
        
        return alerts
    
    async def _generate_recommendations(self, interactions: List[Dict], contraindications: List[Dict], medications: List[str], patient_data: Dict) -> List[str]:
        """Generate clinical recommendations"""
        recommendations = []
        
        # Interaction recommendations
        if interactions:
            major_count = len([i for i in interactions if i.get("severity") == "Major"])
            if major_count > 0:
                recommendations.append(f"Review {major_count} major drug interaction(s) - consider alternative medications")
            
            recommendations.append("Implement enhanced monitoring protocols for identified interactions")
        
        # Contraindication recommendations
        if contraindications:
            recommendations.append("Immediately review contraindicated medications - consider alternatives")
        
        # General recommendations
        if len(medications) > 10:
            recommendations.append("Patient on polypharmacy - consider medication reconciliation")
        
        if patient_data and patient_data.get("age", 0) > 65:
            recommendations.append("Consider geriatric dosing guidelines and fall risk assessment")
        
        # Monitoring recommendations
        high_risk_meds = ["warfarin", "digoxin", "lithium", "phenytoin"]
        for med in medications:
            if any(risk_med in med.lower() for risk_med in high_risk_meds):
                recommendations.append(f"Implement therapeutic drug monitoring for {med}")
        
        return recommendations[:8]  # Limit to top 8 recommendations
    
    async def _store_interaction_check(self, interaction_result: Dict[str, Any]):
        """Store interaction check result in MongoDB"""
        try:
            collection = self.db["drug_interaction_checks"]
            await collection.insert_one(interaction_result)
            logger.info(f"Stored drug interaction check {interaction_result['check_id']}")
        except Exception as e:
            logger.error(f"Failed to store interaction check: {e}")
    
    async def _cache_interaction_check(self, patient_id: str, interaction_result: Dict[str, Any]):
        """Cache interaction check for real-time monitoring"""
        try:
            cache_key = f"drug_interactions:{patient_id}"
            await self.redis.setex(
                cache_key,
                3600,  # 1 hour TTL
                json.dumps(interaction_result, default=str)
            )
            logger.info(f"Cached interaction check for patient {patient_id}")
        except Exception as e:
            logger.warning(f"Failed to cache interaction check: {e}")
    
    async def real_time_monitoring(self, patient_id: str) -> Dict[str, Any]:
        """Get real-time drug interaction monitoring status"""
        try:
            # Get current medications
            medications_collection = self.db["medications"]
            current_meds = []
            async for med in medications_collection.find({"patient_id": patient_id, "status": "active"}):
                current_meds.append(med.get("name", ""))
            
            if not current_meds:
                return {"message": "No active medications found"}
            
            # Check for cached results
            cache_key = f"drug_interactions:{patient_id}"
            cached_check = await self.redis.get(cache_key)
            
            if cached_check:
                cached_result = json.loads(cached_check)
                # Check if medications have changed
                if set(cached_result["medications_checked"]) == set(current_meds):
                    return {
                        "status": "up_to_date",
                        "last_check": cached_result["check_timestamp"],
                        "interactions": cached_result["interactions_found"],
                        "alerts": cached_result["clinical_alerts"]
                    }
            
            # Perform new check if cache is stale
            new_check = await self.check_interactions(current_meds, patient_id)
            
            return {
                "status": "updated",
                "last_check": new_check["check_timestamp"],
                "interactions": new_check["interactions_found"],
                "alerts": new_check["clinical_alerts"]
            }
            
        except Exception as e:
            logger.error(f"Real-time monitoring failed: {e}")
            return {"error": str(e)}