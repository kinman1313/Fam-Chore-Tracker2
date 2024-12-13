import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="glass-navbar fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center group">
              <span className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                ChoreTracker
              </span>
            </Link>
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`nav-link ${isActive('/dashboard') ? 'nav-link-active' : ''}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/chores/create"
                  className={`nav-link ${isActive('/chores/create') ? 'nav-link-active' : ''}`}
                >
                  Create Chore
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 nav-link group"
                    aria-expanded={isMenuOpen ? 'true' : 'false'}
                    aria-haspopup="true"
                    aria-label="User menu"
                  >
                    <span>{user.username}</span>
                    <svg
                      className={`h-5 w-5 transform transition-transform duration-200 ${
                        isMenuOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isMenuOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-48 glass-dropdown origin-top-right animate-dropdown"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu"
                    >
                      <div className="py-1">
                        <Link 
                          to="/profile" 
                          className="dropdown-item" 
                          role="menuitem"
                        >
                          Profile
                        </Link>
                        <Link 
                          to="/settings" 
                          className="dropdown-item"
                          role="menuitem"
                        >
                          Settings
                        </Link>
                        <button
                          onClick={logout}
                          className="w-full text-left dropdown-item text-red-400 hover:text-red-300"
                          role="menuitem"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`nav-link ${isActive('/login') ? 'nav-link-active' : ''}`}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="btn-primary transform hover:scale-105 transition-transform"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white"
              aria-expanded={isMenuOpen ? "true" : "false"}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`sm:hidden glass-dropdown border-t transition-all duration-200 ease-in-out ${
          isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
        aria-label="Mobile menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`block px-3 py-2 rounded-md ${
                  isActive('/dashboard')
                    ? 'bg-gray-700/50 text-white'
                    : 'nav-link'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/chores/create"
                className={`block px-3 py-2 rounded-md ${
                  isActive('/chores/create')
                    ? 'bg-gray-700/50 text-white'
                    : 'nav-link'
                }`}
              >
                Create Chore
              </Link>
              <Link
                to="/profile"
                className={`block px-3 py-2 rounded-md ${
                  isActive('/profile')
                    ? 'bg-gray-700/50 text-white'
                    : 'nav-link'
                }`}
              >
                Profile
              </Link>
              <Link
                to="/settings"
                className={`block px-3 py-2 rounded-md ${
                  isActive('/settings')
                    ? 'bg-gray-700/50 text-white'
                    : 'nav-link'
                }`}
              >
                Settings
              </Link>
              <button
                onClick={logout}
                className="block w-full text-left px-3 py-2 rounded-md text-red-400 hover:text-red-300"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`block px-3 py-2 rounded-md ${
                  isActive('/login')
                    ? 'bg-gray-700/50 text-white'
                    : 'nav-link'
                }`}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-md btn-primary text-center"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 