import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Smile, Frown, Meh, Zap, Battery, BatteryLow, Check, Plus, Lock, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const SYMPTOM_OPTIONS = [
  { id: 'cramps', label: 'Cramps', emoji: '😣' },
  { id: 'headache', label: 'Headache', emoji: '🤕' },
  { id: 'bloating', label: 'Bloating', emoji: '😮‍💨' },
  { id: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { id: 'acne', label: 'Acne', emoji: '😖' },
  { id: 'cravings', label: 'Cravings', emoji: '🍫' },
  { id: 'mood_swings', label: 'Mood Swings', emoji: '🎭' },
  { id: 'breast_tenderness', label: 'Breast Tenderness', emoji: '💗' },
  { id: 'backache', label: 'Backache', emoji: '🔙' },
  { id: 'nausea', label: 'Nausea', emoji: '🤢' },
] as const;

const MOOD_OPTIONS = [
  { id: 'happy', label: 'Happy', icon: Smile, color: 'text-green-500' },
  { id: 'neutral', label: 'Neutral', icon: Meh, color: 'text-yellow-500' },
  { id: 'sad', label: 'Sad', icon: Frown, color: 'text-blue-500' },
] as const;

const ENERGY_OPTIONS = [
  { id: 'high', label: 'High', icon: Zap, color: 'text-green-500' },
  { id: 'medium', label: 'Medium', icon: Battery, color: 'text-yellow-500' },
  { id: 'low', label: 'Low', icon: BatteryLow, color: 'text-red-500' },
] as const;

interface SymptomLoggerProps {
  onLogSuccess?: () => void;
}

// Memoized symptom button to prevent re-renders
const SymptomButton = memo(function SymptomButton({ 
  symptom, 
  isSelected, 
  onClick 
}: { 
  symptom: typeof SYMPTOM_OPTIONS[number]; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs transition-all border ${
        isSelected
          ? 'bg-primary/20 border-primary text-foreground'
          : 'bg-background/50 border-border/50 text-muted-foreground hover:border-primary/50'
      }`}
    >
      {symptom.emoji} {symptom.label}
    </button>
  );
});

export const SymptomLogger = memo(function SymptomLogger({ onLogSuccess }: SymptomLoggerProps) {
  const { user, initializeAuth } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [todayLogged, setTodayLogged] = useState(false);
  const [supabase, setSupabase] = useState<any>(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  // Lazy load supabase only when user is authenticated
  useEffect(() => {
    if (user && !supabase) {
      import('@/integrations/supabase/client').then(mod => {
        setSupabase(mod.supabase);
      });
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user && supabase) {
      checkTodayLog();
    }
  }, [user, supabase]);

  const checkTodayLog = useCallback(async () => {
    if (!user || !supabase) return;
    
    const { data } = await supabase
      .from('symptom_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', today)
      .maybeSingle();

    if (data) {
      setTodayLogged(true);
      setSelectedSymptoms(data.symptoms || []);
      setSelectedMood(data.mood);
      setSelectedEnergy(data.energy_level);
      setNotes(data.notes || '');
    }
  }, [user, supabase, today]);

  const toggleSymptom = useCallback((symptomId: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptomId)
        ? prev.filter(s => s !== symptomId)
        : [...prev, symptomId]
    );
  }, []);

  const handleSave = useCallback(async () => {
    if (!user || !supabase) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to log symptoms.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase
      .from('symptom_logs')
      .upsert({
        user_id: user.id,
        log_date: today,
        symptoms: selectedSymptoms,
        mood: selectedMood,
        energy_level: selectedEnergy,
        notes: notes || null,
      }, {
        onConflict: 'user_id,log_date'
      });

    setIsLoading(false);

    if (error) {
      toast({
        title: 'Failed to save',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } else {
      setTodayLogged(true);
      setIsExpanded(false);
      toast({
        title: 'Symptoms logged! 💕',
        description: 'Your daily log has been saved.',
      });
      onLogSuccess?.();
    }
  }, [user, supabase, today, selectedSymptoms, selectedMood, selectedEnergy, notes, toast, onLogSuccess]);

  const handleSignIn = useCallback(async () => {
    await initializeAuth();
    navigate('/auth');
  }, [initializeAuth, navigate]);

  // Show upgrade prompt for unauthenticated users
  if (!user) {
    return (
      <Card variant="soft" className="overflow-hidden border border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="w-5 h-5 text-primary" />
            Daily Symptom Log
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preview of feature */}
          <div className="opacity-50 pointer-events-none">
            <div className="flex flex-wrap gap-2 mb-4">
              {SYMPTOM_OPTIONS.slice(0, 4).map(symptom => (
                <span
                  key={symptom.id}
                  className="px-3 py-1.5 rounded-full text-xs bg-background/50 border border-border/50 text-muted-foreground"
                >
                  {symptom.emoji} {symptom.label}
                </span>
              ))}
              <span className="px-3 py-1.5 rounded-full text-xs bg-background/50 border border-border/50 text-muted-foreground">
                +6 more
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="p-2 rounded-full bg-primary/10">
              <Lock className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground flex-1">
              Track daily symptoms and see patterns over time
            </p>
          </div>
          <Button
            variant="soft"
            className="w-full gap-2"
            onClick={handleSignIn}
          >
            <LogIn className="w-4 h-4" />
            Sign in to unlock
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="soft" className="overflow-hidden border border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Daily Symptom Log
          </div>
          {todayLogged && !isExpanded && (
            <span className="text-xs font-normal text-primary flex items-center gap-1">
              <Check className="w-3 h-3" /> Logged today
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isExpanded ? (
          <Button
            variant="soft"
            className="w-full gap-2"
            onClick={() => setIsExpanded(true)}
          >
            <Plus className="w-4 h-4" />
            {todayLogged ? 'Update Today\'s Log' : 'Log Today\'s Symptoms'}
          </Button>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {/* Symptoms */}
              <div>
                <p className="text-sm font-medium mb-2">How are you feeling?</p>
                <div className="flex flex-wrap gap-2">
                  {SYMPTOM_OPTIONS.map(symptom => (
                    <SymptomButton
                      key={symptom.id}
                      symptom={symptom}
                      isSelected={selectedSymptoms.includes(symptom.id)}
                      onClick={() => toggleSymptom(symptom.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div>
                <p className="text-sm font-medium mb-2">Mood</p>
                <div className="flex gap-2">
                  {MOOD_OPTIONS.map(mood => {
                    const Icon = mood.icon;
                    return (
                      <button
                        key={mood.id}
                        onClick={() => setSelectedMood(mood.id)}
                        className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl transition-all border ${
                          selectedMood === mood.id
                            ? 'bg-primary/20 border-primary'
                            : 'bg-background/50 border-border/50 hover:border-primary/50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${mood.color}`} />
                        <span className="text-xs">{mood.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Energy */}
              <div>
                <p className="text-sm font-medium mb-2">Energy Level</p>
                <div className="flex gap-2">
                  {ENERGY_OPTIONS.map(energy => {
                    const Icon = energy.icon;
                    return (
                      <button
                        key={energy.id}
                        onClick={() => setSelectedEnergy(energy.id)}
                        className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl transition-all border ${
                          selectedEnergy === energy.id
                            ? 'bg-primary/20 border-primary'
                            : 'bg-background/50 border-border/50 hover:border-primary/50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${energy.color}`} />
                        <span className="text-xs">{energy.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-sm font-medium mb-2">Notes (optional)</p>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any other notes about how you're feeling..."
                  className="resize-none"
                  rows={2}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setIsExpanded(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="soft"
                  className="flex-1"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
});
