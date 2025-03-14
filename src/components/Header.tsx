
import React from 'react';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  return (
    <motion.header 
      className="w-full py-8 sm:py-12"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div 
        className="container mx-auto px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-gray-900">
          Ground Truthing Notice Generator
        </h1>
        <p className="mt-3 text-lg text-gray-600 max-w-2xl">
          Generate notices for land surveying with an elegant, minimalist interface
        </p>
      </motion.div>
    </motion.header>
  );
};

export default Header;
