import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const AchievementNotification = ({ achievement, onClose }) => {
  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.8 }}
        onAnimationComplete={triggerCelebration}
        className="fixed top-4 right-4 z-50 w-96"
      >
        <div className="bg-[rgba(26,26,26,0.95)] backdrop-blur-lg border border-[#00ff9f] rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 text-4xl animate-bounce">
              {achievement.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold">Achievement Unlocked!</h3>
              <p className="text-[#00ff9f]">{achievement.title}</p>
              <p className="text-gray-400 text-sm">{achievement.description}</p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <span className="text-[#00ff9f] font-bold">+{achievement.points} points</span>
            <div className="space-x-2">
              <button
                onClick={() => {
                  // Share achievement
                  // Implementation depends on your sharing mechanism
                }}
                className="px-3 py-1 bg-[rgba(255,255,255,0.1)] text-white rounded-lg hover:bg-[rgba(255,255,255,0.2)] transition-colors"
              >
                Share
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1 bg-[rgba(255,255,255,0.1)] text-white rounded-lg hover:bg-[rgba(255,255,255,0.2)] transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementNotification; 