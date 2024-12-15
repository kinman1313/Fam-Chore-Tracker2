import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      className="flex items-center space-x-2 text-sm text-gray-400"
    >
      <Link to="/" className="hover:text-[#00ff9f] transition-colors">
        Home
      </Link>
      
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <motion.div
            key={routeTo}
            variants={variants}
            transition={{ delay: index * 0.1 }}
            className="flex items-center"
          >
            <span className="mx-2 text-gray-500">/</span>
            {isLast ? (
              <span className="text-[#00ff9f] capitalize">{name}</span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-[#00ff9f] transition-colors capitalize"
              >
                {name}
              </Link>
            )}
          </motion.div>
        )}
      )}
    </motion.nav>
  );
};

export default Breadcrumbs; 