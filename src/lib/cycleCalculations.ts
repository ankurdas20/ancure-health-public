export type CycleGoal = 'track_period' | 'try_to_conceive' | 'avoid_pregnancy' | 'pcos_management';

export interface CycleData {
  age: number;
  cycleLength: number;
  lastPeriodDate: string;
  periodDuration: number;
  isRegular: boolean;
  goal?: CycleGoal;
  symptoms?: string[];
  stressLevel?: 'low' | 'moderate' | 'high';
  activityLevel?: 'low' | 'moderate' | 'high';
}

export interface CycleInsights {
  nextPeriodDate: Date;
  nextPeriodEndDate: Date;
  ovulationDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  currentCycleDay: number;
  daysUntilNextPeriod: number;
  cyclePhase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  confidence: 'high' | 'medium' | 'low';
}

export function calculateCycleInsights(data: CycleData): CycleInsights {
  const lastPeriod = new Date(data.lastPeriodDate);
  const today = new Date();
  
  // Calculate next period
  const nextPeriodDate = new Date(lastPeriod);
  nextPeriodDate.setDate(lastPeriod.getDate() + data.cycleLength);
  
  // If next period is in the past, calculate the upcoming one
  while (nextPeriodDate < today) {
    nextPeriodDate.setDate(nextPeriodDate.getDate() + data.cycleLength);
  }
  
  const nextPeriodEndDate = new Date(nextPeriodDate);
  nextPeriodEndDate.setDate(nextPeriodDate.getDate() + data.periodDuration);
  
  // Ovulation estimate (14 days before next period)
  const ovulationDate = new Date(nextPeriodDate);
  ovulationDate.setDate(nextPeriodDate.getDate() - 14);
  
  // Fertile window (5 days before to day of ovulation)
  const fertileWindowStart = new Date(ovulationDate);
  fertileWindowStart.setDate(ovulationDate.getDate() - 5);
  
  const fertileWindowEnd = new Date(ovulationDate);
  fertileWindowEnd.setDate(ovulationDate.getDate() + 1);
  
  // Widen fertile window for irregular cycles
  if (!data.isRegular) {
    fertileWindowStart.setDate(fertileWindowStart.getDate() - 2);
    fertileWindowEnd.setDate(fertileWindowEnd.getDate() + 2);
  }
  
  // Current cycle day
  const currentCycleStart = new Date(nextPeriodDate);
  currentCycleStart.setDate(nextPeriodDate.getDate() - data.cycleLength);
  const daysSinceStart = Math.floor((today.getTime() - currentCycleStart.getTime()) / (1000 * 60 * 60 * 24));
  const currentCycleDay = daysSinceStart + 1;
  
  // Days until next period
  const daysUntilNextPeriod = Math.ceil((nextPeriodDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Determine cycle phase
  let cyclePhase: CycleInsights['cyclePhase'];
  if (currentCycleDay <= data.periodDuration) {
    cyclePhase = 'menstrual';
  } else if (currentCycleDay <= 13) {
    cyclePhase = 'follicular';
  } else if (currentCycleDay <= 16) {
    cyclePhase = 'ovulation';
  } else {
    cyclePhase = 'luteal';
  }
  
  // Confidence level
  let confidence: CycleInsights['confidence'] = 'high';
  if (!data.isRegular) {
    confidence = 'low';
  } else if (data.cycleLength < 24 || data.cycleLength > 35) {
    confidence = 'medium';
  }
  
  return {
    nextPeriodDate,
    nextPeriodEndDate,
    ovulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    currentCycleDay,
    daysUntilNextPeriod,
    cyclePhase,
    confidence,
  };
}

export function getPhaseInfo(phase: CycleInsights['cyclePhase']) {
  const phases = {
    menstrual: {
      name: 'Menstrual Phase',
      emoji: '🌸',
      color: 'from-primary/30 to-primary/10',
      message: "It's okay to rest and be gentle with yourself during this time. Your body is doing important work.",
    },
    follicular: {
      name: 'Follicular Phase',
      emoji: '🌱',
      color: 'from-secondary/30 to-secondary/10',
      message: "Energy often starts to rise during this phase. It's a great time for new beginnings and creativity.",
    },
    ovulation: {
      name: 'Ovulation Phase',
      emoji: '✨',
      color: 'from-accent/30 to-accent/10',
      message: "Many people feel their most energetic and social during ovulation. Embrace this vibrant energy!",
    },
    luteal: {
      name: 'Luteal Phase',
      emoji: '🍂',
      color: 'from-primary/20 to-secondary/20',
      message: "This phase invites introspection. Be kind to yourself as your body prepares for its next cycle.",
    },
  };
  return phases[phase];
}

export function getDailyInsight(phase: CycleInsights['cyclePhase'], day: number): string {
  const insights = {
    menstrual: [
      "It's common to feel lower energy during your period. Be gentle with yourself today 🤍",
      "Warm drinks and rest can help you feel more comfortable during this phase.",
      "Your body is doing amazing work right now. Take time to nurture yourself.",
    ],
    follicular: [
      "Rising estrogen often brings renewed energy. Today might be great for planning!",
      "Many find this phase ideal for starting new projects or habits.",
      "Your focus and creativity may be heightened during this time.",
    ],
    ovulation: [
      "You might feel extra social and energetic today. Embrace the vibrancy!",
      "Communication often feels easier during ovulation. Great for important conversations.",
      "This is often a peak energy time. Use it for activities you love!",
    ],
    luteal: [
      "Progesterone rises during this phase. Comfort foods and rest are perfectly okay.",
      "You might crave more quiet time. Listen to what your body needs.",
      "Self-care becomes especially important as your cycle prepares to renew.",
    ],
  };
  
  const phaseInsights = insights[phase];
  return phaseInsights[day % phaseInsights.length];
}

export function getPatternInsights(data: CycleData): string[] {
  const insights: string[] = [];
  
  if (data.cycleLength > 35) {
    insights.push("Your cycles appear longer than average. This is common and can be influenced by many factors.");
  }
  
  if (data.cycleLength < 24) {
    insights.push("Your cycles are shorter than average. Tracking can help you understand your unique pattern.");
  }
  
  if (!data.isRegular) {
    insights.push("Your cycle shows some variation. This is normal for many people, especially during stress or lifestyle changes.");
  }
  
  if (data.symptoms?.includes('severe-cramps')) {
    insights.push("Experiencing intense cramps is common. Gentle movement and warmth often help.");
  }
  
  if (data.stressLevel === 'high') {
    insights.push("High stress can sometimes affect cycle regularity. Self-care practices may help.");
  }
  
  if (insights.length === 0) {
    insights.push("Your cycle patterns appear within typical ranges. Keep tracking for deeper insights!");
  }
  
  return insights;
}

export function getPCOSEducationalIndicators(data: CycleData): { hasIndicators: boolean; messages: string[] } {
  const messages: string[] = [];
  
  if (data.cycleLength > 35) {
    messages.push("Cycles longer than 35 days are sometimes seen in hormonal variations");
  }
  
  if (data.symptoms?.includes('acne') && data.symptoms?.includes('weight-gain')) {
    messages.push("Persistent acne with weight changes can sometimes relate to hormonal patterns");
  }
  
  if (data.symptoms?.includes('missed-periods') && !data.isRegular) {
    messages.push("Irregular cycles with missed periods are worth discussing with a healthcare provider");
  }
  
  return {
    hasIndicators: messages.length > 0,
    messages,
  };
}

export function formatDateRange(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
