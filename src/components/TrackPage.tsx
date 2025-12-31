import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { CycleInputForm } from "@/components/CycleInputForm";
import { Dashboard } from "@/components/Dashboard";
import { CycleData, calculateCycleInsights } from "@/lib/cycleCalculations";
import { saveLocalCycleData, loadLocalCycleData, clearLocalCycleData } from "@/lib/storage";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TrackPage() {
  const navigate = useNavigate();
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const localData = loadLocalCycleData();
    if (localData) {
      setCycleData(localData);
      setShowDashboard(true);
    }
    setIsLoading(false);
  }, []);

  const handleFormSubmit = (data: CycleData) => {
    setCycleData(data);
    saveLocalCycleData(data);
    setShowDashboard(true);
  };

  const handleReset = () => {
    clearLocalCycleData();
    setCycleData(null);
    setShowDashboard(false);
  };

  const insights = cycleData ? calculateCycleInsights(cycleData) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
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
          <div className="w-[72px]" /> {/* Spacer for alignment */}
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
                  <Dashboard data={cycleData} insights={insights} onReset={handleReset} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Medical Disclaimer Footer */}
        <footer className="mt-12 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center max-w-md mx-auto">
            ⚕️ <strong>Medical Disclaimer:</strong> This tool provides educational estimates only 
            and is not intended as medical advice, diagnosis, or treatment. Always consult a 
            healthcare professional for personal health decisions.
          </p>
        </footer>
      </div>
    </div>
  );
}
