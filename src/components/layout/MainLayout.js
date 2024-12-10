import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../navigation/Navbar';
import Sidebar from '../navigation/Sidebar';
import Breadcrumbs from '../navigation/Breadcrumbs';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="p-6 pt-24">
            <Breadcrumbs />
            <div className="mt-4">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 