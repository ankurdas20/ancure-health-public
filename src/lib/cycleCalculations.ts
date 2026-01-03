/**
 * Cycle calculation utilities for menstrual health tracking
 * Provides period predictions, fertile window calculations, and phase detection
 * @module cycleCalculations
 */

/** User's tracking goal */
export type CycleGoal = 'track_period' | 'try_to_conceive' | 'avoid_pregnancy' | 'pcos_management';

/** User's cycle data input */
export interface CycleData {
  /** User's age in years */
  age: number;
  /** Average cycle length in days (typically 21-35) */
  cycleLength: number;
  /** Last period start date (YYYY-MM-DD format) */
  lastPeriodDate: string;
  /** Average period duration in days */
  periodDuration: number;
  /** Whether cycles are regular (vary by ≤7 days) */
  isRegular: boolean;
  /** User's primary tracking goal */
  goal?: CycleGoal;
  /** Current symptoms being tracked */
  symptoms?: string[];
  /** Self-reported stress level */
  stressLevel?: 'low' | 'moderate' | 'high';
  /** Self-reported physical activity level */
  activityLevel?: 'low' | 'moderate' | 'high';
}

/** Calculated cycle insights based on user data */
export interface CycleInsights {
  /** Predicted next period start date */
  nextPeriodDate: Date;
  /** Predicted next period end date */
  nextPeriodEndDate: Date;
  /** Estimated ovulation date */
  ovulationDate: Date;
  /** Start of estimated fertile window */
  fertileWindowStart: Date;
  /** End of estimated fertile window */
  fertileWindowEnd: Date;
  /** Current day in the cycle (1-based) */
  currentCycleDay: number;
  /** Days until predicted next period */
  daysUntilNextPeriod: number;
  /** Current phase of the cycle */
  cyclePhase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  /** Prediction confidence based on cycle regularity */
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Calculates cycle insights from user data
 * @param data - User's cycle configuration
 * @returns Calculated predictions and current cycle status
 */
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

/**
 * Gets display information for a cycle phase
 * @param phase - The cycle phase
 * @returns Phase name, emoji, gradient colors, and supportive message
 */
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

/**
 * Gets a daily wellness insight based on cycle phase
 * @param phase - Current cycle phase
 * @param day - Current day for message rotation
 * @returns A supportive insight message
 */
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

/**
 * Generates personalized pattern insights based on user data
 * @param data - User's cycle data
 * @returns Array of relevant insight messages
 */
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

/**
 * Checks for potential PCOS educational indicators (not diagnostic)
 * @param data - User's cycle data
 * @returns Object with indicator status and educational messages
 */
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

/**
 * Formats a date range for display
 * @param start - Start date
 * @param end - End date
 * @returns Formatted string like "Jan 1 - Jan 5"
 */
export function formatDateRange(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
}

/**
 * Formats a single date for display
 * @param date - The date to format
 * @returns Formatted string like "January 1, 2024"
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
