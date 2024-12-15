import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FamilyManagement = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  const familyMembers = [
    { id: 1, name: 'John Doe', role: 'parent', status: 'active', points: 450, avatar: '👨' },
    { id: 2, name: 'Jane Doe', role: 'parent', status: 'active', points: 380, avatar: '👩' },
    { id: 3, name: 'Sarah Doe', role: 'child', status: 'active', points: 290, avatar: '👧' },
    { id: 4, name: 'Tommy Doe', role: 'child', status: 'active', points: 210, avatar: '👦' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Family Members</h2>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-[#00ff9f] text-black rounded-lg hover:bg-[#00cc88] transition-colors"
        >
          Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {familyMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[rgba(26,26,26,0.75)] backdrop-blur-lg border border-[rgba(255,255,255,0.1)] rounded-xl p-6 hover:border-[#00ff9f] transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{member.avatar}</div>
                <div>
                  <h3 className="text-white text-lg font-medium">{member.name}</h3>
                  <p className="text-gray-400 capitalize">{member.role}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[#00ff9f] font-medium">{member.points} pts</span>
                <p className="text-gray-400 mt-1">Total Earned</p>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between">
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-[rgba(0,255,159,0.1)] text-[#00ff9f] rounded-lg hover:bg-[rgba(0,255,159,0.2)] transition-colors">
                  View Profile
                </button>
                {member.role === 'child' && (
                  <button className="px-3 py-1 bg-[rgba(255,255,255,0.05)] text-gray-400 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                    Manage Access
                  </button>
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                member.status === 'active' ? 'bg-[rgba(0,255,159,0.1)] text-[#00ff9f]' : 'bg-[rgba(255,255,255,0.1)] text-gray-400'
              }`}>
                {member.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FamilyManagement; 