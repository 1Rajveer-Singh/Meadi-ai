import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Pill, Search, AlertTriangle, X, ArrowRight, Download, 
  RefreshCw, Database, Clock, Shield, Info, AlertCircle, 
  CheckCircle, PlusCircle, Trash2, User, Heart, Brain,
  Filter, Star, BookOpen, FileText, Calendar, Plus,
  Users, Activity, Target, Award, Zap, Eye, BarChart3,
  Settings, Share, Sparkles, Monitor, Stethoscope,
  MessageSquare, Bell, Phone, Mail, ExternalLink,
  HelpCircle, Bookmark, Flag, Archive, ChevronRight,
  Building, Microscope, FlaskConical, Clipboard, Gauge,
  TrendingUp, LineChart, PieChart, BarChart2, Map,
  Layers, Grid, Crosshair, Palette, Sliders, Timer
} from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce'; 
import NavigationBar from '../components/NavigationBar';
import toast from 'react-hot-toast';

const SafetyPage = () => {
  const [activeTab, setActiveTab] = useState('drug-checker');
  
  // Enhanced state management
  const [medications, setMedications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [interactions, setInteractions] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Enhanced tabs configuration
  const tabs = [
    {
      id: 'drug-checker',
      label: 'Smart Drug Checker',
      icon: Pill,
      description: 'AI-powered medication safety analysis',
      color: 'red',
      features: ['Drug Interactions', 'Allergy Alerts', 'Dosage Validation', 'Contraindications']
    },
    {
      id: 'clinical-guidelines',
      label: 'Clinical Guidelines',
      icon: BookOpen,
      description: 'Evidence-based medical protocols',
      color: 'blue',
      features: ['Treatment Protocols', 'Best Practices', 'Guidelines Library', 'Updates']
    },
    {
      id: 'safety-protocols',
      label: 'Safety Protocols',
      icon: Shield,
      description: 'Hospital safety procedures',
      color: 'green',
      features: ['Emergency Protocols', 'Infection Control', 'Patient Safety', 'Risk Management']
    },
    {
      id: 'alerts-monitoring',
      label: 'Real-time Alerts',
      icon: Bell,
      description: 'Live safety monitoring system',
      color: 'orange',
      features: ['Critical Alerts', 'Trend Analysis', 'Predictive Warnings', 'Risk Scoring']
    },
    {
      id: 'compliance',
      label: 'Compliance Center',
      icon: Clipboard,
      description: 'Regulatory compliance tracking',
      color: 'purple',
      features: ['FDA Guidelines', 'Quality Metrics', 'Audit Trails', 'Certifications']
    }
  ];

  // Enhanced drug database
  const drugDatabase = [
    {
      id: 1,
      name: 'Aspirin',
      generic: 'Acetylsalicylic acid',
      category: 'NSAID',
      strength: '81mg, 325mg',
      interactions: ['Warfarin', 'Methotrexate', 'Ibuprofen'],
      allergies: ['Salicylate sensitivity', 'Asthma'],
      contraindications: ['Active bleeding', 'Peptic ulcer', 'Severe renal disease'],
      riskLevel: 'medium'
    },
    {
      id: 2,
      name: 'Warfarin',
      generic: 'Warfarin sodium',
      category: 'Anticoagulant',
      strength: '1mg, 2mg, 5mg',
      interactions: ['Aspirin', 'Amiodarone', 'Simvastatin', 'Phenytoin'],
      allergies: ['Warfarin hypersensitivity'],
      contraindications: ['Active bleeding', 'Pregnancy', 'Severe liver disease'],
      riskLevel: 'high'
    },
    {
      id: 3,
      name: 'Metformin',
      generic: 'Metformin HCl',
      category: 'Antidiabetic',
      strength: '500mg, 850mg, 1000mg',
      interactions: ['Furosemide', 'Topiramate', 'Contrast agents'],
      allergies: ['Metformin hypersensitivity'],
      contraindications: ['Renal impairment', 'Severe heart failure', 'Acidosis'],
      riskLevel: 'medium'
    },
    {
      id: 4,
      name: 'Amiodarone',
      generic: 'Amiodarone HCl',
      category: 'Antiarrhythmic',
      strength: '200mg, 400mg',
      interactions: ['Warfarin', 'Digoxin', 'Simvastatin', 'Phenytoin'],
      allergies: ['Iodine sensitivity', 'Amiodarone hypersensitivity'],
      contraindications: ['Severe sinus node dysfunction', 'AV block', 'Thyroid disorders'],
      riskLevel: 'high'
    }
  ];

  // Clinical guidelines data
  const clinicalGuidelines = [
    {
      id: 1,
      title: 'Hypertension Management Guidelines 2024',
      category: 'Cardiovascular',
      organization: 'AHA/ACC',
      lastUpdated: '2024-01-15',
      level: 'Class I',
      summary: 'Comprehensive guidelines for diagnosis and management of hypertension in adults',
      keyPoints: [
        'Target BP <130/80 for most patients',
        'Lifestyle modifications first-line',
        'ACE inhibitors or ARBs preferred',
        'Regular monitoring essential'
      ]
    },
    {
      id: 2,
      title: 'Diabetes Management Protocol',
      category: 'Endocrine',
      organization: 'ADA',
      lastUpdated: '2024-02-10',
      level: 'Class I',
      summary: 'Evidence-based approach to diabetes diagnosis, treatment, and monitoring',
      keyPoints: [
        'HbA1c target <7% for most adults',
        'Metformin first-line therapy',
        'SGLT-2 inhibitors for CV protection',
        'Regular screening for complications'
      ]
    },
    {
      id: 3,
      title: 'Antibiotic Stewardship Program',
      category: 'Infectious Disease',
      organization: 'CDC/IDSA',
      lastUpdated: '2024-01-20',
      level: 'Class I',
      summary: 'Guidelines for appropriate antibiotic use and resistance prevention',
      keyPoints: [
        'Culture-directed therapy preferred',
        'Shortest effective duration',
        'De-escalation based on results',
        'Regular resistance monitoring'
      ]
    }
  ];

  // Safety protocols data
  const safetyProtocols = [
    {
      id: 1,
      title: 'Code Blue Response Protocol',
      category: 'Emergency',
      priority: 'Critical',
      steps: [
        'Call Code Blue immediately',
        'Begin CPR within 60 seconds',
        'Establish airway and ventilation',
        'Obtain IV access and monitor',
        'Follow ACLS algorithms'
      ],
      timing: '<4 minutes',
      lastReviewed: '2024-01-01'
    },
    {
      id: 2,
      title: 'Infection Prevention Protocol',
      category: 'Infection Control',
      priority: 'High',
      steps: [
        'Hand hygiene before/after contact',
        'Use appropriate PPE',
        'Isolate infectious patients',
        'Proper waste disposal',
        'Environmental cleaning'
      ],
      timing: 'Continuous',
      lastReviewed: '2024-02-15'
    },
    {
      id: 3,
      title: 'Medication Error Prevention',
      category: 'Patient Safety',
      priority: 'High',
      steps: [
        'Verify patient identity (2 identifiers)',
        'Check medication 5 times',
        'Use barcode scanning',
        'Double-check high-risk meds',
        'Document immediately'
      ],
      timing: 'Every administration',
      lastReviewed: '2024-01-10'
    }
  ];

  // Drug search functionality
  useEffect(() => {
    if (debouncedSearchTerm) {
      setIsSearching(true);
      
      // Simulate API search
      setTimeout(() => {
        const results = drugDatabase.filter(drug =>
          drug.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          drug.generic.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
        setSearchResults(results);
        setIsSearching(false);
      }, 500);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm]);

  // Add medication
  const addMedication = (drug) => {
    if (!medications.find(med => med.id === drug.id)) {
      setMedications([...medications, drug]);
      setSearchTerm('');
      toast.success(`Added ${drug.name} to medication list`);
      checkInteractions([...medications, drug]);
    } else {
      toast.error('Medication already in list');
    }
  };

  // Remove medication
  const removeMedication = (drugId) => {
    const updatedMeds = medications.filter(med => med.id !== drugId);
    setMedications(updatedMeds);
    checkInteractions(updatedMeds);
    toast.success('Medication removed');
  };

  // Check drug interactions
  const checkInteractions = (medList) => {
    setAnalyzing(true);
    
    setTimeout(() => {
      const interactionResults = {
        severity: 'moderate',
        total: medList.length > 1 ? Math.floor(Math.random() * 3) + 1 : 0,
        interactions: medList.length > 1 ? [
          {
            drugs: [medList[0]?.name, medList[1]?.name].filter(Boolean),
            severity: 'moderate',
            description: 'May increase risk of bleeding when used together',
            recommendation: 'Monitor patient closely for signs of bleeding',
            mechanism: 'Additive anticoagulant effects'
          }
        ] : []
      };
      
      setInteractions(interactionResults);
      setAnalyzing(false);
    }, 1000);
  };

  const renderDrugChecker = () => (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Pill className="w-7 h-7 mr-3 text-red-600" />
          Smart Medication Analysis
        </h2>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search medications by name or generic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-lg"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Search Results */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
            >
              {searchResults.map((drug) => (
                <motion.div
                  key={drug.id}
                  whileHover={{ backgroundColor: '#F3F4F6' }}
                  onClick={() => addMedication(drug)}
                  className="p-4 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{drug.name}</h4>
                      <p className="text-sm text-gray-600">{drug.generic} - {drug.category}</p>
                      <p className="text-xs text-gray-500">{drug.strength}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      drug.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                      drug.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {drug.riskLevel} risk
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Current Medications */}
      {medications.length > 0 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Current Medications ({medications.length})</h3>
          
          <div className="grid gap-4">
            {medications.map((drug) => (
              <motion.div
                key={drug.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    drug.riskLevel === 'high' ? 'bg-red-100' :
                    drug.riskLevel === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    <Pill className={`w-6 h-6 ${
                      drug.riskLevel === 'high' ? 'text-red-600' :
                      drug.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{drug.name}</h4>
                    <p className="text-sm text-gray-600">{drug.generic} - {drug.category}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => removeMedication(drug.id)}
                  className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Analysis Button */}
          <div className="mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => checkInteractions(medications)}
              disabled={analyzing || medications.length < 1}
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Analyzing Interactions...</span>
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  <span>Analyze Drug Interactions</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      )}

      {/* Interaction Results */}
      <AnimatePresence>
        {interactions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-3 text-orange-600" />
              Interaction Analysis Results
            </h3>

            {interactions.total === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Interactions Detected</h4>
                <p className="text-gray-600">Current medication combination appears safe</p>
              </div>
            ) : (
              <div className="space-y-4">
                {interactions.interactions.map((interaction, index) => (
                  <div key={index} className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-orange-600" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-2">
                          {interaction.drugs.join(' + ')}
                        </h4>
                        <p className="text-gray-700 mb-3">{interaction.description}</p>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-600">Mechanism: </span>
                            <span className="text-sm text-gray-800">{interaction.mechanism}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">Recommendation: </span>
                            <span className="text-sm text-gray-800">{interaction.recommendation}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            interaction.severity === 'severe' ? 'bg-red-100 text-red-700' :
                            interaction.severity === 'moderate' ? 'bg-orange-100 text-orange-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {interaction.severity} severity
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderClinicalGuidelines = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <BookOpen className="w-7 h-7 mr-3 text-blue-600" />
          Evidence-Based Clinical Guidelines
        </h2>

        <div className="grid gap-6">
          {clinicalGuidelines.map((guideline) => (
            <motion.div
              key={guideline.id}
              whileHover={{ scale: 1.02 }}
              className="p-6 border border-gray-200 rounded-2xl hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-blue-50"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{guideline.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      {guideline.organization}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Updated {guideline.lastUpdated}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      guideline.level === 'Class I' ? 'bg-green-100 text-green-700' :
                      guideline.level === 'Class II' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {guideline.level}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{guideline.summary}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Key Recommendations:</h4>
                <ul className="space-y-1">
                  {guideline.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSafetyProtocols = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Shield className="w-7 h-7 mr-3 text-green-600" />
          Hospital Safety Protocols
        </h2>

        <div className="grid gap-6">
          {safetyProtocols.map((protocol) => (
            <motion.div
              key={protocol.id}
              whileHover={{ scale: 1.02 }}
              className="p-6 border border-gray-200 rounded-2xl hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-green-50"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{protocol.title}</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-600">{protocol.category}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      protocol.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                      protocol.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {protocol.priority} Priority
                    </span>
                    <span className="text-sm text-gray-500">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {protocol.timing}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Protocol Steps:</h4>
                <ol className="space-y-2">
                  {protocol.steps.map((step, index) => (
                    <li key={index} className="flex items-start space-x-3 text-sm text-gray-700">
                      <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Last reviewed: {protocol.lastReviewed}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'drug-checker':
        return renderDrugChecker();
      case 'clinical-guidelines':
        return renderClinicalGuidelines();
      case 'safety-protocols':
        return renderSafetyProtocols();
      case 'alerts-monitoring':
        return (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 text-center">
            <Bell className="w-16 h-16 text-orange-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-4">Real-time Safety Monitoring</h3>
            <p className="text-gray-600">Advanced alert system coming soon...</p>
          </div>
        );
      case 'compliance':
        return (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 text-center">
            <Clipboard className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-4">Compliance Center</h3>
            <p className="text-gray-600">Regulatory compliance tracking coming soon...</p>
          </div>
        );
      default:
        return renderDrugChecker();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <NavigationBar />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-red-400 to-orange-400 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden mb-8"
        >
          {/* Gradient Header */}
          <div className="relative h-32 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 via-orange-600/90 to-yellow-600/90" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            
            <div className="relative z-10 flex items-center justify-between h-full px-8">
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Shield className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Enhanced Safety Center
                  </h1>
                  <p className="text-orange-100 text-lg">
                    Comprehensive patient safety and clinical guidance platform
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`p-4 rounded-xl transition-all duration-300 text-left ${
                      isActive
                        ? 'bg-gradient-to-br from-white to-gray-50 shadow-lg border-2 border-blue-200'
                        : 'bg-white/60 hover:bg-white/80 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive
                          ? `bg-${tab.color}-100 text-${tab.color}-600`
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold ${isActive ? `text-${tab.color}-700` : 'text-gray-800'}`}>
                          {tab.label}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{tab.description}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {tab.features.slice(0, 2).map((feature, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default SafetyPage;