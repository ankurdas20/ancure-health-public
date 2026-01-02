import { useState, useEffect } from 'react'; // 1. Added useEffect
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Clock, Activity, AlertCircle, Sparkles, Heart, Droplets, Frown, Scale, CircleSlash, Target } from 'lucide-react';
import { CycleData, CycleGoal } from '@/lib/cycleCalculations';
import { supabase } from '@/integrations/supabase/client'; // 2. Added Supabase import
import { loadCloudCycleData } from '@/lib/storage'; // 3. Added Cloud Load import

interface CycleInputFormProps {
  onSubmit: (data: CycleData) => void;
  initialData?: CycleData | null;
}

const symptoms = [
  { id: 'acne', label: 'Acne', icon: Sparkles },
  { id: 'hair-fall', label: 'Hair fall', icon: Droplets },
  { id: 'weight-gain', label: 'Weight gain', icon: Scale },
  { id: 'missed-periods', label: 'Missed periods', icon: CircleSlash },
  { id: 'severe-cramps', label: 'Severe cramps', icon: Frown },
];

const goals: { id: CycleGoal; label: string; description: string }[] = [
  { id: 'track_period', label: 'Track Period', description: 'Monitor my cycle' },
  { id: 'try_to_conceive', label: 'Try to Conceive', description: 'Plan pregnancy' },
  { id: 'avoid_pregnancy', label: 'Avoid Pregnancy', description: 'Natural family planning' },
  { id: 'pcos_management', label: 'PCOS Management', description: 'Track symptoms' },
];

export function CycleInputForm({ onSubmit, initialData }: CycleInputFormProps) {
  const [age, setAge] = useState(initialData?.age?.toString() || '');
  const [cycleLength, setCycleLength] = useState(initialData?.cycleLength?.toString() || '28');
  const [lastPeriodDate, setLastPeriodDate] = useState(initialData?.lastPeriodDate || '');
  const [periodDuration, setPeriodDuration] = useState(initialData?.periodDuration?.toString() || '5');
  const [isRegular, setIsRegular] = useState(initialData?.isRegular ?? true);
  const [goal, setGoal] = useState<CycleGoal>(initialData?.goal || 'track_period');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(initialData?.symptoms || []);
  const [stressLevel, setStressLevel] = useState<'low' | 'moderate' | 'high' | undefined>(initialData?.stressLevel);
  const [activityLevel, setActivityLevel] = useState<'low' | 'moderate' | 'high' | undefined>(initialData?.activityLevel);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOptional, setShowOptional] = useState(false);

  // --- NEW CLOUD SYNC LOGIC START ---
  useEffect(() => {
    async function fetchSavedData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const cloudData = await loadCloudCycleData(user.id);
        if (cloudData) {
          setAge(cloudData.age.toString());
          setCycleLength(cloudData.cycleLength.toString());
          setLastPeriodDate(cloudData.lastPeriodDate);
          setPeriodDuration(cloudData.periodDuration.toString());
          setIsRegular(cloudData.isRegular);
          setGoal(cloudData.goal);
          setSelectedSymptoms(cloudData.symptoms);
          if (cloudData.stressLevel) setStressLevel(cloudData.stressLevel);
          if (cloudData.activityLevel) setActivityLevel(cloudData.activityLevel);
        }
      }
    }
    fetchSavedData();
  }, []);
  // --- NEW CLOUD SYNC LOGIC END ---

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!age || parseInt(age) < 12 || parseInt(age) > 60) newErrors.age = 'Please enter a valid age between 12 and 60';
    const cycleLengthNum = parseInt(cycleLength);
    if (!cycleLength || cycleLengthNum < 20 || cycleLengthNum > 45) newErrors.cycleLength = 'Cycle length should be between 20 and 45 days';
    if (!lastPeriodDate) newErrors.lastPeriodDate = 'Please select your last period start date';
    const periodDurationNum = parseInt(periodDuration);
    if (!periodDuration || periodDurationNum < 2 || periodDurationNum > 10) newErrors.periodDuration = 'Period duration should be between 2 and 10 days';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const data: CycleData = {
      age: parseInt(age),
      cycleLength: parseInt(cycleLength),
      lastPeriodDate,
      periodDuration: parseInt(periodDuration),
      isRegular,
      goal,
      symptoms: selectedSymptoms,
      stressLevel,
      activityLevel,
    };
    onSubmit(data);
  };

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev => prev.includes(symptomId) ? prev.filter(s => s !== symptomId) : [...prev, symptomId]);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-lg mx-auto"
    >
      <motion.div variants={itemVariants}>
        <Card variant="gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Tell us about your cycle
            </CardTitle>
            <CardDescription>This helps us provide personalized insights just for you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> What's your goal?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {goals.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id)}
                    className={`flex flex-col items-start p-3 rounded-xl border-2 transition-all text-left hover:scale-[1.02] active:scale-[0.98] ${
                      goal === g.id ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/30'
                    }`}
                  >
                    <span className={`text-sm font-medium ${goal === g.id ? 'text-primary' : 'text-foreground'}`}>{g.label}</span>
                    <span className="text-xs text-muted-foreground">{g.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">Your age</label>
              <Input type="number" placeholder="e.g., 25" value={age} onChange={(e) => setAge(e.target.value)} min={12} max={60} />
              {errors.age && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-primary flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.age}</motion.p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Last period start date?</label>
              <Input type="date" value={lastPeriodDate} onChange={(e) => setLastPeriodDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
              {errors.lastPeriodDate && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-primary flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.lastPeriodDate}</motion.p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Average cycle length (days)</label>
              <Input type="number" placeholder="e.g., 28" value={cycleLength} onChange={(e) => setCycleLength(e.target.value)} min={20} max={45} />
              {errors.cycleLength && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-primary flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.cycleLength}</motion.p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2"><Droplets className="w-4 h-4 text-primary" /> Period duration (days)</label>
              <Input type="number" placeholder="e.g., 5" value={periodDuration} onChange={(e) => setPeriodDuration(e.target.value)} min={2} max={10} />
              {errors.periodDuration && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-primary flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.periodDuration}</motion.p>}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Is your cycle usually regular?</label>
              <div className="flex gap-3">
                <Button type="button" variant={isRegular ? "default" : "outline"} onClick={() => setIsRegular(true)} className="flex-1">Regular</Button>
                <Button type="button" variant={!isRegular ? "default" : "outline"} onClick={() => setIsRegular(false)} className="flex-1">Irregular</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="text-center">
        <Button type="button" variant="ghost" onClick={() => setShowOptional(!showOptional)} className="text-muted-foreground">
          {showOptional ? 'Hide' : 'Show'} optional details <Activity className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>

      <AnimatePresence>
        {showOptional && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card variant="lavender">
              <CardHeader>
                <CardTitle className="text-lg">Additional details (optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Do you experience any of these?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {symptoms.map((symptom) => {
                      const Icon = symptom.icon;
                      return (
                        <button
                          key={symptom.id}
                          type="button"
                          onClick={() => toggleSymptom(symptom.id)}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${selectedSymptoms.includes(symptom.id) ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card'}`}
                        >
                          <Icon className="w-4 h-4" /> <span className="text-sm font-medium">{symptom.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Stress & Activity</label>
                  <div className="flex gap-2">
                    {['low', 'moderate', 'high'].map((level) => (
                      <Button key={level} type="button" variant={stressLevel === level ? "default" : "outline"} onClick={() => setStressLevel(level as any)} className="flex-1 capitalize" size="sm">{level}</Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants}>
        <Button type="submit" variant="hero" size="lg" className="w-full">
          <Sparkles className="w-5 h-5 mr-2" /> See My Insights
        </Button>
      </motion.div>
    </motion.form>
  );
}
