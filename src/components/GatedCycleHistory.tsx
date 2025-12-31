import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Calendar, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLazyAuth } from '@/contexts/LazyAuthContext';
import { LockedFeatureOverlay } from '@/components/LockedFeatureOverlay';
import { format, differenceInDays, parseISO } from 'date-fns';

interface PeriodLog {
  id: string;
  start_date: string;
  end_date: string | null;
  predicted_start_date: string | null;
  cycle_length: number | null;
  notes: string | null;
}

interface SymptomLog {
  id: string;
  log_date: string;
  symptoms: string[];
  mood: string | null;
  energy_level: string | null;
}

interface GatedCycleHistoryProps {
  currentCycleLength: number;
  lastPeriodDate: string;
}

export function GatedCycleHistory({ currentCycleLength, lastPeriodDate }: GatedCycleHistoryProps) {
  const { user, isInitialized } = useLazyAuth();
  const [periodLogs, setPeriodLogs] = useState<PeriodLog[]>([]);
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && isInitialized) {
      loadHistory();
    }
  }, [user, isInitialized]);

  const loadHistory = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    const { supabase } = await import('@/integrations/supabase/client');
    
    const [periodResult, symptomResult] = await Promise.all([
      supabase
        .from('period_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false })
        .limit(12),
      supabase
        .from('symptom_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('log_date', { ascending: false })
        .limit(30)
    ]);

    if (periodResult.data) {
      setPeriodLogs(periodResult.data);
    }
    if (symptomResult.data) {
      setSymptomLogs(symptomResult.data);
    }
    
    setIsLoading(false);
  };

  const calculateAverageCycleLength = () => {
    if (periodLogs.length < 2) return null;
    
    const cycleLengths: number[] = [];
    for (let i = 0; i < periodLogs.length - 1; i++) {
      const current = parseISO(periodLogs[i].start_date);
      const previous = parseISO(periodLogs[i + 1].start_date);
      const days = differenceInDays(current, previous);
      if (days > 0 && days < 60) {
        cycleLengths.push(days);
      }
    }
    
    if (cycleLengths.length === 0) return null;
    return Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
  };

  const getMostCommonSymptoms = () => {
    const symptomCounts: Record<string, number> = {};
    symptomLogs.forEach(log => {
      log.symptoms.forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    });
    
    return Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([symptom]) => symptom.replace('_', ' '));
  };

  // Show locked state for non-authenticated users
  if (!user) {
    return (
      <Card variant="soft" className="overflow-hidden border border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="w-5 h-5 text-primary" />
            Cycle History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LockedFeatureOverlay
            title="View Cycle History"
            description="Sign in to track your cycle history and see patterns."
            icon={<History className="w-6 h-6 text-primary" />}
          />
        </CardContent>
      </Card>
    );
  }

  const avgCycleLength = calculateAverageCycleLength();
  const commonSymptoms = getMostCommonSymptoms();

  return (
    <Card variant="soft" className="overflow-hidden border border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="w-5 h-5 text-primary" />
          Cycle History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <motion.div
              className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : periodLogs.length === 0 && symptomLogs.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              No history yet. Log your periods and symptoms to see patterns over time.
            </p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-background/50 text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs">Avg Cycle</span>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {avgCycleLength ? `${avgCycleLength} days` : `${currentCycleLength} days`}
                </p>
                {avgCycleLength && avgCycleLength !== currentCycleLength && (
                  <p className="text-xs text-muted-foreground">
                    vs {currentCycleLength} set
                  </p>
                )}
              </div>
              <div className="p-3 rounded-xl bg-background/50 text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Calendar className="w-3 h-3" />
                  <span className="text-xs">Periods Logged</span>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {periodLogs.length}
                </p>
              </div>
            </div>

            {/* Common Symptoms */}
            {commonSymptoms.length > 0 && (
              <div className="p-3 rounded-xl bg-background/50">
                <p className="text-xs text-muted-foreground mb-2">Most common symptoms</p>
                <div className="flex flex-wrap gap-1">
                  {commonSymptoms.map(symptom => (
                    <span
                      key={symptom}
                      className="px-2 py-0.5 rounded-full bg-primary/10 text-xs text-foreground capitalize"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Expandable History */}
            {periodLogs.length > 0 && (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between text-muted-foreground"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <span>Past Periods</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
                
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2 mt-2"
                  >
                    {periodLogs.slice(0, 6).map((log, index) => {
                      const startDate = parseISO(log.start_date);
                      const cycleLength = index < periodLogs.length - 1
                        ? differenceInDays(startDate, parseISO(periodLogs[index + 1].start_date))
                        : null;
                      
                      return (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-background/30 text-sm"
                        >
                          <span className="text-foreground">
                            {format(startDate, 'MMM d, yyyy')}
                          </span>
                          {cycleLength && (
                            <span className="text-xs text-muted-foreground">
                              {cycleLength} day cycle
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
