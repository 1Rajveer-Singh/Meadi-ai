import React, { useState } from 'react';
import { motion } from 'framer-motion';
import NavigationBar from './NavigationBar';
import HospitalSidebar from './HospitalSidebar';

const HospitalLayout = ({ children, showSidebar = false }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (!showSidebar) {
    // Simple layout with just navigation bar
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar />
        <main className="relative z-10">
          {children}
        </main>
      </div>
    );
  }

  // Full hospital dashboard layout with sidebar
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hospital Sidebar */}
      <HospitalSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={handleSidebarToggle} 
      />
      
      {/* Main Content */}
      <motion.div
        animate={{ 
          marginLeft: sidebarCollapsed ? 80 : 280 
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative"
      >
        {/* Top Navigation Bar */}
        <NavigationBar />
        
        {/* Page Content */}
        <main className="relative z-10">
          {children}
        </main>
      </motion.div>
    </div>
  );
};

export default HospitalLayout;