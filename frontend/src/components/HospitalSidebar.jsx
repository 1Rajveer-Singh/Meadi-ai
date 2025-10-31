import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Upload, FileText, Activity, 
  Settings, ChevronLeft, ChevronRight, Search, Bell,
  User, LogOut, Menu, X, Heart, Brain, Stethoscope,
  BarChart3, Zap, Shield, Sparkles, TrendingUp, Database,
  FileSearch, Pill, Microscope, Calendar, Clock, Image,
  Plus, AlertCircle, CheckSquare, Gauge, Server, Cpu
} from 'lucide-react';

const HospitalSidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const [activeGroup, setActiveGroup] = useState('main');

  const navigationGroups = [
    {
      id: 'main',
      title: 'Hospital Dashboard',
      items: [
        {
          path: '/dashboard',
          label: 'Overview',
          icon: LayoutDashboard,
          badge: null,
          description: 'Dashboard & Analytics'
        },
        {
          path: '/diagnosis/new',
          label: 'New Diagnosis',
          icon: Plus,
          badge: 'Start',
          description: 'AI-powered analysis',
          highlight: true
        },
        {
          path: '/patients',
          label: 'Patient Records',
          icon: Users,
          badge: '247',
          description: 'Patient management'
        }
      ]
    },
    {
      id: 'analysis',
      title: 'Medical Analysis',
      items: [
        {
          path: '/analysis/images',
          label: 'Image Analysis',
          icon: Image,
          badge: 'MONAI',
          description: 'Medical imaging studio'
        },
        {
          path: '/drug-checker',
          label: 'Drug Interactions',
          icon: Pill,
          badge: null,
          description: 'Safety checker'
        },
        {
          path: '/research',
          label: 'Research Database',
          icon: Database,
          badge: 'Live',
          description: 'Clinical trials & papers'
        }
      ]
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      items: [
        {
          path: '/analytics',
          label: 'Reports & Analytics',
          icon: BarChart3,
          badge: null,
          description: 'Performance metrics'
        },
        {
          path: '/ai-insights',
          label: 'AI Insights',
          icon: Brain,
          badge: 'New',
          description: 'Agent coordination'
        }
      ]
    },
    {
      id: 'system',
      title: 'System & Settings',
      items: [
        {
          path: '/settings',
          label: 'Settings',
          icon: Settings,
          badge: null,
          description: 'System configuration'
        }
      ]
    }
  ];

  const isActive = (path) => location.pathname === path;

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 }
  };

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 }
  };

  return (
    <motion.div
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-lg z-30 flex flex-col"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!isCollapsed && (
          <motion.div
            variants={contentVariants}
            animate={isCollapsed ? 'collapsed' : 'expanded'}
            className="flex items-center space-x-3"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                <div className="flex items-center">
                  <Heart className="w-4 h-4 text-white mr-0.5" />
                  <Brain className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                MedGuard AI
              </h1>
              <p className="text-xs text-gray-600">Hospital Portal</p>
            </div>
          </motion.div>
        )}
        
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.id}>
              {!isCollapsed && (
                <motion.div
                  variants={contentVariants}
                  animate={isCollapsed ? 'collapsed' : 'expanded'}
                  className="px-4 mb-3"
                >
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {group.title}
                  </h3>
                </motion.div>
              )}
              
              <div className="space-y-1 px-2">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <Link key={item.path} to={item.path}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          relative flex items-center px-3 py-3 rounded-xl transition-all duration-200 group
                          ${active 
                            ? 'bg-gradient-to-r from-blue-50 to-green-50 text-blue-700 border border-blue-200 shadow-sm' 
                            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                          }
                          ${item.highlight 
                            ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700 shadow-md' 
                            : ''
                          }
                        `}
                      >
                        <Icon className={`w-5 h-5 flex-shrink-0 ${
                          item.highlight ? 'text-white' : active ? 'text-blue-600' : 'text-gray-500'
                        } group-hover:text-blue-600`} />
                        
                        {!isCollapsed && (
                          <motion.div
                            variants={contentVariants}
                            animate={isCollapsed ? 'collapsed' : 'expanded'}
                            className="ml-3 flex-1 min-w-0"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium truncate">
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className={`
                                  px-2 py-0.5 text-xs font-semibold rounded-full ml-2
                                  ${item.highlight
                                    ? 'bg-white/20 text-white'
                                    : active 
                                      ? 'bg-blue-100 text-blue-700' 
                                      : 'bg-gray-100 text-gray-600'
                                  }
                                `}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className={`text-xs mt-0.5 ${
                              item.highlight ? 'text-blue-100' : 
                              active ? 'text-blue-600' : 'text-gray-500'
                            } group-hover:text-blue-500 truncate`}>
                              {item.description}
                            </p>
                          </motion.div>
                        )}
                        
                        {/* Active indicator */}
                        {active && !item.highlight && (
                          <motion.div
                            layoutId="activeSidebarItem"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-green-600 rounded-r-full"
                          />
                        )}

                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {item.label}
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-800"></div>
                          </div>
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Status & User Info */}
      <div className="border-t border-gray-200 p-4">
        {!isCollapsed ? (
          <motion.div
            variants={contentVariants}
            animate={isCollapsed ? 'collapsed' : 'expanded'}
            className="space-y-4"
          >
            {/* System Health */}
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-800">System Health</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-green-700">
                  <div className="flex items-center justify-between">
                    <span>API</span>
                    <span className="font-medium">99.9%</span>
                  </div>
                </div>
                <div className="text-green-700">
                  <div className="flex items-center justify-between">
                    <span>Agents</span>
                    <span className="font-medium">4/4</span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                  DR
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Dr. Sarah Johnson</p>
                <p className="text-xs text-gray-500 truncate">Radiology Department</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              DR
            </div>
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HospitalSidebar;