import { motion } from 'framer-motion';
import { RefreshCw, CalendarDays, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CycleRing } from '@/components/CycleRing';
import { GoalInsights } from '@/components/GoalInsights';
import { CycleCalendar } from '@/components/CycleCalendar';
import { CycleData, CycleInsights, formatDate, getPhaseInfo, getDailyInsight } from '@/lib/cycleCalculations';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardProps {
  data: CycleData;
  insights: CycleInsights;
  onReset: () => void;
}

export function Dashboard({ data, insights, onReset }: DashboardProps) {
  const { currentCycleDay, cyclePhase, nextPeriodDate, daysUntilNextPeriod } = insights;
  const phaseInfo = getPhaseInfo(cyclePhase);
  const dailyInsight = getDailyInsight(cyclePhase, currentCycleDay);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with cycle ring */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card variant="soft" className="overflow-hidden">
          <CardContent className="pt-6 pb-8">
            <CycleRing
              currentDay={currentCycleDay}
              totalDays={data.cycleLength}
              phase={cyclePhase}
              periodDuration={data.periodDuration}
            />
            
            {/* Quick stats */}
            <div className="mt-6 grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div className="text-center p-3 rounded-xl bg-background/50">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                  <CalendarDays className="w-4 h-4" />
                  <span className="text-xs">Next Period</span>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(nextPeriodDate)}
                </p>
              </div>
              <div className="text-center p-3 rounded-xl bg-background/50">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">Days Until</span>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {daysUntilNextPeriod} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Phase message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card variant="lavender" className="overflow-hidden">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{phaseInfo.emoji}</span>
              <div className="space-y-1">
                <h3 className="font-medium text-foreground">{phaseInfo.name}</h3>
                <p className="text-sm text-muted-foreground">{phaseInfo.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily insight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Card className="overflow-hidden border-primary/20 bg-primary/5">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-foreground text-center italic">
              "{dailyInsight}"
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Goal-specific insights */}
      {data.goal && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <GoalInsights
            goal={data.goal}
            insights={insights}
            isRegular={data.isRegular}
          />
        </motion.div>
      )}

      {/* Cycle Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <CycleCalendar data={data} insights={insights} />
      </motion.div>

      {/* Confidence indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        <Card className="overflow-hidden border-border/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span>
                Prediction confidence: <strong className="capitalize">{insights.confidence}</strong>
                {insights.confidence === 'low' && ' — Consider tracking for more accurate predictions'}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Start over button */}
      <motion.div
        className="flex justify-center pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          variant="ghost"
          onClick={onReset}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="w-4 h-4" />
          Start Over
        </Button>
      </motion.div>
    </div>
  );
}
