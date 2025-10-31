"""
Precision Medicine Agent
Advanced AI agent for personalized medicine and genomic analysis
Integrates genomics, pharmacogenomics, and biomarker data for personalized care
"""

import logging
import asyncio
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
import json
import numpy as np
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)

class PrecisionMedicineAgent:
    """
    Advanced Precision Medicine AI Agent
    
    Capabilities:
    - Genomic variant analysis and interpretation
    - Pharmacogenomic recommendations
    - Biomarker-based therapy selection
    - Personalized risk assessment
    - Targeted therapy optimization
    - Companion diagnostics integration
    """
    
    def __init__(self, mongodb_client: AsyncIOMotorClient, redis_client, settings):
        self.mongodb = mongodb_client
        self.redis = redis_client
        self.settings = settings
        self.db = mongodb_client[settings.MONGODB_DATABASE]
        
        # Genomic databases and knowledge bases
        self.genomic_variants = {}
        self.pharmacogenomic_data = {}
        self.biomarker_databases = {}
        self.drug_gene_interactions = {}
        
        # Initialize precision medicine knowledge base
        asyncio.create_task(self._initialize_precision_medicine_knowledge())
        
        logger.info("🧬 Precision Medicine Agent initialized")
    
    async def _initialize_precision_medicine_knowledge(self):
        """Initialize precision medicine knowledge bases"""
        try:
            # Pharmacogenomic data (simplified - real implementation would use PharmGKB, ClinVar, etc.)
            self.pharmacogenomic_data = {
                "CYP2D6": {
                    "*1/*1": {  # Normal metabolizer
                        "phenotype": "Normal Metabolizer",
                        "medications": {
                            "codeine": {"recommendation": "Standard dosing", "evidence": "Strong"},
                            "tamoxifen": {"recommendation": "Standard dosing", "evidence": "Strong"},
                            "metoprolol": {"recommendation": "Standard dosing", "evidence": "Moderate"}
                        }
                    },
                    "*4/*4": {  # Poor metabolizer
                        "phenotype": "Poor Metabolizer",
                        "medications": {
                            "codeine": {"recommendation": "Avoid - no analgesic effect", "evidence": "Strong"},
                            "tamoxifen": {"recommendation": "Alternative therapy", "evidence": "Strong"},
                            "metoprolol": {"recommendation": "Reduce dose by 50%", "evidence": "Moderate"}
                        }
                    }
                },
                "CYP2C19": {
                    "*1/*1": {  # Extensive metabolizer
                        "phenotype": "Extensive Metabolizer", 
                        "medications": {
                            "clopidogrel": {"recommendation": "Standard dosing", "evidence": "Strong"},
                            "omeprazole": {"recommendation": "Standard dosing", "evidence": "Moderate"}
                        }
                    },
                    "*2/*2": {  # Poor metabolizer
                        "phenotype": "Poor Metabolizer",
                        "medications": {
                            "clopidogrel": {"recommendation": "Alternative antiplatelet", "evidence": "Strong"},
                            "omeprazole": {"recommendation": "Reduce dose", "evidence": "Moderate"}
                        }
                    }
                },
                "TPMT": {
                    "normal": {
                        "phenotype": "Normal Activity",
                        "medications": {
                            "azathioprine": {"recommendation": "Standard dosing", "evidence": "Strong"},
                            "mercaptopurine": {"recommendation": "Standard dosing", "evidence": "Strong"}
                        }
                    },
                    "deficient": {
                        "phenotype": "Deficient Activity",
                        "medications": {
                            "azathioprine": {"recommendation": "Reduce dose by 90%", "evidence": "Strong"},
                            "mercaptopurine": {"recommendation": "Reduce dose by 90%", "evidence": "Strong"}
                        }
                    }
                }
            }
            
            # Biomarker databases
            self.biomarker_databases = {
                "cancer_biomarkers": {
                    "HER2": {
                        "positive": {
                            "therapies": ["Trastuzumab", "Pertuzumab", "T-DM1"],
                            "cancer_types": ["Breast", "Gastric"],
                            "evidence_level": "FDA Approved"
                        }
                    },
                    "EGFR": {
                        "L858R": {
                            "therapies": ["Erlotinib", "Gefitinib", "Osimertinib"],
                            "cancer_types": ["Non-small cell lung cancer"],
                            "evidence_level": "FDA Approved"
                        },
                        "T790M": {
                            "therapies": ["Osimertinib"],
                            "cancer_types": ["Non-small cell lung cancer"],
                            "evidence_level": "FDA Approved",
                            "resistance_mechanism": "Secondary mutation"
                        }
                    },
                    "BRCA1/2": {
                        "pathogenic_variant": {
                            "therapies": ["PARP inhibitors (Olaparib, Rucaparib)"],
                            "cancer_types": ["Breast", "Ovarian", "Prostate"],
                            "evidence_level": "FDA Approved"
                        }
                    },
                    "PD-L1": {
                        "high_expression": {
                            "therapies": ["Pembrolizumab", "Nivolumab", "Atezolizumab"],
                            "cancer_types": ["Multiple"],
                            "evidence_level": "FDA Approved"
                        }
                    }
                },
                "cardiovascular_biomarkers": {
                    "APOE": {
                        "e4/e4": {
                            "risk_factors": ["Alzheimer's disease", "Cardiovascular disease"],
                            "recommendations": ["Intensive lipid management", "Cognitive monitoring"]
                        }
                    },
                    "LDLR": {
                        "pathogenic_variant": {
                            "condition": "Familial hypercholesterolemia",
                            "therapies": ["High-intensity statins", "PCSK9 inhibitors"],
                            "monitoring": "Lipid panel q3months"
                        }
                    }
                }
            }
            
            # Drug-gene interaction matrix
            self.drug_gene_interactions = {
                "warfarin": {
                    "genes": ["CYP2C9", "VKORC1"],
                    "dosing_algorithm": "IWPC algorithm",
                    "evidence_level": "Strong"
                },
                "abacavir": {
                    "genes": ["HLA-B*5701"],
                    "recommendation": "Screen before prescribing",
                    "evidence_level": "Strong"
                },
                "carbamazepine": {
                    "genes": ["HLA-B*1502"],
                    "recommendation": "Screen in Asian populations",
                    "evidence_level": "Strong"
                }
            }
            
            logger.info("✅ Precision medicine knowledge base initialized")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize precision medicine knowledge: {e}")
    
    async def generate_precision_recommendations(
        self,
        patient_data: Dict[str, Any],
        include_genomic_analysis: bool = True,
        include_biomarker_analysis: bool = True,
        include_personalized_therapy: bool = True,
        include_pharmacogenomics: bool = True
    ) -> Dict[str, Any]:
        """
        Generate comprehensive precision medicine recommendations
        """
        try:
            recommendations = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "patient_id": patient_data.get("patient_id", "unknown"),
                "analysis_type": "precision_medicine",
                "recommendations": []
            }
            
            # Genomic analysis
            if include_genomic_analysis:
                genomic_results = await self._analyze_genomic_data(patient_data)
                recommendations["genomic_analysis"] = genomic_results
            
            # Biomarker analysis
            if include_biomarker_analysis:
                biomarker_results = await self._analyze_biomarkers(patient_data)
                recommendations["biomarker_analysis"] = biomarker_results
            
            # Pharmacogenomic recommendations
            if include_pharmacogenomics:
                pharmacogenomic_results = await self._generate_pharmacogenomic_recommendations(patient_data)
                recommendations["pharmacogenomics"] = pharmacogenomic_results
            
            # Personalized therapy recommendations
            if include_personalized_therapy:
                therapy_results = await self._generate_personalized_therapy_recommendations(
                    patient_data, recommendations
                )
                recommendations["personalized_therapy"] = therapy_results
            
            # Risk stratification based on genetic factors
            risk_assessment = await self._perform_genetic_risk_assessment(patient_data, recommendations)
            recommendations["genetic_risk_assessment"] = risk_assessment
            
            # Clinical trial matching
            trial_matching = await self._match_clinical_trials(patient_data, recommendations)
            recommendations["clinical_trial_matching"] = trial_matching
            
            # Generate actionable insights
            actionable_insights = await self._generate_actionable_insights(recommendations)
            recommendations["actionable_insights"] = actionable_insights
            
            return recommendations
            
        except Exception as e:
            logger.error(f"❌ Precision medicine recommendations failed: {e}")
            return {"error": str(e)}
    
    async def _analyze_genomic_data(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze genomic variants for clinical significance"""
        
        genomic_analysis = {
            "variants_analyzed": 0,
            "pathogenic_variants": [],
            "pharmacogenomic_variants": [],
            "risk_variants": [],
            "recommendations": []
        }
        
        # Extract genomic data (in real implementation, this would parse VCF files, etc.)
        genomic_data = patient_data.get("genomic_data", {})
        
        if not genomic_data:
            # Simulate genomic analysis for demo
            genomic_analysis["simulated_analysis"] = True
            genomic_analysis["variants_analyzed"] = 150000  # Typical WES variant count
            
            # Simulate finding some variants of interest
            genomic_analysis["pharmacogenomic_variants"] = [
                {
                    "gene": "CYP2D6",
                    "variant": "*1/*4",
                    "phenotype": "Intermediate Metabolizer",
                    "clinical_significance": "Pharmacogenomic",
                    "medications_affected": ["codeine", "tamoxifen", "metoprolol"]
                },
                {
                    "gene": "CYP2C19", 
                    "variant": "*1/*2",
                    "phenotype": "Intermediate Metabolizer",
                    "clinical_significance": "Pharmacogenomic",
                    "medications_affected": ["clopidogrel", "omeprazole"]
                }
            ]
            
            genomic_analysis["risk_variants"] = [
                {
                    "gene": "APOE",
                    "variant": "e3/e4",
                    "condition": "Alzheimer's disease risk",
                    "risk_increase": "2-3x increased risk",
                    "recommendations": ["Cognitive monitoring", "Lifestyle interventions"]
                }
            ]
            
            genomic_analysis["recommendations"].extend([
                "Consider pharmacogenomic testing for precision dosing",
                "Genetic counseling for identified risk variants",
                "Family screening may be appropriate"
            ])
        
        else:
            # Process actual genomic data
            variants = genomic_data.get("variants", [])
            genomic_analysis["variants_analyzed"] = len(variants)
            
            for variant in variants:
                # Classify variant significance
                clinical_significance = variant.get("clinical_significance", "unknown")
                
                if clinical_significance in ["pathogenic", "likely_pathogenic"]:
                    genomic_analysis["pathogenic_variants"].append({
                        "gene": variant.get("gene"),
                        "variant": variant.get("variant_id"),
                        "clinical_significance": clinical_significance,
                        "condition": variant.get("associated_condition"),
                        "evidence_level": variant.get("evidence_level", "unknown")
                    })
                
                # Check for pharmacogenomic relevance
                gene = variant.get("gene", "")
                if gene in self.pharmacogenomic_data:
                    genomic_analysis["pharmacogenomic_variants"].append({
                        "gene": gene,
                        "variant": variant.get("variant_id"),
                        "phenotype": variant.get("predicted_phenotype"),
                        "clinical_significance": "Pharmacogenomic"
                    })
        
        return genomic_analysis
    
    async def _analyze_biomarkers(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze biomarkers for therapeutic targeting"""
        
        biomarker_analysis = {
            "biomarkers_tested": [],
            "therapeutic_targets": [],
            "companion_diagnostics": [],
            "recommendations": []
        }
        
        # Extract biomarker data
        biomarkers = patient_data.get("biomarkers", {})
        cancer_type = patient_data.get("cancer_type", "")
        
        if biomarkers:
            for biomarker, result in biomarkers.items():
                biomarker_analysis["biomarkers_tested"].append({
                    "biomarker": biomarker,
                    "result": result,
                    "method": "IHC/NGS"  # Simplified
                })
                
                # Check for therapeutic relevance
                if biomarker in self.biomarker_databases.get("cancer_biomarkers", {}):
                    biomarker_data = self.biomarker_databases["cancer_biomarkers"][biomarker]
                    
                    if str(result).lower() in biomarker_data:
                        target_data = biomarker_data[str(result).lower()]
                        
                        if cancer_type.lower() in [ct.lower() for ct in target_data.get("cancer_types", [])]:
                            biomarker_analysis["therapeutic_targets"].append({
                                "biomarker": biomarker,
                                "status": result,
                                "targeted_therapies": target_data.get("therapies", []),
                                "evidence_level": target_data.get("evidence_level"),
                                "cancer_type": cancer_type
                            })
        
        else:
            # Simulate biomarker analysis for common cancer scenarios
            if cancer_type.lower() in ["breast", "breast cancer"]:
                biomarker_analysis["biomarkers_tested"] = [
                    {"biomarker": "HER2", "result": "positive", "method": "IHC/FISH"},
                    {"biomarker": "ER", "result": "positive", "method": "IHC"},
                    {"biomarker": "PR", "result": "positive", "method": "IHC"}
                ]
                
                biomarker_analysis["therapeutic_targets"].append({
                    "biomarker": "HER2",
                    "status": "positive",
                    "targeted_therapies": ["Trastuzumab", "Pertuzumab", "T-DM1"],
                    "evidence_level": "FDA Approved",
                    "cancer_type": "Breast Cancer"
                })
            
            elif cancer_type.lower() in ["lung", "lung cancer", "nsclc"]:
                biomarker_analysis["biomarkers_tested"] = [
                    {"biomarker": "EGFR", "result": "L858R mutation", "method": "NGS"},
                    {"biomarker": "PD-L1", "result": "50% expression", "method": "IHC"}
                ]
                
                biomarker_analysis["therapeutic_targets"].extend([
                    {
                        "biomarker": "EGFR",
                        "status": "L858R mutation",
                        "targeted_therapies": ["Erlotinib", "Gefitinib", "Osimertinib"],
                        "evidence_level": "FDA Approved",
                        "cancer_type": "NSCLC"
                    },
                    {
                        "biomarker": "PD-L1",
                        "status": "high expression",
                        "targeted_therapies": ["Pembrolizumab"],
                        "evidence_level": "FDA Approved", 
                        "cancer_type": "NSCLC"
                    }
                ])
        
        # Generate companion diagnostic recommendations
        for target in biomarker_analysis["therapeutic_targets"]:
            biomarker_analysis["companion_diagnostics"].append({
                "test": f"{target['biomarker']} testing",
                "indication": f"Required for {target['targeted_therapies'][0]} therapy",
                "frequency": "Before treatment initiation"
            })
        
        return biomarker_analysis
    
    async def _generate_pharmacogenomic_recommendations(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate pharmacogenomic-based dosing and drug selection recommendations"""
        
        pharmacogenomic_recommendations = {
            "tested_genes": [],
            "drug_recommendations": [],
            "dosing_adjustments": [],
            "drug_alternatives": [],
            "monitoring_recommendations": []
        }
        
        # Extract genomic and medication data
        genomic_data = patient_data.get("genomic_data", {})
        current_medications = patient_data.get("medications", [])
        
        # Process pharmacogenomic variants
        for gene, variants in self.pharmacogenomic_data.items():
            pharmacogenomic_recommendations["tested_genes"].append(gene)
            
            # Simulate genotype (in real implementation, would get from genomic data)
            if gene == "CYP2D6":
                genotype = "*1/*4"  # Intermediate metabolizer
            elif gene == "CYP2C19":
                genotype = "*1/*2"  # Intermediate metabolizer
            else:
                genotype = "normal"
            
            if genotype in variants:
                variant_data = variants[genotype]
                phenotype = variant_data["phenotype"]
                
                # Check current medications
                for medication in current_medications:
                    med_name = medication.get("name", "").lower()
                    
                    for pg_drug, pg_data in variant_data["medications"].items():
                        if pg_drug.lower() in med_name:
                            if "reduce" in pg_data["recommendation"].lower():
                                pharmacogenomic_recommendations["dosing_adjustments"].append({
                                    "medication": med_name,
                                    "gene": gene,
                                    "genotype": genotype,
                                    "phenotype": phenotype,
                                    "recommendation": pg_data["recommendation"],
                                    "evidence_level": pg_data["evidence"]
                                })
                            elif "avoid" in pg_data["recommendation"].lower() or "alternative" in pg_data["recommendation"].lower():
                                pharmacogenomic_recommendations["drug_alternatives"].append({
                                    "medication": med_name,
                                    "gene": gene,
                                    "genotype": genotype,
                                    "phenotype": phenotype,
                                    "recommendation": pg_data["recommendation"],
                                    "evidence_level": pg_data["evidence"]
                                })
                
                # General drug recommendations for this phenotype
                for drug, drug_data in variant_data["medications"].items():
                    pharmacogenomic_recommendations["drug_recommendations"].append({
                        "drug": drug,
                        "gene": gene,
                        "genotype": genotype,
                        "phenotype": phenotype,
                        "recommendation": drug_data["recommendation"],
                        "evidence_level": drug_data["evidence"]
                    })
        
        # Monitoring recommendations
        if pharmacogenomic_recommendations["dosing_adjustments"]:
            pharmacogenomic_recommendations["monitoring_recommendations"].extend([
                "Close monitoring during dose titration",
                "Consider therapeutic drug monitoring if available",
                "Monitor for efficacy and toxicity"
            ])
        
        if pharmacogenomic_recommendations["drug_alternatives"]:
            pharmacogenomic_recommendations["monitoring_recommendations"].extend([
                "Consider alternative medications as recommended",
                "Genetic counseling regarding medication risks"
            ])
        
        return pharmacogenomic_recommendations
    
    async def _generate_personalized_therapy_recommendations(self, patient_data: Dict[str, Any], analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized therapy recommendations based on all precision medicine data"""
        
        therapy_recommendations = {
            "primary_recommendations": [],
            "alternative_therapies": [],
            "combination_strategies": [],
            "monitoring_plan": [],
            "contraindications": []
        }
        
        # Extract analysis results
        biomarker_analysis = analysis_results.get("biomarker_analysis", {})
        pharmacogenomics = analysis_results.get("pharmacogenomics", {})
        
        # Primary therapy recommendations based on biomarkers
        therapeutic_targets = biomarker_analysis.get("therapeutic_targets", [])
        for target in therapeutic_targets:
            therapy_recommendations["primary_recommendations"].append({
                "therapy_class": "Targeted Therapy",
                "medications": target["targeted_therapies"],
                "indication": f"{target['biomarker']} {target['status']}",
                "evidence_level": target["evidence_level"],
                "expected_response_rate": self._get_response_rate(target),
                "monitoring_requirements": [
                    "Response assessment q6-8 weeks",
                    "Toxicity monitoring",
                    "Resistance monitoring"
                ]
            })
        
        # Consider pharmacogenomic factors
        drug_alternatives = pharmacogenomics.get("drug_alternatives", [])
        for alternative in drug_alternatives:
            therapy_recommendations["contraindications"].append({
                "medication": alternative["medication"],
                "reason": f"Pharmacogenomic risk: {alternative['phenotype']}",
                "alternative": "Consider alternative agents",
                "evidence": alternative["evidence_level"]
            })
        
        # Combination therapy strategies
        if len(therapeutic_targets) > 1:
            therapy_recommendations["combination_strategies"].append({
                "strategy": "Multi-target approach",
                "rationale": "Multiple actionable targets identified",
                "considerations": [
                    "Sequential therapy may be preferred",
                    "Monitor for cumulative toxicities",
                    "Consider drug interactions"
                ]
            })
        
        # Immunotherapy considerations
        cancer_type = patient_data.get("cancer_type", "")
        if cancer_type:
            immunotherapy_rec = await self._assess_immunotherapy_eligibility(patient_data, analysis_results)
            if immunotherapy_rec:
                therapy_recommendations["primary_recommendations"].append(immunotherapy_rec)
        
        return therapy_recommendations
    
    async def _perform_genetic_risk_assessment(self, patient_data: Dict[str, Any], analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """Perform comprehensive genetic risk assessment"""
        
        risk_assessment = {
            "hereditary_cancer_risk": {},
            "cardiovascular_genetic_risk": {},
            "pharmacogenomic_risks": {},
            "family_screening_recommendations": [],
            "prevention_strategies": []
        }
        
        # Assess hereditary cancer risk
        genomic_analysis = analysis_results.get("genomic_analysis", {})
        pathogenic_variants = genomic_analysis.get("pathogenic_variants", [])
        
        for variant in pathogenic_variants:
            gene = variant.get("gene", "")
            condition = variant.get("condition", "")
            
            if "cancer" in condition.lower():
                risk_assessment["hereditary_cancer_risk"][gene] = {
                    "variant": variant.get("variant"),
                    "condition": condition,
                    "lifetime_risk": self._get_lifetime_risk(gene, condition),
                    "screening_recommendations": self._get_screening_recommendations(gene, condition),
                    "prevention_options": self._get_prevention_options(gene, condition)
                }
        
        # Assess pharmacogenomic risks
        pharmacogenomics = analysis_results.get("pharmacogenomics", {})
        drug_alternatives = pharmacogenomics.get("drug_alternatives", [])
        
        for alternative in drug_alternatives:
            gene = alternative.get("gene")
            medication = alternative.get("medication")
            
            risk_assessment["pharmacogenomic_risks"][f"{gene}_{medication}"] = {
                "gene": gene,
                "medication": medication,
                "risk_type": "Therapeutic failure or toxicity",
                "phenotype": alternative.get("phenotype"),
                "management": alternative.get("recommendation")
            }
        
        # Family screening recommendations
        if pathogenic_variants:
            risk_assessment["family_screening_recommendations"] = [
                "Genetic counseling for patient and family",
                "Consider cascade screening for first-degree relatives",
                "Family history reassessment",
                "Reproductive counseling if appropriate"
            ]
        
        return risk_assessment
    
    async def _match_clinical_trials(self, patient_data: Dict[str, Any], analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """Match patient to relevant clinical trials based on precision medicine data"""
        
        trial_matching = {
            "matched_trials": [],
            "biomarker_based_trials": [],
            "genomic_based_trials": [],
            "recommendations": []
        }
        
        # Extract relevant data
        cancer_type = patient_data.get("cancer_type", "")
        biomarker_analysis = analysis_results.get("biomarker_analysis", {})
        genomic_analysis = analysis_results.get("genomic_analysis", {})
        
        # Biomarker-based trial matching
        therapeutic_targets = biomarker_analysis.get("therapeutic_targets", [])
        for target in therapeutic_targets:
            biomarker = target.get("biomarker")
            status = target.get("status")
            
            # Simulate trial matching (in real implementation, would query ClinicalTrials.gov API)
            if biomarker == "HER2" and "positive" in str(status):
                trial_matching["biomarker_based_trials"].append({
                    "trial_id": "NCT12345678",
                    "title": "Phase III Trial of Novel HER2-Targeted Therapy",
                    "phase": "Phase III",
                    "biomarker_requirement": "HER2-positive",
                    "cancer_types": ["Breast Cancer"],
                    "status": "Recruiting",
                    "eligibility_score": 0.85
                })
        
        # Genomic-based trial matching
        pharmacogenomic_variants = genomic_analysis.get("pharmacogenomic_variants", [])
        for variant in pharmacogenomic_variants:
            gene = variant.get("gene")
            
            if gene in ["BRCA1", "BRCA2"]:
                trial_matching["genomic_based_trials"].append({
                    "trial_id": "NCT87654321",
                    "title": "PARP Inhibitor Trial for BRCA-mutated Cancers",
                    "phase": "Phase II",
                    "genomic_requirement": f"{gene} mutation",
                    "cancer_types": ["Breast", "Ovarian", "Prostate"],
                    "status": "Recruiting",
                    "eligibility_score": 0.90
                })
        
        # Combine and rank trials
        all_trials = trial_matching["biomarker_based_trials"] + trial_matching["genomic_based_trials"]
        trial_matching["matched_trials"] = sorted(all_trials, key=lambda x: x.get("eligibility_score", 0), reverse=True)
        
        # Recommendations
        if trial_matching["matched_trials"]:
            trial_matching["recommendations"] = [
                "Consider enrollment in precision medicine clinical trials",
                "Discuss trial options with oncologist",
                "Review eligibility criteria with research coordinator"
            ]
        else:
            trial_matching["recommendations"] = [
                "No precision medicine trials currently matched",
                "Continue monitoring for new trial opportunities",
                "Consider expanded access programs if appropriate"
            ]
        
        return trial_matching
    
    async def _generate_actionable_insights(self, recommendations: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate prioritized actionable insights from all precision medicine data"""
        
        insights = []
        
        # High-priority therapeutic recommendations
        personalized_therapy = recommendations.get("personalized_therapy", {})
        primary_recommendations = personalized_therapy.get("primary_recommendations", [])
        
        for rec in primary_recommendations:
            if rec.get("evidence_level") == "FDA Approved":
                insights.append({
                    "priority": "high",
                    "category": "therapeutic",
                    "title": f"FDA-approved targeted therapy available",
                    "description": f"Consider {', '.join(rec['medications'])} based on {rec['indication']}",
                    "action_required": "Discuss with oncologist",
                    "timeline": "Immediate",
                    "evidence_level": rec["evidence_level"]
                })
        
        # Pharmacogenomic safety alerts
        pharmacogenomics = recommendations.get("pharmacogenomics", {})
        drug_alternatives = pharmacogenomics.get("drug_alternatives", [])
        
        for alternative in drug_alternatives:
            if alternative.get("evidence_level") == "Strong":
                insights.append({
                    "priority": "high",
                    "category": "safety",
                    "title": f"Pharmacogenomic safety concern identified",
                    "description": f"Avoid {alternative['medication']} due to {alternative['phenotype']}",
                    "action_required": "Medication review",
                    "timeline": "Before next dose",
                    "evidence_level": alternative["evidence_level"]
                })
        
        # Genetic risk insights
        genetic_risk = recommendations.get("genetic_risk_assessment", {})
        hereditary_cancer_risk = genetic_risk.get("hereditary_cancer_risk", {})
        
        for gene, risk_data in hereditary_cancer_risk.items():
            insights.append({
                "priority": "medium",
                "category": "prevention",
                "title": f"Hereditary cancer risk identified",
                "description": f"{gene} variant increases {risk_data['condition']} risk",
                "action_required": "Enhanced screening protocol",
                "timeline": "Within 3 months",
                "evidence_level": "Clinical Guidelines"
            })
        
        # Clinical trial opportunities
        clinical_trials = recommendations.get("clinical_trial_matching", {})
        matched_trials = clinical_trials.get("matched_trials", [])
        
        high_match_trials = [trial for trial in matched_trials if trial.get("eligibility_score", 0) > 0.8]
        if high_match_trials:
            insights.append({
                "priority": "medium",
                "category": "research",
                "title": f"High-match clinical trial available",
                "description": f"{len(high_match_trials)} precision medicine trial(s) identified",
                "action_required": "Clinical trial consultation",
                "timeline": "Within 2 weeks",
                "evidence_level": "Research Opportunity"
            })
        
        # Sort insights by priority
        priority_order = {"high": 3, "medium": 2, "low": 1}
        insights.sort(key=lambda x: priority_order.get(x["priority"], 0), reverse=True)
        
        return insights
    
    # Helper methods for data lookups
    def _get_response_rate(self, target: Dict[str, Any]) -> str:
        """Get expected response rate for targeted therapy"""
        biomarker = target.get("biomarker", "")
        
        response_rates = {
            "HER2": "60-80%",
            "EGFR": "70-85%", 
            "BRCA1/2": "40-60%",
            "PD-L1": "20-45%"
        }
        
        return response_rates.get(biomarker, "Variable")
    
    def _get_lifetime_risk(self, gene: str, condition: str) -> str:
        """Get lifetime risk for hereditary conditions"""
        risk_data = {
            "BRCA1": {"breast_cancer": "55-72%", "ovarian_cancer": "39-44%"},
            "BRCA2": {"breast_cancer": "45-69%", "ovarian_cancer": "11-17%"},
            "MLH1": {"colorectal_cancer": "52-82%"},
            "MSH2": {"colorectal_cancer": "52-82%"}
        }
        
        return risk_data.get(gene, {}).get(condition.lower().replace(" ", "_"), "Unknown")
    
    def _get_screening_recommendations(self, gene: str, condition: str) -> List[str]:
        """Get screening recommendations for hereditary conditions"""
        screening_protocols = {
            "BRCA1": [
                "Annual breast MRI starting age 25",
                "Annual mammography starting age 30",
                "Consider prophylactic surgery",
                "Transvaginal ultrasound + CA-125 q6months"
            ],
            "BRCA2": [
                "Annual breast MRI starting age 25", 
                "Annual mammography starting age 30",
                "Consider prophylactic surgery",
                "Enhanced ovarian screening"
            ]
        }
        
        return screening_protocols.get(gene, ["Standard screening protocols"])
    
    def _get_prevention_options(self, gene: str, condition: str) -> List[str]:
        """Get prevention options for hereditary conditions"""
        prevention_options = {
            "BRCA1": [
                "Prophylactic mastectomy (risk reduction 90-95%)",
                "Prophylactic oophorectomy (risk reduction 85-90%)",
                "Chemoprevention (tamoxifen/raloxifene)",
                "Lifestyle modifications"
            ],
            "BRCA2": [
                "Prophylactic mastectomy (risk reduction 90-95%)",
                "Prophylactic oophorectomy (risk reduction 85-90%)",
                "Chemoprevention consideration",
                "Enhanced surveillance"
            ]
        }
        
        return prevention_options.get(gene, ["Discuss with genetic counselor"])
    
    async def _assess_immunotherapy_eligibility(self, patient_data: Dict[str, Any], analysis_results: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Assess eligibility for immunotherapy based on biomarkers"""
        
        biomarker_analysis = analysis_results.get("biomarker_analysis", {})
        therapeutic_targets = biomarker_analysis.get("therapeutic_targets", [])
        
        # Check for PD-L1 expression
        pdl1_targets = [t for t in therapeutic_targets if t.get("biomarker") == "PD-L1"]
        if pdl1_targets:
            pdl1_target = pdl1_targets[0]
            if "high" in pdl1_target.get("status", "").lower():
                return {
                    "therapy_class": "Immunotherapy",
                    "medications": ["Pembrolizumab", "Nivolumab"],
                    "indication": f"PD-L1 {pdl1_target['status']}",
                    "evidence_level": "FDA Approved",
                    "expected_response_rate": "20-45%",
                    "monitoring_requirements": [
                        "Immune-related adverse event monitoring",
                        "Response assessment q6-9 weeks",
                        "Autoimmune toxicity screening"
                    ]
                }
        
        return None