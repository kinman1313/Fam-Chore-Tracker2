import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/auth/Register.js';
import Login from './components/auth/Login.js';
import CreateChore from './components/chores/CreateChore.js';
import Navigation from './components/navigation/Navigation.js';
import ProtectedRoute from './components/auth/ProtectedRoute.js';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-lg">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chores/create" element={<ProtectedRoute><CreateChore /></ProtectedRoute>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App; 