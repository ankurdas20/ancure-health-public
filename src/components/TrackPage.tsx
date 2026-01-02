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

  // 1. Initial Load: Try Local Storage first for speed
  useEffect(() => {
    const localData = loadLocalCycleData();
    if (localData) {
      setCycleData(localData);
      setShowDashboard(true);
    }
    // Don't set isLoading(false) here if we expect a user to log in
    if (!user) setIsLoading(false);
  }, [user]);

  // 2. Cloud Sync: If user is logged in, fetch from Supabase
  useEffect(() => {
    const syncWithCloud = async () => {
      if (!user || !initialized || hasReset) {
        setIsLoading(false);
        return;
      }
      
      try {
        // First, move any guest data to the cloud
        await migrateLocalToCloud(user.id);
        
        // Then, fetch the most recent data from Supabase
        const cloudData = await loadCloudCycleData(user.id);
        if (cloudData) {
          setCycleData(cloudData);
          setShowDashboard(true);
          console.log("Ancure Health: Cloud data synced successfully.");
        }
      } catch (err) {
        console.error("Cloud Sync Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    syncWithCloud();
  }, [user, initialized, hasReset]);

  const handleFormSubmit = useCallback(async (data: CycleData) => {
    setHasReset(false);
    setCycleData(data);
    
    // Save locally for offline/guest use
    saveLocalCycleData(data);
    
    // CRITICAL: Save to Supabase Cloud
    if (user) {
      const { error } = await saveCloudCycleData(user.id, data);
      if (error) {
        toast({
          title: "Cloud Sync Failed",
          description: "Data saved locally but couldn't reach the server.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Securely Saved",
          description: "Your health data is now synced to your Ancure account.",
        });
      }
    }
    
    setShowDashboard(true);
  }, [user, toast]);

  const handleReset = useCallback(() => {
    setHasReset(true);
    clearLocalCycleData();
    setCycleData(null);
    setShowDashboard(false);
    toast({
      title: "Data Reset",
      description: "Local data cleared. Log in to manage cloud history.",
    });
  }, [toast]);

  const handleLogPeriod = useCallback(async (date: string) => {
    if (!cycleData) return;
    const updatedData = { ...cycleData, lastPeriodDate: date };
    setCycleData(updatedData);
    
    saveLocalCycleData(updatedData);
    
    if (user) {
      await saveCloudCycleData(user.id, updatedData);
    }
  }, [cycleData, user]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    // Clear local cache on logout for security
    clearLocalCycleData();
    setCycleData(null);
    setShowDashboard(false);
    navigate("/");
  }, [signOut, navigate]);

  const insights = cycleData ? calculateCycleInsights(cycleData) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Syncing with Ancure Cloud...</p>
        </div>
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
          <Logo size="small" />
          <UserMenu />
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
