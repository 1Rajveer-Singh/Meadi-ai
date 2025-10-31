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
  Building, Microscope, FlaskConical, Clipboard
} from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce'; 
import NavigationBar from '../components/NavigationBar';

const SafetyPage = () => {
  const [activeTab, setActiveTab] = useState('drugs');
  
  // Drug checker state
  const [medications, setMedications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [interactions, setInteractions] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Safety guidelines state
  const [selectedGuideline, setSelectedGuideline] = useState(null);
  const [guidelineSearch, setGuidelineSearch] = useState('');
  
  // Protocol state
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [protocolCategory, setProtocolCategory] = useState('emergency');

  const tabs = [
    {
      id: 'drugs',
      label: 'Drug Interactions',
      icon: Pill,
      description: 'Check medication safety',
      color: 'red'
    },
    {
      id: 'guidelines',
      label: 'Clinical Guidelines',
      icon: BookOpen,
      description: 'Evidence-based protocols',
      color: 'blue'
    },
    {
      id: 'protocols',
      label: 'Safety Protocols',
      icon: Shield,
      description: 'Emergency & routine procedures',
      color: 'green'
    },
    {
      id: 'compliance',
      label: 'Compliance',
      icon: CheckCircle,
      description: 'Regulatory requirements',
      color: 'purple'
    }
  ];

  // Mock medication database
  const medicationDatabase = [
    { id: 1, name: "Lisinopril", category: "ACE Inhibitor", dose: "10mg", riskLevel: "low" },
    { id: 2, name: "Metformin", category: "Antidiabetic", dose: "500mg", riskLevel: "low" },
    { id: 3, name: "Atorvastatin", category: "Statin", dose: "20mg", riskLevel: "medium" },
    { id: 4, name: "Amlodipine", category: "Calcium Channel Blocker", dose: "5mg", riskLevel: "low" },
    { id: 5, name: "Warfarin", category: "Anticoagulant", dose: "5mg", riskLevel: "high" },
    { id: 6, name: "Aspirin", category: "NSAID", dose: "81mg", riskLevel: "medium" },
    { id: 7, name: "Digoxin", category: "Cardiac Glycoside", dose: "0.25mg", riskLevel: "high" },
    { id: 8, name: "Lithium", category: "Mood Stabilizer", dose: "300mg", riskLevel: "high" }
  ];

  // Mock clinical guidelines
  const clinicalGuidelines = [
    {
      id: 1,
      title: "Anticoagulation in Atrial Fibrillation",
      category: "Cardiology",
      organization: "ACC/AHA",
      lastUpdated: "2023",
      summary: "Comprehensive guidelines for anticoagulation therapy in patients with atrial fibrillation",
      riskFactors: ["Age ≥65", "Heart failure", "Hypertension", "Diabetes"],
      recommendations: [
        "CHA2DS2-VASc score calculation required",
        "Direct oral anticoagulants preferred over warfarin",
        "Regular monitoring of renal function"
      ]
    },
    {
      id: 2,
      title: "Diabetes Management Protocol",
      category: "Endocrinology",
      organization: "ADA",
      lastUpdated: "2024",
      summary: "Evidence-based approach to diabetes mellitus management",
      riskFactors: ["HbA1c >7%", "Cardiovascular disease", "Nephropathy"],
      recommendations: [
        "Metformin as first-line therapy",
        "Target HbA1c <7% for most adults",
        "Regular cardiovascular risk assessment"
      ]
    },
    {
      id: 3,
      title: "Hypertension Management",
      category: "Cardiology",
      organization: "ESH/ESC",
      lastUpdated: "2023",
      summary: "Guidelines for diagnosis and management of hypertension",
      riskFactors: ["Age >55", "Family history", "Obesity", "Smoking"],
      recommendations: [
        "Target BP <140/90 mmHg for most patients",
        "ACE inhibitors or ARBs as first-line",
        "Lifestyle modifications essential"
      ]
    }
  ];

  // Mock safety protocols
  const safetyProtocols = [
    {
      id: 1,
      title: "Cardiac Arrest Protocol",
      category: "emergency",
      urgency: "critical",
      steps: [
        "Check responsiveness and breathing",
        "Call for help and AED",
        "Begin CPR immediately",
        "Follow ACLS guidelines"
      ],
      timeframe: "Immediate",
      equipment: ["AED", "CPR mask", "Emergency cart"]
    },
    {
      id: 2,
      title: "Medication Error Prevention",
      category: "routine",
      urgency: "medium",
      steps: [
        "Verify patient identity",
        "Check medication five rights",
        "Double-check high-risk medications",
        "Document administration"
      ],
      timeframe: "Every administration",
      equipment: ["Barcode scanner", "Medication chart"]
    },
    {
      id: 3,
      title: "Infection Control Protocol",
      category: "routine",
      urgency: "high",
      steps: [
        "Hand hygiene before/after patient contact",
        "Use appropriate PPE",
        "Follow isolation precautions",
        "Proper waste disposal"
      ],
      timeframe: "Continuous",
      equipment: ["PPE", "Hand sanitizer", "Isolation supplies"]
    }
  ];

  // Search for medications
  useEffect(() => {
    if (debouncedSearchTerm) {
      setIsSearching(true);
      setTimeout(() => {
        const results = medicationDatabase.filter(med => 
          med.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) &&
          !medications.some(m => m.id === med.id)
        );
        setSearchResults(results);
        setIsSearching(false);
      }, 300);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm, medications]);

  const addMedication = (med) => {
    setMedications([...medications, med]);
    setSearchTerm('');
    setSearchResults([]);
  };

  const removeMedication = (medId) => {
    setMedications(medications.filter(med => med.id !== medId));
    setInteractions(null);
  };

  const analyzeInteractions = () => {
    if (medications.length < 2) return;
    setAnalyzing(true);
    
    setTimeout(() => {
      const hasWarfarin = medications.some(m => m.name === "Warfarin");
      const hasAspirin = medications.some(m => m.name === "Aspirin");
      const hasDigoxin = medications.some(m => m.name === "Digoxin");
      const hasLisinopril = medications.some(m => m.name === "Lisinopril");
      
      const mockInteractions = [];
      
      if (hasWarfarin && hasAspirin) {
        mockInteractions.push({
          id: 1,
          severity: "severe",
          drugs: ["Warfarin", "Aspirin"],
          description: "Increased risk of bleeding",
          mechanism: "Both medications affect blood clotting",
          recommendation: "Avoid combination unless specifically directed by physician"
        });
      }
      
      if (hasDigoxin && hasLisinopril) {
        mockInteractions.push({
          id: 2,
          severity: "moderate",
          drugs: ["Digoxin", "Lisinopril"],
          description: "Potential for increased digoxin levels",
          mechanism: "ACE inhibitors may increase digoxin concentration",
          recommendation: "Monitor digoxin levels closely"
        });
      }

      setInteractions({
        total: mockInteractions.length,
        severe: mockInteractions.filter(i => i.severity === "severe").length,
        moderate: mockInteractions.filter(i => i.severity === "moderate").length,
        interactions: mockInteractions
      });
      setAnalyzing(false);
    }, 2000);
  };

  const renderDrugChecker = () => (
    <div className="space-y-6">
      {/* Drug Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Medications</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for medications..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          {isSearching && (
            <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
            {searchResults.map((med) => (
              <div
                key={med.id}
                onClick={() => addMedication(med)}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{med.name}</p>
                    <p className="text-sm text-gray-500">{med.category} • {med.dose}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      med.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                      med.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {med.riskLevel} risk
                    </span>
                    <PlusCircle className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Medications */}
      {medications.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Selected Medications ({medications.length})
            </h3>
            <button
              onClick={analyzeInteractions}
              disabled={medications.length < 2 || analyzing}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 inline mr-2" />
                  Check Interactions
                </>
              )}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {medications.map((med) => (
              <div key={med.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{med.name}</h4>
                    <p className="text-sm text-gray-500">{med.category} • {med.dose}</p>
                  </div>
                  <button
                    onClick={() => removeMedication(med.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interaction Results */}
      {interactions && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Interaction Analysis</h3>
            <div className="flex items-center space-x-4">
              {interactions.severe > 0 && (
                <span className="flex items-center text-red-600">
                  <AlertTriangle className="w-5 h-5 mr-1" />
                  {interactions.severe} Severe
                </span>
              )}
              {interactions.moderate > 0 && (
                <span className="flex items-center text-yellow-600">
                  <AlertCircle className="w-5 h-5 mr-1" />
                  {interactions.moderate} Moderate
                </span>
              )}
              {interactions.total === 0 && (
                <span className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-1" />
                  No Interactions Found
                </span>
              )}
            </div>
          </div>

          {interactions.interactions.length > 0 ? (
            <div className="space-y-4">
              {interactions.interactions.map((interaction) => (
                <div key={interaction.id} className={`border-l-4 p-4 rounded-lg ${
                  interaction.severity === 'severe' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${
                        interaction.severity === 'severe' ? 'text-red-800' : 'text-yellow-800'
                      }`}>
                        {interaction.drugs.join(' + ')}
                      </h4>
                      <p className={`mt-1 ${
                        interaction.severity === 'severe' ? 'text-red-700' : 'text-yellow-700'
                      }`}>
                        {interaction.description}
                      </p>
                      <p className={`text-sm mt-2 ${
                        interaction.severity === 'severe' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        <strong>Mechanism:</strong> {interaction.mechanism}
                      </p>
                      <p className={`text-sm mt-1 ${
                        interaction.severity === 'severe' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        <strong>Recommendation:</strong> {interaction.recommendation}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      interaction.severity === 'severe' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {interaction.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-green-700">No Drug Interactions Detected</p>
              <p className="text-green-600 mt-1">The selected medications appear to be safe to use together.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderGuidelines = () => (
    <div className="space-y-6">
      {/* Search Guidelines */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Clinical Guidelines</h2>
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={guidelineSearch}
              onChange={(e) => setGuidelineSearch(e.target.value)}
              placeholder="Search guidelines..."
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clinicalGuidelines
            .filter(guideline => 
              guideline.title.toLowerCase().includes(guidelineSearch.toLowerCase()) ||
              guideline.category.toLowerCase().includes(guidelineSearch.toLowerCase())
            )
            .map((guideline) => (
              <div 
                key={guideline.id}
                onClick={() => setSelectedGuideline(guideline)}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    {guideline.category}
                  </span>
                  <span className="text-xs text-gray-500">{guideline.lastUpdated}</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{guideline.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{guideline.summary}</p>
                <p className="text-xs text-gray-500">
                  <Building className="w-3 h-3 inline mr-1" />
                  {guideline.organization}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Selected Guideline Detail */}
      {selectedGuideline && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{selectedGuideline.title}</h3>
              <p className="text-gray-600 mt-1">{selectedGuideline.organization} • {selectedGuideline.lastUpdated}</p>
            </div>
            <button 
              onClick={() => setSelectedGuideline(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Risk Factors</h4>
              <ul className="space-y-2">
                {selectedGuideline.riskFactors.map((factor, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0" />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
              <ul className="space-y-2">
                {selectedGuideline.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4 inline mr-2" />
              Download PDF
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Bookmark className="w-4 h-4 inline mr-2" />
              Save to Library
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderProtocols = () => (
    <div className="space-y-6">
      {/* Protocol Categories */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Safety Protocols</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {['emergency', 'routine', 'infection-control', 'medication'].map((category) => (
            <button
              key={category}
              onClick={() => setProtocolCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                protocolCategory === category
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {safetyProtocols
            .filter(protocol => protocol.category === protocolCategory)
            .map((protocol) => (
              <div 
                key={protocol.id}
                onClick={() => setSelectedProtocol(protocol)}
                className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    protocol.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                    protocol.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {protocol.urgency} priority
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{protocol.title}</h3>
                <p className="text-sm text-gray-600">
                  {protocol.steps.length} steps • {protocol.timeframe}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Selected Protocol Detail */}
      {selectedProtocol && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{selectedProtocol.title}</h3>
              <p className="text-gray-600 mt-1">Timeframe: {selectedProtocol.timeframe}</p>
            </div>
            <button 
              onClick={() => setSelectedProtocol(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h4 className="font-medium text-gray-900 mb-3">Protocol Steps</h4>
              <ol className="space-y-3">
                {selectedProtocol.steps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Required Equipment</h4>
              <ul className="space-y-2">
                {selectedProtocol.equipment.map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <Clipboard className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Download className="w-4 h-4 inline mr-2" />
              Print Protocol
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Bell className="w-4 h-4 inline mr-2" />
              Set Reminder
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6">
      {/* Compliance Dashboard */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Regulatory Compliance</h2>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900">FDA Compliance</h3>
            <p className="text-2xl font-bold text-green-600 mt-1">98.5%</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">HIPAA Compliance</h3>
            <p className="text-2xl font-bold text-blue-600 mt-1">100%</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="font-medium text-gray-900">Pending Reviews</h3>
            <p className="text-2xl font-bold text-yellow-600 mt-1">3</p>
          </div>
        </div>

        {/* Recent Compliance Activities */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4">Recent Compliance Activities</h3>
          <div className="space-y-3">
            {[
              { type: 'audit', title: 'Medication Safety Audit', status: 'completed', date: '2024-10-09' },
              { type: 'training', title: 'HIPAA Training Update', status: 'pending', date: '2024-10-15' },
              { type: 'review', title: 'Protocol Review - Emergency Procedures', status: 'in-progress', date: '2024-10-08' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    activity.status === 'completed' ? 'bg-green-500' :
                    activity.status === 'pending' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.date}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                  activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Safety & Guidelines Hub</h1>
          <p className="text-gray-600">Comprehensive clinical safety, drug interactions, and compliance management</p>
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
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group flex items-center py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap
                    ${isActive
                      ? `border-${tab.color}-500 text-${tab.color}-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 mr-2 ${
                    isActive ? `text-${tab.color}-500` : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  <span>{tab.label}</span>
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
            {activeTab === 'drugs' && renderDrugChecker()}
            {activeTab === 'guidelines' && renderGuidelines()}
            {activeTab === 'protocols' && renderProtocols()}
            {activeTab === 'compliance' && renderCompliance()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SafetyPage;