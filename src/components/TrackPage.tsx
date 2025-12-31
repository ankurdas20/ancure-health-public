import { useState, useEffect } from "react";
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
import { ArrowLeft, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TrackPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();

  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasReset, setHasReset] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (authLoading || hasReset) return;
      setIsLoading(true);
      if (user) {
        await migrateLocalToCloud(user.id);
        const cloudData = await loadCloudCycleData(user.id);
        if (cloudData) {
          setCycleData(cloudData);
          setShowDashboard(true);
        }
      } else {
        const localData = loadLocalCycleData();
        if (localData) {
          setCycleData(localData);
          setShowDashboard(true);
        }
      }
      setIsLoading(false);
    };
    loadData();
  }, [user, authLoading, hasReset]);

  const handleFormSubmit = async (data: CycleData) => {
    setHasReset(false);
    setCycleData(data);
    if (user) {
      await saveCloudCycleData(user.id, data);
    } else {
      saveLocalCycleData(data);
    }
    setShowDashboard(true);
  };

  const handleReset = () => {
    setHasReset(true);
    if (!user) clearLocalCycleData();
    setCycleData(null);
    setShowDashboard(false);
  };

  const handleLogPeriod = async (date: string) => {
    if (!cycleData) return;
    const updatedData = { ...cycleData, lastPeriodDate: date };
    setCycleData(updatedData);
    if (user) {
      await saveCloudCycleData(user.id, updatedData);
    } else {
      saveLocalCycleData(updatedData);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setCycleData(null);
    setShowDashboard(false);
    const localData = loadLocalCycleData();
    if (localData) {
      setCycleData(localData);
      setShowDashboard(true);
    }
  };

  const insights = cycleData ? calculateCycleInsights(cycleData) : null;

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen w-full bg-background">
        {" "}
        {/* Change bg-white to bg-background */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
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
          <Button variant="ghost" size="sm" onClick={user ? handleSignOut : () => navigate("/auth")}>
            {user ? <LogOut className="w-4 h-4 mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
            {user ? "Sign out" : "Sign in"}
          </Button>
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
                  <Dashboard data={cycleData} insights={insights} onReset={handleReset} onLogPeriod={handleLogPeriod} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
