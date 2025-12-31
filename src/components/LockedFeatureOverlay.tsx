import { motion } from 'framer-motion';
import { Lock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface LockedFeatureOverlayProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function LockedFeatureOverlay({ title, description, icon }: LockedFeatureOverlayProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center text-center py-6 px-4"
    >
      <div className="mb-4 p-3 rounded-full bg-primary/10">
        {icon || <Lock className="w-6 h-6 text-primary" />}
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-xs">
        {description}
      </p>
      <Button
        variant="soft"
        size="sm"
        onClick={() => navigate('/auth')}
        className="gap-2"
      >
        <LogIn className="w-4 h-4" />
        Sign in
      </Button>
    </motion.div>
  );
}
