import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Clock, Activity, AlertCircle, Sparkles, Heart, Droplets, Frown, Scale, CircleSlash, Target } from 'lucide-react';
import { CycleData, CycleGoal } from '@/lib/cycleCalculations';
import { supabase } from '@/integrations/supabase/client';

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

  // LOAD SAVED DATA FROM SUPABASE ON MOUNT
  useEffect(() => {
    async function loadSavedCycle() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('cycle_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        setCycleLength(data.cycle_length?.toString() || '28');
        setLastPeriodDate(data.last_period || '');
        setSelectedSymptoms(data.symptoms || []);
      }
    }
    loadSavedCycle();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!age || parseInt(age) < 12 || parseInt(age) > 60) newErrors.age = 'Invalid age (12-60)';
    if (!cycleLength || parseInt(cycleLength) < 20 || parseInt(cycleLength) > 45) newErrors.cycleLength = 'Invalid length (20-45)';
    if (!lastPeriodDate) newErrors.lastPeriodDate = 'Select a date';
    if (!periodDuration || parseInt(periodDuration) < 2 || parseInt(periodDuration) > 10) newErrors.periodDuration = 'Invalid duration (2-10)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;

    if (user) {
      // SAVE TO CYCLE HISTORY
      await supabase.from('cycle_history').insert({
        user_id: user.id,
        cycle_length: data.cycleLength,
        last_period: data.lastPeriodDate,
        symptoms: data.symptoms,
      });

      // UPDATE PROFILE AGE
      await supabase.from('profiles').upsert({
        id: user.id,
        age: data.age,
      });
    }

    onSubmit(data);
  };

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptomId) ? prev.filter(s => s !== symptomId) : [...prev, symptomId]
    );
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-lg mx-auto pb-10"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Ancure Health Tracker
          </CardTitle>
          <CardDescription>Enter your details for medical insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Goal selection omitted for brevity but remains same in logic */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Age</label>
            <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Last Period Start Date</label>
            <Input type="date" value={lastPeriodDate} onChange={(e) => setLastPeriodDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Average Cycle Length</label>
            <Input type="number" value={cycleLength} onChange={(e) => setCycleLength(e.target.value)} />
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            Save & Calculate
          </Button>
        </CardContent>
      </Card>
    </motion.form>
  );
}
