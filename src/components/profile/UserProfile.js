import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';

const UserProfile = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock user data
  const userData = {
    name: 'Sarah Doe',
    avatar: '👧',
    role: 'child',
    joinDate: '2024-01-15',
    totalPoints: 1250,
    completedChores: 45,
    currentStreak: 7,
    achievements: [
      { id: 1, title: 'Early Bird', description: 'Complete 5 chores before 9 AM', icon: '🌅', earned: true },
      { id: 2, title: 'Super Streaker', description: 'Maintain a 7-day streak', icon: '🔥', earned: true },
      { id: 3, title: 'Master Cleaner', description: 'Complete 50 cleaning tasks', icon: '🧹', earned: false },
    ],
    recentActivity: [
      { date: '2024-03-17', task: 'Clean Room', points: 50, status: 'completed' },
      { date: '2024-03-16', task: 'Take Out Trash', points: 20, status: 'completed' },
      { date: '2024-03-15', task: 'Do Laundry', points: 40, status: 'completed' },
    ]
  };

  // Chart data
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Points Earned',
      data: [30, 45, 60, 35, 50, 40, 55],
      fill: true,
      borderColor: '#00ff9f',
      backgroundColor: 'rgba(0, 255, 159, 0.1)',
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#888'
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#888'
        }
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[rgba(26,26,26,0.75)] backdrop-blur-lg border border-[rgba(255,255,255,0.1)] rounded-xl p-6 mb-6"
      >
        <div className="flex items-center space-x-6">
          <div className="text-6xl">{userData.avatar}</div>
          <div>
            <h1 className="text-3xl font-bold text-white">{userData.name}</h1>
            <p className="text-gray-400">
              {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} • Member since {userData.joinDate}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
      >
        <div className="bg-[rgba(26,26,26,0.75)] backdrop-blur-lg border border-[rgba(255,255,255,0.1)] rounded-xl p-6">
          <h3 className="text-gray-400 text-sm">Total Points</h3>
          <p className="text-2xl font-bold text-white mt-1">{userData.totalPoints}</p>
        </div>
        <div className="bg-[rgba(26,26,26,0.75)] backdrop-blur-lg border border-[rgba(255,255,255,0.1)] rounded-xl p-6">
          <h3 className="text-gray-400 text-sm">Completed Chores</h3>
          <p className="text-2xl font-bold text-white mt-1">{userData.completedChores}</p>
        </div>
        <div className="bg-[rgba(26,26,26,0.75)] backdrop-blur-lg border border-[rgba(255,255,255,0.1)] rounded-xl p-6">
          <h3 className="text-gray-400 text-sm">Current Streak</h3>
          <p className="text-2xl font-bold text-white mt-1">{userData.currentStreak} days</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {['overview', 'achievements', 'activity'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab
                ? 'bg-[#00ff9f] text-black'
                : 'bg-[rgba(255,255,255,0.05)] text-gray-400 hover:bg-[rgba(255,255,255,0.1)]'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[rgba(26,26,26,0.75)] backdrop-blur-lg border border-[rgba(255,255,255,0.1)] rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Weekly Progress</h3>
              <Line data={chartData} options={chartOptions} />
            </div>
            <div className="bg-[rgba(26,26,26,0.75)] backdrop-blur-lg border border-[rgba(255,255,255,0.1)] rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {userData.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-[rgba(255,255,255,0.05)] rounded-lg"
                  >
                    <div>
                      <p className="text-white">{activity.task}</p>
                      <p className="text-sm text-gray-400">{activity.date}</p>
                    </div>
                    <span className="text-[#00ff9f]">+{activity.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userData.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`bg-[rgba(26,26,26,0.75)] backdrop-blur-lg border rounded-xl p-6 ${
                  achievement.earned
                    ? 'border-[#00ff9f]'
                    : 'border-[rgba(255,255,255,0.1)] opacity-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">{achievement.icon}</span>
                  <div>
                    <h3 className="text-white font-medium">{achievement.title}</h3>
                    <p className="text-sm text-gray-400">{achievement.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-[rgba(26,26,26,0.75)] backdrop-blur-lg border border-[rgba(255,255,255,0.1)] rounded-xl p-6">
            <div className="space-y-4">
              {userData.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-[rgba(255,255,255,0.05)] rounded-lg"
                >
                  <div>
                    <p className="text-white">{activity.task}</p>
                    <p className="text-sm text-gray-400">{activity.date}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-[#00ff9f]">+{activity.points} pts</span>
                    <span className="px-2 py-1 bg-[rgba(0,255,159,0.1)] text-[#00ff9f] rounded-full text-sm">
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UserProfile; 