import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AchievementSystem = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  const categories = [
    { id: 'all', name: 'All', icon: '🏆' },
    { id: 'daily', name: 'Daily', icon: '📅' },
    { id: 'streak', name: 'Streaks', icon: '🔥' },
    { id: 'special', name: 'Special', icon: '⭐' },
    { id: 'master', name: 'Master', icon: '👑' }
  ];

  const achievements = [
    {
      id: 1,
      title: 'Early Bird',
      description: 'Complete 5 chores before 9 AM',
      icon: '🌅',
      category: 'daily',
      progress: 3,
      total: 5,
      points: 100,
      earned: false,
      requirements: [
        'Complete chores between 5 AM and 9 AM',
        'Must be different chores',
        'Must be completed within one week'
      ]
    },
    {
      id: 2,
      title: 'Super Streaker',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      category: 'streak',
      progress: 7,
      total: 7,
      points: 150,
      earned: true,
      date_earned: '2024-03-15',
      requirements: [
        'Complete at least one chore every day',
        'Streak resets if a day is missed',
        'Must be verified by parent'
      ]
    },
    // Add more achievements...
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Categories */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex space-x-4 mb-8 overflow-x-auto pb-4"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              selectedCategory === category.id
                ? 'bg-[#00ff9f] text-black'
                : 'bg-[rgba(255,255,255,0.05)] text-gray-400 hover:bg-[rgba(255,255,255,0.1)]'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </motion.div>

      {/* Achievements Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredAchievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.02 }}
              className={`bg-[rgba(26,26,26,0.75)] backdrop-blur-lg border rounded-xl p-6 cursor-pointer transition-colors ${
                achievement.earned ? 'border-[#00ff9f]' : 'border-[rgba(255,255,255,0.1)]'
              }`}
              onClick={() => setSelectedAchievement(achievement)}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{achievement.icon}</span>
                <span className="text-[#00ff9f] font-medium">+{achievement.points} pts</span>
              </div>
              <h3 className="text-white font-medium mb-2">{achievement.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{achievement.description}</p>
              
              {/* Progress Bar */}
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-[#00ff9f]">
                      {Math.round((achievement.progress / achievement.total) * 100)}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-gray-400">
                      {achievement.progress}/{achievement.total}
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-[rgba(255,255,255,0.1)]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#00ff9f]"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[rgba(26,26,26,0.95)] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl">{selectedAchievement.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedAchievement.title}</h3>
                    <p className="text-gray-400">{selectedAchievement.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-medium mb-2">Requirements</h4>
                  <ul className="space-y-2">
                    {selectedAchievement.requirements.map((req, index) => (
                      <li key={index} className="flex items-center space-x-2 text-gray-400">
                        <span className="text-[#00ff9f]">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Progress</h4>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-[rgba(255,255,255,0.1)]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(selectedAchievement.progress / selectedAchievement.total) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#00ff9f]"
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{selectedAchievement.progress}/{selectedAchievement.total} completed</span>
                      <span className="text-[#00ff9f]">+{selectedAchievement.points} pts</span>
                    </div>
                  </div>
                </div>

                {selectedAchievement.earned && (
                  <div className="text-center p-4 bg-[rgba(0,255,159,0.1)] rounded-lg">
                    <span className="text-[#00ff9f]">
                      Earned on {selectedAchievement.date_earned}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementSystem; 