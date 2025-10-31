# 🔬 Research Agent
# Real-time medical research and evidence-based recommendations

import asyncio
import aioredis
import aiohttp
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import os
from sentence_transformers import SentenceTransformer
import numpy as np
import xml.etree.ElementTree as ET
from dataclasses import dataclass
import hashlib
import re
from motor.motor_asyncio import AsyncIOMotorClient

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ResearchEvidence:
    study_title: str
    authors: List[str]
    journal: str
    publication_date: str
    pmid: Optional[str]
    evidence_level: str
    relevance_score: float
    key_findings: str
    clinical_implications: str

@dataclass
class ClinicalGuideline:
    guideline_name: str
    organization: str
    publication_year: str
    recommendation: str
    strength: str
    evidence_quality: str
    clinical_context: str

@dataclass
class SimilarCase:
    case_id: str
    patient_demographics: Dict
    presentation: str
    diagnosis: str
    treatment: str
    outcome: str
    similarity_score: float

class MedicalResearchAgent:
    """
    Advanced medical research agent with real-time literature search
    Integrates PubMed, Clinical Trials, and medical guidelines
    """
    
    def __init__(self):
        self.session = None
        self.embedding_model = None
        
        # API endpoints
        self.pubmed_base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
        self.clinical_trials_base = "https://clinicaltrials.gov/api/query"
        self.semantic_scholar_base = "https://api.semanticscholar.org/graph/v1"
        
        # Evidence levels mapping
        self.evidence_levels = {
            'systematic_review_meta_analysis': 'Level I',
            'randomized_controlled_trial': 'Level I', 
            'cohort_study': 'Level II',
            'case_control': 'Level III',
            'case_series': 'Level IV',
            'expert_opinion': 'Level V'
        }
        
        # Medical specialty keywords for search optimization
        self.specialty_keywords = {
            'cardiology': ['heart', 'cardiac', 'cardiovascular', 'myocardial', 'coronary'],
            'pulmonology': ['lung', 'respiratory', 'pulmonary', 'pneumonia', 'asthma'],
            'infectious_disease': ['infection', 'bacterial', 'viral', 'antibiotic', 'sepsis'],
            'oncology': ['cancer', 'tumor', 'neoplasm', 'malignancy', 'chemotherapy'],
            'neurology': ['brain', 'neurological', 'seizure', 'stroke', 'dementia'],
            'endocrinology': ['diabetes', 'thyroid', 'hormone', 'insulin', 'metabolism']
        }
        
    async def initialize(self):
        """Initialize research agent components"""
        try:
            logger.info("🔄 Loading research models...")
            
            # Initialize HTTP session
            self.session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=30)
            )
            
            # Load sentence transformer for semantic similarity
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            logger.info("✅ Research agent initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize research agent: {str(e)}")
            raise
            
    async def conduct_research(self, diagnosis_info: Dict, symptoms: List[str]) -> Dict:
        """Conduct comprehensive medical research"""
        try:
            logger.info("🔍 Conducting medical research...")
            
            # Extract key terms for search
            search_terms = await self._extract_search_terms(diagnosis_info, symptoms)
            
            # Parallel research queries
            research_tasks = [
                self._search_pubmed_literature(search_terms),
                self._search_clinical_guidelines(search_terms),
                self._find_similar_cases(diagnosis_info, symptoms),
                self._search_clinical_trials(search_terms)
            ]
            
            literature_results, guidelines_results, similar_cases, clinical_trials = await asyncio.gather(
                *research_tasks, return_exceptions=True
            )
            
            # Process results (handle exceptions)
            evidence_base = literature_results if not isinstance(literature_results, Exception) else []
            guidelines = guidelines_results if not isinstance(guidelines_results, Exception) else []
            cases = similar_cases if not isinstance(similar_cases, Exception) else []
            trials = clinical_trials if not isinstance(clinical_trials, Exception) else []
            
            # Generate research synthesis
            synthesis = await self._synthesize_research_findings(
                evidence_base, guidelines, cases, trials, search_terms
            )
            
            return {
                'evidence_base': [self._evidence_to_dict(e) for e in evidence_base[:10]],
                'clinical_guidelines': [self._guideline_to_dict(g) for g in guidelines[:5]],
                'similar_cases': [self._case_to_dict(c) for c in cases[:5]],
                'clinical_trials': trials[:5],
                'research_synthesis': synthesis,
                'search_metadata': {
                    'search_terms': search_terms,
                    'total_sources': len(evidence_base) + len(guidelines) + len(cases) + len(trials),
                    'confidence_score': await self._calculate_research_confidence(evidence_base, guidelines)
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Medical research failed: {str(e)}")
            return {'error': str(e)}
            
    async def _extract_search_terms(self, diagnosis_info: Dict, symptoms: List[str]) -> List[str]:
        """Extract optimized search terms from diagnosis and symptoms"""
        try:
            search_terms = []
            
            # Add primary diagnosis if available
            primary_diagnosis = diagnosis_info.get('primary_diagnosis', '')
            if primary_diagnosis:
                search_terms.append(primary_diagnosis)
                
            # Add key symptoms
            symptom_keywords = []
            for symptom in symptoms:
                # Clean and normalize symptom terms
                cleaned = re.sub(r'[^a-zA-Z\s]', '', symptom.lower())
                if len(cleaned) > 2:
                    symptom_keywords.append(cleaned)
                    
            search_terms.extend(symptom_keywords[:5])  # Top 5 symptoms
            
            # Add specialty-specific terms
            specialty_terms = await self._identify_specialty_terms(symptoms)
            search_terms.extend(specialty_terms)
            
            # Remove duplicates and empty terms
            search_terms = list(set([term for term in search_terms if term and len(term) > 2]))
            
            return search_terms[:8]  # Limit to 8 terms for optimal search
            
        except Exception as e:
            logger.error(f"❌ Search term extraction failed: {str(e)}")
            return ['medical', 'diagnosis']  # Fallback terms
            
    async def _identify_specialty_terms(self, symptoms: List[str]) -> List[str]:
        """Identify medical specialty-specific terms"""
        symptoms_text = ' '.join(symptoms).lower()
        specialty_terms = []
        
        for specialty, keywords in self.specialty_keywords.items():
            if any(keyword in symptoms_text for keyword in keywords):
                specialty_terms.extend(keywords[:2])  # Top 2 keywords per specialty
                
        return specialty_terms[:4]  # Limit to 4 specialty terms
        
    async def _search_pubmed_literature(self, search_terms: List[str]) -> List[ResearchEvidence]:
        """Search PubMed for relevant literature"""
        try:
            evidence_list = []
            
            # Construct search query
            query = ' AND '.join(search_terms[:4])  # Limit to 4 terms for PubMed
            
            # Search PubMed
            search_url = f"{self.pubmed_base}/esearch.fcgi"
            search_params = {
                'db': 'pubmed',
                'term': query,
                'retmax': 20,
                'sort': 'relevance',
                'datetype': 'pdat',
                'reldate': 1825,  # Last 5 years
                'retmode': 'json'
            }
            
            async with self.session.get(search_url, params=search_params) as response:
                if response.status == 200:
                    search_data = await response.json()
                    pmids = search_data.get('esearchresult', {}).get('idlist', [])
                    
                    # Get article details
                    if pmids:
                        evidence_list = await self._fetch_pubmed_details(pmids[:10])
                        
            return evidence_list
            
        except Exception as e:
            logger.error(f"❌ PubMed search failed: {str(e)}")
            return []
            
    async def _fetch_pubmed_details(self, pmids: List[str]) -> List[ResearchEvidence]:
        """Fetch detailed information for PubMed articles"""
        try:
            evidence_list = []
            
            # Fetch article summaries
            summary_url = f"{self.pubmed_base}/esummary.fcgi"
            summary_params = {
                'db': 'pubmed',
                'id': ','.join(pmids),
                'retmode': 'json'
            }
            
            async with self.session.get(summary_url, params=summary_params) as response:
                if response.status == 200:
                    summary_data = await response.json()
                    articles = summary_data.get('result', {})
                    
                    for pmid in pmids:
                        if pmid in articles:
                            article = articles[pmid]
                            
                            # Extract authors
                            authors = []
                            if 'authors' in article:
                                authors = [author.get('name', '') for author in article['authors'][:3]]
                                
                            # Determine evidence level based on publication type
                            pub_types = article.get('pubtype', [])
                            evidence_level = self._determine_evidence_level(pub_types)
                            
                            # Calculate relevance score (simplified)
                            relevance_score = 0.8  # Default score
                            
                            evidence_list.append(ResearchEvidence(
                                study_title=article.get('title', ''),
                                authors=authors,
                                journal=article.get('source', ''),
                                publication_date=article.get('pubdate', ''),
                                pmid=pmid,
                                evidence_level=evidence_level,
                                relevance_score=relevance_score,
                                key_findings=await self._extract_key_findings(article),
                                clinical_implications=await self._extract_clinical_implications(article)
                            ))
                            
            return evidence_list
            
        except Exception as e:
            logger.error(f"❌ PubMed details fetch failed: {str(e)}")
            return []
            
    def _determine_evidence_level(self, pub_types: List[str]) -> str:
        """Determine evidence level from publication types"""
        pub_types_lower = [pt.lower() for pt in pub_types]
        
        if any('meta-analysis' in pt or 'systematic review' in pt for pt in pub_types_lower):
            return 'Level I'
        elif any('randomized controlled trial' in pt or 'clinical trial' in pt for pt in pub_types_lower):
            return 'Level I'
        elif any('cohort' in pt or 'prospective' in pt for pt in pub_types_lower):
            return 'Level II'
        elif any('case-control' in pt for pt in pub_types_lower):
            return 'Level III'
        elif any('case report' in pt or 'case series' in pt for pt in pub_types_lower):
            return 'Level IV'
        else:
            return 'Level V'
            
    async def _extract_key_findings(self, article: Dict) -> str:
        """Extract key findings from article (simplified)"""
        # This would normally use NLP to extract findings from abstracts
        title = article.get('title', '')
        
        # Simple keyword-based extraction
        if 'effective' in title.lower():
            return "Study demonstrates therapeutic effectiveness"
        elif 'risk' in title.lower():
            return "Study identifies risk factors and associations"
        elif 'diagnosis' in title.lower():
            return "Study provides diagnostic insights"
        else:
            return "Study contributes to clinical evidence base"
            
    async def _extract_clinical_implications(self, article: Dict) -> str:
        """Extract clinical implications (simplified)"""
        title = article.get('title', '')
        journal = article.get('source', '')
        
        # High-impact journals carry more weight
        high_impact_journals = ['Nature', 'NEJM', 'Lancet', 'JAMA', 'BMJ']
        if any(journal_name in journal for journal_name in high_impact_journals):
            return "High-impact evidence supporting clinical decision-making"
        else:
            return "Contributes to evidence-based clinical practice"
            
    async def _search_clinical_guidelines(self, search_terms: List[str]) -> List[ClinicalGuideline]:
        """Search for relevant clinical guidelines"""
        try:
            # Mock clinical guidelines (in production, this would query actual databases)
            guidelines = []
            
            symptoms_text = ' '.join(search_terms).lower()
            
            # Create relevant guidelines based on search terms
            if 'pneumonia' in symptoms_text or 'respiratory' in symptoms_text:
                guidelines.append(ClinicalGuideline(
                    guideline_name="Community-Acquired Pneumonia Guidelines",
                    organization="IDSA/ATS",
                    publication_year="2024",
                    recommendation="Macrolide monotherapy for outpatient low-risk CAP",
                    strength="Strong recommendation",
                    evidence_quality="High",
                    clinical_context="Outpatient management of community-acquired pneumonia"
                ))
                
            if 'diabetes' in symptoms_text:
                guidelines.append(ClinicalGuideline(
                    guideline_name="Standards of Medical Care in Diabetes",
                    organization="American Diabetes Association",
                    publication_year="2024",
                    recommendation="Metformin as first-line therapy for T2DM",
                    strength="Strong recommendation",
                    evidence_quality="High",
                    clinical_context="Type 2 diabetes management"
                ))
                
            if 'hypertension' in symptoms_text or 'blood pressure' in symptoms_text:
                guidelines.append(ClinicalGuideline(
                    guideline_name="Hypertension Management Guidelines",
                    organization="AHA/ACC",
                    publication_year="2024",
                    recommendation="ACE inhibitors or ARBs as first-line therapy",
                    strength="Strong recommendation",
                    evidence_quality="High",
                    clinical_context="Primary hypertension management"
                ))
                
            return guidelines
            
        except Exception as e:
            logger.error(f"❌ Guidelines search failed: {str(e)}")
            return []
            
    async def _find_similar_cases(self, diagnosis_info: Dict, symptoms: List[str]) -> List[SimilarCase]:
        """Find similar clinical cases"""
        try:
            # Mock similar cases (in production, this would query case databases)
            similar_cases = []
            
            # Create similar cases based on diagnosis and symptoms
            primary_diagnosis = diagnosis_info.get('primary_diagnosis', 'Unknown')
            
            if 'pneumonia' in primary_diagnosis.lower():
                similar_cases.append(SimilarCase(
                    case_id="CASE_2024_0892",
                    patient_demographics={'age': 45, 'gender': 'male'},
                    presentation="Cough, fever, dyspnea for 3 days",
                    diagnosis="Community-acquired pneumonia",
                    treatment="Azithromycin 500mg daily x 5 days",
                    outcome="Full recovery without complications",
                    similarity_score=0.85
                ))
                
                similar_cases.append(SimilarCase(
                    case_id="CASE_2024_0734",
                    patient_demographics={'age': 52, 'gender': 'female'},
                    presentation="Productive cough, chest pain, fever",
                    diagnosis="Bacterial pneumonia",
                    treatment="Amoxicillin/clavulanate 875mg BID x 7 days",
                    outcome="Resolved with outpatient treatment",
                    similarity_score=0.78
                ))
                
            return similar_cases
            
        except Exception as e:
            logger.error(f"❌ Similar cases search failed: {str(e)}")
            return []
            
    async def _search_clinical_trials(self, search_terms: List[str]) -> List[Dict]:
        """Search for relevant clinical trials"""
        try:
            # Mock clinical trials data (in production, would query ClinicalTrials.gov API)
            trials = []
            
            symptoms_text = ' '.join(search_terms).lower()
            
            if 'pneumonia' in symptoms_text:
                trials.append({
                    'nct_id': 'NCT05123456',
                    'title': 'Efficacy of Azithromycin vs Amoxicillin in CAP',
                    'phase': 'Phase III',
                    'status': 'Recruiting',
                    'enrollment': 1200,
                    'primary_outcome': 'Clinical cure rate at day 10',
                    'relevance': 'Directly relevant to antibiotic selection'
                })
                
            return trials
            
        except Exception as e:
            logger.error(f"❌ Clinical trials search failed: {str(e)}")
            return []
            
    async def _synthesize_research_findings(self, evidence_base: List[ResearchEvidence], 
                                          guidelines: List[ClinicalGuideline],
                                          similar_cases: List[SimilarCase],
                                          clinical_trials: List[Dict],
                                          search_terms: List[str]) -> str:
        """Synthesize research findings into clinical recommendations"""
        try:
            synthesis_parts = []
            
            # Evidence quality assessment
            level_1_evidence = [e for e in evidence_base if e.evidence_level == 'Level I']
            if level_1_evidence:
                synthesis_parts.append(
                    f"High-quality evidence from {len(level_1_evidence)} Level I studies supports clinical decision-making."
                )
                
            # Guidelines synthesis
            if guidelines:
                strong_recommendations = [g for g in guidelines if g.strength == 'Strong recommendation']
                if strong_recommendations:
                    synthesis_parts.append(
                        f"Professional guidelines provide {len(strong_recommendations)} strong recommendations for this clinical scenario."
                    )
                    
            # Similar cases insights
            if similar_cases:
                successful_outcomes = [c for c in similar_cases if 'recovery' in c.outcome.lower() or 'resolved' in c.outcome.lower()]
                if successful_outcomes:
                    synthesis_parts.append(
                        f"Similar case analysis shows {len(successful_outcomes)} successful outcomes with comparable presentations."
                    )
                    
            # Clinical trials relevance
            if clinical_trials:
                active_trials = [t for t in clinical_trials if t.get('status') == 'Recruiting']
                if active_trials:
                    synthesis_parts.append(
                        f"Current research includes {len(active_trials)} active clinical trials investigating related therapeutic approaches."
                    )
                    
            # Overall synthesis
            if synthesis_parts:
                return " ".join(synthesis_parts) + " This evidence base supports evidence-based clinical decision-making."
            else:
                return "Limited research evidence available for this specific clinical presentation. Clinical judgment and expert consultation recommended."
                
        except Exception as e:
            logger.error(f"❌ Research synthesis failed: {str(e)}")
            return "Research synthesis unavailable due to processing error."
            
    async def _calculate_research_confidence(self, evidence_base: List[ResearchEvidence], 
                                          guidelines: List[ClinicalGuideline]) -> float:
        """Calculate confidence score for research findings"""
        try:
            if not evidence_base and not guidelines:
                return 0.0
                
            score = 0.0
            
            # Evidence quality scoring
            level_1_count = len([e for e in evidence_base if e.evidence_level == 'Level I'])
            level_2_count = len([e for e in evidence_base if e.evidence_level == 'Level II'])
            
            score += level_1_count * 0.3  # High weight for Level I evidence
            score += level_2_count * 0.2  # Medium weight for Level II evidence
            
            # Guidelines scoring
            strong_guidelines = len([g for g in guidelines if g.strength == 'Strong recommendation'])
            score += strong_guidelines * 0.25
            
            # Normalize to 0-1 scale
            return min(1.0, score / 2.0)
            
        except Exception as e:
            logger.error(f"❌ Confidence calculation failed: {str(e)}")
            return 0.5  # Default moderate confidence
            
    def _evidence_to_dict(self, evidence: ResearchEvidence) -> Dict:
        """Convert ResearchEvidence to dictionary"""
        return {
            'study_title': evidence.study_title,
            'authors': evidence.authors,
            'journal': evidence.journal,
            'publication_date': evidence.publication_date,
            'pmid': evidence.pmid,
            'evidence_level': evidence.evidence_level,
            'relevance_score': evidence.relevance_score,
            'key_findings': evidence.key_findings,
            'clinical_implications': evidence.clinical_implications
        }
        
    def _guideline_to_dict(self, guideline: ClinicalGuideline) -> Dict:
        """Convert ClinicalGuideline to dictionary"""
        return {
            'guideline_name': guideline.guideline_name,
            'organization': guideline.organization,
            'publication_year': guideline.publication_year,
            'recommendation': guideline.recommendation,
            'strength': guideline.strength,
            'evidence_quality': guideline.evidence_quality,
            'clinical_context': guideline.clinical_context
        }
        
    def _case_to_dict(self, case: SimilarCase) -> Dict:
        """Convert SimilarCase to dictionary"""
        return {
            'case_id': case.case_id,
            'patient_demographics': case.patient_demographics,
            'presentation': case.presentation,
            'diagnosis': case.diagnosis,
            'treatment': case.treatment,
            'outcome': case.outcome,
            'similarity_score': case.similarity_score
        }
        
    async def cleanup(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()


class ResearchAgentService:
    """Service for Research Agent"""
    
    def __init__(self):
        self.redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
        self.mongodb_url = os.getenv('MONGODB_URL', 'mongodb://localhost:27017/medical_ai_db')
        self.researcher = None
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
            
            # Initialize research agent
            self.researcher = MedicalResearchAgent()
            await self.researcher.initialize()
            logger.info("✅ Research Agent initialized")
            
        except Exception as e:
            logger.error(f"❌ Initialization failed: {str(e)}")
            raise
            
    async def process_diagnosis_request(self, diagnosis_id: str):
        """Process research request for a diagnosis"""
        try:
            # Update status
            await self.update_agent_status(diagnosis_id, "processing", "Conducting medical research...")
            
            # Get diagnosis data
            diagnosis_data = await self.get_diagnosis_data(diagnosis_id)
            
            if not diagnosis_data:
                raise ValueError("Diagnosis data not found")
                
            # Extract diagnosis info and symptoms
            input_data = diagnosis_data.get('input_data', {})
            symptoms = input_data.get('symptoms', [])
            
            # Mock diagnosis info (would normally come from other AI agents)
            diagnosis_info = {
                'primary_diagnosis': 'Community-acquired pneumonia',
                'confidence': 0.89
            }
            
            # Conduct research
            start_time = datetime.utcnow()
            research_results = await self.researcher.conduct_research(diagnosis_info, symptoms)
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            
            # Store results
            results_key = f"ai_agent:results:{diagnosis_id}:research"
            await self.redis.setex(
                results_key,
                3600,  # 1 hour TTL
                json.dumps({
                    'agent_id': 'RESEARCH_SCHOLAR_v2.0',
                    'status': 'completed',
                    'started_at': start_time.isoformat(),
                    'completed_at': datetime.utcnow().isoformat(),
                    'processing_time_seconds': processing_time,
                    'results': research_results
                })
            )
            
            # Update status
            await self.update_agent_status(diagnosis_id, "completed", "Medical research complete")
            
            logger.info(f"✅ Medical research completed for diagnosis {diagnosis_id}")
            
        except Exception as e:
            logger.error(f"❌ Medical research failed for diagnosis {diagnosis_id}: {str(e)}")
            await self.update_agent_status(diagnosis_id, "failed", str(e))
            
    async def get_diagnosis_data(self, diagnosis_id: str) -> Optional[Dict]:
        """Get diagnosis data from database"""
        try:
            db = self.mongodb.medical_ai_db
            
            # Get diagnosis data
            diagnosis = await db.diagnoses.find_one({'diagnosis_id': diagnosis_id})
            return diagnosis
            
        except Exception as e:
            logger.error(f"❌ Failed to get diagnosis data: {str(e)}")
            return None
            
    async def update_agent_status(self, diagnosis_id: str, status: str, message: str):
        """Update agent status in Redis"""
        try:
            status_key = f"ai_agent:status:{diagnosis_id}:research"
            status_data = {
                'agent_id': 'RESEARCH_SCHOLAR_v2.0',
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
            logger.info("🔬 Research Agent listening for requests...")
            
            while True:
                result = await self.redis.blpop(['diagnosis:queue:research'], timeout=5)
                
                if result:
                    _, diagnosis_id = result
                    diagnosis_id = diagnosis_id.decode('utf-8')
                    logger.info(f"📨 Processing research request: {diagnosis_id}")
                    
                    asyncio.create_task(self.process_diagnosis_request(diagnosis_id))
                    
        except KeyboardInterrupt:
            logger.info("🔄 Research Agent shutting down...")
        except Exception as e:
            logger.error(f"❌ Listening error: {str(e)}")
            
    async def cleanup(self):
        """Cleanup resources"""
        if self.researcher:
            await self.researcher.cleanup()
        if self.redis:
            await self.redis.close()
        if self.mongodb:
            self.mongodb.close()
        logger.info("🧹 Research Agent cleanup completed")


async def main():
    """Main entry point for Research Agent"""
    agent = ResearchAgentService()
    
    try:
        await agent.initialize()
        await agent.start_listening()
    except KeyboardInterrupt:
        logger.info("🔄 Shutting down Research Agent...")
    finally:
        await agent.cleanup()

if __name__ == "__main__":
    asyncio.run(main())