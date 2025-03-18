
import React from "react";
import { motion } from "framer-motion";

const Header = () => {
  return (
    <motion.header
      className="w-full py-8 sm:py-4 print:hidden print:bg-transparent print:pt-0 print:mt-0"
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
        <div className="print:hidden">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-blue-800">
            Ground Truthing Notice Generation
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl">
            Generate notices for private lands khata wise
          </p>
        </div>
      </motion.div>
    </motion.header>
  );
};

export default Header;
