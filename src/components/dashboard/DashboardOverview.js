import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import StatsCard from './StatsCard';
import RecentActivity from './RecentActivity';

const DashboardOverview = () => {
  // Move stats data to useMemo to prevent unnecessary recreations
  const stats = useMemo(() => [
    {
      title: 'Pending Chores',
      value: '12',
      icon: '📋',
      trend: '+2 from yesterday'
    },
    {
      title: 'Completed Today',
      value: '5',
      icon: '✅',
      trend: '80% completion rate'
    },
    {
      title: 'Points Earned',
      value: '150',
      icon: '⭐',
      trend: '+45 this week'
    },
    {
      title: 'Family Streak',
      value: '7 days',
      icon: '🔥',
      trend: 'Personal best!'
    }
  ], []);

  // Extract Leaderboard component for better organization
  const LeaderboardItem = ({ member, index }) => (
    <div className="flex items-center justify-between p-3 bg-[rgba(255,255,255,0.05)] rounded-lg">
      <div className="flex items-center space-x-3">
        <span className="text-[#00ff9f] font-semibold">#{index + 1}</span>
        <span className="text-white">{member}</span>
      </div>
      <span className="text-gray-400">{(400 - index * 75)} pts</span>
    </div>
  );

  const familyMembers = useMemo(() => ['Mom', 'Dad', 'Sarah', 'Tommy'], []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <StatsCard key={`stat-${index}`} {...stat} delay={index * 0.1} />
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="bg-[rgba(26,26,26,0.75)] backdrop-blur-lg border border-[rgba(255,255,255,0.1)] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Today's Schedule</h2>
            <RecentActivity />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[rgba(26,26,26,0.75)] backdrop-blur-lg border border-[rgba(255,255,255,0.1)] rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Family Leaderboard</h2>
          <div className="space-y-4">
            {familyMembers.map((member, index) => (
              <LeaderboardItem 
                key={`member-${index}`} 
                member={member} 
                index={index} 
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardOverview; 