import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Activity,
  Brain,
  Pill,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Globe,
  Zap,
  Shield,
  TrendingDown,
  Users,
  Clock,
  Heart,
  Stethoscope,
  Microscope,
  Upload,
  BarChart3,
  AlertCircle,
  Wifi,
  Database,
  Lock,
  Sparkles,
  FileText
} from 'lucide-react';
import LandingNavBar from '../components/LandingNavBar';
import AuthModal from '../components/AuthModal';
import InteractiveFooter from '../components/InteractiveFooter';
import DemoCredentialsSection from '../components/DemoCredentialsSection';

const COLOR_VARIANTS = {
  primary: {
    lightBg: 'bg-primary-50',
    softBg: 'bg-primary-100',
    border: 'border-primary-200',
    icon: 'text-primary-600',
    accent: 'text-primary-400',
    gradient: 'from-primary-500 to-primary-600',
  },
  health: {
    lightBg: 'bg-health-50',
    softBg: 'bg-health-100',
    border: 'border-health-200',
    icon: 'text-health-600',
    accent: 'text-health-400',
    gradient: 'from-health-500 to-health-600',
  },
  warning: {
    lightBg: 'bg-warning-50',
    softBg: 'bg-warning-100',
    border: 'border-warning-200',
    icon: 'text-warning-600',
    accent: 'text-warning-400',
    gradient: 'from-warning-500 to-warning-600',
  },
  alert: {
    lightBg: 'bg-alert-50',
    softBg: 'bg-alert-100',
    border: 'border-alert-200',
    icon: 'text-alert-600',
    accent: 'text-alert-400',
    gradient: 'from-alert-500 to-alert-600',
  },
};

const getColorVariant = (color) => COLOR_VARIANTS[color] ?? COLOR_VARIANTS.primary;

const LandingPage = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // AUTO-REDIRECT: If user is authenticated, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      console.log('🚀 User authenticated, redirecting to dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  // Show loading during authentication check
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Landing Navigation Bar */}
      <LandingNavBar onAuthClick={handleAuthClick} />

      {/* Hero Section */}
      <HeroSection onAuthClick={handleAuthClick} />
      
      {/* Problem Statement Banner */}
      <ProblemBanner />
      
      {/* Multi-Agent System Showcase */}
      <AgentShowcase />
      
      {/* Key Features Grid */}
      <FeaturesGrid />
      
      {/* Impact Metrics */}
      <ImpactMetrics />
      
      {/* How It Works */}
      <HowItWorks />
      
      {/* Technology Showcase */}
      <TechnologyShowcase />
      
      {/* Testimonials */}
      <Testimonials />
      
      {/* Demo Credentials Section */}
      <DemoCredentialsSection onAuthClick={handleAuthClick} />
      
      {/* Interactive Footer */}
      <InteractiveFooter onAuthClick={handleAuthClick} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
};

const HeroSection = ({ onAuthClick }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-health-500 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 backdrop-blur rounded-full text-white text-sm font-medium mb-6"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Trusted by 50,000+ Healthcare Professionals</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6"
            >
              AI-Powered Medical Diagnostics in
              <span className="block bg-gradient-to-r from-health-300 to-health-100 bg-clip-text text-transparent">
                Real-Time
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-blue-100 mb-8 leading-relaxed"
            >
              90% reduction in diagnostic delays • 25% fewer medication errors • Accessible healthcare for rural communities
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAuthClick('register')}
                className="relative group"
              >
                <motion.div
                  className="absolute inset-0 bg-health-400 rounded-xl blur-xl opacity-50"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative inline-flex items-center space-x-2 px-8 py-4 bg-health-500 hover:bg-health-600 text-white rounded-xl font-bold text-lg transition-all shadow-2xl">
                  <span>Get Started Free</span>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-white bg-opacity-10 backdrop-blur hover:bg-opacity-20 text-white rounded-xl font-semibold text-lg transition-all border-2 border-white border-opacity-30"
              >
                <Activity className="w-5 h-5" />
                <span>View Demo</span>
              </motion.button>
            </motion.div>

            {/* Stats Pills */}
            <div className="grid grid-cols-3 gap-4 mt-12">
              {[
                { value: '<2min', label: 'Diagnosis Time' },
                { value: '85%+', label: 'Accuracy Rate' },
                { value: '24/7', label: 'Availability' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white bg-opacity-10 backdrop-blur rounded-lg px-4 py-3 text-center"
                >
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-blue-100">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-alert-500" />
                <div className="w-3 h-3 rounded-full bg-warning-500" />
                <div className="w-3 h-3 rounded-full bg-health-500" />
              </div>

              {/* Animated Medical Icons */}
              <div className="grid grid-cols-2 gap-6">
                {[ 
                  { icon: Stethoscope, label: 'Patient Monitoring', color: 'primary' },
                  { icon: Brain, label: 'AI Analysis', color: 'health' },
                  { icon: Heart, label: 'Health Tracking', color: 'alert' },
                  { icon: Microscope, label: 'Lab Results', color: 'warning' },
                ].map((item, index) => {
                  const variant = getColorVariant(item.color);
                  return (
                    <motion.div
                      key={index}
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2,
                      }}
                      className={`p-6 rounded-xl ${variant.lightBg} border-2 ${variant.border}`}
                    >
                      <item.icon className={`w-8 h-8 ${variant.icon} mb-3`} />
                      <div className="text-sm font-semibold text-gray-700">{item.label}</div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-6 -right-6 w-24 h-24 bg-health-400 rounded-full blur-xl opacity-50"
            />
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary-400 rounded-full blur-xl opacity-50"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const ProblemBanner = () => {
  return (
    <section className="bg-gray-900 py-16 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 30, repeat: Infinity, repeatType: 'reverse' }}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="glass-card-secondary bg-white/5 backdrop-blur-md border border-white/10 p-8 lg:p-12 rounded-2xl"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Addressing Critical Healthcare Challenges
              </h2>
              <div className="space-y-4">
                {[
                  { icon: Clock, text: '48% of diagnostic errors are due to time constraints on clinicians' },
                  { icon: Globe, text: '57% of world population lacks access to specialized medical expertise' },
                  { icon: AlertCircle, text: '40% of radiologists report symptoms of burnout due to workload' },
                  { icon: TrendingDown, text: 'Rural areas face 30% higher mortality rates due to delayed diagnoses' }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-alert-600/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <item.icon className="w-5 h-5 text-alert-500" />
                    </div>
                    <p className="text-gray-300 leading-relaxed">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* Stats */}
            <div>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: '4.2M', label: 'Radiologist Shortage', 
                    desc: 'Projected global shortage by 2028', color: 'alert' },
                  { value: '68%', label: 'Diagnostic Delays', 
                    desc: 'Cases with preventable delays', color: 'warning' },
                  { value: '35%', label: 'Medical Errors', 
                    desc: 'Due to information overload', color: 'health' },
                  { value: '$240B', label: 'Annual Cost', 
                    desc: 'From diagnostic errors in the US', color: 'primary' },
                ].map((stat, index) => {
                  const variant = getColorVariant(stat.color);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="glass-card-secondary bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl"
                    >
                      <div className={`text-3xl font-bold ${variant.accent} mb-2`}>{stat.value}</div>
                      <div className="text-white font-medium mb-1">{stat.label}</div>
                      <p className="text-gray-400 text-sm">{stat.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const AgentShowcase = () => {
  const agents = [
    {
      icon: Microscope,
      name: 'Image Analysis Agent',
      description: 'Advanced medical image processing with MONAI framework. Detects anomalies in X-rays, MRI, and CT scans with 94% accuracy.',
      features: ['Heatmap Generation', 'Anomaly Detection', 'Region Annotation'],
      color: 'primary',
    },
    {
      icon: BookOpen,
      name: 'History Synthesis Agent',
      description: 'Correlates patient medical history, lab results, and medications. Identifies risk factors and patterns.',
      features: ['Timeline Analysis', 'Risk Prediction', 'Pattern Recognition'],
      color: 'health',
    },
    {
      icon: Pill,
      name: 'Drug Interaction Agent',
      description: '30% reduction in medication errors. Real-time checking of drug interactions and contraindications.',
      features: ['Interaction Alerts', 'Alternative Suggestions', 'Dosage Validation'],
      color: 'warning',
    },
    {
      icon: Brain,
      name: 'Research Agent',
      description: 'Searches latest clinical trials and medical literature. Provides evidence-based recommendations.',
      features: ['Literature Search', 'Clinical Trials', 'Guidelines Updates'],
      color: 'alert',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Multi-Agent AI System
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Four specialized AI agents work in coordination to deliver comprehensive, explainable medical diagnostics
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {agents.map((agent, index) => {
            const variant = getColorVariant(agent.color);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="card hover:shadow-xl cursor-pointer group"
              >
                <div className={`w-16 h-16 ${variant.softBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <agent.icon className={`w-8 h-8 ${variant.icon}`} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">{agent.name}</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{agent.description}</p>
                
                <div className="space-y-2">
                  {agent.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className={`w-4 h-4 ${variant.icon} flex-shrink-0`} />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Additional sections would continue here...
// For brevity, I'll create placeholder sections

const FeaturesGrid = () => {
  const features = [
    {
      icon: Zap,
      title: 'Real-Time Analysis',
      description: 'Get comprehensive diagnostic results in under 2 minutes with our AI-powered system',
      color: 'warning',
    },
    {
      icon: Shield,
      title: 'HIPAA Compliant',
      description: 'End-to-end encryption and compliance with all healthcare data regulations',
      color: 'health',
    },
    {
      icon: Brain,
      title: 'Multi-Agent AI',
      description: 'Four specialized agents working together for comprehensive analysis',
      color: 'primary',
    },
    {
      icon: Upload,
      title: 'Easy Integration',
      description: 'Seamless integration with existing PACS and EHR systems',
      color: 'alert',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track trends, identify patterns, and measure outcomes over time',
      color: 'primary',
    },
    {
      icon: Database,
      title: 'Knowledge Base',
      description: 'Access to millions of medical cases and latest research papers',
      color: 'health',
    },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Modern Healthcare
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to deliver accurate, fast, and reliable medical diagnostics
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const variant = getColorVariant(feature.color);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass-card p-8 group cursor-pointer"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`w-14 h-14 bg-gradient-to-br ${variant.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const ImpactMetrics = () => {
  const metrics = [
    { value: '1M+', label: 'Diagnoses Completed', icon: Heart },
    { value: '90%', label: 'Reduction in Delays', icon: Clock },
    { value: '25%', label: 'Fewer Med Errors', icon: Shield },
    { value: '50K+', label: 'Healthcare Professionals', icon: Users },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-purple-900 relative overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Real-World Impact</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Transforming healthcare delivery with measurable results
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: 'spring' }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="glass-card-secondary bg-white/10 backdrop-blur-lg p-8 text-center border border-white/20"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                >
                  <Icon className="w-12 h-12 text-health-400 mx-auto mb-4" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="text-5xl font-bold text-white mb-2"
                >
                  {metric.value}
                </motion.div>
                <div className="text-blue-100 font-medium">{metric.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Upload Medical Data',
      description: 'Upload medical images, patient history, and lab results through our secure platform',
      icon: Upload,
    },
    {
      number: '02',
      title: 'AI Analysis',
      description: 'Four specialized AI agents analyze the data simultaneously in real-time',
      icon: Brain,
    },
    {
      number: '03',
      title: 'Comprehensive Report',
      description: 'Receive detailed findings with explanations, confidence scores, and recommendations',
      icon: FileText,
    },
    {
      number: '04',
      title: 'Expert Review',
      description: 'Healthcare professionals review and validate AI findings before final diagnosis',
      icon: CheckCircle,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple, secure, and fast - from upload to diagnosis in minutes
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-primary-600 to-purple-600 -translate-y-1/2" />
                )}

                <motion.div
                  whileHover={{ y: -10, scale: 1.03 }}
                  className="glass-card p-6 text-center relative z-10"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-20 h-20 bg-gradient-to-br from-primary-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </motion.div>

                  <div className="text-sm font-bold text-primary-600 mb-2">STEP {step.number}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const TechnologyShowcase = () => {
  const technologies = [
    { name: 'Python FastAPI', icon: '🐍', desc: 'High-performance API' },
    { name: 'React + Vite', icon: '⚛️', desc: 'Modern UI framework' },
    { name: 'MONAI', icon: '🏥', desc: 'Medical imaging AI' },
    { name: 'LangChain', icon: '🦜', desc: 'LLM orchestration' },
    { name: 'MongoDB', icon: '🍃', desc: 'Flexible database' },
    { name: 'Docker', icon: '🐳', desc: 'Containerization' },
    { name: 'MinIO', icon: '📦', desc: 'Object storage' },
    { name: 'Redis', icon: '⚡', desc: 'Fast caching' },
  ];

  return (
    <section id="technology" className="py-20 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Built with Cutting-Edge Technology</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Powered by the latest in AI, cloud computing, and medical imaging technology
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {technologies.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8, scale: 1.05 }}
              className="glass-card-secondary bg-white/5 backdrop-blur-lg p-6 text-center border border-white/10"
            >
              <div className="text-5xl mb-3">{tech.icon}</div>
              <h3 className="font-bold text-white mb-2">{tech.name}</h3>
              <p className="text-sm text-gray-400">{tech.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Chief Radiologist, Metro Hospital',
      image: '👩‍⚕️',
      quote: 'This AI system has transformed our radiology department. We\'ve reduced diagnostic time by 60% while maintaining accuracy.',
      rating: 5,
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Emergency Medicine Director',
      image: '👨‍⚕️',
      quote: 'In emergency situations, every second counts. This tool helps us make faster, more confident decisions.',
      rating: 5,
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Rural Health Clinic',
      image: '👩‍⚕️',
      quote: 'We finally have access to specialist-level diagnostics in our rural community. It\'s been life-changing for our patients.',
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by Healthcare Professionals
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of doctors who are already using AI to improve patient care
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="glass-card p-8"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="text-yellow-400 text-xl"
                  >
                    ⭐
                  </motion.span>
                ))}
              </div>

              <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>

              <div className="flex items-center">
                <div className="text-4xl mr-3">{testimonial.image}</div>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingPage;
