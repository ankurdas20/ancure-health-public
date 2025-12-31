import { motion } from 'framer-motion';
import ancureLogo from '@/assets/ancure-logo.png';

export function Logo({ size = 'default' }: { size?: 'default' | 'small' | 'large' }) {
  const sizes = {
    small: { icon: 24, text: 'text-lg' },
    default: { icon: 36, text: 'text-2xl' },
    large: { icon: 48, text: 'text-3xl' },
  };

  const { icon, text } = sizes[size];

  return (
    <motion.div 
      className="flex items-center gap-2"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <img 
        src={ancureLogo} 
        alt="Ancure Health" 
        width={icon} 
        height={icon}
        className="object-contain"
      />
      <span className={`${text} font-bold text-foreground`}>
        Ancure <span className="text-primary">Health</span>
      </span>
    </motion.div>
  );
}
