import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  index?: number;
  className?: string;
}

export function AnimatedCard({ children, index = 0, className }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.05, 0.4),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ 
        y: -3, 
        transition: { duration: 0.2, ease: 'easeOut' } 
      }}
      whileTap={{ scale: 0.985 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
