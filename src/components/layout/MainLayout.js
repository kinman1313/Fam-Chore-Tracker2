import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import Navbar from '../navigation/Navbar';
import Breadcrumbs from '../navigation/Breadcrumbs';

const MainLayout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative">
      <Navbar />
      
      <main className="flex-1 transition-all duration-300 ease-in-out min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <Breadcrumbs />
          <div className="mt-4 fade-in">
            {children}
          </div>
        </div>
      </main>

      {/* Status bar - matches your theme color */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00ff9f] to-[#00cc7f]" />
    </div>
  );
};

// Add prop types validation
MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout; 