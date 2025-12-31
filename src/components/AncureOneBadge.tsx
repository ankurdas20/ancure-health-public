import { motion } from 'framer-motion';

interface AncureOneBadgeProps {
  onScrollToSection: () => void;
}

export function AncureOneBadge({ onScrollToSection }: AncureOneBadgeProps) {
  return (
    <motion.button
      onClick={onScrollToSection}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 text-muted-foreground hover:from-primary/15 hover:to-secondary/15 transition-colors border border-primary/10"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <span>💗</span>
      <span>Using Ancure freely — Ancure One is optional</span>
    </motion.button>
  );
}
