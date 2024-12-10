import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AchievementSharing = ({ achievement, onClose }) => {
  const [shareMessage, setShareMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  const platforms = [
    { id: 'family', name: 'Family Feed', icon: '👨‍👩‍👧‍👦' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'clipboard', name: 'Copy Link', icon: '🔗' }
  ];

  const handleShare = async (platform) => {
    setIsSharing(true);
    try {
      switch (platform) {
        case 'family':
          // Share to family feed implementation
          await shareFamilyFeed();
          break;
        case 'whatsapp':
          window.open(`whatsapp://send?text=${encodeURIComponent(generateShareText())}`);
          break;
        case 'email':
          window.location.href = `mailto:?subject=Achievement Unlocked!&body=${encodeURIComponent(generateShareText())}`;
          break;
        case 'clipboard':
          await navigator.clipboard.writeText(generateShareText());
          // Show success notification
          break;
      }
    } catch (error) {
      console.error('Sharing failed:', error);
    }
    setIsSharing(false);
  };

  const generateShareText = () => {
    return `🎉 I just unlocked "${achievement.title}" in FamChores! ${shareMessage}\n\n${achievement.description}\n\nPoints earned: ${achievement.points}`;
  };

  const shareFamilyFeed = async () => {
    // API implementation for sharing to family feed
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
    >
      <div className="bg-[rgba(26,26,26,0.95)] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Share Achievement</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-4 p-4 bg-[rgba(0,255,159,0.1)] rounded-lg">
            <span className="text-4xl">{achievement.icon}</span>
            <div>
              <h4 className="text-white font-medium">{achievement.title}</h4>
              <p className="text-sm text-gray-400">{achievement.description}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 mb-2">Add a message (optional)</label>
          <textarea
            value={shareMessage}
            onChange={(e) => setShareMessage(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white focus:ring-2 focus:ring-[#00ff9f] focus:border-transparent transition-all resize-none"
            rows="3"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {platforms.map((platform) => (
            <motion.button
              key={platform.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleShare(platform.id)}
              disabled={isSharing}
              className={`flex items-center justify-center space-x-2 p-4 rounded-lg transition-colors ${
                isSharing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[rgba(255,255,255,0.1)]'
              } ${
                selectedPlatform === platform.id ? 'bg-[rgba(0,255,159,0.1)] border-[#00ff9f]' : 'bg-[rgba(255,255,255,0.05)] border-transparent'
              } border`}
            >
              <span className="text-2xl">{platform.icon}</span>
              <span className="text-white">{platform.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Success/Error Notifications */}
        <AnimatePresence>
          {isSharing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-4 p-3 bg-[rgba(0,255,159,0.1)] text-[#00ff9f] rounded-lg text-center"
            >
              Sharing achievement...
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AchievementSharing; 