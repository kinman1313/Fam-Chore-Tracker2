import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: '📊',
    submenu: []
  },
  {
    title: 'Chores',
    path: '/chores',
    icon: '✓',
    submenu: [
      { title: 'All Chores', path: '/chores' },
      { title: 'Create Chore', path: '/chores/create' },
      { title: 'Assignments', path: '/chores/assignments' }
    ]
  },
  {
    title: 'Family',
    path: '/family',
    icon: '👨‍👩‍👧‍👦',
    submenu: [
      { title: 'Members', path: '/family/members' },
      { title: 'Invite', path: '/family/invite' }
    ]
  },
  {
    title: 'Rewards',
    path: '/rewards',
    icon: '🎁',
    submenu: [
      { title: 'Available Rewards', path: '/rewards' },
      { title: 'Create Reward', path: '/rewards/create' }
    ]
  }
];

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState(null);

  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const menuItemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        y: { stiffness: 1000, velocity: -100 }
      }
    },
    closed: {
      y: 50,
      opacity: 0,
      transition: {
        y: { stiffness: 1000 }
      }
    }
  };

  return (
    <motion.div
      initial={false}
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-[rgba(26,26,26,0.75)] backdrop-blur-lg border-r border-[rgba(255,255,255,0.1)] z-40"
    >
      <div className="p-4 space-y-2">
        {menuItems.map((item, index) => (
          <div key={item.path} className="relative">
            <motion.div
              variants={menuItemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={() => setExpandedMenu(expandedMenu === index ? null : index)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-[rgba(0,255,159,0.1)] text-[#00ff9f]'
                    : 'text-gray-300 hover:bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.title}</span>
                {item.submenu.length > 0 && (
                  <span className={`ml-auto transform transition-transform duration-200 ${
                    expandedMenu === index ? 'rotate-180' : ''
                  }`}>
                    ▼
                  </span>
                )}
              </button>
            </motion.div>

            <AnimatePresence>
              {expandedMenu === index && item.submenu.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-8 mt-2 space-y-2"
                >
                  {item.submenu.map((subItem) => (
                    <Link
                      key={subItem.path}
                      to={subItem.path}
                      className={`block px-4 py-2 rounded-md text-sm transition-colors ${
                        location.pathname === subItem.path
                          ? 'text-[#00ff9f]'
                          : 'text-gray-400 hover:text-[#00ff9f]'
                      }`}
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Sidebar; 