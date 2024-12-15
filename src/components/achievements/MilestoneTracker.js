import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MilestoneTracker = () => {
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  const milestones = [
    {
      id: 1,
      title: 'Chore Champion',
      levels: [
        { level: 1, requirement: 10, points: 50, completed: true },
        { level: 2, requirement: 25, points: 100, completed: true },
        { level: 3, requirement: 50, points: 200, completed: false },
        { level: 4, requirement: 100, points: 500, completed: false },
        { level: 5, requirement: 200, points: 1000, completed: false }
      ],
      currentProgress: 37,
      icon: '🏆',
      category: 'Completion'
    },
    {
      id: 2,
      title: 'Streak Master',
      levels: [
        { level: 1, requirement: 3, points: 30, completed: true },
        { level: 2, requirement: 7, points: 70, completed: true },
        { level: 3, requirement: 14, points: 150, completed: false },
        { level: 4, requirement: 30, points: 300, completed: false },
        { level: 5, requirement: 60, points: 600, completed: false }
      ],
      currentProgress: 9,
      icon: '🔥',
      category: 'Consistency'
    }
    // Add more milestone categories...
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {milestones.map((milestone) => (
          <motion.div
            key={milestone.id}
            className="bg-[rgba(26,26,26,0.75)] backdrop-blur-lg border border-[rgba(255,255,255,0.1)] rounded-xl p-6"
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedMilestone(milestone)}
          >
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-4xl">{milestone.icon}</span>
              <div>
                <h3 className="text-xl font-bold text-white">{milestone.title}</h3>
                <p className="text-gray-400">Level {milestone.levels.filter(l => l.completed).length}/5</p>
              </div>
            </div>

            <div className="space-y-4">
              {milestone.levels.map((level, index) => {
                const isNextLevel = index === milestone.levels.filter(l => l.completed).length;
                const progress = isNextLevel 
                  ? (milestone.currentProgress / level.requirement) * 100 
                  : level.completed ? 100 : 0;

                return (
                  <div key={level.level} className="relative">
                    <div className="flex justify-between mb-2">
                      <span className={`text-sm ${level.completed ? 'text-[#00ff9f]' : 'text-gray-400'}`}>
                        Level {level.level}
                      </span>
                      <span className={`text-sm ${level.completed ? 'text-[#00ff9f]' : 'text-gray-400'}`}>
                        {isNextLevel ? `${milestone.currentProgress}/${level.requirement}` : level.completed ? 'Complete' : `0/${level.requirement}`}
                      </span>
                    </div>
                    <div className="h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={`h-full ${level.completed ? 'bg-[#00ff9f]' : 'bg-[#00ff9f] opacity-50'}`}
                      />
                    </div>
                    {isNextLevel && (
                      <div className="mt-1 text-xs text-right text-[#00ff9f]">
                        +{level.points} pts on completion
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Milestone Detail Modal */}
      <AnimatePresence>
        {selectedMilestone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedMilestone(null)}
          >
            {/* Modal content... */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MilestoneTracker; 