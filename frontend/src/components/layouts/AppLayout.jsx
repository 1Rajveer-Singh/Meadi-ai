import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@components/Sidebar';
import Header from '@components/Header';

const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-100/50 to-primary-100/50"></div>
      </div>

      {/* Floating Medical Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-primary-200/20 to-accent-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-32 left-32 w-24 h-24 bg-gradient-to-br from-secondary-200/20 to-primary-200/20 rounded-full blur-2xl"
        />
      </div>

      <div className="relative flex h-screen">
        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {(!isMobile || !sidebarCollapsed) && (
            <Sidebar 
              isCollapsed={sidebarCollapsed} 
              onToggle={toggleSidebar}
            />
          )}
        </AnimatePresence>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {isMobile && !sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarCollapsed(true)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <Header 
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={toggleSidebar}
          />

          {/* Main Content */}
          <main className="flex-1 overflow-auto custom-scrollbar">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.3,
                ease: "easeInOut"
              }}
              className="p-6 max-w-none"
            >
              <div className="max-w-7xl mx-auto">
                <Outlet />
              </div>
            </motion.div>
          </main>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="border-t border-white/10 bg-white/5 backdrop-blur-sm p-4"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-neutral-500">
              <div className="flex items-center space-x-6">
                <span>© 2024 AgenticAI HealthGuard</span>
                <span>•</span>
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                  <span>System Status: Operational</span>
                </span>
              </div>
              
              <div className="hidden md:flex items-center space-x-6">
                <span>Version 2.1.3</span>
                <span>•</span>
                <span>HIPAA Compliant</span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-primary-500 rounded-full"
                  />
                  <span>AI Agents: 4/4 Active</span>
                </span>
              </div>
            </div>
          </motion.footer>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
