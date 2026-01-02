import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Calendar,
  Clock,
  Activity,
  AlertCircle,
  Sparkles,
  Heart,
  Droplets,
  Frown,
  Scale,
  CircleSlash,
  Target,
} from 'lucide-react';
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
  const [stressLevel, setStressLevel] = useState<'low' | 'moderate' | 'high' | undefined>(
    initialData?.stressLevel
  );
  const [activityLevel, setActivityLevel] = useState<'low' | 'moderate' | 'high' | undefined>(
    initialData?.activityLevel
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOptional, setShowOptional] = useState(false);

  /* ===================== LOAD SAVED DATA (AUTO-FILL) ===================== */
  useEffect(() => {
    async function loadSavedData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from('cycle_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setAge(data.age?.toString() || '');
        setCycleLength(data.cycle_length?.toString() || '28');
        setLastPeriodDate(data.last_period || '');
        setSelectedSymptoms(data.symptoms || []);
      }
    }

    loadSavedData();
  }, []);

  /* ===================== VALIDATION ===================== */
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!age || parseInt(age) < 12 || parseInt(age) > 60) {
      newErrors.age = 'Please enter a valid age between 12 and 60';
    }

    const cycleLengthNum = parseInt(cycleLength);
    if (!cycleLength || cycleLengthNum < 20 || cycleLengthNum > 45) {
      newErrors.cycleLength = 'Cycle length should be between 20 and 45 days';
    }

    if (!lastPeriodDate) {
      newErrors.lastPeriodDate = 'Please select your last period start date';
    }

    const periodDurationNum = parseInt(periodDuration);
    if (!periodDuration || periodDurationNum < 2 || periodDurationNum > 10) {
      newErrors.periodDuration = 'Period duration should be between 2 and 10 days';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ===================== SUBMIT + SAVE ===================== */
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from('cycle_history').upsert({
        user_id: user.id,
        cycle_length: data.cycleLength,
        last_period: data.lastPeriodDate,
        symptoms: data.symptoms,
        created_at: new Date().toISOString(),
      });

      await supabase.from('profiles').upsert({
        id: user.id,
        age: data.age,
      });
    }

    onSubmit(data);
  };

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptomId)
        ? prev.filter(s => s !== symptomId)
        : [...prev, symptomId]
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  /* ===================== UI ===================== */
  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-lg mx-auto"
    >
      {/* UI REMAINS UNCHANGED */}
      <motion.div variants={itemVariants}>
        <Card variant="gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Tell us about your cycle
            </CardTitle>
            <CardDescription>
              This helps us provide personalized insights just for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* --- UI CONTENT UNCHANGED --- */}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Button type="submit" variant="hero" size="lg" className="w-full">
          <Sparkles className="w-5 h-5" />
          See My Insights
        </Button>
      </motion.div>
    </motion.form>
  );
}
