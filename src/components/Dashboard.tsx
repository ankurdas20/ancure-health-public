import { motion } from 'framer-motion';
import { RefreshCw, CalendarDays, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CycleRing } from '@/components/CycleRing';
import { GoalInsights } from '@/components/GoalInsights';
import { CycleCalendar } from '@/components/CycleCalendar';
import { AncureOneSection } from '@/components/AncureOneSection';
import { NotificationSettings } from '@/components/NotificationSettings';
import { GatedPeriodLogger } from '@/components/GatedPeriodLogger';
import { GatedSymptomLogger } from '@/components/GatedSymptomLogger';
import { GatedCycleHistory } from '@/components/GatedCycleHistory';
import { GatedSymptomTrendsChart } from '@/components/GatedSymptomTrendsChart';
import { CycleData, CycleInsights, formatDate } from '@/lib/cycleCalculations';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardProps {
  data: CycleData;
  insights: CycleInsights;
  onReset: () => void;
  onLogPeriod: (date: string) => void;
}

export function Dashboard({ data, insights, onReset, onLogPeriod }: DashboardProps) {
  const { currentCycleDay, cyclePhase, nextPeriodDate, daysUntilNextPeriod } = insights;

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

      {/* Goal-specific insights */}
      {data.goal && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GoalInsights
            goal={data.goal}
            insights={insights}
            isRegular={data.isRegular}
          />
        </motion.div>
      )}

      {/* Symptom Tracking & Cycle History - Gated */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid md:grid-cols-2 gap-4"
      >
        <GatedSymptomLogger />
        <GatedCycleHistory 
          currentCycleLength={data.cycleLength}
          lastPeriodDate={data.lastPeriodDate}
        />
      </motion.div>

      {/* Symptom Trends Chart - Gated */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <GatedSymptomTrendsChart />
      </motion.div>

      {/* Reminders & Period Logging - Gated */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid md:grid-cols-2 gap-4"
      >
        <NotificationSettings insights={insights} goal={data.goal} />
        <GatedPeriodLogger 
          currentLastPeriodDate={data.lastPeriodDate} 
          onLogPeriod={onLogPeriod}
        />
      </motion.div>

      {/* Cycle Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <CycleCalendar data={data} insights={insights} />
      </motion.div>

      {/* Continue on Telegram */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card variant="soft" className="overflow-hidden border border-border/50">
          <CardContent className="pt-6 pb-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <span className="text-2xl">📱</span>
                <span className="font-medium">Get Reminders on Telegram</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Connect with our Telegram bot to receive personalized cycle reminders and insights.
              </p>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  const payload = {
                    goal: data.goal,
                    lastPeriodDate: data.lastPeriodDate,
                    cycleLength: data.cycleLength,
                    periodDuration: data.periodDuration,
                    hasPCOSRisk: data.symptoms?.some(s => 
                      ['irregular', 'heavy_bleeding', 'acne', 'hair_growth'].includes(s)
                    ) || false
                  };
                  const encoded = btoa(JSON.stringify(payload));
                  window.open(`https://t.me/Ancurehealth_bot?start=${encoded}`, '_blank');
                }}
              >
                Continue on Telegram
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Ancure One section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <AncureOneSection id="ancure-one" />
      </motion.div>

      {/* Start over button */}
      <motion.div
        className="flex justify-center pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
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
