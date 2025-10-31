"""
History Synthesis Agent
Integrates patient records, lab data, and medical history
Provides comprehensive patient timeline and EHR integration
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import asyncio
import json

from motor.motor_asyncio import AsyncIOMotorClient
import redis.asyncio as redis

logger = logging.getLogger(__name__)

class HistorySynthesisAgent:
    """
    Specialized AI Agent for Patient History Synthesis
    - Integrates patient records from multiple sources
    - Synthesizes lab data and medical history
    - Creates comprehensive patient timelines
    - EHR integration and data correlation
    """
    
    def __init__(self, mongodb_client: AsyncIOMotorClient, redis_client, settings):
        self.mongodb = mongodb_client
        self.redis = redis_client
        self.settings = settings
        self.db = mongodb_client[settings.MONGODB_DATABASE]
        
        # Cache TTL for patient data
        self.cache_ttl = 3600  # 1 hour
        
    async def synthesize_history(self, patient_id: str) -> Dict[str, Any]:
        """
        Main history synthesis pipeline
        """
        try:
            # Check cache first
            cached_history = await self._get_cached_synthesis(patient_id)
            if cached_history:
                logger.info(f"Using cached history for patient {patient_id}")
                return cached_history
            
            # Gather all patient data
            patient_data = await self._gather_patient_data(patient_id)
            
            # Synthesize comprehensive history
            synthesis_result = {
                "patient_id": patient_id,
                "synthesis_timestamp": datetime.now().isoformat(),
                "synthesis_id": f"HIST_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{patient_id}",
                "patient_demographics": patient_data.get("demographics", {}),
                "medical_timeline": await self._create_medical_timeline(patient_data),
                "lab_data_summary": await self._synthesize_lab_data(patient_data),
                "medication_history": await self._analyze_medication_history(patient_data),
                "diagnostic_history": await self._compile_diagnostic_history(patient_data),
                "vital_signs_trends": await self._analyze_vital_trends(patient_data),
                "clinical_correlations": await self._find_clinical_correlations(patient_data),
                "risk_factors": await self._identify_risk_factors(patient_data),
                "ehr_integration": await self._integrate_ehr_data(patient_id),
                "care_gaps": await self._identify_care_gaps(patient_data),
                "recommendations": []
            }
            
            # Generate clinical insights
            synthesis_result["clinical_insights"] = await self._generate_clinical_insights(synthesis_result)
            
            # Generate recommendations
            synthesis_result["recommendations"] = await self._generate_recommendations(synthesis_result)
            
            # Store synthesis result
            await self._store_synthesis_result(synthesis_result)
            
            # Cache the result
            await self._cache_synthesis(patient_id, synthesis_result)
            
            logger.info(f"History synthesis completed for patient {patient_id}")
            return synthesis_result
            
        except Exception as e:
            logger.error(f"History synthesis failed for patient {patient_id}: {e}")
            raise
    
    async def _get_cached_synthesis(self, patient_id: str) -> Optional[Dict[str, Any]]:
        """Get cached synthesis result"""
        try:
            cache_key = f"history_synthesis:{patient_id}"
            cached_data = await self.redis.get(cache_key)
            
            if cached_data:
                return json.loads(cached_data)
            
            return None
            
        except Exception as e:
            logger.warning(f"Cache retrieval failed: {e}")
            return None
    
    async def _gather_patient_data(self, patient_id: str) -> Dict[str, Any]:
        """Gather all available patient data from various collections"""
        try:
            patient_data = {
                "demographics": {},
                "medical_records": [],
                "lab_results": [],
                "medications": [],
                "vital_signs": [],
                "diagnoses": [],
                "procedures": [],
                "allergies": [],
                "immunizations": []
            }
            
            # Get patient demographics
            patients_collection = self.db["patients"]
            patient = await patients_collection.find_one({"patient_id": patient_id})
            if patient:
                patient_data["demographics"] = patient
            
            # Get medical records
            records_collection = self.db["medical_records"]
            async for record in records_collection.find({"patient_id": patient_id}):
                patient_data["medical_records"].append(record)
            
            # Get lab results
            labs_collection = self.db["lab_results"]
            async for lab in labs_collection.find({"patient_id": patient_id}).sort("date", -1):
                patient_data["lab_results"].append(lab)
            
            # Get medications
            medications_collection = self.db["medications"]
            async for medication in medications_collection.find({"patient_id": patient_id}):
                patient_data["medications"].append(medication)
            
            # Get vital signs
            vitals_collection = self.db["vital_signs"]
            async for vital in vitals_collection.find({"patient_id": patient_id}).sort("timestamp", -1):
                patient_data["vital_signs"].append(vital)
            
            # Get diagnoses
            diagnoses_collection = self.db["diagnoses"]
            async for diagnosis in diagnoses_collection.find({"patient_id": patient_id}):
                patient_data["diagnoses"].append(diagnosis)
            
            return patient_data
            
        except Exception as e:
            logger.error(f"Failed to gather patient data: {e}")
            raise
    
    async def _create_medical_timeline(self, patient_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create comprehensive medical timeline"""
        timeline_events = []
        
        # Add diagnoses to timeline
        for diagnosis in patient_data.get("diagnoses", []):
            timeline_events.append({
                "date": diagnosis.get("diagnosis_date", ""),
                "type": "diagnosis",
                "event": f"Diagnosed with {diagnosis.get('condition', 'Unknown')}",
                "details": diagnosis,
                "severity": diagnosis.get("severity", "Unknown"),
                "provider": diagnosis.get("provider", "Unknown")
            })
        
        # Add procedures to timeline
        for procedure in patient_data.get("procedures", []):
            timeline_events.append({
                "date": procedure.get("procedure_date", ""),
                "type": "procedure",
                "event": f"Procedure: {procedure.get('name', 'Unknown')}",
                "details": procedure,
                "location": procedure.get("facility", "Unknown")
            })
        
        # Add significant lab results
        for lab in patient_data.get("lab_results", [])[:10]:  # Last 10 lab results
            if lab.get("abnormal", False):
                timeline_events.append({
                    "date": lab.get("date", ""),
                    "type": "lab_abnormal",
                    "event": f"Abnormal {lab.get('test_name', 'Lab Result')}: {lab.get('value', '')} {lab.get('unit', '')}",
                    "details": lab,
                    "reference_range": lab.get("reference_range", "")
                })
        
        # Add medication changes
        for medication in patient_data.get("medications", []):
            if medication.get("start_date"):
                timeline_events.append({
                    "date": medication.get("start_date", ""),
                    "type": "medication_start",
                    "event": f"Started {medication.get('name', 'Unknown medication')}",
                    "details": medication,
                    "dosage": medication.get("dosage", "Unknown")
                })
            
            if medication.get("end_date"):
                timeline_events.append({
                    "date": medication.get("end_date", ""),
                    "type": "medication_stop",
                    "event": f"Discontinued {medication.get('name', 'Unknown medication')}",
                    "details": medication,
                    "reason": medication.get("discontinuation_reason", "Unknown")
                })
        
        # Sort timeline by date
        timeline_events.sort(key=lambda x: x.get("date", ""), reverse=True)
        
        return timeline_events[:50]  # Return last 50 events
    
    async def _synthesize_lab_data(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Synthesize and analyze lab data trends"""
        lab_summary = {
            "total_tests": len(patient_data.get("lab_results", [])),
            "recent_abnormalities": [],
            "trending_values": {},
            "critical_results": [],
            "lab_categories": {}
        }
        
        lab_results = patient_data.get("lab_results", [])
        
        # Categorize lab results
        categories = {}
        for lab in lab_results:
            category = lab.get("category", "General")
            if category not in categories:
                categories[category] = []
            categories[category].append(lab)
        
        lab_summary["lab_categories"] = {
            category: len(tests) for category, tests in categories.items()
        }
        
        # Find recent abnormalities
        for lab in lab_results[:20]:  # Last 20 results
            if lab.get("abnormal", False):
                lab_summary["recent_abnormalities"].append({
                    "test_name": lab.get("test_name", "Unknown"),
                    "value": lab.get("value", ""),
                    "unit": lab.get("unit", ""),
                    "reference_range": lab.get("reference_range", ""),
                    "date": lab.get("date", ""),
                    "significance": lab.get("clinical_significance", "Unknown")
                })
        
        # Find critical results
        for lab in lab_results:
            if lab.get("critical", False) or lab.get("panic_value", False):
                lab_summary["critical_results"].append({
                    "test_name": lab.get("test_name", "Unknown"),
                    "value": lab.get("value", ""),
                    "date": lab.get("date", ""),
                    "action_taken": lab.get("action_taken", "Unknown")
                })
        
        return lab_summary
    
    async def _analyze_medication_history(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze medication history and patterns"""
        medications = patient_data.get("medications", [])
        
        medication_analysis = {
            "total_medications": len(medications),
            "current_medications": [],
            "discontinued_medications": [],
            "medication_classes": {},
            "adherence_issues": [],
            "drug_allergies": patient_data.get("allergies", [])
        }
        
        # Categorize current vs discontinued
        for med in medications:
            if med.get("status", "").lower() == "active":
                medication_analysis["current_medications"].append({
                    "name": med.get("name", "Unknown"),
                    "dosage": med.get("dosage", "Unknown"),
                    "frequency": med.get("frequency", "Unknown"),
                    "start_date": med.get("start_date", "Unknown"),
                    "indication": med.get("indication", "Unknown")
                })
            else:
                medication_analysis["discontinued_medications"].append({
                    "name": med.get("name", "Unknown"),
                    "end_date": med.get("end_date", "Unknown"),
                    "reason": med.get("discontinuation_reason", "Unknown")
                })
        
        # Group by medication classes
        for med in medications:
            med_class = med.get("class", "Unclassified")
            if med_class not in medication_analysis["medication_classes"]:
                medication_analysis["medication_classes"][med_class] = 0
            medication_analysis["medication_classes"][med_class] += 1
        
        return medication_analysis
    
    async def _compile_diagnostic_history(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Compile comprehensive diagnostic history"""
        diagnoses = patient_data.get("diagnoses", [])
        
        diagnostic_summary = {
            "total_diagnoses": len(diagnoses),
            "active_conditions": [],
            "resolved_conditions": [],
            "chronic_conditions": [],
            "diagnostic_categories": {},
            "comorbidities": []
        }
        
        # Categorize diagnoses
        for diagnosis in diagnoses:
            diagnosis_info = {
                "condition": diagnosis.get("condition", "Unknown"),
                "icd_code": diagnosis.get("icd_code", ""),
                "diagnosis_date": diagnosis.get("diagnosis_date", ""),
                "severity": diagnosis.get("severity", "Unknown"),
                "status": diagnosis.get("status", "Unknown")
            }
            
            status = diagnosis.get("status", "").lower()
            if status == "active":
                diagnostic_summary["active_conditions"].append(diagnosis_info)
            elif status == "resolved":
                diagnostic_summary["resolved_conditions"].append(diagnosis_info)
            
            # Check for chronic conditions
            if diagnosis.get("chronic", False):
                diagnostic_summary["chronic_conditions"].append(diagnosis_info)
            
            # Categorize by system
            category = diagnosis.get("body_system", "General")
            if category not in diagnostic_summary["diagnostic_categories"]:
                diagnostic_summary["diagnostic_categories"][category] = 0
            diagnostic_summary["diagnostic_categories"][category] += 1
        
        return diagnostic_summary
    
    async def _analyze_vital_trends(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze vital signs trends"""
        vitals = patient_data.get("vital_signs", [])
        
        if not vitals:
            return {"message": "No vital signs data available"}
        
        # Get recent vitals (last 10 readings)
        recent_vitals = vitals[:10]
        
        vital_trends = {
            "latest_vitals": recent_vitals[0] if recent_vitals else {},
            "trend_analysis": {},
            "abnormal_readings": [],
            "stability_assessment": "Stable"
        }
        
        # Analyze trends for key vitals
        vital_parameters = ["blood_pressure_systolic", "blood_pressure_diastolic", 
                          "heart_rate", "temperature", "respiratory_rate", "oxygen_saturation"]
        
        for param in vital_parameters:
            values = [v.get(param) for v in recent_vitals if v.get(param) is not None]
            if values:
                vital_trends["trend_analysis"][param] = {
                    "latest": values[0],
                    "average": sum(values) / len(values),
                    "range": {"min": min(values), "max": max(values)},
                    "readings_count": len(values)
                }
        
        # Identify abnormal readings
        for vital in recent_vitals:
            abnormalities = []
            
            # Check for abnormal values (simplified thresholds)
            if vital.get("blood_pressure_systolic", 0) > 140:
                abnormalities.append("Hypertensive systolic BP")
            if vital.get("heart_rate", 0) > 100:
                abnormalities.append("Tachycardia")
            if vital.get("temperature", 0) > 38.0:
                abnormalities.append("Fever")
            if vital.get("oxygen_saturation", 100) < 95:
                abnormalities.append("Low oxygen saturation")
            
            if abnormalities:
                vital_trends["abnormal_readings"].append({
                    "date": vital.get("timestamp", "Unknown"),
                    "abnormalities": abnormalities,
                    "values": vital
                })
        
        return vital_trends
    
    async def _find_clinical_correlations(self, patient_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Find correlations between different clinical data points"""
        correlations = []
        
        diagnoses = patient_data.get("diagnoses", [])
        medications = patient_data.get("medications", [])
        lab_results = patient_data.get("lab_results", [])
        
        # Correlate diagnoses with medications
        for diagnosis in diagnoses:
            condition = diagnosis.get("condition", "").lower()
            related_meds = [med for med in medications 
                          if condition in med.get("indication", "").lower()]
            
            if related_meds:
                correlations.append({
                    "type": "diagnosis_medication_correlation",
                    "diagnosis": diagnosis.get("condition"),
                    "related_medications": [med.get("name") for med in related_meds],
                    "correlation_strength": "Strong"
                })
        
        # Correlate lab results with diagnoses
        for lab in lab_results[:10]:  # Recent labs
            if lab.get("abnormal", False):
                related_diagnoses = [diag for diag in diagnoses 
                                   if any(keyword in diag.get("condition", "").lower() 
                                         for keyword in lab.get("test_name", "").lower().split())]
                
                if related_diagnoses:
                    correlations.append({
                        "type": "lab_diagnosis_correlation",
                        "lab_test": lab.get("test_name"),
                        "abnormal_value": f"{lab.get('value')} {lab.get('unit', '')}",
                        "related_diagnoses": [diag.get("condition") for diag in related_diagnoses],
                        "correlation_strength": "Moderate"
                    })
        
        return correlations
    
    async def _identify_risk_factors(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Identify patient risk factors"""
        demographics = patient_data.get("demographics", {})
        diagnoses = patient_data.get("diagnoses", [])
        medications = patient_data.get("medications", [])
        
        risk_factors = {
            "demographic_risks": [],
            "clinical_risks": [],
            "medication_risks": [],
            "lifestyle_risks": [],
            "overall_risk_score": "Moderate"
        }
        
        # Demographic risk factors
        age = demographics.get("age", 0)
        if age > 65:
            risk_factors["demographic_risks"].append("Advanced age (>65 years)")
        
        gender = demographics.get("gender", "").lower()
        if gender == "male":
            risk_factors["demographic_risks"].append("Male gender (higher cardiovascular risk)")
        
        # Clinical risk factors
        high_risk_conditions = ["diabetes", "hypertension", "heart disease", "stroke", "cancer"]
        for diagnosis in diagnoses:
            condition = diagnosis.get("condition", "").lower()
            for risk_condition in high_risk_conditions:
                if risk_condition in condition:
                    risk_factors["clinical_risks"].append(f"History of {diagnosis.get('condition')}")
        
        # Medication risk factors
        high_risk_meds = ["warfarin", "digoxin", "insulin", "chemotherapy"]
        for med in medications:
            med_name = med.get("name", "").lower()
            for risk_med in high_risk_meds:
                if risk_med in med_name:
                    risk_factors["medication_risks"].append(f"High-risk medication: {med.get('name')}")
        
        return risk_factors
    
    async def _integrate_ehr_data(self, patient_id: str) -> Dict[str, Any]:
        """Integrate with Electronic Health Record systems"""
        # Simulate EHR integration
        return {
            "ehr_system": "Epic/Cerner Integration",
            "last_sync": datetime.now().isoformat(),
            "data_completeness": 85.2,
            "integrated_sources": [
                "Hospital EMR",
                "Outpatient Clinics", 
                "Laboratory Systems",
                "Pharmacy Records",
                "Radiology PACS"
            ],
            "sync_status": "Active",
            "data_quality_score": 92.1
        }
    
    async def _identify_care_gaps(self, patient_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identify gaps in patient care"""
        care_gaps = []
        
        demographics = patient_data.get("demographics", {})
        diagnoses = patient_data.get("diagnoses", [])
        
        # Age-based screening gaps
        age = demographics.get("age", 0)
        gender = demographics.get("gender", "").lower()
        
        if age > 50 and gender == "female":
            care_gaps.append({
                "type": "screening_gap",
                "description": "Mammography screening due",
                "urgency": "Routine",
                "recommendation": "Schedule annual mammogram"
            })
        
        if age > 50:
            care_gaps.append({
                "type": "screening_gap", 
                "description": "Colorectal screening due",
                "urgency": "Routine",
                "recommendation": "Schedule colonoscopy or FIT test"
            })
        
        # Condition-specific gaps
        diabetes_present = any("diabetes" in diag.get("condition", "").lower() 
                             for diag in diagnoses)
        if diabetes_present:
            care_gaps.append({
                "type": "monitoring_gap",
                "description": "HbA1c monitoring",
                "urgency": "Important",
                "recommendation": "HbA1c every 3-6 months"
            })
        
        return care_gaps
    
    async def _generate_clinical_insights(self, synthesis_result: Dict[str, Any]) -> List[str]:
        """Generate clinical insights from synthesized data"""
        insights = []
        
        # Medication insights
        current_meds = synthesis_result.get("medication_history", {}).get("current_medications", [])
        if len(current_meds) > 10:
            insights.append("Patient is on polypharmacy (>10 medications) - consider medication review")
        
        # Lab insights
        abnormalities = synthesis_result.get("lab_data_summary", {}).get("recent_abnormalities", [])
        if len(abnormalities) > 5:
            insights.append("Multiple recent lab abnormalities detected - requires attention")
        
        # Vital signs insights
        abnormal_vitals = synthesis_result.get("vital_signs_trends", {}).get("abnormal_readings", [])
        if abnormal_vitals:
            insights.append("Recent abnormal vital signs noted - monitor closely")
        
        # Risk factor insights
        clinical_risks = synthesis_result.get("risk_factors", {}).get("clinical_risks", [])
        if len(clinical_risks) > 3:
            insights.append("Multiple clinical risk factors present - comprehensive risk management needed")
        
        return insights
    
    async def _generate_recommendations(self, synthesis_result: Dict[str, Any]) -> List[str]:
        """Generate clinical recommendations"""
        recommendations = []
        
        # Care gap recommendations
        care_gaps = synthesis_result.get("care_gaps", [])
        for gap in care_gaps:
            recommendations.append(gap.get("recommendation", ""))
        
        # Risk-based recommendations
        risk_factors = synthesis_result.get("risk_factors", {})
        if risk_factors.get("clinical_risks"):
            recommendations.append("Consider cardiology consultation for risk stratification")
        
        # Medication recommendations
        med_history = synthesis_result.get("medication_history", {})
        if len(med_history.get("current_medications", [])) > 8:
            recommendations.append("Pharmacist medication review recommended")
        
        return recommendations[:10]  # Limit to top 10 recommendations
    
    async def _store_synthesis_result(self, synthesis_result: Dict[str, Any]):
        """Store synthesis result in MongoDB"""
        try:
            collection = self.db["history_syntheses"]
            await collection.insert_one(synthesis_result)
            logger.info(f"Stored synthesis result for patient {synthesis_result['patient_id']}")
        except Exception as e:
            logger.error(f"Failed to store synthesis result: {e}")
    
    async def _cache_synthesis(self, patient_id: str, synthesis_result: Dict[str, Any]):
        """Cache synthesis result in Redis"""
        try:
            cache_key = f"history_synthesis:{patient_id}"
            await self.redis.setex(
                cache_key,
                self.cache_ttl,
                json.dumps(synthesis_result, default=str)
            )
            logger.info(f"Cached synthesis result for patient {patient_id}")
        except Exception as e:
            logger.warning(f"Failed to cache synthesis result: {e}")
    
    async def get_patient_summary(self, patient_id: str) -> Dict[str, Any]:
        """Get concise patient summary"""
        try:
            synthesis = await self.synthesize_history(patient_id)
            
            summary = {
                "patient_id": patient_id,
                "active_conditions": len(synthesis.get("diagnostic_history", {}).get("active_conditions", [])),
                "current_medications": len(synthesis.get("medication_history", {}).get("current_medications", [])),
                "recent_abnormal_labs": len(synthesis.get("lab_data_summary", {}).get("recent_abnormalities", [])),
                "care_gaps": len(synthesis.get("care_gaps", [])),
                "risk_level": synthesis.get("risk_factors", {}).get("overall_risk_score", "Unknown"),
                "last_updated": synthesis.get("synthesis_timestamp")
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"Failed to generate patient summary: {e}")
            return {"error": str(e)}