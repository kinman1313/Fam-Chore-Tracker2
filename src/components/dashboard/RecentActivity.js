import React from 'react';
import { motion } from 'framer-motion';

const activities = [
  {
    time: '9:00 AM',
    task: 'Make Bed',
    assignee: 'Sarah',
    status: 'completed'
  },
  {
    time: '10:30 AM',
    task: 'Empty Dishwasher',
    assignee: 'Tommy',
    status: 'pending'
  },
  {
    time: '2:00 PM',
    task: 'Vacuum Living Room',
    assignee: 'Mom',
    status: 'in-progress'
  },
  {
    time: '4:30 PM',
    task: 'Take Out Trash',
    assignee: 'Dad',
    status: 'pending'
  }
];

const RecentActivity = () => {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-4 bg-[rgba(255,255,255,0.05)] rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors"
        >
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">{activity.time}</span>
            <span className="text-white font-medium">{activity.task}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">{activity.assignee}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              activity.status === 'completed' ? 'bg-[rgba(0,255,159,0.1)] text-[#00ff9f]' :
              activity.status === 'in-progress' ? 'bg-[rgba(255,159,0,0.1)] text-[#ffa500]' :
              'bg-[rgba(255,255,255,0.1)] text-gray-400'
            }`}>
              {activity.status}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RecentActivity; 