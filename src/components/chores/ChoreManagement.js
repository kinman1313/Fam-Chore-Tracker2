import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChoreManagement = () => {
  const [selectedTab, setSelectedTab] = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const chores = {
    active: [
      { id: 1, title: 'Clean Room', assignee: 'Sarah', points: 50, dueDate: '2024-03-20', priority: 'high' },
      { id: 2, title: 'Do Laundry', assignee: 'Tommy', points: 30, dueDate: '2024-03-19', priority: 'medium' },
      { id: 3, title: 'Dishes', assignee: 'Dad', points: 20, dueDate: '2024-03-18', priority: 'low' },
    ],
    completed: [
      { id: 4, title: 'Take Out Trash', assignee: 'Mom', points: 10, completedDate: '2024-03-17', priority: 'medium' },
      { id: 5, title: 'Vacuum Living Room', assignee: 'Sarah', points: 40, completedDate: '2024-03-16', priority: 'high' },
    ]
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedTab('active')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedTab === 'active'
                ? 'bg-[#00ff9f] text-black'
                : 'bg-[rgba(255,255,255,0.05)] text-gray-400 hover:bg-[rgba(255,255,255,0.1)]'
            }`}
          >
            Active Chores
          </button>
          <button
            onClick={() => setSelectedTab('completed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedTab === 'completed'
                ? 'bg-[#00ff9f] text-black'
                : 'bg-[rgba(255,255,255,0.05)] text-gray-400 hover:bg-[rgba(255,255,255,0.1)]'
            }`}
          >
            Completed
          </button>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#00ff9f] text-black rounded-lg hover:bg-[#00cc88] transition-colors"
        >
          Create Chore
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="grid gap-4"
        >
          {chores[selectedTab].map((chore) => (
            <motion.div
              key={chore.id}
              layout
              className="bg-[rgba(26,26,26,0.75)] backdrop-blur-lg border border-[rgba(255,255,255,0.1)] rounded-xl p-6 hover:border-[#00ff9f] transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white text-lg font-medium">{chore.title}</h3>
                  <p className="text-gray-400 mt-1">Assigned to: {chore.assignee}</p>
                </div>
                <div className="text-right">
                  <span className="text-[#00ff9f] font-medium">{chore.points} pts</span>
                  <p className={`mt-1 ${getPriorityColor(chore.priority)}`}>
                    {chore.priority} priority
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-gray-400">
                  {selectedTab === 'active' ? `Due: ${chore.dueDate}` : `Completed: ${chore.completedDate}`}
                </span>
                {selectedTab === 'active' && (
                  <button className="px-3 py-1 bg-[rgba(0,255,159,0.1)] text-[#00ff9f] rounded-lg hover:bg-[rgba(0,255,159,0.2)] transition-colors">
                    Mark Complete
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ChoreManagement; 