"""
Demo Data Generator for Multi-Agent Medical AI System
Generates realistic medical data for testing and demonstrations
"""

import json
import random
from datetime import datetime, timedelta
from typing import Dict, Any, List
import uuid

class MedicalDemoDataGenerator:
    """
    Generates comprehensive demo data for medical AI system testing
    """
    
    def __init__(self):
        self.patient_templates = self._initialize_patient_templates()
        self.conditions_database = self._initialize_conditions_database()
        self.medications_database = self._initialize_medications_database()
        
    def _initialize_patient_templates(self) -> List[Dict]:
        """Initialize patient profile templates"""
        return [
            {
                "name": "John Miller",
                "age": 68,
                "gender": "Male",
                "primary_condition": "Cardiovascular Disease",
                "complexity": "High"
            },
            {
                "name": "Sarah Johnson", 
                "age": 45,
                "gender": "Female",
                "primary_condition": "Diabetes Mellitus",
                "complexity": "Moderate"
            },
            {
                "name": "Robert Chen",
                "age": 72,
                "gender": "Male", 
                "primary_condition": "COPD",
                "complexity": "High"
            },
            {
                "name": "Maria Rodriguez",
                "age": 35,
                "gender": "Female",
                "primary_condition": "Autoimmune Disease",
                "complexity": "Moderate"
            },
            {
                "name": "David Thompson",
                "age": 58,
                "gender": "Male",
                "primary_condition": "Oncology",
                "complexity": "Critical"
            }
        ]
    
    def _initialize_conditions_database(self) -> Dict:
        """Initialize medical conditions with associated data"""
        return {
            "Cardiovascular Disease": {
                "symptoms": ["Chest pain", "Shortness of breath", "Fatigue", "Palpitations", "Dizziness"],
                "lab_abnormalities": {"Troponin": "elevated", "BNP": "elevated", "Cholesterol": "high"},
                "imaging_findings": ["Coronary artery narrowing", "Left ventricular dysfunction", "Wall motion abnormalities"],
                "medications": ["Atorvastatin", "Metoprolol", "Lisinopril", "Aspirin", "Clopidogrel"],
                "risk_factors": ["Hypertension", "Diabetes", "Smoking", "Family history"]
            },
            "Diabetes Mellitus": {
                "symptoms": ["Polyuria", "Polydipsia", "Weight loss", "Fatigue", "Blurred vision"],
                "lab_abnormalities": {"HbA1c": "elevated", "Glucose": "high", "Microalbumin": "present"},
                "imaging_findings": ["Diabetic retinopathy", "Nephropathy changes"],
                "medications": ["Metformin", "Insulin glargine", "Lisinopril", "Atorvastatin"],
                "risk_factors": ["Obesity", "Family history", "Sedentary lifestyle"]
            },
            "COPD": {
                "symptoms": ["Dyspnea", "Chronic cough", "Sputum production", "Wheezing", "Fatigue"],
                "lab_abnormalities": {"ABG": "hypoxemia", "Alpha-1": "low"},
                "imaging_findings": ["Emphysematous changes", "Hyperinflation", "Bullae"],
                "medications": ["Albuterol", "Tiotropium", "Prednisone", "Azithromycin"],
                "risk_factors": ["Smoking", "Environmental exposure", "Alpha-1 deficiency"]
            },
            "Autoimmune Disease": {
                "symptoms": ["Joint pain", "Fatigue", "Rash", "Fever", "Muscle weakness"],
                "lab_abnormalities": {"ANA": "positive", "ESR": "elevated", "CRP": "elevated"},
                "imaging_findings": ["Joint erosions", "Synovial thickening", "Soft tissue swelling"],
                "medications": ["Methotrexate", "Prednisone", "Hydroxychloroquine", "Adalimumab"],
                "risk_factors": ["Female gender", "Family history", "Environmental triggers"]
            },
            "Oncology": {
                "symptoms": ["Weight loss", "Fatigue", "Pain", "Night sweats", "Appetite loss"],
                "lab_abnormalities": {"CEA": "elevated", "CA-125": "elevated", "LDH": "high"},
                "imaging_findings": ["Mass lesion", "Lymphadenopathy", "Metastatic disease"],
                "medications": ["Carboplatin", "Paclitaxel", "Dexamethasone", "Ondansetron"],
                "risk_factors": ["Age", "Smoking", "Family history", "Environmental exposure"]
            }
        }
    
    def _initialize_medications_database(self) -> Dict:
        """Initialize medication database with interactions"""
        return {
            "Warfarin": {
                "class": "Anticoagulant",
                "major_interactions": ["Aspirin", "Amiodarone", "Fluconazole"],
                "monitoring": ["INR", "PT/PTT"],
                "side_effects": ["Bleeding", "Bruising"]
            },
            "Metformin": {
                "class": "Antidiabetic",
                "major_interactions": ["Contrast agents", "Alcohol"],
                "monitoring": ["Renal function", "B12 levels"],
                "side_effects": ["GI upset", "Lactic acidosis"]
            },
            "Atorvastatin": {
                "class": "Statin",
                "major_interactions": ["Gemfibrozil", "Cyclosporine"],
                "monitoring": ["Liver enzymes", "CK levels"],
                "side_effects": ["Myalgia", "Hepatotoxicity"]
            }
        }
    
    def generate_comprehensive_patient(self, patient_template: Dict = None) -> Dict[str, Any]:
        """Generate comprehensive patient data"""
        
        if not patient_template:
            patient_template = random.choice(self.patient_templates)
        
        patient_id = f"DEMO_{uuid.uuid4().hex[:8].upper()}"
        condition = patient_template["primary_condition"]
        condition_data = self.conditions_database.get(condition, {})
        
        # Generate patient demographics
        patient_data = {
            "patient_id": patient_id,
            "demographics": {
                "name": patient_template["name"],
                "age": patient_template["age"],
                "gender": patient_template["gender"],
                "mrn": f"MRN{random.randint(100000, 999999)}",
                "dob": (datetime.now() - timedelta(days=patient_template["age"] * 365)).strftime("%Y-%m-%d")
            },
            
            # Analysis request data
            "analysis_type": "comprehensive",
            "timestamp": datetime.now().isoformat(),
            
            # Medical images (simulated)
            "medical_images": self._generate_medical_images(condition),
            
            # Current medications
            "medications": self._generate_medications(condition_data.get("medications", [])),
            
            # Current symptoms
            "symptoms": random.sample(condition_data.get("symptoms", []), 
                                    min(4, len(condition_data.get("symptoms", [])))),
            
            # Lab results
            "lab_results": self._generate_lab_results(condition_data.get("lab_abnormalities", {})),
            
            # Medical history
            "medical_history": self._generate_medical_history(condition, patient_template),
            
            # Vital signs
            "vital_signs": self._generate_vital_signs(condition),
            
            # Clinical notes
            "clinical_notes": self._generate_clinical_notes(condition, patient_template),
            
            # Expected findings (for validation)
            "expected_findings": {
                "primary_diagnosis": condition,
                "imaging_findings": condition_data.get("imaging_findings", []),
                "risk_factors": condition_data.get("risk_factors", []),
                "complexity_level": patient_template["complexity"]
            }
        }
        
        return patient_data
    
    def _generate_medical_images(self, condition: str) -> List[str]:
        """Generate medical image paths based on condition"""
        
        image_mappings = {
            "Cardiovascular Disease": [
                "/demo/images/chest_xray_cardiomegaly.jpg",
                "/demo/images/ecg_afib.jpg",
                "/demo/images/echo_lv_dysfunction.mp4"
            ],
            "Diabetes Mellitus": [
                "/demo/images/retinal_photo_diabetic_retinopathy.jpg",
                "/demo/images/foot_ulcer.jpg"
            ],
            "COPD": [
                "/demo/images/chest_xray_emphysema.jpg",
                "/demo/images/ct_chest_copd.dcm"
            ],
            "Autoimmune Disease": [
                "/demo/images/hand_xray_erosions.jpg",
                "/demo/images/mri_joint_synovitis.dcm"
            ],
            "Oncology": [
                "/demo/images/ct_chest_mass.dcm",
                "/demo/images/pet_scan_metastases.dcm",
                "/demo/images/mri_brain_lesion.dcm"
            ]
        }
        
        return image_mappings.get(condition, ["/demo/images/chest_xray_normal.jpg"])
    
    def _generate_medications(self, condition_meds: List[str]) -> List[Dict]:
        """Generate medication list with dosages"""
        
        medications = []
        for med_name in condition_meds[:4]:  # Limit to 4 medications
            med_data = self.medications_database.get(med_name, {})
            
            # Generate realistic dosages
            dosages = {
                "Warfarin": "5mg daily",
                "Metformin": "500mg twice daily", 
                "Atorvastatin": "20mg daily",
                "Aspirin": "81mg daily",
                "Lisinopril": "10mg daily",
                "Metoprolol": "25mg twice daily"
            }
            
            medications.append({
                "name": med_name,
                "dosage": dosages.get(med_name, "Standard dose"),
                "frequency": "As prescribed",
                "class": med_data.get("class", "Unknown"),
                "start_date": (datetime.now() - timedelta(days=random.randint(30, 365))).strftime("%Y-%m-%d")
            })
        
        return medications
    
    def _generate_lab_results(self, abnormalities: Dict) -> Dict[str, Any]:
        """Generate realistic lab results"""
        
        base_labs = {
            "CBC": {
                "WBC": round(random.uniform(4.0, 11.0), 1),
                "RBC": round(random.uniform(4.0, 5.5), 1),
                "Hemoglobin": round(random.uniform(12.0, 16.0), 1),
                "Hematocrit": round(random.uniform(36, 48), 1),
                "Platelets": random.randint(150, 450)
            },
            "Chemistry": {
                "Glucose": random.randint(70, 120),
                "BUN": random.randint(7, 25),
                "Creatinine": round(random.uniform(0.6, 1.3), 1),
                "Sodium": random.randint(135, 145),
                "Potassium": round(random.uniform(3.5, 5.1), 1),
                "Chloride": random.randint(98, 108)
            },
            "Lipids": {
                "Total_Cholesterol": random.randint(150, 250),
                "HDL": random.randint(35, 80),
                "LDL": random.randint(70, 180),
                "Triglycerides": random.randint(50, 200)
            }
        }
        
        # Apply condition-specific abnormalities
        if "Glucose" in abnormalities and abnormalities["Glucose"] == "high":
            base_labs["Chemistry"]["Glucose"] = random.randint(200, 350)
            base_labs["HbA1c"] = round(random.uniform(8.0, 12.0), 1)
        
        if "Troponin" in abnormalities and abnormalities["Troponin"] == "elevated":
            base_labs["Cardiac"] = {
                "Troponin_I": round(random.uniform(0.1, 2.5), 2),
                "BNP": random.randint(200, 800),
                "CK_MB": round(random.uniform(5.0, 25.0), 1)
            }
        
        if "Cholesterol" in abnormalities and abnormalities["Cholesterol"] == "high":
            base_labs["Lipids"]["Total_Cholesterol"] = random.randint(280, 400)
            base_labs["Lipids"]["LDL"] = random.randint(180, 250)
        
        return base_labs
    
    def _generate_medical_history(self, condition: str, template: Dict) -> Dict[str, Any]:
        """Generate comprehensive medical history"""
        
        history_mappings = {
            "Cardiovascular Disease": {
                "current_conditions": ["Coronary artery disease", "Hypertension", "Hyperlipidemia"],
                "past_surgeries": ["Cardiac catheterization (2022)", "Appendectomy (1995)"],
                "hospitalizations": ["MI (2022)", "Chest pain workup (2023)"]
            },
            "Diabetes Mellitus": {
                "current_conditions": ["Type 2 diabetes mellitus", "Diabetic neuropathy", "Hypertension"],
                "past_surgeries": ["Cataract surgery (2021)"],
                "hospitalizations": ["DKA (2020)", "Diabetic foot ulcer (2022)"]
            }
        }
        
        base_history = history_mappings.get(condition, {
            "current_conditions": [condition],
            "past_surgeries": ["Appendectomy"],
            "hospitalizations": []
        })
        
        return {
            **base_history,
            "allergies": random.sample(["Penicillin", "Shellfish", "Latex", "Codeine"], 2),
            "family_history": [
                f"{random.choice(['Father', 'Mother', 'Sibling'])}: {random.choice(['CAD', 'Diabetes', 'HTN', 'Cancer'])}",
                f"{random.choice(['Grandfather', 'Grandmother'])}: {random.choice(['Stroke', 'Heart disease', 'Diabetes'])}"
            ],
            "social_history": {
                "smoking": random.choice(["Never", "Former (quit 2015)", "Current (1 PPD)"]),
                "alcohol": random.choice(["Social", "None", "Moderate"]),
                "occupation": random.choice(["Retired", "Teacher", "Engineer", "Manager"])
            }
        }
    
    def _generate_vital_signs(self, condition: str) -> Dict[str, Any]:
        """Generate realistic vital signs"""
        
        # Base vital signs
        vitals = {
            "blood_pressure": {
                "systolic": random.randint(110, 140),
                "diastolic": random.randint(70, 90)
            },
            "heart_rate": random.randint(60, 100),
            "respiratory_rate": random.randint(12, 20),
            "temperature": round(random.uniform(97.0, 99.5), 1),
            "oxygen_saturation": random.randint(95, 100),
            "weight": round(random.uniform(60, 100), 1),
            "height": random.randint(160, 185)
        }
        
        # Condition-specific adjustments
        if condition == "Cardiovascular Disease":
            vitals["blood_pressure"]["systolic"] = random.randint(140, 180)
            vitals["heart_rate"] = random.randint(80, 120)
        
        elif condition == "COPD":
            vitals["respiratory_rate"] = random.randint(18, 28)
            vitals["oxygen_saturation"] = random.randint(88, 95)
        
        return vitals
    
    def _generate_clinical_notes(self, condition: str, template: Dict) -> Dict[str, str]:
        """Generate clinical notes"""
        
        return {
            "chief_complaint": f"{template['age']}-year-old {template['gender'].lower()} with {condition}",
            "history_present_illness": f"Patient presents with worsening symptoms related to known {condition}. Reports increased difficulty with daily activities.",
            "assessment": f"Stable {condition} with good medication compliance. Continue current management plan.",
            "plan": "Continue current medications, follow up in 3 months, order routine lab work."
        }
    
    def generate_multiple_patients(self, count: int = 5) -> List[Dict[str, Any]]:
        """Generate multiple demo patients"""
        
        patients = []
        templates = self.patient_templates * (count // len(self.patient_templates) + 1)
        
        for i in range(count):
            template = templates[i]
            patient = self.generate_comprehensive_patient(template)
            patients.append(patient)
        
        return patients
    
    def save_demo_data(self, output_path: str = "demo_medical_data.json"):
        """Save generated demo data to file"""
        
        demo_data = {
            "generated_at": datetime.now().isoformat(),
            "patients": self.generate_multiple_patients(5),
            "metadata": {
                "total_patients": 5,
                "conditions_covered": list(self.conditions_database.keys()),
                "data_version": "1.0"
            }
        }
        
        with open(output_path, 'w') as f:
            json.dump(demo_data, f, indent=2)
        
        return demo_data

# Usage example
if __name__ == "__main__":
    generator = MedicalDemoDataGenerator()
    demo_data = generator.save_demo_data("demo_medical_data.json")
    print(f"Generated demo data for {len(demo_data['patients'])} patients")