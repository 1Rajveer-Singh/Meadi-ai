import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload, X, FileText, Image as ImageIcon, User, Calendar, 
  Phone, Mail, Heart, AlertCircle, Pill, FileImage,
  ChevronRight, ChevronLeft, Check, Clock, Stethoscope,
  Brain, Database, Microscope, Zap, Play, Pause, Download,
  Eye, Plus, Trash2, Edit3, Mic, MicOff, Volume2,
  Search, Filter, Maximize, Minimize, RotateCw, ZoomIn, 
  ZoomOut, PlusSquare, MinusSquare, Share, Save, Loader,
  EyeOff, Sparkles, Target, CheckCircle, Monitor, Layers,
  AlertTriangle, BarChart3, TrendingUp, Shield
} from 'lucide-react';
import NavigationBar from '../components/NavigationBar';

const AnalyzePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Determine active tab from URL or default
  const getActiveTabFromPath = () => {
    if (location.pathname.includes('/analysis/images')) return 'imaging';
    if (location.pathname.includes('/diagnosis/processing')) return 'processing';
    if (location.pathname.includes('/diagnosis/results')) return 'results';
    return 'diagnosis';
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());
  const priority = searchParams.get('priority') || 'routine';
  
  // Unified state for all analysis workflows
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('upload');
  const [results, setResults] = useState(null);

  // Form data for diagnosis workflow
  const [formData, setFormData] = useState({
    patientInfo: {
      patientId: '',
      autoGenerate: false,
      name: '',
      age: '',
      gender: '',
      contactInfo: { phone: '', email: '', address: '' },
      emergencyContact: { name: '', phone: '', relationship: '' },
      medicalRecordNumber: ''
    },
    medicalHistory: {
      uploadedFiles: [],
      previousDiagnoses: [],
      medications: [],
      allergies: [],
      conditions: [],
      ehrIntegration: false
    },
    analysisPreferences: {
      aiModels: ['general', 'specialized'],
      urgencyLevel: priority,
      requireSecondOpinion: false,
      generateReport: true
    }
  });

  // Image analysis state
  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [viewMode, setViewMode] = useState('standard');
  const canvasRef = useRef(null);

  // Tab configuration
  const tabs = [
    {
      id: 'diagnosis',
      label: 'New Diagnosis',
      icon: Stethoscope,
      description: 'Start comprehensive analysis',
      color: 'blue'
    },
    {
      id: 'imaging',
      label: 'Image Analysis',
      icon: ImageIcon,
      description: 'MONAI Studio & Imaging',
      color: 'purple'
    },
    {
      id: 'processing',
      label: 'Processing',
      icon: Brain,
      description: 'AI Analysis in Progress',
      color: 'green',
      badge: isProcessing ? 'Active' : null
    },
    {
      id: 'results',
      label: 'Results',
      icon: BarChart3,
      description: 'Analysis Results & Reports',
      color: 'orange',
      badge: results ? 'Ready' : null
    }
  ];

  // Handle file upload for image analysis
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/dicom': ['.dcm'],
      'image/*': []
    },
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file),
        id: `image-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      }));
      
      setImages(prev => [...prev, ...newFiles]);
      if (!activeImage) {
        setActiveImage(newFiles[0]);
      }
    }
  });

  // Mock analysis processing
  const startAnalysis = async (type = 'diagnosis') => {
    setIsProcessing(true);
    setProcessingStep('initializing');
    
    const steps = [
      { step: 'initializing', label: 'Initializing AI Models...', duration: 1000 },
      { step: 'preprocessing', label: 'Preprocessing Data...', duration: 2000 },
      { step: 'analysis', label: 'Running Analysis...', duration: 3000 },
      { step: 'validation', label: 'Validating Results...', duration: 1500 },
      { step: 'complete', label: 'Analysis Complete!', duration: 500 }
    ];

    for (const stepData of steps) {
      setProcessingStep(stepData.step);
      await new Promise(resolve => setTimeout(resolve, stepData.duration));
    }

    // Mock results
    setResults({
      diagnosis: {
        primary: 'Pneumonia - Community Acquired',
        confidence: 94.2,
        severity: 'Moderate',
        recommendations: [
          'Start antibiotic treatment',
          'Monitor oxygen saturation',
          'Follow-up in 48 hours'
        ]
      },
      analysis: {
        processingTime: '2.4 seconds',
        modelsUsed: ['ResNet-50', 'DenseNet-121', 'EfficientNet-B0'],
        accuracy: 96.7
      }
    });
    
    setIsProcessing(false);
    setActiveTab('results');
  };

  // Tab change handler with URL update
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Update URL without full navigation
    const newPath = {
      'diagnosis': '/diagnosis/new',
      'imaging': '/analysis/images',
      'processing': '/diagnosis/processing/current',
      'results': '/diagnosis/results/latest'
    }[tabId];
    
    if (newPath) {
      window.history.replaceState({}, '', newPath);
    }
  };

  const renderDiagnosisTab = () => (
    <div className="space-y-8">
      {/* Emergency Priority Banner */}
      {priority === 'emergency' && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
        >
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-800">Emergency Priority Analysis</h3>
            <p className="text-sm text-red-600">This case will be processed immediately with highest priority.</p>
          </div>
        </motion.div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center justify-between bg-white rounded-lg p-6 shadow-sm border">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
              ${currentStep >= step 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
              }
            `}>
              {currentStep > step ? <Check className="w-5 h-5" /> : step}
            </div>
            {step < 3 && (
              <div className={`
                w-20 h-1 mx-4
                ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Patient Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter patient name"
                  value={formData.patientInfo.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    patientInfo: { ...prev.patientInfo, name: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Age"
                  value={formData.patientInfo.age}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    patientInfo: { ...prev.patientInfo, age: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Upload Medical Data</h2>
            <div 
              {...getRootProps()} 
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drop medical images here, or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports: DICOM, PNG, JPEG, X-rays, CT scans, MRI
              </p>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Analysis Preferences</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-3">AI Models to Use</h3>
                <div className="space-y-2">
                  {['General Diagnosis', 'Specialized Imaging', 'Emergency Protocol'].map((model) => (
                    <label key={model} className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-3" />
                      <span className="text-gray-700">{model}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 inline mr-2" />
            Previous
          </button>
          
          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
              <ChevronRight className="w-4 h-4 inline ml-2" />
            </button>
          ) : (
            <button
              onClick={() => startAnalysis('diagnosis')}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700"
            >
              <Zap className="w-4 h-4 inline mr-2" />
              Start Analysis
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderImagingTab = () => (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Image Upload & List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Image Analysis Studio</h2>
        
        <div 
          {...getRootProps()} 
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          `}
        >
          <input {...getInputProps()} />
          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Upload Images</p>
          <p className="text-xs text-gray-500">DICOM, PNG, JPEG</p>
        </div>

        {/* Image List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {images.map((image) => (
            <div 
              key={image.id}
              onClick={() => setActiveImage(image)}
              className={`
                p-3 border rounded-lg cursor-pointer transition-colors
                ${activeImage?.id === image.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
              `}
            >
              <div className="flex items-center space-x-3">
                <img src={image.preview} alt="" className="w-12 h-12 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{image.name}</p>
                  <p className="text-xs text-gray-500">{(image.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Image Viewer */}
      <div className="lg:col-span-2 space-y-4">
        {activeImage ? (
          <>
            {/* Image Controls */}
            <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setZoomLevel(Math.max(0.1, zoomLevel - 0.1))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium">{Math.round(zoomLevel * 100)}%</span>
                <button 
                  onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.1))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAnnotations(!showAnnotations)}
                  className={`px-3 py-2 text-sm rounded-lg ${showAnnotations ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                >
                  <Eye className="w-4 h-4 inline mr-1" />
                  Annotations
                </button>
                <button
                  onClick={() => startAnalysis('imaging')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Brain className="w-4 h-4 inline mr-2" />
                  Analyze
                </button>
              </div>
            </div>

            {/* Image Display */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="relative overflow-hidden rounded-lg bg-gray-100" style={{ height: '500px' }}>
                <img 
                  src={activeImage.preview} 
                  alt="Medical scan"
                  className="w-full h-full object-contain"
                  style={{ transform: `scale(${zoomLevel})` }}
                />
                {showAnnotations && analysisResults && (
                  <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
                    Confidence: {analysisResults.confidence}%
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Select or upload an image to begin analysis</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderProcessingTab = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <Brain className="w-8 h-8 text-blue-600 animate-pulse" />
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">AI Analysis in Progress</h2>
          <p className="text-gray-600">
            {processingStep === 'initializing' && 'Initializing AI models...'}
            {processingStep === 'preprocessing' && 'Preprocessing medical data...'}
            {processingStep === 'analysis' && 'Running comprehensive analysis...'}
            {processingStep === 'validation' && 'Validating results for accuracy...'}
            {processingStep === 'complete' && 'Analysis complete!'}
          </p>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-1000"
            style={{ 
              width: {
                'initializing': '20%',
                'preprocessing': '40%',
                'analysis': '70%',
                'validation': '90%',
                'complete': '100%'
              }[processingStep]
            }}
          />
        </div>

        {isProcessing && (
          <div className="text-sm text-gray-500">
            Estimated time remaining: 2-5 minutes
          </div>
        )}
      </div>
    </div>
  );

  const renderResultsTab = () => (
    <div className="space-y-6">
      {results ? (
        <>
          {/* Results Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">Analysis Results</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Confidence:</span>
                <span className="text-lg font-semibold text-green-600">{results.diagnosis.confidence}%</span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Primary Diagnosis</h3>
                <p className="text-lg font-semibold text-gray-900">{results.diagnosis.primary}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Severity</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  results.diagnosis.severity === 'Moderate' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {results.diagnosis.severity}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Processing Time</h3>
                <p className="text-lg font-semibold text-gray-900">{results.analysis.processingTime}</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
            <div className="space-y-3">
              {results.diagnosis.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4 inline mr-2" />
              Download Report
            </button>
            <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Share className="w-4 h-4 inline mr-2" />
              Share Results
            </button>
            <button 
              onClick={() => {
                setCurrentStep(1);
                setActiveTab('diagnosis');
                setResults(null);
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              New Analysis
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No results available. Start a new analysis to see results here.</p>
        </div>
      )}
    </div>
  );

  // Cleanup image previews
  useEffect(() => {
    return () => {
      images.forEach(image => URL.revokeObjectURL(image.preview));
    };
  }, [images]);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Analysis Hub</h1>
          <p className="text-gray-600">Comprehensive diagnostic analysis and medical imaging studio</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    group flex items-center py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap
                    ${isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 mr-2 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                      isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'diagnosis' && renderDiagnosisTab()}
            {activeTab === 'imaging' && renderImagingTab()}
            {activeTab === 'processing' && renderProcessingTab()}
            {activeTab === 'results' && renderResultsTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnalyzePage;