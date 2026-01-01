import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Lock, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface FeatureGateProps {
  children: ReactNode;
  title: string;
  description: string;
  icon?: ReactNode;
  requiresAuth?: boolean;
}

export function FeatureGate({ 
  children, 
  title, 
  description, 
  icon,
  requiresAuth = true 
}: FeatureGateProps) {
  const { user, initialized } = useAuth();
  const navigate = useNavigate();

  // If auth not required or user is logged in, show children
  if (!requiresAuth || user) {
    return <>{children}</>;
  }

  // Show upgrade prompt for unauthenticated users
  return (
    <Card variant="soft" className="overflow-hidden border border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
          <div className="p-2 rounded-full bg-primary/10">
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        <Button
          variant="soft"
          className="w-full gap-2"
          onClick={() => navigate('/auth')}
        >
          <LogIn className="w-4 h-4" />
          Sign in to unlock
        </Button>
      </CardContent>
    </Card>
  );
}

// Lightweight placeholder that shows feature preview without loading backend
interface FeaturePlaceholderProps {
  title: string;
  description: string;
  icon: ReactNode;
  previewContent?: ReactNode;
}

export function FeaturePlaceholder({ 
  title, 
  description, 
  icon,
  previewContent 
}: FeaturePlaceholderProps) {
  const navigate = useNavigate();

  return (
    <Card variant="soft" className="overflow-hidden border border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {previewContent && (
          <div className="opacity-60 pointer-events-none">
            {previewContent}
          </div>
        )}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
          <div className="p-2 rounded-full bg-primary/10">
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        <Button
          variant="soft"
          className="w-full gap-2"
          onClick={() => navigate('/auth')}
        >
          <LogIn className="w-4 h-4" />
          Sign in to unlock
        </Button>
      </CardContent>
    </Card>
  );
}
