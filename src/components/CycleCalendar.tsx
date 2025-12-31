import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { CalendarDays } from 'lucide-react';
import { CycleInsights, CycleData } from '@/lib/cycleCalculations';

interface CycleCalendarProps {
  data: CycleData;
  insights: CycleInsights;
}

type PhaseType = 'menstrual' | 'fertile' | 'ovulation' | 'luteal' | 'follicular';

function getDatePhase(
  date: Date,
  data: CycleData,
  insights: CycleInsights
): PhaseType | null {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  const { nextPeriodDate, nextPeriodEndDate, ovulationDate, fertileWindowStart, fertileWindowEnd } = insights;
  
  // Calculate current period dates
  const currentPeriodStart = new Date(nextPeriodDate);
  currentPeriodStart.setDate(currentPeriodStart.getDate() - data.cycleLength);
  const currentPeriodEnd = new Date(currentPeriodStart);
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + data.periodDuration - 1);
  
  // Normalize all dates
  const normalizeDate = (d: Date) => {
    const normalized = new Date(d);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };
  
  const normalizedNextPeriodStart = normalizeDate(nextPeriodDate);
  const normalizedNextPeriodEnd = normalizeDate(nextPeriodEndDate);
  const normalizedCurrentPeriodStart = normalizeDate(currentPeriodStart);
  const normalizedCurrentPeriodEnd = normalizeDate(currentPeriodEnd);
  const normalizedOvulation = normalizeDate(ovulationDate);
  const normalizedFertileStart = normalizeDate(fertileWindowStart);
  const normalizedFertileEnd = normalizeDate(fertileWindowEnd);
  
  // Check menstrual phase (current or next period)
  if (
    (checkDate >= normalizedCurrentPeriodStart && checkDate <= normalizedCurrentPeriodEnd) ||
    (checkDate >= normalizedNextPeriodStart && checkDate <= normalizedNextPeriodEnd)
  ) {
    return 'menstrual';
  }
  
  // Check ovulation (single day)
  if (checkDate.getTime() === normalizedOvulation.getTime()) {
    return 'ovulation';
  }
  
  // Check fertile window
  if (checkDate >= normalizedFertileStart && checkDate <= normalizedFertileEnd) {
    return 'fertile';
  }
  
  // Determine follicular vs luteal
  if (checkDate > normalizedCurrentPeriodEnd && checkDate < normalizedFertileStart) {
    return 'follicular';
  }
  
  if (checkDate > normalizedFertileEnd && checkDate < normalizedNextPeriodStart) {
    return 'luteal';
  }
  
  return null;
}

const phaseStyles: Record<PhaseType, string> = {
  menstrual: 'bg-primary text-primary-foreground',
  fertile: 'bg-pink-400/80 text-white',
  ovulation: 'bg-pink-600 text-white ring-2 ring-pink-300',
  follicular: 'bg-secondary/60 text-secondary-foreground',
  luteal: 'bg-accent/60 text-accent-foreground',
};

const phaseLegend: { phase: PhaseType; label: string; color: string }[] = [
  { phase: 'menstrual', label: 'Period', color: 'bg-primary' },
  { phase: 'follicular', label: 'Follicular', color: 'bg-secondary/60' },
  { phase: 'fertile', label: 'Fertile', color: 'bg-pink-400/80' },
  { phase: 'ovulation', label: 'Ovulation', color: 'bg-pink-600' },
  { phase: 'luteal', label: 'Luteal', color: 'bg-accent/60' },
];

export function CycleCalendar({ data, insights }: CycleCalendarProps) {
  const [month, setMonth] = useState<Date>(new Date());

  const modifiers = {
    menstrual: (date: Date) => getDatePhase(date, data, insights) === 'menstrual',
    fertile: (date: Date) => getDatePhase(date, data, insights) === 'fertile',
    ovulation: (date: Date) => getDatePhase(date, data, insights) === 'ovulation',
    follicular: (date: Date) => getDatePhase(date, data, insights) === 'follicular',
    luteal: (date: Date) => getDatePhase(date, data, insights) === 'luteal',
  };

  const modifiersStyles = {
    menstrual: { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' },
    fertile: { backgroundColor: 'hsl(330 80% 65%)', color: 'white' },
    ovulation: { backgroundColor: 'hsl(330 70% 45%)', color: 'white', boxShadow: '0 0 0 2px hsl(330 80% 75%)' },
    follicular: { backgroundColor: 'hsl(var(--secondary) / 0.6)', color: 'hsl(var(--secondary-foreground))' },
    luteal: { backgroundColor: 'hsl(var(--accent) / 0.6)', color: 'hsl(var(--accent-foreground))' },
  };

  return (
    <Card variant="soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays className="w-5 h-5 text-primary" />
          Cycle Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Legend */}
        <motion.div 
          className="flex flex-wrap gap-2 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {phaseLegend.map((item) => (
            <div key={item.phase} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
        >
          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-xl border border-border/50 p-3 pointer-events-auto"
            classNames={{
              day: "h-9 w-9 text-center text-sm p-0 relative rounded-full transition-all",
              day_today: "ring-2 ring-primary/50",
            }}
          />
        </motion.div>
      </CardContent>
    </Card>
  );
}
