import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { checkSupabaseConnection } from '@/lib/supabaseHelpers';

interface ConnectionStatusProps {
  showAlways?: boolean;
}

export const ConnectionStatus = memo(function ConnectionStatus({ 
  showAlways = false 
}: ConnectionStatusProps) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [isRetrying, setIsRetrying] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const checkConnection = useCallback(async () => {
    setStatus('checking');
    const isConnected = await checkSupabaseConnection();
    setStatus(isConnected ? 'connected' : 'disconnected');
    setShowBanner(!isConnected || showAlways);
  }, [showAlways]);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    await checkConnection();
    setIsRetrying(false);
  }, [checkConnection]);

  useEffect(() => {
    checkConnection();
    
    // Recheck on visibility change (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkConnection();
      }
    };
    
    // Recheck on online/offline events
    const handleOnline = () => checkConnection();
    const handleOffline = () => setStatus('disconnected');
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnection]);

  // Auto-hide success banner after 3 seconds
  useEffect(() => {
    if (status === 'connected' && showBanner && !showAlways) {
      const timer = setTimeout(() => setShowBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [status, showBanner, showAlways]);

  if (!showBanner && status !== 'disconnected') {
    return null;
  }

  return (
    <AnimatePresence>
      {(showBanner || status === 'disconnected') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-sm ${
            status === 'connected'
              ? 'bg-green-500/10 border-b border-green-500/20 text-green-700 dark:text-green-400'
              : status === 'disconnected'
              ? 'bg-destructive/10 border-b border-destructive/20 text-destructive'
              : 'bg-muted border-b border-border text-muted-foreground'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            {status === 'checking' && (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <span>Checking connection...</span>
              </>
            )}
            
            {status === 'connected' && (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Connected to backend</span>
              </>
            )}
            
            {status === 'disconnected' && (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>Unable to connect to server</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="ml-2 h-6 px-2 text-xs"
                >
                  {isRetrying ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <RefreshCw className="w-3 h-3" />
                    </motion.div>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// Compact indicator for header/footer placement
export const ConnectionIndicator = memo(function ConnectionIndicator() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const connected = await checkSupabaseConnection();
      setIsConnected(connected);
    };
    check();
    
    const interval = setInterval(check, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (isConnected === null) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse" />
        <span className="hidden sm:inline">Checking...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 text-xs ${
      isConnected ? 'text-green-600 dark:text-green-400' : 'text-destructive'
    }`}>
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3" />
          <span className="hidden sm:inline">Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span className="hidden sm:inline">Offline</span>
        </>
      )}
    </div>
  );
});
