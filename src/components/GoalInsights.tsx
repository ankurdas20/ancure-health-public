import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Baby, Shield, Stethoscope, Heart, Calendar, AlertCircle, Sparkles } from 'lucide-react';
import { CycleGoal, CycleInsights, formatDate, formatDateRange } from '@/lib/cycleCalculations';

interface GoalInsightsProps {
  goal: CycleGoal;
  insights: CycleInsights;
  isRegular: boolean;
}

const goalConfig = {
  track_period: {
    icon: Target,
    title: 'Period Tracking Insights',
    color: 'from-primary/20 to-primary/5',
    borderColor: 'border-primary/20',
  },
  try_to_conceive: {
    icon: Baby,
    title: 'Fertility Insights',
    color: 'from-pink-500/20 to-pink-500/5',
    borderColor: 'border-pink-500/20',
  },
  avoid_pregnancy: {
    icon: Shield,
    title: 'Natural Family Planning',
    color: 'from-blue-500/20 to-blue-500/5',
    borderColor: 'border-blue-500/20',
  },
  pcos_management: {
    icon: Stethoscope,
    title: 'PCOS Management Tips',
    color: 'from-purple-500/20 to-purple-500/5',
    borderColor: 'border-purple-500/20',
  },
};

function getGoalTips(goal: CycleGoal, insights: CycleInsights, isRegular: boolean): { icon: typeof Heart; tip: string; highlight?: boolean }[] {
  const { cyclePhase, fertileWindowStart, fertileWindowEnd, ovulationDate, nextPeriodDate, daysUntilNextPeriod } = insights;
  const today = new Date();
  const isInFertileWindow = today >= fertileWindowStart && today <= fertileWindowEnd;
  
  switch (goal) {
    case 'try_to_conceive':
      return [
        {
          icon: Calendar,
          tip: `Your fertile window is ${formatDateRange(fertileWindowStart, fertileWindowEnd)}`,
          highlight: isInFertileWindow,
        },
        {
          icon: Sparkles,
          tip: `Ovulation expected around ${formatDate(ovulationDate)} — peak fertility day`,
          highlight: cyclePhase === 'ovulation',
        },
        {
          icon: Heart,
          tip: isInFertileWindow 
            ? "You're in your fertile window! This is the best time to try." 
            : `${Math.ceil((fertileWindowStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} days until your fertile window begins`,
        },
        {
          icon: AlertCircle,
          tip: isRegular 
            ? "Regular cycles help predict ovulation more accurately" 
            : "Irregular cycles may shift ovulation timing — consider tracking basal temperature",
        },
      ];
      
    case 'avoid_pregnancy':
      const safeBeforeFertile = new Date(fertileWindowStart);
      safeBeforeFertile.setDate(safeBeforeFertile.getDate() - 2);
      const safeAfterFertile = new Date(fertileWindowEnd);
      safeAfterFertile.setDate(safeAfterFertile.getDate() + 2);
      
      return [
        {
          icon: AlertCircle,
          tip: isInFertileWindow 
            ? "⚠️ You're in your fertile window — higher pregnancy risk" 
            : "You're outside the fertile window, but no method is 100% reliable",
          highlight: isInFertileWindow,
        },
        {
          icon: Shield,
          tip: `Avoid unprotected intercourse: ${formatDateRange(safeBeforeFertile, safeAfterFertile)}`,
          highlight: true,
        },
        {
          icon: Calendar,
          tip: `Lower risk days return after ${formatDate(safeAfterFertile)}`,
        },
        {
          icon: AlertCircle,
          tip: isRegular 
            ? "Natural family planning works best with very regular cycles" 
            : "⚠️ Irregular cycles make prediction less reliable — consider additional protection",
        },
      ];
      
    case 'pcos_management':
      return [
        {
          icon: Stethoscope,
          tip: cyclePhase === 'menstrual' 
            ? "Track your flow intensity and any pain levels during your period" 
            : "Continue tracking any symptoms like acne, bloating, or mood changes",
        },
        {
          icon: Heart,
          tip: "Regular gentle exercise can help manage PCOS symptoms",
        },
        {
          icon: Sparkles,
          tip: "Focus on balanced meals with protein and fiber to support insulin levels",
        },
        {
          icon: Calendar,
          tip: isRegular 
            ? "Your cycles appear regular — great for managing PCOS!" 
            : "Tracking cycle variations helps your doctor understand your patterns",
        },
      ];
      
    case 'track_period':
    default:
      return [
        {
          icon: Calendar,
          tip: `Your next period is expected around ${formatDate(nextPeriodDate)}`,
        },
        {
          icon: Sparkles,
          tip: `You're in the ${cyclePhase} phase of your cycle`,
        },
        {
          icon: Heart,
          tip: daysUntilNextPeriod <= 3 
            ? "Your period is coming soon — prepare your essentials!" 
            : `${daysUntilNextPeriod} days until your next period`,
        },
        {
          icon: AlertCircle,
          tip: isRegular 
            ? "Your regular cycles help us provide more accurate predictions" 
            : "Tracking helps us understand your unique cycle patterns",
        },
      ];
  }
}

export function GoalInsights({ goal, insights, isRegular }: GoalInsightsProps) {
  const config = goalConfig[goal];
  const tips = getGoalTips(goal, insights, isRegular);
  const Icon = config.icon;

  return (
    <Card className={`overflow-hidden border ${config.borderColor} bg-card`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="w-5 h-5 text-foreground" />
          {config.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tips.map((item, index) => {
          const TipIcon = item.icon;
          return (
            <motion.div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-xl ${
                item.highlight 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'bg-card/50'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <TipIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                item.highlight ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <span className={`text-sm ${
                item.highlight ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}>
                {item.tip}
              </span>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
