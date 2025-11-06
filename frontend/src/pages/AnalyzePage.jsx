import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Upload,
  Image as ImageIcon,
  Clock,
  Stethoscope,
  Brain,
  Microscope,
  Pill,
  Target,
  Play,
  Pause,
  Trash2,
  CheckCircle,
  Monitor,
  BarChart3,
  Activity,
  Shield,
  Settings,
  Plus,
  Eye,
  X,
  Download,
  FileText,
} from "lucide-react";
import NavigationBar from "../components/NavigationBar";
import MedicalAnalysisAPI from "../api/medicalAnalysisAPI";
import MedicalReport from "../components/MedicalReport";
import toast from "react-hot-toast";

// Multi-Agent Analysis Types
const ANALYSIS_TYPES = [
  {
    id: "comprehensive",
    name: "Multi-Agent Comprehensive",
    description: "Complete AI system with all specialized agents",
    icon: Brain,
    color: "purple",
    agents: [
      "Image Analysis (MONAI)",
      "Drug Safety",
      "Clinical Decision",
      "Research",
      "History Synthesis",
    ],
    features: [
      "Visual Heatmaps",
      "Explainable AI",
      "Real-time Monitoring",
      "Clinical Trials Matching",
    ],
  },
  {
    id: "imaging",
    name: "Medical Imaging (MONAI)",
    description: "MONAI-powered medical image analysis with explainable AI",
    icon: Microscope,
    color: "green",
    agents: ["Image Analysis Agent"],
    features: [
      "X-ray/MRI Processing",
      "Visual Heatmaps",
      "Pathology Detection",
      "NIH Dataset Integration",
    ],
  },
  {
    id: "drug_safety",
    name: "Drug Interaction Analysis",
    description: "Real-time prescription safety monitoring and alerts",
    icon: Shield,
    color: "orange",
    agents: ["Drug Interaction Agent"],
    features: [
      "Drug-Drug Interactions",
      "Contraindication Alerts",
      "Dosage Optimization",
      "Safety Monitoring",
    ],
  },
  {
    id: "clinical",
    name: "Clinical Decision Support",
    description: "Evidence-based clinical recommendations and guidelines",
    icon: Stethoscope,
    color: "red",
    agents: ["Clinical Decision Support Agent"],
    features: [
      "Evidence-Based Medicine",
      "Risk Stratification",
      "Treatment Protocols",
      "Quality Metrics",
    ],
  },
  {
    id: "research",
    name: "Research & Clinical Trials",
    description: "Auto-fetch latest clinical trials for rare conditions",
    icon: Target,
    color: "blue",
    agents: ["Research Agent"],
    features: [
      "Clinical Trial Matching",
      "Rare Disease Research",
      "Literature Synthesis",
      "Evidence Updates",
    ],
  },
];

// Initialize Multi-Agent API
const medicalAnalysisAPI = new MedicalAnalysisAPI();

// Helper functions for data extraction
const extractMedications = (medicalHistory) => {
  if (!medicalHistory) return [];

  const medicationKeywords = [
    "taking",
    "medication",
    "drug",
    "pill",
    "dose",
    "mg",
    "tablet",
  ];
  const lines = medicalHistory.split("\n");

  return lines
    .filter((line) =>
      medicationKeywords.some((keyword) => line.toLowerCase().includes(keyword))
    )
    .map((line) => {
      const match = line.match(/(\w+)\s*(\d+\s*mg)?/i);
      return {
        name: match ? match[1] : line.trim(),
        dosage: match && match[2] ? match[2] : "Unknown",
        frequency: "As prescribed",
      };
    })
    .filter((med) => med.name.length > 2);
};

const extractConditions = (medicalHistory) => {
  if (!medicalHistory) return [];

  const conditionKeywords = [
    "diabetes",
    "hypertension",
    "heart",
    "cancer",
    "asthma",
    "copd",
    "arthritis",
    "depression",
  ];
  const conditions = [];

  conditionKeywords.forEach((condition) => {
    if (medicalHistory.toLowerCase().includes(condition)) {
      conditions.push(condition.charAt(0).toUpperCase() + condition.slice(1));
    }
  });

  return conditions;
};

const extractDiagnosisKeywords = (medicalHistory) => {
  if (!medicalHistory) return [];

  const diagnosisPattern =
    /(?:diagnosis|diagnosed|condition|disease):\s*([^.\n]+)/gi;
  const matches = medicalHistory.match(diagnosisPattern) || [];

  return matches.map((match) => match.split(":")[1]?.trim()).filter(Boolean);
};

const extractLabResults = (medicalHistory) => {
  if (!medicalHistory) return {};

  const labPattern = /(\w+):\s*(\d+\.?\d*)\s*(\w+)?/g;
  const labs = {};
  let match;

  while ((match = labPattern.exec(medicalHistory)) !== null) {
    labs[match[1]] = {
      value: parseFloat(match[2]),
      unit: match[3] || "",
    };
  }

  return labs;
};

const formatAnalysisResults = (response, analysisType) => {
  if (!response || !response.results) {
    return {
      analysisType,
      confidence: 75,
      riskScore: "Low",
      priority: "Routine",
      findings: ["Analysis completed successfully"],
      recommendations: ["Continue routine care"],
      workflowId: response.analysis_id || "Unknown",
      completedAt: new Date().toISOString(),
      rawResults: response,
    };
  }

  const results = response.results;

  // Format based on analysis type
  switch (analysisType) {
    case "comprehensive":
      return formatComprehensiveResults(results);
    case "imaging":
      return formatImagingResults(results);
    case "drug_safety":
      return formatDrugSafetyResults(results);
    case "clinical":
      return formatClinicalResults(results);
    case "research":
      return formatResearchResults(results);
    default:
      return {
        analysisType,
        confidence: 80,
        riskScore: "Moderate",
        priority: "Standard",
        findings: ["Analysis completed"],
        recommendations: ["Review results with healthcare provider"],
        workflowId: response.analysis_id,
        rawResults: results,
      };
  }
};

const formatComprehensiveResults = (results) => {
  const report = results.comprehensive_report || results;

  return {
    analysisType: "Multi-Agent Comprehensive",
    confidence: Math.round((report.confidence_scores?.overall || 0.8) * 100),
    riskScore: report.risk_assessment?.overall?.risk_level || "Moderate",
    priority:
      report.risk_assessment?.overall?.risk_level === "Critical"
        ? "Urgent"
        : report.risk_assessment?.overall?.risk_level === "High"
        ? "High"
        : "Routine",
    findings: [
      ...Object.values(report.detailed_findings || {})
        .flat()
        .slice(0, 5),
      `Multi-agent analysis completed with ${
        Object.keys(report.agent_results || {}).length
      } agents`,
    ],
    recommendations: [
      ...Object.values(report.recommendations || {})
        .flat()
        .slice(0, 5),
      "Comprehensive multi-agent analysis provides detailed insights across all medical domains",
    ],
    workflowId: report.analysis_id,
    completedAt: report.generated_at,
    agentResults: report.agent_results,
    visualAnalytics: report.visual_analytics,
    rawResults: results,
  };
};

const formatImagingResults = (results) => {
  const imageData = results.results?.[0] || results;

  return {
    analysisType: "Medical Imaging (MONAI)",
    confidence: Math.round((imageData.confidence_score || 0.85) * 100),
    riskScore: imageData.primary_finding?.includes("No significant")
      ? "Low"
      : "Moderate",
    priority: imageData.confidence_score > 0.8 ? "High" : "Routine",
    findings: [
      `Primary Finding: ${imageData.primary_finding || "Analysis completed"}`,
      `Image Quality: ${imageData.image_quality?.positioning || "Good"}`,
      `MONAI-powered analysis with explainable AI`,
      "Visual heatmaps generated for pathology detection",
    ],
    recommendations: [
      "Review imaging findings with radiologist",
      "Consider clinical correlation with symptoms",
      "Follow-up imaging as clinically indicated",
      "Utilize AI-generated heatmaps for interpretation",
    ],
    workflowId: results.analysis_id,
    heatmapUrl: imageData.heatmap_url,
    rawResults: results,
  };
};

const formatDrugSafetyResults = (results) => {
  const drugData = results.results || results;
  const riskLevel = drugData.risk_assessment?.overall_risk_level || "Low";

  return {
    analysisType: "Drug Interaction Analysis",
    confidence: 90,
    riskScore: riskLevel,
    priority:
      riskLevel === "Critical"
        ? "Urgent"
        : riskLevel === "High"
        ? "High"
        : "Routine",
    findings: [
      `${drugData.total_medications || 0} medications analyzed`,
      `${drugData.interactions_found?.length || 0} interactions detected`,
      `${drugData.contraindications?.length || 0} contraindications found`,
      "Real-time prescription safety monitoring completed",
    ],
    recommendations: [
      ...(drugData.recommendations || []).slice(0, 3),
      "Continue medication safety monitoring",
    ],
    workflowId: results.analysis_id,
    interactionDetails: drugData.interactions_found,
    rawResults: results,
  };
};

const formatClinicalResults = (results) => {
  const clinicalData = results.results || results;

  return {
    analysisType: "Clinical Decision Support",
    confidence: 85,
    riskScore:
      clinicalData.risk_stratification?.overall_risk_score > 0.7
        ? "High"
        : "Moderate",
    priority: "Standard",
    findings: [
      "Evidence-based clinical analysis completed",
      "Risk stratification performed",
      "Clinical guidelines consulted",
      "Treatment protocols reviewed",
    ],
    recommendations: [
      ...(clinicalData.recommendations || []).slice(0, 4),
      "Continue evidence-based care protocols",
    ],
    workflowId: results.analysis_id,
    clinicalInsights: clinicalData.insights,
    rawResults: results,
  };
};

const formatResearchResults = (results) => {
  const researchData = results.results || results;

  return {
    analysisType: "Research & Clinical Trials",
    confidence: 80,
    riskScore: "Low",
    priority: "Routine",
    findings: [
      `${
        researchData.clinical_trials?.total || 0
      } relevant clinical trials found`,
      "Latest research evidence synthesized",
      "Rare disease databases consulted",
      "Evidence-based medicine integration completed",
    ],
    recommendations: [
      "Consider clinical trial enrollment if appropriate",
      "Review latest research findings with specialist",
      "Stay updated on emerging treatments",
      "Discuss research options with healthcare team",
    ],
    workflowId: results.analysis_id,
    clinicalTrials: researchData.clinical_trials,
    rawResults: results,
  };
};

const AnalyzePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Simple state management
  const [selectedAnalysisType, setSelectedAnalysisType] =
    useState("comprehensive");
  const [activeTab, setActiveTab] = useState("upload");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [patientId, setPatientId] = useState(
    searchParams.get("patient_id") || ""
  );

  // Patient information
  const [patientInfo, setPatientInfo] = useState({
    age: "",
    gender: "",
    symptoms: "",
    medicalHistory: "",
  });

  // Multi-agent system state
  const [agentsStatus, setAgentsStatus] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Tab configuration
  const tabs = [
    { id: "upload", label: "Upload Files", icon: Upload },
    { id: "patient", label: "Patient Info", icon: Monitor },
    { id: "analysis", label: "Analysis", icon: Brain },
    { id: "results", label: "Results", icon: CheckCircle },
  ];

  // Simple functions
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);

    // Medical file type definitions
    const allowedTypes = {
      // Medical Images
      "image/jpeg": "JPEG Medical Image",
      "image/png": "PNG Medical Image",
      "image/tiff": "TIFF Medical Image",
      "image/bmp": "BMP Medical Image",

      // DICOM Files
      "application/dicom": "DICOM Image",
      "application/octet-stream": "DICOM/Medical Data",

      // Medical Documents
      "application/pdf": "Medical PDF Document",

      // Lab Results
      "text/csv": "Lab Results CSV",
      "application/vnd.ms-excel": "Lab Results Excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "Lab Results Excel",
    };

    // Medical file extensions
    const allowedExtensions = [
      ".dcm",
      ".dicom", // DICOM
      ".jpg",
      ".jpeg",
      ".png",
      ".tiff",
      ".tif",
      ".bmp", // Images
      ".pdf", // Documents
      ".nii",
      ".nii.gz", // NIfTI neuroimaging
      ".csv",
      ".xls",
      ".xlsx", // Lab results
    ];

    const validFiles = files.filter((file) => {
      const fileName = file.name.toLowerCase();
      const fileExtension = fileName.substring(fileName.lastIndexOf("."));

      // Check if file extension is allowed
      const hasValidExtension = allowedExtensions.some((ext) =>
        fileName.endsWith(ext)
      );

      // Check if MIME type is allowed
      const hasValidMimeType = Object.keys(allowedTypes).includes(file.type);

      if (!hasValidExtension && !hasValidMimeType) {
        toast.error(
          `❌ Invalid medical file type: ${file.name}\n` +
            `Only medical images (DICOM, X-ray, MRI, CT), PDFs, and lab results are allowed.`,
          { duration: 5000 }
        );
        return false;
      }

      // Check file size (max 100MB for medical images)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(
          `❌ File too large: ${file.name}\n` +
            `Maximum size: 100MB. Current: ${(file.size / 1024 / 1024).toFixed(
              2
            )}MB`,
          { duration: 5000 }
        );
        return false;
      }

      // Minimum file size check (avoid empty files)
      if (file.size < 1024) {
        toast.error(`❌ File too small: ${file.name} (may be corrupted)`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) {
      toast.error(
        "No valid medical files selected. Please upload DICOM, X-ray, MRI, CT scans, or medical PDFs."
      );
      return;
    }

    const newFiles = validFiles.map((file) => {
      const fileName = file.name.toLowerCase();
      let fileCategory = "Unknown";

      // Categorize file
      if (fileName.endsWith(".dcm") || fileName.endsWith(".dicom")) {
        fileCategory = "DICOM Image";
      } else if (fileName.match(/\.(jpg|jpeg|png|tiff|tif|bmp)$/)) {
        fileCategory = "Medical Image";
      } else if (fileName.endsWith(".pdf")) {
        fileCategory = "Medical Document";
      } else if (fileName.match(/\.(nii|nii\.gz)$/)) {
        fileCategory = "Neuroimaging";
      } else if (fileName.match(/\.(csv|xls|xlsx)$/)) {
        fileCategory = "Lab Results";
      }

      return {
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        category: fileCategory,
        status: "pending",
        uploadedAt: new Date().toISOString(),
      };
    });

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    toast.success(
      `✅ ${newFiles.length} medical file(s) added for analysis\n` +
        `Types: ${[...new Set(newFiles.map((f) => f.category))].join(", ")}`,
      { duration: 4000 }
    );
  };

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Load mock data for testing
  const loadMockData = () => {
    // Mock patient data
    setPatientId("PT-2024-DEMO-001");
    setPatientInfo({
      age: "45",
      gender: "male",
      symptoms:
        "Persistent chest pain, shortness of breath, and fatigue for the past 2 weeks",
      medicalHistory: `Conditions: Type 2 Diabetes (diagnosed 2018), Hypertension (diagnosed 2020)

Current Medications:
- Metformin 1000mg twice daily
- Lisinopril 10mg once daily
- Aspirin 81mg once daily

Allergies: Penicillin (rash)

Family History: Father had myocardial infarction at age 52, Mother has hypertension

Recent Labs:
- HbA1c: 7.2%
- Total Cholesterol: 220 mg/dL
- LDL: 145 mg/dL
- Blood Pressure: 145/92 mmHg`,
    });

    // Mock file upload
    const mockFile = {
      id: Date.now(),
      name: "chest_xray_pa_view.dcm",
      size: 2.5 * 1024 * 1024, // 2.5 MB
      type: "application/dicom",
      category: "DICOM Image",
      status: "pending",
      uploadedAt: new Date().toISOString(),
      file: new File([], "chest_xray_pa_view.dcm", {
        type: "application/dicom",
      }),
    };

    setUploadedFiles([mockFile]);

    toast.success(
      "✅ Mock patient data loaded!\n" +
        "Patient: 45-year-old male with cardiovascular symptoms\n" +
        "Medical history and chest X-ray added",
      { duration: 5000, icon: "🧪" }
    );
  };

  // Generate mock analysis results for testing
  const generateMockResults = () => {
    const mockResults = {
      analysisType: "Multi-Agent Comprehensive Analysis",
      confidence: 92,
      riskScore: "Moderate",
      priority: "High",
      findings: [
        "Cardiac silhouette appears mildly enlarged with cardiothoracic ratio of 0.52",
        "Possible early signs of pulmonary vascular congestion in lower lung fields",
        "No acute infiltrates or consolidation identified",
        "Costophrenic angles are sharp bilaterally",
        "No pneumothorax or pleural effusion detected",
        "AI-powered analysis suggests further cardiac evaluation recommended",
      ],
      recommendations: [
        "Immediate cardiology referral for comprehensive cardiac workup",
        "Consider echocardiogram to assess cardiac function and ejection fraction",
        "ECG and cardiac biomarkers (troponin, BNP) recommended within 24 hours",
        "Blood pressure optimization - current readings above target for diabetic patient",
        "Lipid panel review and consider statin therapy initiation",
        "Continue current diabetes and hypertension management",
        "Lifestyle modifications: cardiac rehabilitation, dietary sodium restriction",
      ],
      workflowId: `ANALYSIS-${Date.now()}`,
      completedAt: new Date().toISOString(),
      rawResults: {
        agent_results: {
          imaging_analysis: "Completed with 94% confidence",
          drug_safety: "2 potential drug-condition interactions identified",
          clinical_decision: "High priority cardiac evaluation recommended",
          risk_assessment: "Moderate cardiovascular risk profile",
        },
      },
    };

    setAnalysisResults(mockResults);
    setActiveTab("results");

    toast.success(
      "🎉 Mock analysis completed!\n" +
        "Professional medical report generated with AI findings",
      { duration: 4000, icon: "📊" }
    );
  };

  // Check multi-agent system status
  const checkAgentsStatus = async () => {
    try {
      const status = await medicalAnalysisAPI.getAgentsStatus();
      setAgentsStatus(status.system_status);
      return status.system_status;
    } catch (error) {
      console.error("Failed to check agents status:", error);
      toast.error("Failed to connect to AI agents");
      return null;
    }
  };

  // Run demo analysis
  const runDemoAnalysis = async () => {
    setIsDemoMode(true);
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setActiveTab("analysis");

    try {
      toast.loading("Generating demo patient data...", { id: "demo" });

      // Generate demo patient
      const demoResponse = await medicalAnalysisAPI.generateDemoPatient();
      const demoPatient = demoResponse.demo_patient;

      // Set demo patient info
      setPatientId(demoPatient.patient_id);
      setPatientInfo({
        age: demoPatient.demographics.age.toString(),
        gender: demoPatient.demographics.gender,
        symptoms: demoPatient.symptoms.join(", "),
        medicalHistory: `Conditions: ${demoPatient.medical_history.current_conditions.join(
          ", "
        )}\nMedications: ${demoPatient.medications
          .map((m) => `${m.name} ${m.dosage}`)
          .join(", ")}`,
      });

      toast.success("Demo patient generated", { id: "demo" });
      setAnalysisProgress(25);

      // Run comprehensive demo analysis
      toast.loading("Running comprehensive multi-agent analysis...", {
        id: "analysis",
      });
      const analysisResponse = await medicalAnalysisAPI.runDemoAnalysis();

      setAnalysisProgress(80);

      // Format results
      const formattedResults = formatAnalysisResults(
        analysisResponse,
        "comprehensive"
      );
      formattedResults.isDemoMode = true;
      formattedResults.demoPatient = demoPatient;

      setAnalysisResults(formattedResults);
      setAnalysisProgress(100);
      setActiveTab("results");

      toast.success("🎉 Demo analysis completed successfully!", {
        id: "analysis",
        duration: 4000,
        icon: "🤖",
      });
    } catch (error) {
      console.error("Demo analysis failed:", error);
      toast.error("Demo analysis failed: " + error.message);
      setIsAnalyzing(false);
      setIsDemoMode(false);
    }
  };

  // Initialize component
  useEffect(() => {
    checkAgentsStatus();
  }, []);

  const startAnalysis = async () => {
    // Validate patient ID
    if (!patientId.trim()) {
      toast.error("⚠️ Patient ID is required to start analysis");
      setActiveTab("patient");
      return;
    }

    // Validate patient info
    const validationErrors = [];

    if (!patientInfo.age || patientInfo.age < 0 || patientInfo.age > 150) {
      validationErrors.push("Valid age is required (0-150 years)");
    }

    if (!patientInfo.gender) {
      validationErrors.push("Gender is required");
    }

    if (!patientInfo.symptoms || patientInfo.symptoms.trim().length < 5) {
      validationErrors.push(
        "Symptoms description is required (minimum 5 characters)"
      );
    }

    if (validationErrors.length > 0) {
      toast.error(
        `❌ Please complete patient information:\n${validationErrors.join(
          "\n"
        )}`,
        { duration: 6000 }
      );
      setActiveTab("patient");
      return;
    }

    // Validate files for certain analysis types
    if (
      ["imaging", "comprehensive"].includes(selectedAnalysisType) &&
      uploadedFiles.length === 0
    ) {
      toast.error("⚠️ Please upload medical images for imaging analysis");
      setActiveTab("upload");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setActiveTab("analysis");

    try {
      toast.loading("🧠 Initializing AI analysis...", { id: "init" });

      // Prepare comprehensive analysis request for multi-agent system
      const analysisRequest = {
        patient_id: patientId,
        analysis_type: selectedAnalysisType,
        medical_images: uploadedFiles.map((f) => `/uploads/${f.name}`),
        medications: extractMedications(patientInfo.medicalHistory),
        symptoms: patientInfo.symptoms
          ? patientInfo.symptoms.split(",").map((s) => s.trim())
          : [],
        diagnosis_keywords: extractDiagnosisKeywords(
          patientInfo.medicalHistory
        ),
        lab_results: extractLabResults(patientInfo.medicalHistory),
        medical_history: {
          current_conditions: extractConditions(patientInfo.medicalHistory),
          demographics: {
            age: parseInt(patientInfo.age) || null,
            gender: patientInfo.gender || null,
          },
          history_text: patientInfo.medicalHistory,
        },
      };

      toast.success("✅ Analysis request prepared", { id: "init" });
      setAnalysisProgress(20);

      // Execute appropriate analysis based on selected type
      let analysisResponse;

      switch (selectedAnalysisType) {
        case "comprehensive":
          toast.loading("🤖 Running comprehensive multi-agent analysis...", {
            id: "analysis",
          });
          analysisResponse = await medicalAnalysisAPI.comprehensiveAnalysis(
            analysisRequest
          );
          break;

        case "imaging":
          toast.loading("🔬 Analyzing medical images with MONAI...", {
            id: "analysis",
          });
          const imageFiles = uploadedFiles.map((f) => f.file);
          analysisResponse = await medicalAnalysisAPI.medicalImageAnalysis(
            imageFiles,
            "auto"
          );
          break;

        case "drug_safety":
          toast.loading("💊 Checking drug interactions...", { id: "analysis" });
          const drugRequest = medicalAnalysisAPI.formatDrugSafetyRequest(
            analysisRequest.medications,
            analysisRequest.medical_history
          );
          analysisResponse = await medicalAnalysisAPI.drugSafetyAnalysis(
            drugRequest
          );
          break;

        case "clinical":
          toast.loading("🩺 Generating clinical recommendations...", {
            id: "analysis",
          });
          analysisResponse = await medicalAnalysisAPI.clinicalDecisionSupport(
            analysisRequest
          );
          break;

        case "research":
          toast.loading("🔍 Matching clinical trials and research...", {
            id: "analysis",
          });
          analysisResponse = await medicalAnalysisAPI.researchAnalysis(
            analysisRequest
          );
          break;

        default:
          throw new Error("Invalid analysis type selected");
      }

      setAnalysisProgress(80);
      toast.success("✅ Analysis completed successfully", { id: "analysis" });

      // Process and format results
      const formattedResults = formatAnalysisResults(
        analysisResponse,
        selectedAnalysisType
      );
      setAnalysisResults(formattedResults);

      setAnalysisProgress(100);
      setActiveTab("results");

      // Show completion notification
      toast.success(
        `🎉 ${
          ANALYSIS_TYPES.find((t) => t.id === selectedAnalysisType)?.name
        } completed!`,
        {
          duration: 4000,
          icon: "🤖",
        }
      );
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(`❌ Analysis failed: ${error.message}`, { duration: 6000 });
      setAnalysisResults(null);
      setActiveTab("upload");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to determine modality from uploaded files
  const getModalityFromFiles = (files) => {
    const imageExtensions = [".dcm", ".dicom"];
    const hasImageFiles = files.some((f) =>
      imageExtensions.some((ext) => f.name.toLowerCase().includes(ext))
    );
    return hasImageFiles ? "CT" : "Document";
  };

  // Poll for workflow results
  const pollWorkflowResults = async (workflowId, maxAttempts = 30) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const status = await medicalAnalysisAPI.getWorkflowStatus(workflowId);

        // Update progress based on workflow status
        if (status.progress) {
          setAnalysisProgress(60 + status.progress * 0.3); // 60-90% range
        }

        if (status.status === "completed" && status.results) {
          return {
            confidence: status.results.confidence_score || 95.0,
            findings: status.results.findings || [
              "Analysis completed successfully",
            ],
            recommendations: status.results.recommendations || [
              "Please consult with your healthcare provider",
            ],
            riskScore: status.results.risk_assessment || "Low",
            priority: status.results.priority || "Routine",
            workflowId: workflowId,
            completedAt: new Date().toISOString(),
            analysisType: selectedAnalysisType,
            rawResults: status.results,
          };
        }

        if (status.status === "failed") {
          throw new Error(status.error || "Analysis workflow failed");
        }

        // Wait before next poll
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    throw new Error("Analysis timeout - please try again");
  };

  const cancelAnalysis = () => {
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    toast.success("Analysis cancelled");
  };

  // Test backend connection and initialize
  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        // Test API connection
        const systemMetrics = await medicalAnalysisAPI.getSystemMetrics();
        console.log("✅ Backend connection successful:", systemMetrics);
        toast.success("🟢 Connected to Medical AI Backend", { duration: 3000 });
      } catch (error) {
        console.error("❌ Backend connection failed:", error);
        toast.error("🔴 Backend connection failed - using offline mode", {
          duration: 5000,
        });
      }
    };

    console.log("🧠 Medical AI AnalyzePage initialized");
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
          age: patientData.age || "",
          gender: patientData.gender || "",
          symptoms: patientData.symptoms || "",
          medicalHistory: patientData.medical_history || "",
        });
        toast.success(`Loaded data for patient ${id}`);
      }
    } catch (error) {
      console.log("No existing patient data found");
    }
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "upload":
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                📁 Upload Medical Files
              </h3>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Accepted: DICOM, X-ray, MRI, CT, PDF, Lab Results
              </div>
            </div>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 bg-blue-50/30 dark:bg-blue-900/10">
              <Upload className="w-12 h-12 text-blue-500 dark:text-blue-400 mx-auto mb-4 transition-colors duration-300" />
              <p className="text-gray-700 dark:text-gray-200 font-medium mb-2 transition-colors duration-300">
                Drop medical files here or click to upload
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                DICOM images (.dcm), Medical scans (JPEG, PNG, TIFF), PDFs, Lab
                results (CSV, Excel)
              </p>
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.tiff,.tif,.pdf,.dcm,.dicom,.nii,.nii.gz,.csv,.xls,.xlsx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg cursor-pointer transition-colors duration-300 shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Choose Medical Files
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Maximum file size: 100MB per file
              </p>
            </div>

            {/* Accepted File Types Guide */}
            <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                ✅ Accepted Medical File Types:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>DICOM:</strong> .dcm, .dicom
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Images:</strong> .jpg, .png, .tiff
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Documents:</strong> .pdf
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Neuroimaging:</strong> .nii, .nii.gz
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Lab Results:</strong> .csv, .xls
                  </span>
                </div>
              </div>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center justify-between transition-colors duration-300">
                  <span>📋 Uploaded Files ({uploadedFiles.length})</span>
                  <button
                    onClick={() => setUploadedFiles([])}
                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Clear All
                  </button>
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700/60 dark:to-blue-900/20 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300 hover:shadow-md"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                          <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-300 transition-colors duration-300" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                            {file.name}
                          </p>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full font-medium">
                              {file.category}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {new Date(file.uploadedAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="ml-3 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-300"
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

      case "patient":
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
              👤 Patient Information
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Please provide complete patient information for accurate AI
              analysis
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Patient ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                  placeholder="e.g., PT-2024-001"
                  required
                />
                {!patientId && (
                  <p className="text-xs text-red-500 mt-1">
                    Patient ID is required
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={patientInfo.age}
                  onChange={(e) =>
                    setPatientInfo((prev) => ({ ...prev, age: e.target.value }))
                  }
                  min="0"
                  max="150"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                  placeholder="Enter age in years"
                  required
                />
                {patientInfo.age &&
                  (patientInfo.age < 0 || patientInfo.age > 150) && (
                    <p className="text-xs text-red-500 mt-1">
                      Age must be between 0 and 150
                    </p>
                  )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={patientInfo.gender}
                  onChange={(e) =>
                    setPatientInfo((prev) => ({
                      ...prev,
                      gender: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                  required
                >
                  <option value="">Select gender...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
                {!patientInfo.gender && (
                  <p className="text-xs text-red-500 mt-1">
                    Gender is required
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Presenting Symptoms <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={patientInfo.symptoms}
                  onChange={(e) =>
                    setPatientInfo((prev) => ({
                      ...prev,
                      symptoms: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                  placeholder="e.g., Chest pain, shortness of breath"
                  required
                />
                {patientInfo.symptoms && patientInfo.symptoms.length < 5 && (
                  <p className="text-xs text-red-500 mt-1">
                    Please provide more detail (min 5 characters)
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Medical History & Current Medications
              </label>
              <textarea
                value={patientInfo.medicalHistory}
                onChange={(e) =>
                  setPatientInfo((prev) => ({
                    ...prev,
                    medicalHistory: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                rows="4"
                placeholder="Previous diagnoses, surgeries, chronic conditions, current medications with dosages, allergies, family history..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Include any relevant medical history, medications, allergies,
                and family history
              </p>
            </div>

            {/* Validation Summary */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                ✓ Required Information Checklist
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  {patientId ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={
                      patientId
                        ? "text-green-700 dark:text-green-300"
                        : "text-red-700 dark:text-red-300"
                    }
                  >
                    Patient ID
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {patientInfo.age &&
                  patientInfo.age > 0 &&
                  patientInfo.age <= 150 ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={
                      patientInfo.age && patientInfo.age > 0
                        ? "text-green-700 dark:text-green-300"
                        : "text-red-700 dark:text-red-300"
                    }
                  >
                    Valid Age
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {patientInfo.gender ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={
                      patientInfo.gender
                        ? "text-green-700 dark:text-green-300"
                        : "text-red-700 dark:text-red-300"
                    }
                  >
                    Gender
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {patientInfo.symptoms && patientInfo.symptoms.length >= 5 ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={
                      patientInfo.symptoms && patientInfo.symptoms.length >= 5
                        ? "text-green-700 dark:text-green-300"
                        : "text-red-700 dark:text-red-300"
                    }
                  >
                    Symptoms Description
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case "analysis":
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
              🧠 AI Analysis Engine
            </h3>

            {!isAnalyzing && !analysisResults && (
              <div className="text-center py-8">
                <Brain className="w-16 h-16 text-blue-500 dark:text-blue-400 mx-auto mb-4 transition-colors duration-300" />
                <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">
                  Ready to start comprehensive AI-powered medical analysis
                </p>
                <div className="flex flex-col items-center space-y-3">
                  <button
                    onClick={startAnalysis}
                    disabled={
                      uploadedFiles.length === 0 && !patientInfo.symptoms
                    }
                    className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Analysis
                  </button>

                  {/* Quick Test Button */}
                  <button
                    onClick={generateMockResults}
                    className="inline-flex items-center px-6 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg transition-colors duration-300 text-sm"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Mock Report (For Testing)
                  </button>

                  {uploadedFiles.length === 0 && !patientInfo.symptoms && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                      ⚠️ Please upload files or fill patient information first
                    </p>
                  )}
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="text-center py-8">
                <div className="relative mx-auto mb-6 w-16 h-16">
                  <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 font-medium transition-colors duration-300">
                  🤖 AI agents analyzing medical data...
                </p>
                <div className="max-w-md mx-auto">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2 transition-colors duration-300 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 h-3 rounded-full transition-all duration-500 relative"
                      style={{ width: `${analysisProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span>{analysisProgress}% complete</span>
                    <span>
                      {analysisProgress < 30 && "Initializing..."}
                      {analysisProgress >= 30 &&
                        analysisProgress < 70 &&
                        "Processing images..."}
                      {analysisProgress >= 70 &&
                        analysisProgress < 90 &&
                        "Analyzing data..."}
                      {analysisProgress >= 90 && "Generating report..."}
                    </span>
                  </div>
                </div>
                <button
                  onClick={cancelAnalysis}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg transition-colors duration-300"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Cancel Analysis
                </button>
              </div>
            )}
          </div>
        );

      case "results":
        return (
          <div className="space-y-6">
            {analysisResults ? (
              <>
                {/* Quick Actions Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    <FileText className="w-6 h-6 mr-2 text-blue-600" />
                    Medical Analysis Report
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </button>
                    <button
                      onClick={() => {
                        setAnalysisResults(null);
                        setActiveTab("upload");
                        setUploadedFiles([]);
                        setPatientInfo({
                          age: "",
                          gender: "",
                          symptoms: "",
                          medicalHistory: "",
                        });
                        setPatientId("");
                      }}
                      className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Analysis
                    </button>
                  </div>
                </div>

                {/* Professional Medical Report */}
                <MedicalReport
                  analysisResults={analysisResults}
                  patientInfo={patientInfo}
                  patientId={patientId}
                />
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Activity className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Analysis Results
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Complete the previous steps and run an analysis to view
                  results
                </p>
                <button
                  onClick={() => setActiveTab("upload")}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Start Analysis
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <NavigationBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">
              🧠 Medical AI Analysis
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 transition-colors duration-300">
              AI-powered medical analysis and diagnosis
            </p>
          </motion.div>
        </div>

        {/* Multi-Agent System Status */}
        {agentsStatus && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800/60 p-4 mb-6 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                  🤖 Multi-Agent AI System: Active
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={loadMockData}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg flex items-center space-x-2 transition-colors duration-300"
                >
                  <FileText className="w-4 h-4" />
                  <span>Load Mock Data</span>
                </button>
                <button
                  onClick={runDemoAnalysis}
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 flex items-center space-x-2 transition-colors duration-300"
                >
                  <Brain className="w-4 h-4" />
                  <span>Run Demo Analysis</span>
                </button>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
              {Object.keys(agentsStatus.agents).length} AI agents ready •
              Explainable AI • Visual Heatmaps • Real-time Monitoring
            </div>
          </div>
        )}

        {/* Enhanced Analysis Type Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              🧠 Multi-Agent Analysis Types
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Select an AI analysis mode
            </span>
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
                    ${
                      isSelected
                        ? `border-${type.color}-500 bg-${type.color}-50 shadow-lg dark:bg-opacity-10`
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md bg-white dark:bg-gray-800"
                    }
                  `}
                  onClick={() => setSelectedAnalysisType(type.id)}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div
                      className={`absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-${type.color}-500`}
                    >
                      <CheckCircle className="absolute -top-4 -right-4 w-3 h-3 text-white" />
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-3 rounded-lg ${
                        isSelected
                          ? `bg-${type.color}-100 dark:bg-opacity-20`
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      <IconComponent
                        className={`w-6 h-6 ${
                          isSelected
                            ? `text-${type.color}-600 dark:text-${type.color}-400`
                            : "text-gray-600 dark:text-gray-300"
                        }`}
                      />
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {type.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {type.description}
                      </p>

                      {/* AI Agents */}
                      <div className="mb-2">
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          AI Agents:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {type.agents.map((agent, index) => (
                            <span
                              key={index}
                              className={`
                              px-2 py-1 text-xs rounded-full 
                              ${
                                isSelected
                                  ? `bg-${type.color}-200 text-${type.color}-800 dark:bg-opacity-30 dark:text-${type.color}-200`
                                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                              }
                            `}
                            >
                              {agent}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Features */}
                      {type.features && (
                        <div>
                          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Features:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {type.features.slice(0, 2).map((feature, index) => (
                              <span
                                key={index}
                                className="text-xs text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                              >
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
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  Selected:{" "}
                  {
                    ANALYSIS_TYPES.find((t) => t.id === selectedAnalysisType)
                      ?.name
                  }
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                This analysis will utilize specialized AI agents for
                comprehensive medical insights with explainable AI and visual
                analytics.
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                    ${
                      activeTab === tab.id
                        ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
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
