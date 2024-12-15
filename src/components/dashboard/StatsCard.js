import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon, trend, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[rgba(26,26,26,0.75)] backdrop-blur-lg border border-[rgba(255,255,255,0.1)] rounded-xl p-6 hover:border-[#00ff9f] transition-colors duration-300"
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <div className="flex items-center space-x-1 text-sm text-gray-400">
          <span>{trend}</span>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-gray-400 text-sm">{title}</h3>
        <p className="text-2xl font-semibold text-white mt-1">{value}</p>
      </div>
    </motion.div>
  );
};

export default StatsCard; 