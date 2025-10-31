import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Calendar, Clock, Shield, Award,
  Edit, Camera, Save, X, Check, Upload, Download, Settings,
  Activity, TrendingUp, Users, FileText, Briefcase, GraduationCap,
  Heart, Star, Badge, ChevronRight, Eye, Bell, Globe, Palette,
  Lock, Key, Smartphone, CreditCard, HelpCircle, LogOut, Plus,
  BarChart3, Target, Zap, BookOpen, AlertCircle, CheckCircle,
  Sparkles, Brain, Stethoscope, Microscope, Building, RefreshCw,
  Image, Trash2, Copy, ExternalLink, MessageCircle, Video,
  Github, Linkedin, Twitter, Instagram, Facebook, Link as LinkIcon,
  Verified, Crown, Diamond, Flame, Lightbulb, Coffee,
  Rocket, Moon, Sun, Wind, Cloud, Rainbow
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SimpleLayout from '../components/layouts/SimpleLayout';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const fileInputRef = useRef(null);

  // Initialize edit data
  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        profession: user.profession || user.role || '',
        department: user.department || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        specialization: user.specialization || '',
        experience: user.experience || '',
        education: user.education || '',
        certifications: user.certifications || [],
        skills: user.skills || [],
        interests: user.interests || [],
        socialLinks: user.socialLinks || {},
        preferences: user.preferences || {}
      });
    }
  }, [user]);

  // Avatar options
  const avatarEmojis = ['👨‍⚕️', '👩‍⚕️', '🧑‍⚕️', '👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🔬', '👩‍🔬', '🧑‍🔬', '👨‍🎓', '👩‍🎓', '🧑‍🎓'];

  // Handle file upload
  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
        setEditData(prev => ({ ...prev, avatar: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateUser(editData);
      setIsEditing(false);
      toast.success('Profile updated successfully! Changes reflected in navigation.');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Professional healthcare user data
  const profileData = {
    personalInfo: {
      fullName: user?.name || 'Dr. Jennifer Martinez',
      email: user?.email || 'j.martinez@healthguard.com',
      phone: '+1 (555) 123-4567',
      address: '1234 Medical Center Drive, Healthcare City, HC 12345',
      dateOfBirth: '1985-03-15',
      joinDate: '2020-08-15',
      avatar: user?.avatar || 'JM',
      status: 'Active',
      timezone: 'EST (UTC-5)',
      pronouns: 'She/Her',
      emergencyContact: 'Dr. Michael Chen - +1 (555) 987-6543'
    },
    professionalInfo: {
      title: 'Senior Radiologist - Cardiac Imaging',
      department: 'Radiology',
      specialization: 'Cardiovascular Imaging',
      licenseNumber: 'RAD-2020-1234567',
      boardCertifications: [
        'American Board of Radiology',
        'Cardiovascular Radiology Certification',
        'AI-Enhanced Diagnostic Imaging'
      ],
      yearsExperience: 12,
      institution: 'HealthGuard Medical Center',
      supervisor: 'Dr. Sarah Johnson',
      teamMembers: 8,
      workSchedule: 'Monday - Friday, 8:00 AM - 6:00 PM'
    },
    systemStats: {
      totalDiagnoses: 2847,
      accuracyRate: 97.2,
      avgResponseTime: '14 minutes',
      casesThisMonth: 156,
      aiCollaborations: 1823,
      researchContributions: 23,
      mentorshipHours: 84,
      continuingEducationCredits: 128
    },
    achievements: [
      {
        id: 1,
        title: 'Excellence in AI Diagnostics',
        description: 'Achieved 99.1% accuracy rate using AI-assisted diagnosis',
        date: '2024-12-15',
        type: 'excellence',
        icon: Brain
      },
      {
        id: 2,
        title: 'Research Pioneer',
        description: 'Published 5 papers on AI in cardiovascular imaging',
        date: '2024-11-20',
        type: 'research',
        icon: BookOpen
      },
      {
        id: 3,
        title: 'Patient Safety Champion',
        description: 'Zero critical missed diagnoses for 18 consecutive months',
        date: '2024-10-01',
        type: 'safety',
        icon: Shield
      },
      {
        id: 4,
        title: 'Innovation Leader',
        description: 'Led implementation of new AI image analysis protocols',
        date: '2024-09-15',
        type: 'innovation',
        icon: Sparkles
      }
    ],
    recentActivity: [
      {
        id: 1,
        action: 'Completed cardiac MRI analysis',
        details: 'Patient ID: HC-2024-0892 - Normal findings',
        timestamp: '2025-01-12T10:30:00Z',
        type: 'diagnosis',
        status: 'completed'
      },
      {
        id: 2,
        action: 'AI model training session',
        details: 'Contributed to cardiac anomaly detection dataset',
        timestamp: '2025-01-12T09:15:00Z',
        type: 'ai_training',
        status: 'completed'
      },
      {
        id: 3,
        action: 'Peer consultation',
        details: 'Reviewed complex case with Dr. Chen',
        timestamp: '2025-01-11T16:45:00Z',
        type: 'consultation',
        status: 'completed'
      },
      {
        id: 4,
        action: 'Research paper submission',
        details: 'AI-Enhanced Cardiac Risk Assessment - Journal of Medical AI',
        timestamp: '2025-01-11T14:20:00Z',
        type: 'research',
        status: 'pending'
      }
    ],
    preferences: {
      notifications: {
        criticalAlerts: true,
        aiUpdates: true,
        researchNotifications: true,
        systemMaintenance: false,
        weeklyReports: true
      },
      display: {
        theme: 'light',
        compactMode: false,
        animationsEnabled: true,
        highContrast: false
      },
      workflow: {
        autoSaveInterval: 5,
        defaultImageView: 'enhanced',
        showAiConfidence: true,
        enableShortcuts: true
      }
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User, description: 'Personal information and status' },
    { id: 'professional', name: 'Professional', icon: Briefcase, description: 'Credentials and work details' },
    { id: 'performance', name: 'Performance', icon: TrendingUp, description: 'Stats and achievements' },
    { id: 'activity', name: 'Activity', icon: Activity, description: 'Recent actions and history' },
    { id: 'preferences', name: 'Preferences', icon: Settings, description: 'System and workflow settings' },
    { id: 'security', name: 'Security', icon: Shield, description: 'Account security and privacy' }
  ];

  useEffect(() => {
    setEditData(profileData.personalInfo);
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profileData.personalInfo);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user data
      await updateUser(editData);
      
      setIsEditing(false);
      setLoading(false);
    } catch (error) {
      console.error('Save error:', error);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(profileData.personalInfo);
  };

  const getAchievementColor = (type) => {
    switch (type) {
      case 'excellence': return 'from-purple-500 to-purple-600';
      case 'research': return 'from-blue-500 to-blue-600';
      case 'safety': return 'from-green-500 to-green-600';
      case 'innovation': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'diagnosis': return Stethoscope;
      case 'ai_training': return Brain;
      case 'consultation': return Users;
      case 'research': return BookOpen;
      default: return Activity;
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card relative overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-purple-600/10"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{ backgroundSize: '200% 100%' }}
        />
        
        <div className="relative p-8">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-2xl"
              >
                {profileData.personalInfo.avatar}
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-purple-200 hover:border-purple-400 transition-colors"
              >
                <Camera className="w-4 h-4 text-purple-600" />
              </motion.button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {profileData.personalInfo.fullName}
                  </h1>
                  <p className="text-lg text-purple-600 font-semibold mb-1">
                    {profileData.professionalInfo.title}
                  </p>
                  <p className="text-gray-600">
                    {profileData.professionalInfo.department} • {profileData.professionalInfo.institution}
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEdit}
                  className="btn-primary"
                >
                  <Edit className="w-5 h-5 mr-2" />
                  Edit Profile
                </motion.button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white/80 rounded-xl border border-gray-200">
                  <p className="text-2xl font-bold text-purple-600">{profileData.systemStats.totalDiagnoses}</p>
                  <p className="text-xs text-gray-600">Total Diagnoses</p>
                </div>
                <div className="text-center p-3 bg-white/80 rounded-xl border border-gray-200">
                  <p className="text-2xl font-bold text-green-600">{profileData.systemStats.accuracyRate}%</p>
                  <p className="text-xs text-gray-600">Accuracy Rate</p>
                </div>
                <div className="text-center p-3 bg-white/80 rounded-xl border border-gray-200">
                  <p className="text-2xl font-bold text-blue-600">{profileData.systemStats.avgResponseTime}</p>
                  <p className="text-xs text-gray-600">Avg Response</p>
                </div>
                <div className="text-center p-3 bg-white/80 rounded-xl border border-gray-200">
                  <p className="text-2xl font-bold text-orange-600">{profileData.systemStats.casesThisMonth}</p>
                  <p className="text-xs text-gray-600">This Month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Mail className="w-6 h-6 mr-3 text-purple-600" />
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800">{profileData.personalInfo.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-800">{profileData.personalInfo.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-800">{profileData.personalInfo.address}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium text-gray-800">{new Date(profileData.personalInfo.dateOfBirth).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Join Date</p>
                <p className="font-medium text-gray-800">{new Date(profileData.personalInfo.joinDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Timezone</p>
                <p className="font-medium text-gray-800">{profileData.personalInfo.timezone}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderProfessionalTab = () => (
    <div className="space-y-6">
      {/* Professional Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Briefcase className="w-6 h-6 mr-3 text-purple-600" />
          Professional Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Position</p>
              <p className="font-bold text-lg text-gray-800">{profileData.professionalInfo.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Department</p>
              <p className="font-medium text-gray-800">{profileData.professionalInfo.department}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Specialization</p>
              <p className="font-medium text-gray-800">{profileData.professionalInfo.specialization}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">License Number</p>
              <p className="font-medium text-gray-800">{profileData.professionalInfo.licenseNumber}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Years of Experience</p>
              <p className="font-medium text-gray-800">{profileData.professionalInfo.yearsExperience} years</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Supervisor</p>
              <p className="font-medium text-gray-800">{profileData.professionalInfo.supervisor}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Team Size</p>
              <p className="font-medium text-gray-800">{profileData.professionalInfo.teamMembers} members</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Work Schedule</p>
              <p className="font-medium text-gray-800">{profileData.professionalInfo.workSchedule}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Board Certifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Award className="w-6 h-6 mr-3 text-purple-600" />
          Board Certifications
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profileData.professionalInfo.boardCertifications.map((cert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Badge className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{cert}</p>
                  <p className="text-xs text-gray-600">Certified</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* Performance Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <TrendingUp className="w-6 h-6 mr-3 text-purple-600" />
          Performance Statistics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-purple-600">{profileData.systemStats.totalDiagnoses}</p>
            <p className="text-sm text-gray-600">Total Diagnoses</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-green-600">{profileData.systemStats.accuracyRate}%</p>
            <p className="text-sm text-gray-600">Accuracy Rate</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{profileData.systemStats.aiCollaborations}</p>
            <p className="text-sm text-gray-600">AI Collaborations</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{profileData.systemStats.researchContributions}</p>
            <p className="text-sm text-gray-600">Research Papers</p>
          </div>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Award className="w-6 h-6 mr-3 text-purple-600" />
          Recent Achievements
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profileData.achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getAchievementColor(achievement.type)} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-1">{achievement.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    <p className="text-xs text-gray-500">{new Date(achievement.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Activity className="w-6 h-6 mr-3 text-purple-600" />
          Recent Activity
        </h3>
        
        <div className="space-y-4">
          {profileData.recentActivity.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01, x: 4 }}
                className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{activity.action}</h4>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  activity.status === 'completed' 
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {activity.status}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Settings className="w-6 h-6 mr-3 text-purple-600" />
          System Preferences
        </h3>
        
        <div className="space-y-6">
          {/* Notifications */}
          <div>
            <h4 className="font-bold text-gray-800 mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-purple-600" />
              Notification Settings
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(profileData.preferences.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={value}
                      onChange={() => {}}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Display Settings */}
          <div>
            <h4 className="font-bold text-gray-800 mb-4 flex items-center">
              <Palette className="w-5 h-5 mr-2 text-purple-600" />
              Display Settings
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(profileData.preferences.display).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  {typeof value === 'boolean' ? (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={value}
                        onChange={() => {}}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  ) : (
                    <span className="text-sm text-purple-600 font-medium">{value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Shield className="w-6 h-6 mr-3 text-purple-600" />
          Account Security
        </h3>
        
        <div className="space-y-6">
          {/* Password Security */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h4 className="font-bold text-green-800">Password Security: Strong</h4>
            </div>
            <p className="text-sm text-green-700 mb-4">
              Your password meets all security requirements and was last updated 30 days ago.
            </p>
            <button className="btn-secondary">
              <Key className="w-4 h-4 mr-2" />
              Change Password
            </button>
          </div>

          {/* Two-Factor Authentication */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-6 h-6 text-blue-600" />
                <h4 className="font-bold text-blue-800">Two-Factor Authentication</h4>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Enabled
              </span>
            </div>
            <p className="text-sm text-blue-700 mb-4">
              Added security layer using your mobile device. Last used: Today at 9:15 AM
            </p>
            <button className="btn-secondary">
              <Settings className="w-4 h-4 mr-2" />
              Manage 2FA
            </button>
          </div>

          {/* Active Sessions */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center">
              <Monitor className="w-5 h-5 mr-2" />
              Active Sessions
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <p className="font-medium text-gray-800">Current Session</p>
                  <p className="text-sm text-gray-600">Windows 11 • Chrome • Healthcare Network</p>
                  <p className="text-xs text-gray-500">Active now</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Current
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <p className="font-medium text-gray-800">Mobile App</p>
                  <p className="text-sm text-gray-600">iOS • HealthGuard App</p>
                  <p className="text-xs text-gray-500">Last active: 2 hours ago</p>
                </div>
                <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                  Revoke
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderEditModal = () => (
    <AnimatePresence>
      {isEditing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Edit className="w-6 h-6 mr-3 text-purple-600" />
                  Edit Profile
                </h2>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editData.fullName || ''}
                    onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editData.email || ''}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={editData.timezone || ''}
                    onChange={(e) => setEditData({...editData, timezone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="EST (UTC-5)">EST (UTC-5)</option>
                    <option value="PST (UTC-8)">PST (UTC-8)</option>
                    <option value="MST (UTC-7)">MST (UTC-7)</option>
                    <option value="CST (UTC-6)">CST (UTC-6)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={editData.address || ''}
                  onChange={(e) => setEditData({...editData, address: e.target.value})}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={loading}
                className="btn-primary relative"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const tabContent = {
    overview: renderOverviewTab,
    professional: renderProfessionalTab,
    performance: renderPerformanceTab,
    activity: renderActivityTab,
    preferences: renderPreferencesTab,
    security: renderSecurityTab
  };

  return (
    <SimpleLayout>
      <div className="space-y-6">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-20 right-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card relative overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 5, repeat: Infinity }}
          style={{ backgroundSize: '200% 100%' }}
        />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <User className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-gray-600 font-medium">
                Manage your account information and preferences
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
      >
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 p-4 rounded-xl transition-all duration-300 border-2 min-w-[180px] ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-300 shadow-lg'
                    : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive
                        ? 'bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                  <div className="text-left">
                    <h3 className={`font-bold ${isActive ? 'text-purple-700' : 'text-gray-800'}`}>
                      {tab.name}
                    </h3>
                    <p className="text-xs text-gray-500">{tab.description}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        {tabContent[activeTab]()}
      </motion.div>

      {/* Edit Modal */}
      {renderEditModal()}
    </div>
    </SimpleLayout>
  );
};

export default ProfilePage;