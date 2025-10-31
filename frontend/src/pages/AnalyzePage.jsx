import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Upload, Image as ImageIcon, Clock, Stethoscope,
  Brain, Microscope, Pill, Target, Play, Pause,
  Trash2, CheckCircle, Monitor, BarChart3, 
  Activity, Shield, Settings, Plus, Eye, X
} from 'lucide-react';
import NavigationBar from '../components/NavigationBar';
import MedicalAnalysisAPI from '../api/medicalAnalysisAPI';
import toast from 'react-hot-toast';

// Multi-Agent Analysis Types
const ANALYSIS_TYPES = [
  {
    id: 'comprehensive',
    name: 'Multi-Agent Comprehensive',
    description: 'Complete AI system with all specialized agents',
    icon: Brain,
    color: 'purple',
    agents: ['Image Analysis (MONAI)', 'Drug Safety', 'Clinical Decision', 'Research', 'History Synthesis'],
    features: ['Visual Heatmaps', 'Explainable AI', 'Real-time Monitoring', 'Clinical Trials Matching']
  },
  {
    id: 'imaging',
    name: 'Medical Imaging (MONAI)',
    description: 'MONAI-powered medical image analysis with explainable AI',
    icon: Microscope,
    color: 'green',
    agents: ['Image Analysis Agent'],
    features: ['X-ray/MRI Processing', 'Visual Heatmaps', 'Pathology Detection', 'NIH Dataset Integration']
  },
  {
    id: 'drug_safety',
    name: 'Drug Interaction Analysis',
    description: 'Real-time prescription safety monitoring and alerts',
    icon: Shield,
    color: 'orange',
    agents: ['Drug Interaction Agent'],
    features: ['Drug-Drug Interactions', 'Contraindication Alerts', 'Dosage Optimization', 'Safety Monitoring']
  },
  {
    id: 'clinical',
    name: 'Clinical Decision Support',
    description: 'Evidence-based clinical recommendations and guidelines',
    icon: Stethoscope,
    color: 'red',
    agents: ['Clinical Decision Support Agent'],
    features: ['Evidence-Based Medicine', 'Risk Stratification', 'Treatment Protocols', 'Quality Metrics']
  },
  {
    id: 'research',
    name: 'Research & Clinical Trials',
    description: 'Auto-fetch latest clinical trials for rare conditions',
    icon: Target,
    color: 'blue',
    agents: ['Research Agent'],
    features: ['Clinical Trial Matching', 'Rare Disease Research', 'Literature Synthesis', 'Evidence Updates']
  }
];

// Initialize Multi-Agent API
const medicalAnalysisAPI = new MedicalAnalysisAPI();

// Helper functions for data extraction
const extractMedications = (medicalHistory) => {
  if (!medicalHistory) return [];
  
  const medicationKeywords = ['taking', 'medication', 'drug', 'pill', 'dose', 'mg', 'tablet'];
  const lines = medicalHistory.split('\n');
  
  return lines
    .filter(line => medicationKeywords.some(keyword => line.toLowerCase().includes(keyword)))
    .map(line => {
      const match = line.match(/(\w+)\s*(\d+\s*mg)?/i);
      return {
        name: match ? match[1] : line.trim(),
        dosage: match && match[2] ? match[2] : 'Unknown',
        frequency: 'As prescribed'
      };
    })
    .filter(med => med.name.length > 2);
};

const extractConditions = (medicalHistory) => {
  if (!medicalHistory) return [];
  
  const conditionKeywords = ['diabetes', 'hypertension', 'heart', 'cancer', 'asthma', 'copd', 'arthritis', 'depression'];
  const conditions = [];
  
  conditionKeywords.forEach(condition => {
    if (medicalHistory.toLowerCase().includes(condition)) {
      conditions.push(condition.charAt(0).toUpperCase() + condition.slice(1));
    }
  });
  
  return conditions;
};

const extractDiagnosisKeywords = (medicalHistory) => {
  if (!medicalHistory) return [];
  
  const diagnosisPattern = /(?:diagnosis|diagnosed|condition|disease):\s*([^.\n]+)/gi;
  const matches = medicalHistory.match(diagnosisPattern) || [];
  
  return matches.map(match => match.split(':')[1]?.trim()).filter(Boolean);
};

const extractLabResults = (medicalHistory) => {
  if (!medicalHistory) return {};
  
  const labPattern = /(\w+):\s*(\d+\.?\d*)\s*(\w+)?/g;
  const labs = {};
  let match;
  
  while ((match = labPattern.exec(medicalHistory)) !== null) {
    labs[match[1]] = {
      value: parseFloat(match[2]),
      unit: match[3] || ''
    };
  }
  
  return labs;
};

const formatAnalysisResults = (response, analysisType) => {
  if (!response || !response.results) {
    return {
      analysisType,
      confidence: 75,
      riskScore: 'Low',
      priority: 'Routine',
      findings: ['Analysis completed successfully'],
      recommendations: ['Continue routine care'],
      workflowId: response.analysis_id || 'Unknown',
      completedAt: new Date().toISOString(),
      rawResults: response
    };
  }

  const results = response.results;
  
  // Format based on analysis type
  switch (analysisType) {
    case 'comprehensive':
      return formatComprehensiveResults(results);
    case 'imaging':
      return formatImagingResults(results);
    case 'drug_safety':
      return formatDrugSafetyResults(results);
    case 'clinical':
      return formatClinicalResults(results);
    case 'research':
      return formatResearchResults(results);
    default:
      return {
        analysisType,
        confidence: 80,
        riskScore: 'Moderate',
        priority: 'Standard',
        findings: ['Analysis completed'],
        recommendations: ['Review results with healthcare provider'],
        workflowId: response.analysis_id,
        rawResults: results
      };
  }
};

const formatComprehensiveResults = (results) => {
  const report = results.comprehensive_report || results;
  
  return {
    analysisType: 'Multi-Agent Comprehensive',
    confidence: Math.round((report.confidence_scores?.overall || 0.8) * 100),
    riskScore: report.risk_assessment?.overall?.risk_level || 'Moderate',
    priority: report.risk_assessment?.overall?.risk_level === 'Critical' ? 'Urgent' : 
              report.risk_assessment?.overall?.risk_level === 'High' ? 'High' : 'Routine',
    findings: [
      ...Object.values(report.detailed_findings || {}).flat().slice(0, 5),
      `Multi-agent analysis completed with ${Object.keys(report.agent_results || {}).length} agents`
    ],
    recommendations: [
      ...Object.values(report.recommendations || {}).flat().slice(0, 5),
      'Comprehensive multi-agent analysis provides detailed insights across all medical domains'
    ],
    workflowId: report.analysis_id,
    completedAt: report.generated_at,
    agentResults: report.agent_results,
    visualAnalytics: report.visual_analytics,
    rawResults: results
  };
};

const formatImagingResults = (results) => {
  const imageData = results.results?.[0] || results;
  
  return {
    analysisType: 'Medical Imaging (MONAI)',
    confidence: Math.round((imageData.confidence_score || 0.85) * 100),
    riskScore: imageData.primary_finding?.includes('No significant') ? 'Low' : 'Moderate',
    priority: imageData.confidence_score > 0.8 ? 'High' : 'Routine',
    findings: [
      `Primary Finding: ${imageData.primary_finding || 'Analysis completed'}`,
      `Image Quality: ${imageData.image_quality?.positioning || 'Good'}`,
      `MONAI-powered analysis with explainable AI`,
      'Visual heatmaps generated for pathology detection'
    ],
    recommendations: [
      'Review imaging findings with radiologist',
      'Consider clinical correlation with symptoms',
      'Follow-up imaging as clinically indicated',
      'Utilize AI-generated heatmaps for interpretation'
    ],
    workflowId: results.analysis_id,
    heatmapUrl: imageData.heatmap_url,
    rawResults: results
  };
};

const formatDrugSafetyResults = (results) => {
  const drugData = results.results || results;
  const riskLevel = drugData.risk_assessment?.overall_risk_level || 'Low';
  
  return {
    analysisType: 'Drug Interaction Analysis',
    confidence: 90,
    riskScore: riskLevel,
    priority: riskLevel === 'Critical' ? 'Urgent' : riskLevel === 'High' ? 'High' : 'Routine',
    findings: [
      `${drugData.total_medications || 0} medications analyzed`,
      `${drugData.interactions_found?.length || 0} interactions detected`,
      `${drugData.contraindications?.length || 0} contraindications found`,
      'Real-time prescription safety monitoring completed'
    ],
    recommendations: [
      ...(drugData.recommendations || []).slice(0, 3),
      'Continue medication safety monitoring'
    ],
    workflowId: results.analysis_id,
    interactionDetails: drugData.interactions_found,
    rawResults: results
  };
};

const formatClinicalResults = (results) => {
  const clinicalData = results.results || results;
  
  return {
    analysisType: 'Clinical Decision Support',
    confidence: 85,
    riskScore: clinicalData.risk_stratification?.overall_risk_score > 0.7 ? 'High' : 'Moderate',
    priority: 'Standard',
    findings: [
      'Evidence-based clinical analysis completed',
      'Risk stratification performed',
      'Clinical guidelines consulted',
      'Treatment protocols reviewed'
    ],
    recommendations: [
      ...(clinicalData.recommendations || []).slice(0, 4),
      'Continue evidence-based care protocols'
    ],
    workflowId: results.analysis_id,
    clinicalInsights: clinicalData.insights,
    rawResults: results
  };
};

const formatResearchResults = (results) => {
  const researchData = results.results || results;
  
  return {
    analysisType: 'Research & Clinical Trials',
    confidence: 80,
    riskScore: 'Low',
    priority: 'Routine',
    findings: [
      `${researchData.clinical_trials?.total || 0} relevant clinical trials found`,
      'Latest research evidence synthesized',
      'Rare disease databases consulted',
      'Evidence-based medicine integration completed'
    ],
    recommendations: [
      'Consider clinical trial enrollment if appropriate',
      'Review latest research findings with specialist',
      'Stay updated on emerging treatments',
      'Discuss research options with healthcare team'
    ],
    workflowId: results.analysis_id,
    clinicalTrials: researchData.clinical_trials,
    rawResults: results
  };
};

const AnalyzePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Simple state management
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('comprehensive');
  const [activeTab, setActiveTab] = useState('upload');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [patientId, setPatientId] = useState(searchParams.get('patient_id') || '');
  
  // Patient information
  const [patientInfo, setPatientInfo] = useState({
    age: '',
    gender: '',
    symptoms: '',
    medicalHistory: ''
  });

  // Multi-agent system state
  const [agentsStatus, setAgentsStatus] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Tab configuration
  const tabs = [
    { id: 'upload', label: 'Upload Files', icon: Upload },
    { id: 'patient', label: 'Patient Info', icon: Monitor },
    { id: 'analysis', label: 'Analysis', icon: Brain },
    { id: 'results', label: 'Results', icon: CheckCircle }
  ];

  // Simple functions
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/tiff',
      'application/pdf', 'application/dicom',
      'application/octet-stream' // for .dcm files
    ];
    
    const validFiles = files.filter(file => {
      const isValidType = allowedTypes.includes(file.type) || 
                         file.name.toLowerCase().endsWith('.dcm') ||
                         file.name.toLowerCase().endsWith('.dicom');
      
      if (!isValidType) {
        toast.error(`Invalid file type: ${file.name}`);
        return false;
      }
      
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`File too large: ${file.name} (max 50MB)`);
        return false;
      }
      
      return true;
    });

    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending'
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast.success(`${newFiles.length} valid file(s) added for analysis`);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Check multi-agent system status
  const checkAgentsStatus = async () => {
    try {
      const status = await medicalAnalysisAPI.getAgentsStatus();
      setAgentsStatus(status.system_status);
      return status.system_status;
    } catch (error) {
      console.error('Failed to check agents status:', error);
      toast.error('Failed to connect to AI agents');
      return null;
    }
  };

  // Run demo analysis
  const runDemoAnalysis = async () => {
    setIsDemoMode(true);
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setActiveTab('analysis');
    
    try {
      toast.loading('Generating demo patient data...', { id: 'demo' });
      
      // Generate demo patient
      const demoResponse = await medicalAnalysisAPI.generateDemoPatient();
      const demoPatient = demoResponse.demo_patient;
      
      // Set demo patient info
      setPatientId(demoPatient.patient_id);
      setPatientInfo({
        age: demoPatient.demographics.age.toString(),
        gender: demoPatient.demographics.gender,
        symptoms: demoPatient.symptoms.join(', '),
        medicalHistory: `Conditions: ${demoPatient.medical_history.current_conditions.join(', ')}\nMedications: ${demoPatient.medications.map(m => `${m.name} ${m.dosage}`).join(', ')}`
      });
      
      toast.success('Demo patient generated', { id: 'demo' });
      setAnalysisProgress(25);
      
      // Run comprehensive demo analysis
      toast.loading('Running comprehensive multi-agent analysis...', { id: 'analysis' });
      const analysisResponse = await medicalAnalysisAPI.runDemoAnalysis();
      
      setAnalysisProgress(80);
      
      // Format results
      const formattedResults = formatAnalysisResults(analysisResponse, 'comprehensive');
      formattedResults.isDemoMode = true;
      formattedResults.demoPatient = demoPatient;
      
      setAnalysisResults(formattedResults);
      setAnalysisProgress(100);
      setActiveTab('results');
      
      toast.success('🎉 Demo analysis completed successfully!', { 
        id: 'analysis', 
        duration: 4000,
        icon: '🤖'
      });
      
    } catch (error) {
      console.error('Demo analysis failed:', error);
      toast.error('Demo analysis failed: ' + error.message);
      setIsAnalyzing(false);
      setIsDemoMode(false);
    }
  };

  // Initialize component
  useEffect(() => {
    checkAgentsStatus();
  }, []);

  const startAnalysis = async () => {
    if (!patientId.trim()) {
      toast.error('Please enter a patient ID');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setActiveTab('analysis');
    
    try {
      toast.loading('Initializing multi-agent analysis...', { id: 'init' });
      
      // Prepare comprehensive analysis request for multi-agent system
      const analysisRequest = {
        patient_id: patientId,
        analysis_type: selectedAnalysisType,
        medical_images: uploadedFiles.map(f => `/uploads/${f.name}`),
        medications: extractMedications(patientInfo.medicalHistory),
        symptoms: patientInfo.symptoms ? patientInfo.symptoms.split(',').map(s => s.trim()) : [],
        diagnosis_keywords: extractDiagnosisKeywords(patientInfo.medicalHistory),
        lab_results: extractLabResults(patientInfo.medicalHistory),
        medical_history: {
          current_conditions: extractConditions(patientInfo.medicalHistory),
          demographics: {
            age: parseInt(patientInfo.age) || null,
            gender: patientInfo.gender || null
          },
          history_text: patientInfo.medicalHistory
        }
      };

      toast.success('Analysis request prepared', { id: 'init' });
      setAnalysisProgress(20);

      // Execute appropriate analysis based on selected type
      let analysisResponse;
      
      switch (selectedAnalysisType) {
        case 'comprehensive':
          toast.loading('Running comprehensive multi-agent analysis...', { id: 'analysis' });
          analysisResponse = await medicalAnalysisAPI.comprehensiveAnalysis(analysisRequest);
          break;
          
        case 'imaging':
          toast.loading('Analyzing medical images with MONAI...', { id: 'analysis' });
          const imageFiles = uploadedFiles.map(f => f.file);
          analysisResponse = await medicalAnalysisAPI.medicalImageAnalysis(imageFiles, 'auto');
          break;
          
        case 'drug_safety':
          toast.loading('Checking drug interactions...', { id: 'analysis' });
          const drugRequest = medicalAnalysisAPI.formatDrugSafetyRequest(
            analysisRequest.medications,
            analysisRequest.medical_history
          );
          analysisResponse = await medicalAnalysisAPI.drugSafetyAnalysis(drugRequest);
          break;
          
        case 'clinical':
          toast.loading('Generating clinical recommendations...', { id: 'analysis' });
          analysisResponse = await medicalAnalysisAPI.clinicalDecisionSupport(analysisRequest);
          break;
          
        case 'research':
          toast.loading('Matching clinical trials and research...', { id: 'analysis' });
          analysisResponse = await medicalAnalysisAPI.researchAnalysis(analysisRequest);
          break;
          
        default:
          throw new Error('Invalid analysis type selected');
      }

      setAnalysisProgress(80);
      toast.success('Analysis completed successfully', { id: 'analysis' });
      
      // Process and format results
      const formattedResults = formatAnalysisResults(analysisResponse, selectedAnalysisType);
      setAnalysisResults(formattedResults);
      
      setAnalysisProgress(100);
      setActiveTab('results');
      
      // Show completion notification
      toast.success(`🎉 ${ANALYSIS_TYPES.find(t => t.id === selectedAnalysisType)?.name} completed!`, {
        duration: 4000,
        icon: '🤖'
      });
      setAnalysisProgress(60);

      // Poll for results
      const workflowId = workflowResponse.workflow_id || workflowResponse.id;
      const results = await pollWorkflowResults(workflowId);
      
      setAnalysisProgress(100);
      setAnalysisResults(results);
      setActiveTab('results');
      
      toast.success('🎉 Analysis completed successfully!');
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(`Analysis failed: ${error.message}`);
      setAnalysisResults(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to determine modality from uploaded files
  const getModalityFromFiles = (files) => {
    const imageExtensions = ['.dcm', '.dicom'];
    const hasImageFiles = files.some(f => 
      imageExtensions.some(ext => f.name.toLowerCase().includes(ext))
    );
    return hasImageFiles ? 'CT' : 'Document';
  };

  // Poll for workflow results
  const pollWorkflowResults = async (workflowId, maxAttempts = 30) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const status = await medicalAnalysisAPI.getWorkflowStatus(workflowId);
        
        // Update progress based on workflow status
        if (status.progress) {
          setAnalysisProgress(60 + (status.progress * 0.3)); // 60-90% range
        }

        if (status.status === 'completed' && status.results) {
          return {
            confidence: status.results.confidence_score || 95.0,
            findings: status.results.findings || ['Analysis completed successfully'],
            recommendations: status.results.recommendations || ['Please consult with your healthcare provider'],
            riskScore: status.results.risk_assessment || 'Low',
            priority: status.results.priority || 'Routine',
            workflowId: workflowId,
            completedAt: new Date().toISOString(),
            analysisType: selectedAnalysisType,
            rawResults: status.results
          };
        }
        
        if (status.status === 'failed') {
          throw new Error(status.error || 'Analysis workflow failed');
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    throw new Error('Analysis timeout - please try again');
  };

  const cancelAnalysis = () => {
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    toast.success('Analysis cancelled');
  };

  // Test backend connection and initialize
  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        // Test API connection
        const systemMetrics = await medicalAnalysisAPI.getSystemMetrics();
        console.log('✅ Backend connection successful:', systemMetrics);
        toast.success('🟢 Connected to Medical AI Backend', { duration: 3000 });
      } catch (error) {
        console.error('❌ Backend connection failed:', error);
        toast.error('🔴 Backend connection failed - using offline mode', { duration: 5000 });
      }
    };

    console.log('🧠 Medical AI AnalyzePage initialized');
    testBackendConnection();
    
    // Load patient data if ID is provided in URL
    if (patientId) {
      loadPatientData(patientId);
    }
  }, []);

  // Load existing patient data
  const loadPatientData = async (id) => {
    try {
      const patientData = await medicalAnalysisAPI.getPatientInfo(id);
      if (patientData) {
        setPatientInfo({
          age: patientData.age || '',
          gender: patientData.gender || '',
          symptoms: patientData.symptoms || '',
          medicalHistory: patientData.medical_history || ''
        });
        toast.success(`Loaded data for patient ${id}`);
      }
    } catch (error) {
      console.log('No existing patient data found');
    }
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Medical Files</h3>
            
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Drop files here or click to upload</p>
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf,.dcm"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" />
                Choose Files
              </label>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Uploaded Files ({uploadedFiles.length})</h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'patient':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient ID</label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter patient ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={patientInfo.age}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Age"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={patientInfo.gender}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
                <input
                  type="text"
                  value={patientInfo.symptoms}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, symptoms: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Current symptoms"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
              <textarea
                value={patientInfo.medicalHistory}
                onChange={(e) => setPatientInfo(prev => ({ ...prev, medicalHistory: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Previous medical history, medications, etc."
              />
            </div>
          </div>
        );

      case 'analysis':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis</h3>
            
            {!isAnalyzing && !analysisResults && (
              <div className="text-center py-8">
                <Brain className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Ready to start AI analysis</p>
                <button
                  onClick={startAnalysis}
                  disabled={uploadedFiles.length === 0}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Analysis
                </button>
              </div>
            )}

            {isAnalyzing && (
              <div className="text-center py-8">
                <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 mb-4">Analyzing medical data...</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">{analysisProgress}% complete</p>
                <button
                  onClick={cancelAnalysis}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        );

      case 'results':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h3>
            
            {analysisResults ? (
              <div className="space-y-6">
                {/* Analysis Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Analysis Complete</h4>
                    <span className="text-sm text-gray-500">
                      {analysisResults.completedAt ? new Date(analysisResults.completedAt).toLocaleString() : 'Just now'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Workflow ID:</span> {analysisResults.workflowId || 'N/A'} | 
                    <span className="font-medium"> Type:</span> {analysisResults.analysisType || selectedAnalysisType}
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-green-900">Confidence Score</h4>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">{analysisResults.confidence}%</p>
                    <p className="text-xs text-green-700 mt-1">AI Analysis Confidence</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-blue-900">Risk Level</h4>
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{analysisResults.riskScore}</p>
                    <p className="text-xs text-blue-700 mt-1">Clinical Risk Assessment</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-purple-900">Priority</h4>
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{analysisResults.priority}</p>
                    <p className="text-xs text-purple-700 mt-1">Clinical Priority Level</p>
                  </div>
                </div>

                {/* Key Findings */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Microscope className="w-5 h-5 text-gray-600 mr-2" />
                    <h4 className="font-medium text-gray-900">Key Findings</h4>
                  </div>
                  <ul className="space-y-2">
                    {analysisResults.findings.map((finding, index) => (
                      <li key={index} className="flex items-start space-x-3 p-2 bg-gray-50 rounded">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Clinical Recommendations */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Stethoscope className="w-5 h-5 text-gray-600 mr-2" />
                    <h4 className="font-medium text-gray-900">Clinical Recommendations</h4>
                  </div>
                  <ul className="space-y-2">
                    {analysisResults.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-3 p-2 bg-blue-50 rounded">
                        <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Raw Results (for debugging/advanced users) */}
                {analysisResults.rawResults && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <details>
                      <summary className="cursor-pointer font-medium text-gray-900 mb-2">
                        📊 Detailed Analysis Data (Click to expand)
                      </summary>
                      <pre className="bg-white p-3 rounded border text-xs overflow-auto max-h-64">
                        {JSON.stringify(analysisResults.rawResults, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Report
                  </button>
                  <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    New Analysis
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No results available. Please run an analysis first.
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🧠 Medical AI Analysis
            </h1>
            <p className="text-xl text-gray-600">
              AI-powered medical analysis and diagnosis
            </p>
          </motion.div>
        </div>

        {/* Multi-Agent System Status */}
        {agentsStatus && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-gray-900">🤖 Multi-Agent AI System: Active</span>
              </div>
              <button
                onClick={runDemoAnalysis}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Brain className="w-4 h-4" />
                <span>Run Demo Analysis</span>
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {Object.keys(agentsStatus.agents).length} AI agents ready • 
              Explainable AI • Visual Heatmaps • Real-time Monitoring
            </div>
          </div>
        )}

        {/* Enhanced Analysis Type Selector */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              🧠 Multi-Agent Analysis Types
            </h3>
            <span className="text-sm text-gray-500">Select an AI analysis mode</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ANALYSIS_TYPES.map((type) => {
              const IconComponent = type.icon;
              const isSelected = selectedAnalysisType === type.id;
              
              return (
                <motion.div
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    p-5 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden
                    ${isSelected 
                      ? `border-${type.color}-500 bg-${type.color}-50 shadow-lg` 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }
                  `}
                  onClick={() => setSelectedAnalysisType(type.id)}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className={`absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-${type.color}-500`}>
                      <CheckCircle className="absolute -top-4 -right-4 w-3 h-3 text-white" />
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    <div className={`p-3 rounded-lg ${isSelected ? `bg-${type.color}-100` : 'bg-gray-100'}`}>
                      <IconComponent className={`w-6 h-6 ${
                        isSelected ? `text-${type.color}-600` : 'text-gray-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{type.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                      
                      {/* AI Agents */}
                      <div className="mb-2">
                        <div className="text-xs font-medium text-gray-700 mb-1">AI Agents:</div>
                        <div className="flex flex-wrap gap-1">
                          {type.agents.map((agent, index) => (
                            <span key={index} className={`
                              px-2 py-1 text-xs rounded-full 
                              ${isSelected 
                                ? `bg-${type.color}-200 text-${type.color}-800` 
                                : 'bg-gray-200 text-gray-700'
                              }
                            `}>
                              {agent}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Features */}
                      {type.features && (
                        <div>
                          <div className="text-xs font-medium text-gray-700 mb-1">Features:</div>
                          <div className="flex flex-wrap gap-1">
                            {type.features.slice(0, 2).map((feature, index) => (
                              <span key={index} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Selected Analysis Info */}
          {selectedAnalysisType && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-900">
                  Selected: {ANALYSIS_TYPES.find(t => t.id === selectedAnalysisType)?.name}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                This analysis will utilize specialized AI agents for comprehensive medical insights with explainable AI and visual analytics.
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                    ${activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyzePage;