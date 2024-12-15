import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-600">
          Welcome back, {user?.username || 'User'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">My Chores</h3>
          <p className="text-gray-600">View and manage your assigned chores</p>
          <button className="btn-primary mt-4">View Chores</button>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Family Activity</h3>
          <p className="text-gray-600">See what your family members are up to</p>
          <button className="btn-secondary mt-4">View Activity</button>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Achievements</h3>
          <p className="text-gray-600">Track your progress and rewards</p>
          <button className="btn-secondary mt-4">View Achievements</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;