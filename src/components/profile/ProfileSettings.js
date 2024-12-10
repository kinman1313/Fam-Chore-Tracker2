import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ProfileSettings = () => {
  const [formData, setFormData] = useState({
    name: 'Sarah Doe',
    email: 'sarah@example.com',
    avatar: '👧',
    notifications: {
      email: true,
      push: true,
      reminders: true,
      weeklyReport: true
    },
    preferences: {
      theme: 'dark',
      language: 'en',
      showPoints: true,
      showStreak: true
    },
    privacy: {
      profileVisibility: 'family',
      showActivity: true,
      showAchievements: true
    }
  });

  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(formData.avatar);

  const avatarOptions = ['👧', '👦', '👨', '👩', '👴', '👵', '🧑', '🧒'];

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    // API call to save settings would go here
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[rgba(26,26,26,0.75)] backdrop-blur-lg border border-[rgba(255,255,255,0.1)] rounded-xl p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
          {isEditing ? (
            <div className="space-x-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-[rgba(255,255,255,0.05)] text-gray-300 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#00ff9f] text-black rounded-lg hover:bg-[#00cc88] transition-colors"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-[#00ff9f] text-black rounded-lg hover:bg-[#00cc88] transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="flex space-x-4 mb-6">
          {['profile', 'notifications', 'preferences', 'privacy'].map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === section
                  ? 'bg-[#00ff9f] text-black'
                  : 'bg-[rgba(255,255,255,0.05)] text-gray-400 hover:bg-[rgba(255,255,255,0.1)]'
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>

        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">Avatar</label>
                <div className="flex space-x-4">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => isEditing && setSelectedAvatar(avatar)}
                      className={`text-4xl p-2 rounded-lg transition-all ${
                        selectedAvatar === avatar
                          ? 'bg-[rgba(0,255,159,0.1)] scale-110'
                          : 'hover:bg-[rgba(255,255,255,0.05)]'
                      } ${!isEditing && 'cursor-default'}`}
                      disabled={!isEditing}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('profile', 'name', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white focus:ring-2 focus:ring-[#00ff9f] focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('profile', 'email', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white focus:ring-2 focus:ring-[#00ff9f] focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-4">
              {Object.entries(formData.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleChange('notifications', key, e.target.checked)}
                      disabled={!isEditing}
                      className="sr-only peer"
                      id={`notifications-${key}`}
                    />
                    <div className="w-11 h-6 bg-[rgba(255,255,255,0.05)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00ff9f]"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Similar sections for preferences and privacy... */}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfileSettings; 