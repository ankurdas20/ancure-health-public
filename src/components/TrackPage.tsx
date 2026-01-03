import { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { CycleInputForm } from "@/components/CycleInputForm";
import { Dashboard } from "@/components/Dashboard";
import { CycleData, calculateCycleInsights } from "@/lib/cycleCalculations";
import {
  saveLocalCycleData,
  loadLocalCycleData,
  clearLocalCycleData,
  saveCloudCycleData,
  loadCloudCycleData,
  migrateLocalToCloud,
} from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "@/components/UserMenu";
import { ConnectionIndicator } from "@/components/ConnectionStatus";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const TrackPage = memo(function TrackPage() {
  const navigate = useNavigate();
  const { user, initialized, signOut } = useAuth();
  const { toast } = useToast();

  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasReset, setHasReset] = useState(false);

  // Load local data immediately (no auth required)
  useEffect(() => {
    const localData = loadLocalCycleData();
    if (localData) {
      setCycleData(localData);
      setShowDashboard(true);
    }
    setIsLoading(false);
  }, []);

  // If user becomes authenticated, sync with cloud
  useEffect(() => {
    const syncWithCloud = async () => {
      if (!user || hasReset) return;
      
      // Migrate local data to cloud
      await migrateLocalToCloud(user.id);
      
      // Load cloud data (may have more history)
      const cloudData = await loadCloudCycleData(user.id);
      if (cloudData) {
        setCycleData(cloudData);
        setShowDashboard(true);
      }
    };

    if (user && initialized) {
      syncWithCloud();
    }
  }, [user, initialized, hasReset]);

  const handleFormSubmit = useCallback(async (data: CycleData) => {
    setHasReset(false);
    setCycleData(data);
    
    // Always save locally first (instant)
    saveLocalCycleData(data);
    
    // If user is authenticated, also save to cloud
    if (user) {
      const { error } = await saveCloudCycleData(user.id, data);
      if (error) {
        toast({
          title: "Sync issue",
          description: "Data saved locally but couldn't sync to cloud. Will retry later.",
          variant: "destructive",
        });
      }
    }
    
    setShowDashboard(true);
  }, [user, toast]);

  const handleReset = useCallback(() => {
    setHasReset(true);
    if (!user) clearLocalCycleData();
    setCycleData(null);
    setShowDashboard(false);
  }, [user]);

  const handleLogPeriod = useCallback(async (date: string) => {
    if (!cycleData) return;
    const updatedData = { ...cycleData, lastPeriodDate: date };
    setCycleData(updatedData);
    
    // Save locally first
    saveLocalCycleData(updatedData);
    
    // Sync to cloud if authenticated
    if (user) {
      const { error } = await saveCloudCycleData(user.id, updatedData);
      if (error) {
        toast({
          title: "Sync issue",
          description: "Period logged locally but couldn't sync to cloud.",
          variant: "destructive",
        });
      }
    }
  }, [cycleData, user, toast]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    // Keep local data visible after sign out
    const localData = loadLocalCycleData();
    if (localData) {
      setCycleData(localData);
      setShowDashboard(true);
    } else {
      setCycleData(null);
      setShowDashboard(false);
    }
  }, [signOut]);

  const insights = cycleData ? calculateCycleInsights(cycleData) : null;

  // Show loading only briefly for local data
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex items-center gap-3">
            <Logo size="small" />
            {user && <ConnectionIndicator />}
          </div>
          <UserMenu onSignIn={() => navigate("/auth")} />
        </header>

        <main>
          <AnimatePresence mode="wait">
            {!showDashboard ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CycleInputForm onSubmit={handleFormSubmit} initialData={cycleData} />
              </motion.div>
            ) : (
              <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {cycleData && insights && (
                  <Dashboard 
                    data={cycleData} 
                    insights={insights} 
                    onReset={handleReset} 
                    onLogPeriod={handleLogPeriod}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
});
