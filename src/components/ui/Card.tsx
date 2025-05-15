import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <motion.div
    className={`bg-white dark:bg-background-dark rounded-lg shadow-md p-4 ${className}`}
    tabIndex={0}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
    whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(239, 68, 68, 0.15)' }}
    style={{
      background: 'var(--color-bg)',
      color: 'var(--color-text)',
      border: '1.5px solid var(--color-muted)',
      outline: 'none',
    }}
  >
    {children}
  </motion.div>
);

export default Card; 