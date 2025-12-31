import { motion } from 'framer-motion';

interface CycleRingProps {
  currentDay: number;
  totalDays: number;
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  periodDuration: number;
}

export function CycleRing({ currentDay, totalDays, phase, periodDuration }: CycleRingProps) {
  const progress = (currentDay / totalDays) * 100;
  const circumference = 2 * Math.PI * 85;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  // Calculate phase segments
  const menstrualEnd = (periodDuration / totalDays) * 100;
  const follicularEnd = (13 / totalDays) * 100;
  const ovulationEnd = (16 / totalDays) * 100;
  
  const phaseColors = {
    menstrual: 'hsl(340, 75%, 65%)',
    follicular: 'hsl(270, 45%, 75%)',
    ovulation: 'hsl(20, 85%, 70%)',
    luteal: 'hsl(340, 50%, 80%)',
  };

  return (
    <div className="relative w-56 h-56 mx-auto">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke="hsl(340, 30%, 92%)"
          strokeWidth="16"
        />
        
        {/* Phase segments - background */}
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke="hsl(340, 75%, 85%)"
          strokeWidth="16"
          strokeDasharray={`${menstrualEnd * circumference / 100} ${circumference}`}
          strokeLinecap="round"
        />
        
        {/* Progress arc */}
        <motion.circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke={phaseColors[phase]}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="drop-shadow-lg"
        />
        
        {/* Glow effect */}
        <motion.circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke={phaseColors[phase]}
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          opacity="0.3"
          filter="blur(8px)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      
      {/* Center content */}
      <motion.div 
        className="absolute inset-0 flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <span className="text-5xl font-bold text-foreground">
          {currentDay}
        </span>
        <span className="text-muted-foreground text-sm mt-1">
          of {totalDays} days
        </span>
        <motion.div 
          className="mt-2 px-3 py-1 rounded-full text-xs font-medium"
          style={{ 
            backgroundColor: `${phaseColors[phase]}20`,
            color: phaseColors[phase]
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {phase.charAt(0).toUpperCase() + phase.slice(1)} Phase
        </motion.div>
      </motion.div>
    </div>
  );
}
