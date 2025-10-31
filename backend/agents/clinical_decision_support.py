"""
Clinical Decision Support Agent
Advanced AI agent for evidence-based clinical decision making
Integrates with clinical guidelines, protocols, and real-world evidence
"""

import logging
import asyncio
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
import json
import numpy as np
from motor.motor_asyncio import AsyncIOMotorClient
import redis.asyncio as redis

logger = logging.getLogger(__name__)

class ClinicalDecisionSupportAgent:
    """
    Advanced Clinical Decision Support AI Agent
    
    Capabilities:
    - Evidence-based clinical recommendations
    - Risk stratification and scoring
    - Clinical pathway optimization
    - Treatment protocol adherence
    - Outcome prediction and monitoring
    - Quality metrics and benchmarking
    """
    
    def __init__(self, mongodb_client: AsyncIOMotorClient, redis_client, settings):
        self.mongodb = mongodb_client
        self.redis = redis_client
        self.settings = settings
        self.db = mongodb_client[settings.MONGODB_DATABASE]
        
        # Clinical guidelines database
        self.guidelines = {}
        self.clinical_protocols = {}
        self.risk_calculators = {}
        
        # Initialize clinical knowledge base
        asyncio.create_task(self._initialize_clinical_knowledge())
        
        logger.info("🏥 Clinical Decision Support Agent initialized")
    
    async def _initialize_clinical_knowledge(self):
        """Initialize clinical guidelines and protocols"""
        try:
            # Load clinical guidelines (simplified - in real implementation would load from medical databases)
            self.guidelines = {
                "pneumonia": {
                    "diagnosis_criteria": [
                        "Clinical symptoms (fever, cough, dyspnea)",
                        "Radiographic evidence of pneumonia",
                        "Laboratory findings (elevated WBC, procalcitonin)"
                    ],
                    "treatment_protocols": {
                        "community_acquired": {
                            "outpatient": "Amoxicillin 1g TID or Azithromycin 500mg daily",
                            "inpatient": "Ceftriaxone 1g IV daily + Azithromycin 500mg daily",
                            "severe": "Ceftriaxone 2g IV daily + Azithromycin 500mg IV daily"
                        },
                        "hospital_acquired": {
                            "standard": "Piperacillin-tazobactam 4.5g IV q6h",
                            "resistant": "Vancomycin + Meropenem"
                        }
                    },
                    "monitoring": [
                        "Clinical response in 48-72 hours",
                        "Repeat chest X-ray if no improvement",
                        "Procalcitonin trending"
                    ]
                },
                "sepsis": {
                    "diagnosis_criteria": [
                        "qSOFA ≥2 (altered mental status, SBP ≤100, RR ≥22)",
                        "Suspected or confirmed infection",
                        "Organ dysfunction"
                    ],
                    "treatment_protocols": {
                        "sepsis_bundle": [
                            "Blood cultures before antibiotics",
                            "Broad-spectrum antibiotics within 1 hour",
                            "Fluid resuscitation 30ml/kg if hypotensive",
                            "Vasopressors if needed after fluid challenge"
                        ]
                    },
                    "monitoring": [
                        "Serial lactate levels",
                        "Urine output",
                        "Mental status",
                        "Vital signs q1h"
                    ]
                },
                "heart_failure": {
                    "diagnosis_criteria": [
                        "Clinical symptoms (dyspnea, fatigue, edema)",
                        "Echocardiographic evidence",
                        "BNP/NT-proBNP elevation"
                    ],
                    "treatment_protocols": {
                        "acute": {
                            "diuretics": "Furosemide IV",
                            "vasodilators": "Nitroglycerin if appropriate",
                            "inotropes": "If cardiogenic shock"
                        },
                        "chronic": {
                            "ace_inhibitors": "Lisinopril, target dose",
                            "beta_blockers": "Metoprolol succinate",
                            "diuretics": "Furosemide as needed"
                        }
                    }
                }
            }
            
            # Risk calculators
            self.risk_calculators = {
                "cardiovascular": {
                    "framingham": self._calculate_framingham_risk,
                    "ascvd": self._calculate_ascvd_risk
                },
                "surgical": {
                    "revised_cardiac_risk": self._calculate_revised_cardiac_risk,
                    "asa_physical_status": self._assess_asa_status
                },
                "mortality": {
                    "apache_ii": self._calculate_apache_ii,
                    "sofa": self._calculate_sofa_score
                }
            }
            
            logger.info("✅ Clinical knowledge base initialized")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize clinical knowledge: {e}")
    
    async def generate_clinical_recommendations(
        self,
        clinical_data: Dict[str, Any],
        include_differential_diagnosis: bool = True,
        include_treatment_protocols: bool = True,
        include_risk_stratification: bool = True,
        include_monitoring_plans: bool = True
    ) -> Dict[str, Any]:
        """
        Generate comprehensive clinical decision support recommendations
        """
        try:
            recommendations = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "clinical_context": clinical_data.get("patient_id", "unknown"),
                "recommendations": []
            }
            
            # Extract key clinical information
            symptoms = clinical_data.get("symptoms", [])
            vital_signs = clinical_data.get("vital_signs", {})
            lab_results = clinical_data.get("laboratory_results", {})
            imaging_results = clinical_data.get("imaging_results", {})
            
            # Perform clinical reasoning
            clinical_assessment = await self._perform_clinical_assessment(
                symptoms, vital_signs, lab_results, imaging_results
            )
            
            recommendations["clinical_assessment"] = clinical_assessment
            
            # Generate differential diagnosis
            if include_differential_diagnosis:
                differential_dx = await self._generate_differential_diagnosis(clinical_assessment)
                recommendations["differential_diagnosis"] = differential_dx
            
            # Generate treatment protocols
            if include_treatment_protocols:
                treatment_protocols = await self._generate_treatment_protocols(clinical_assessment)
                recommendations["treatment_protocols"] = treatment_protocols
            
            # Perform risk stratification
            if include_risk_stratification:
                risk_assessment = await self._perform_risk_stratification(clinical_data)
                recommendations["risk_assessment"] = risk_assessment
            
            # Generate monitoring plans
            if include_monitoring_plans:
                monitoring_plan = await self._generate_monitoring_plan(clinical_assessment)
                recommendations["monitoring_plan"] = monitoring_plan
            
            # Generate safety alerts
            safety_alerts = await self._generate_clinical_safety_alerts(clinical_data, clinical_assessment)
            recommendations["safety_alerts"] = safety_alerts
            
            # Quality metrics
            recommendations["quality_metrics"] = await self._calculate_quality_metrics(recommendations)
            
            return recommendations
            
        except Exception as e:
            logger.error(f"❌ Clinical recommendations generation failed: {e}")
            return {"error": str(e)}
    
    async def _perform_clinical_assessment(
        self, symptoms: List[str], vital_signs: Dict[str, Any], 
        lab_results: Dict[str, Any], imaging_results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform comprehensive clinical assessment"""
        
        assessment = {
            "primary_concerns": [],
            "severity_assessment": "stable",
            "urgent_findings": [],
            "clinical_patterns": []
        }
        
        # Analyze symptoms
        respiratory_symptoms = [s for s in symptoms if any(term in s.lower() for term in ["cough", "dyspnea", "shortness", "breath"])]
        cardiac_symptoms = [s for s in symptoms if any(term in s.lower() for term in ["chest pain", "palpitation", "syncope"])]
        
        if respiratory_symptoms:
            assessment["primary_concerns"].append({
                "system": "respiratory",
                "symptoms": respiratory_symptoms,
                "severity": "moderate"
            })
        
        if cardiac_symptoms:
            assessment["primary_concerns"].append({
                "system": "cardiovascular", 
                "symptoms": cardiac_symptoms,
                "severity": "moderate"
            })
        
        # Analyze vital signs
        if vital_signs:
            vitals_assessment = await self._assess_vital_signs(vital_signs)
            assessment["vital_signs_assessment"] = vitals_assessment
            
            if vitals_assessment.get("abnormal_findings"):
                assessment["urgent_findings"].extend(vitals_assessment["abnormal_findings"])
        
        # Analyze imaging results
        if imaging_results:
            imaging_assessment = await self._assess_imaging_findings(imaging_results)
            assessment["imaging_assessment"] = imaging_assessment
            
            if imaging_assessment.get("significant_findings"):
                assessment["primary_concerns"].extend(imaging_assessment["significant_findings"])
        
        # Determine overall severity
        if assessment["urgent_findings"]:
            assessment["severity_assessment"] = "urgent"
        elif len(assessment["primary_concerns"]) > 1:
            assessment["severity_assessment"] = "moderate"
        
        return assessment
    
    async def _assess_vital_signs(self, vital_signs: Dict[str, Any]) -> Dict[str, Any]:
        """Assess vital signs for abnormalities"""
        assessment = {
            "normal_findings": [],
            "abnormal_findings": [],
            "severity": "normal"
        }
        
        # Temperature assessment
        temp = vital_signs.get("temperature")
        if temp:
            if temp >= 38.0:  # Celsius
                assessment["abnormal_findings"].append({
                    "parameter": "temperature",
                    "value": temp,
                    "interpretation": "fever",
                    "severity": "moderate" if temp < 39.0 else "high"
                })
            elif temp < 36.0:
                assessment["abnormal_findings"].append({
                    "parameter": "temperature", 
                    "value": temp,
                    "interpretation": "hypothermia",
                    "severity": "moderate"
                })
        
        # Blood pressure assessment
        sbp = vital_signs.get("systolic_bp")
        dbp = vital_signs.get("diastolic_bp")
        if sbp and dbp:
            if sbp < 90 or dbp < 60:
                assessment["abnormal_findings"].append({
                    "parameter": "blood_pressure",
                    "value": f"{sbp}/{dbp}",
                    "interpretation": "hypotension",
                    "severity": "high"
                })
            elif sbp > 180 or dbp > 110:
                assessment["abnormal_findings"].append({
                    "parameter": "blood_pressure",
                    "value": f"{sbp}/{dbp}",
                    "interpretation": "severe_hypertension", 
                    "severity": "high"
                })
        
        # Heart rate assessment
        hr = vital_signs.get("heart_rate")
        if hr:
            if hr > 100:
                assessment["abnormal_findings"].append({
                    "parameter": "heart_rate",
                    "value": hr,
                    "interpretation": "tachycardia",
                    "severity": "moderate" if hr < 120 else "high"
                })
            elif hr < 60:
                assessment["abnormal_findings"].append({
                    "parameter": "heart_rate",
                    "value": hr,
                    "interpretation": "bradycardia",
                    "severity": "moderate"
                })
        
        # Respiratory rate assessment
        rr = vital_signs.get("respiratory_rate")
        if rr:
            if rr > 22:
                assessment["abnormal_findings"].append({
                    "parameter": "respiratory_rate",
                    "value": rr,
                    "interpretation": "tachypnea",
                    "severity": "moderate" if rr < 30 else "high"
                })
        
        # Oxygen saturation
        spo2 = vital_signs.get("oxygen_saturation")
        if spo2:
            if spo2 < 90:
                assessment["abnormal_findings"].append({
                    "parameter": "oxygen_saturation",
                    "value": spo2,
                    "interpretation": "severe_hypoxemia",
                    "severity": "critical"
                })
            elif spo2 < 94:
                assessment["abnormal_findings"].append({
                    "parameter": "oxygen_saturation", 
                    "value": spo2,
                    "interpretation": "hypoxemia",
                    "severity": "high"
                })
        
        # Determine overall severity
        if any(f["severity"] == "critical" for f in assessment["abnormal_findings"]):
            assessment["severity"] = "critical"
        elif any(f["severity"] == "high" for f in assessment["abnormal_findings"]):
            assessment["severity"] = "high"
        elif assessment["abnormal_findings"]:
            assessment["severity"] = "moderate"
        
        return assessment
    
    async def _assess_imaging_findings(self, imaging_results: Dict[str, Any]) -> Dict[str, Any]:
        """Assess imaging results for significant findings"""
        assessment = {
            "significant_findings": [],
            "normal_findings": [],
            "recommendations": []
        }
        
        # Process consolidated findings from image analysis
        consolidated_findings = imaging_results.get("consolidated_findings", [])
        
        for finding in consolidated_findings:
            finding_text = finding.get("finding", "").lower()
            confidence = finding.get("confidence", 0.0)
            
            if confidence > 0.7:  # High confidence findings
                if any(term in finding_text for term in ["pneumonia", "consolidation", "infiltrate"]):
                    assessment["significant_findings"].append({
                        "system": "respiratory",
                        "finding": "pneumonia_pattern",
                        "description": finding.get("finding"),
                        "confidence": confidence,
                        "clinical_significance": "high"
                    })
                
                elif any(term in finding_text for term in ["effusion", "fluid"]):
                    assessment["significant_findings"].append({
                        "system": "respiratory",
                        "finding": "pleural_effusion",
                        "description": finding.get("finding"),
                        "confidence": confidence,
                        "clinical_significance": "moderate"
                    })
                
                elif any(term in finding_text for term in ["cardiomegaly", "enlarged heart"]):
                    assessment["significant_findings"].append({
                        "system": "cardiovascular",
                        "finding": "cardiomegaly",
                        "description": finding.get("finding"),
                        "confidence": confidence,
                        "clinical_significance": "moderate"
                    })
        
        # Generate imaging-based recommendations
        if assessment["significant_findings"]:
            respiratory_findings = [f for f in assessment["significant_findings"] if f["system"] == "respiratory"]
            if respiratory_findings:
                assessment["recommendations"].append("Consider pulmonary function tests and arterial blood gas analysis")
            
            cardiac_findings = [f for f in assessment["significant_findings"] if f["system"] == "cardiovascular"]
            if cardiac_findings:
                assessment["recommendations"].append("Consider echocardiography and ECG")
        
        return assessment
    
    async def _generate_differential_diagnosis(self, clinical_assessment: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate differential diagnosis based on clinical assessment"""
        differential_dx = []
        
        # Analyze primary concerns
        primary_concerns = clinical_assessment.get("primary_concerns", [])
        imaging_assessment = clinical_assessment.get("imaging_assessment", {})
        
        # Respiratory differential
        respiratory_concerns = [c for c in primary_concerns if c.get("system") == "respiratory"]
        if respiratory_concerns:
            # Check for pneumonia patterns
            imaging_findings = imaging_assessment.get("significant_findings", [])
            pneumonia_findings = [f for f in imaging_findings if "pneumonia" in f.get("finding", "")]
            
            if pneumonia_findings:
                differential_dx.append({
                    "diagnosis": "Community-Acquired Pneumonia",
                    "probability": 0.85,
                    "supporting_evidence": [
                        "Respiratory symptoms",
                        "Radiographic consolidation",
                        "Clinical presentation"
                    ],
                    "icd_10": "J18.9",
                    "next_steps": [
                        "Blood cultures",
                        "Sputum culture if productive cough",
                        "Procalcitonin level"
                    ]
                })
            
            differential_dx.append({
                "diagnosis": "Viral Upper Respiratory Infection",
                "probability": 0.6,
                "supporting_evidence": ["Respiratory symptoms"],
                "icd_10": "J06.9",
                "next_steps": ["Supportive care", "Symptom monitoring"]
            })
            
            differential_dx.append({
                "diagnosis": "Asthma Exacerbation",
                "probability": 0.4,
                "supporting_evidence": ["Dyspnea", "Wheezing if present"],
                "icd_10": "J45.9",
                "next_steps": ["Peak flow measurement", "Bronchodilator trial"]
            })
        
        # Cardiovascular differential
        cardiac_concerns = [c for c in primary_concerns if c.get("system") == "cardiovascular"]
        if cardiac_concerns:
            differential_dx.append({
                "diagnosis": "Acute Coronary Syndrome",
                "probability": 0.7,
                "supporting_evidence": ["Chest pain", "Cardiac symptoms"],
                "icd_10": "I20.9",
                "next_steps": ["ECG", "Troponin levels", "Cardiology consultation"]
            })
            
            differential_dx.append({
                "diagnosis": "Heart Failure",
                "probability": 0.5,
                "supporting_evidence": ["Dyspnea", "Possible cardiomegaly"],
                "icd_10": "I50.9",
                "next_steps": ["BNP/NT-proBNP", "Echocardiography", "Chest X-ray"]
            })
        
        # Sort by probability
        differential_dx.sort(key=lambda x: x["probability"], reverse=True)
        
        return differential_dx
    
    async def _generate_treatment_protocols(self, clinical_assessment: Dict[str, Any]) -> Dict[str, Any]:
        """Generate evidence-based treatment protocols"""
        protocols = {
            "immediate_interventions": [],
            "medical_management": [],
            "monitoring_requirements": [],
            "discharge_criteria": []
        }
        
        # Analyze assessment for treatment needs
        primary_concerns = clinical_assessment.get("primary_concerns", [])
        severity = clinical_assessment.get("severity_assessment", "stable")
        urgent_findings = clinical_assessment.get("urgent_findings", [])
        
        # Critical interventions for urgent findings
        if urgent_findings:
            for finding in urgent_findings:
                if finding.get("interpretation") == "severe_hypoxemia":
                    protocols["immediate_interventions"].append({
                        "intervention": "Oxygen Therapy",
                        "details": "High-flow oxygen, target SpO2 >94%",
                        "priority": "immediate",
                        "monitoring": "Continuous pulse oximetry"
                    })
                
                elif finding.get("interpretation") == "hypotension":
                    protocols["immediate_interventions"].append({
                        "intervention": "Fluid Resuscitation",
                        "details": "Normal saline 500ml IV bolus, reassess",
                        "priority": "immediate", 
                        "monitoring": "Blood pressure, urine output"
                    })
        
        # System-specific protocols
        respiratory_concerns = [c for c in primary_concerns if c.get("system") == "respiratory"]
        if respiratory_concerns:
            # Pneumonia protocol
            imaging_assessment = clinical_assessment.get("imaging_assessment", {})
            pneumonia_findings = any("pneumonia" in str(f).lower() for f in imaging_assessment.get("significant_findings", []))
            
            if pneumonia_findings:
                protocols["medical_management"].extend([
                    {
                        "treatment": "Antibiotic Therapy",
                        "details": "Ceftriaxone 1g IV daily + Azithromycin 500mg daily",
                        "duration": "5-7 days",
                        "evidence_level": "Grade A",
                        "monitoring": "Clinical response, temperature, WBC"
                    },
                    {
                        "treatment": "Supportive Care",
                        "details": "Adequate hydration, rest, symptomatic relief",
                        "monitoring": "Fluid balance, symptom improvement"
                    }
                ])
                
                protocols["monitoring_requirements"].extend([
                    "Daily clinical assessment",
                    "Temperature monitoring q4h",
                    "Oxygen saturation monitoring",
                    "Follow-up chest X-ray in 48-72h if not improving"
                ])
                
                protocols["discharge_criteria"] = [
                    "Afebrile for 24 hours",
                    "Stable vital signs",
                    "Improving symptoms",
                    "Tolerating oral intake",
                    "SpO2 >94% on room air"
                ]
        
        return protocols
    
    async def _perform_risk_stratification(self, clinical_data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform comprehensive risk stratification"""
        risk_assessment = {
            "overall_risk": "low",
            "risk_factors": [],
            "risk_scores": {},
            "interventions": []
        }
        
        # Extract patient demographics and history
        patient_age = clinical_data.get("patient_age", 0)
        medical_history = clinical_data.get("medical_history", {})
        vital_signs = clinical_data.get("vital_signs", {})
        
        # Calculate risk scores
        if vital_signs:
            # qSOFA score for sepsis risk
            qsofa_score = await self._calculate_qsofa_score(vital_signs, clinical_data)
            risk_assessment["risk_scores"]["qSOFA"] = qsofa_score
            
            if qsofa_score["score"] >= 2:
                risk_assessment["overall_risk"] = "high"
                risk_assessment["risk_factors"].append("High sepsis risk (qSOFA ≥2)")
                risk_assessment["interventions"].append("Consider sepsis workup and early antibiotics")
        
        # Age-based risk
        if patient_age >= 65:
            risk_assessment["risk_factors"].append("Advanced age (≥65 years)")
            if risk_assessment["overall_risk"] == "low":
                risk_assessment["overall_risk"] = "moderate"
        
        # Comorbidity-based risk
        if medical_history:
            high_risk_conditions = ["diabetes", "copd", "heart_failure", "renal_failure", "immunocompromised"]
            for condition in high_risk_conditions:
                if condition in str(medical_history).lower():
                    risk_assessment["risk_factors"].append(f"History of {condition}")
                    risk_assessment["overall_risk"] = "high"
        
        return risk_assessment
    
    async def _calculate_qsofa_score(self, vital_signs: Dict[str, Any], clinical_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate qSOFA score for sepsis screening"""
        score = 0
        criteria = []
        
        # Altered mental status (simplified assessment)
        symptoms = clinical_data.get("symptoms", [])
        if any("confusion" in str(s).lower() or "altered" in str(s).lower() for s in symptoms):
            score += 1
            criteria.append("Altered mental status")
        
        # Systolic blood pressure ≤100 mmHg
        sbp = vital_signs.get("systolic_bp")
        if sbp and sbp <= 100:
            score += 1
            criteria.append(f"Systolic BP ≤100 ({sbp})")
        
        # Respiratory rate ≥22/min
        rr = vital_signs.get("respiratory_rate")
        if rr and rr >= 22:
            score += 1
            criteria.append(f"Respiratory rate ≥22 ({rr})")
        
        interpretation = "Low risk"
        if score >= 2:
            interpretation = "High risk - Consider sepsis workup"
        elif score == 1:
            interpretation = "Moderate risk - Monitor closely"
        
        return {
            "score": score,
            "criteria_met": criteria,
            "interpretation": interpretation,
            "max_score": 3
        }
    
    async def _generate_monitoring_plan(self, clinical_assessment: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive monitoring plan"""
        monitoring_plan = {
            "vital_signs": {
                "frequency": "q4h",
                "parameters": ["temperature", "blood_pressure", "heart_rate", "respiratory_rate", "oxygen_saturation"],
                "alert_criteria": {
                    "temperature": ">38.5°C or <36°C",
                    "systolic_bp": "<90 or >180 mmHg",
                    "heart_rate": "<50 or >120 bpm",
                    "respiratory_rate": ">24 or <10/min",
                    "oxygen_saturation": "<94%"
                }
            },
            "clinical_assessments": {
                "frequency": "q8h",
                "components": [
                    "Neurological status",
                    "Respiratory effort",
                    "Cardiovascular status", 
                    "Fluid balance",
                    "Pain assessment"
                ]
            },
            "laboratory_monitoring": [],
            "imaging_monitoring": [],
            "escalation_criteria": []
        }
        
        # Customize based on clinical assessment
        severity = clinical_assessment.get("severity_assessment", "stable")
        primary_concerns = clinical_assessment.get("primary_concerns", [])
        
        if severity == "urgent":
            monitoring_plan["vital_signs"]["frequency"] = "q1h"
            monitoring_plan["clinical_assessments"]["frequency"] = "q4h"
        
        # Respiratory monitoring
        respiratory_concerns = [c for c in primary_concerns if c.get("system") == "respiratory"]
        if respiratory_concerns:
            monitoring_plan["laboratory_monitoring"].extend([
                "Arterial blood gas if hypoxemic",
                "Complete blood count daily",
                "Procalcitonin trending"
            ])
            
            monitoring_plan["imaging_monitoring"].append(
                "Chest X-ray in 48-72h if not improving clinically"
            )
            
            monitoring_plan["escalation_criteria"].extend([
                "Worsening hypoxemia despite oxygen therapy",
                "Increasing respiratory distress",
                "Development of septic shock"
            ])
        
        # Cardiovascular monitoring
        cardiac_concerns = [c for c in primary_concerns if c.get("system") == "cardiovascular"]
        if cardiac_concerns:
            monitoring_plan["laboratory_monitoring"].extend([
                "Troponin levels q6h x3 if chest pain",
                "BNP if heart failure suspected",
                "Electrolytes daily"
            ])
            
            monitoring_plan["escalation_criteria"].extend([
                "Chest pain not responding to treatment",
                "Hemodynamic instability", 
                "New arrhythmias"
            ])
        
        return monitoring_plan
    
    async def _generate_clinical_safety_alerts(self, clinical_data: Dict[str, Any], clinical_assessment: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate critical safety alerts"""
        alerts = []
        
        # Check for critical vital signs
        vital_signs = clinical_data.get("vital_signs", {})
        if vital_signs:
            vitals_assessment = clinical_assessment.get("vital_signs_assessment", {})
            critical_findings = [f for f in vitals_assessment.get("abnormal_findings", []) if f.get("severity") == "critical"]
            
            for finding in critical_findings:
                alerts.append({
                    "level": "critical",
                    "category": "vital_signs",
                    "message": f"Critical vital sign abnormality: {finding['interpretation']}",
                    "parameter": finding["parameter"],
                    "value": finding["value"],
                    "action_required": "Immediate intervention required",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
        
        # Check for sepsis risk
        urgent_findings = clinical_assessment.get("urgent_findings", [])
        if len(urgent_findings) >= 2:
            alerts.append({
                "level": "high",
                "category": "sepsis_risk",
                "message": "Multiple organ system dysfunction - consider sepsis",
                "action_required": "Consider sepsis workup and empirical antibiotics",
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        
        # Check for respiratory failure risk
        primary_concerns = clinical_assessment.get("primary_concerns", [])
        respiratory_concerns = [c for c in primary_concerns if c.get("system") == "respiratory"]
        if respiratory_concerns and vital_signs.get("oxygen_saturation", 100) < 90:
            alerts.append({
                "level": "high",
                "category": "respiratory_failure",
                "message": "Severe hypoxemia with respiratory symptoms",
                "action_required": "Consider high-flow oxygen or non-invasive ventilation",
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        
        return alerts
    
    async def _calculate_quality_metrics(self, recommendations: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate quality metrics for clinical recommendations"""
        quality_metrics = {
            "completeness_score": 0.0,
            "evidence_grade": "insufficient",
            "guideline_adherence": 0.0,
            "safety_check_score": 0.0,
            "overall_quality": 0.0
        }
        
        # Completeness assessment
        required_components = ["clinical_assessment", "differential_diagnosis", "treatment_protocols", "monitoring_plan"]
        completed_components = sum(1 for comp in required_components if comp in recommendations)
        quality_metrics["completeness_score"] = completed_components / len(required_components)
        
        # Evidence grading (simplified)
        treatment_protocols = recommendations.get("treatment_protocols", {})
        medical_management = treatment_protocols.get("medical_management", [])
        
        if medical_management:
            evidence_levels = [treatment.get("evidence_level", "") for treatment in medical_management]
            if any("Grade A" in level for level in evidence_levels):
                quality_metrics["evidence_grade"] = "high"
            elif any("Grade B" in level for level in evidence_levels):
                quality_metrics["evidence_grade"] = "moderate"
            else:
                quality_metrics["evidence_grade"] = "low"
        
        # Safety check score
        safety_alerts = recommendations.get("safety_alerts", [])
        critical_alerts = [alert for alert in safety_alerts if alert.get("level") == "critical"]
        
        if not critical_alerts:
            quality_metrics["safety_check_score"] = 1.0
        else:
            quality_metrics["safety_check_score"] = max(0.0, 1.0 - len(critical_alerts) * 0.2)
        
        # Overall quality score
        quality_metrics["overall_quality"] = np.mean([
            quality_metrics["completeness_score"],
            0.8 if quality_metrics["evidence_grade"] == "high" else 0.6 if quality_metrics["evidence_grade"] == "moderate" else 0.4,
            quality_metrics["safety_check_score"]
        ])
        
        return quality_metrics
    
    # Risk calculator methods
    async def _calculate_framingham_risk(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate Framingham cardiovascular risk score"""
        # Simplified implementation - real version would use full Framingham equation
        risk_factors = 0
        
        age = patient_data.get("age", 0)
        if age >= 65:
            risk_factors += 2
        elif age >= 55:
            risk_factors += 1
        
        # Additional risk factors would be calculated here
        
        return {
            "score": risk_factors,
            "10_year_risk": min(risk_factors * 5, 30),  # Simplified
            "risk_category": "low" if risk_factors < 2 else "moderate" if risk_factors < 4 else "high"
        }
    
    async def _calculate_ascvd_risk(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate ASCVD risk score"""
        # Simplified implementation
        return {
            "10_year_risk": 7.5,  # Placeholder
            "risk_category": "borderline"
        }
    
    async def _calculate_revised_cardiac_risk(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate Revised Cardiac Risk Index"""
        # Simplified implementation
        return {
            "score": 1,
            "risk_category": "low"
        }
    
    async def _assess_asa_status(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Assess ASA Physical Status"""
        # Simplified implementation
        return {
            "asa_class": "II",
            "description": "Mild systemic disease"
        }
    
    async def _calculate_apache_ii(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate APACHE II score"""
        # Simplified implementation
        return {
            "score": 15,
            "mortality_risk": "moderate"
        }
    
    async def _calculate_sofa_score(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate SOFA score"""
        # Simplified implementation
        return {
            "score": 3,
            "organ_dysfunction": "mild"
        }