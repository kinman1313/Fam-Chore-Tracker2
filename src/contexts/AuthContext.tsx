import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

// Define the shape of our context
interface AuthContextType {
  user: any | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: (user: any) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (token: string, password: string) => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Provider component
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${config.API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await axios.post(`${config.API_URL}/api/auth/login`, {
      email,
      password
    });

    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setUser(user);
    setIsAuthenticated(true);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await axios.post(`${config.API_URL}/api/auth/register`, {
      name,
      email,
      password
    });

    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const resetPassword = async (email: string) => {
    await axios.post(`${config.API_URL}/api/auth/reset-password`, { email });
  };

  const updatePassword = async (token: string, password: string) => {
    await axios.post(`${config.API_URL}/api/auth/update-password`, { token, password });
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    setUser,
    login,
    register,
    logout,
    resetPassword,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Export everything needed
export { AuthProvider, useAuth };
export type { AuthContextType };