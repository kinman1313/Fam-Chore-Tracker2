import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 w-full bg-[rgba(26,26,26,0.75)] backdrop-blur-lg border-b border-[rgba(255,255,255,0.1)] z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-[#00ff9f] text-xl font-bold">FamChores</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-300 hover:text-[#00ff9f] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/chores"
                className="text-gray-300 hover:text-[#00ff9f] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Chores
              </Link>
              <Link
                to="/family"
                className="text-gray-300 hover:text-[#00ff9f] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Family
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-[#00ff9f] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.1)] focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-[rgba(26,26,26,0.95)] backdrop-blur-lg border-b border-[rgba(255,255,255,0.1)]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/dashboard"
              className="text-gray-300 hover:text-[#00ff9f] block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/chores"
              className="text-gray-300 hover:text-[#00ff9f] block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Chores
            </Link>
            <Link
              to="/family"
              className="text-gray-300 hover:text-[#00ff9f] block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Family
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-300 hover:text-[#00ff9f] block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 