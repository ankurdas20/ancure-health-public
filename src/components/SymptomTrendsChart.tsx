import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { TrendingUp, Lock, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format, subDays, parseISO } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

interface SymptomLog {
  log_date: string;
  symptoms: string[];
  mood: string | null;
  energy_level: string | null;
}

const SYMPTOM_LABELS: Record<string, string> = {
  cramps: 'Cramps',
  headache: 'Headache',
  bloating: 'Bloating',
  fatigue: 'Fatigue',
  acne: 'Acne',
  cravings: 'Cravings',
  mood_swings: 'Mood Swings',
  breast_tenderness: 'Breast Tenderness',
  backache: 'Backache',
  nausea: 'Nausea',
};

export const SymptomTrendsChart = memo(function SymptomTrendsChart() {
  const { user, initializeAuth } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [supabase, setSupabase] = useState<any>(null);

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
      loadLogs();
    }
  }, [user, supabase]);

  const loadLogs = useCallback(async () => {
    if (!user || !supabase) return;
    
    setIsLoading(true);
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split('T')[0];
    
    const { data } = await supabase
      .from('symptom_logs')
      .select('log_date, symptoms, mood, energy_level')
      .eq('user_id', user.id)
      .gte('log_date', thirtyDaysAgo)
      .order('log_date', { ascending: true });

    if (data) {
      setLogs(data);
    }
    setIsLoading(false);
  }, [user, supabase]);

  // Memoize expensive calculations
  const symptomFrequency = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach(log => {
      log.symptoms.forEach(symptom => {
        counts[symptom] = (counts[symptom] || 0) + 1;
      });
    });
    
    return Object.entries(counts)
      .map(([symptom, count]) => ({
        symptom: SYMPTOM_LABELS[symptom] || symptom,
        count,
        fill: 'hsl(var(--primary))',
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [logs]);

  const trendData = useMemo(() => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), 13 - i);
      return format(date, 'yyyy-MM-dd');
    });

    return last14Days.map(date => {
      const log = logs.find(l => l.log_date === date);
      const moodValue = log?.mood === 'happy' ? 3 : log?.mood === 'neutral' ? 2 : log?.mood === 'sad' ? 1 : null;
      const energyValue = log?.energy_level === 'high' ? 3 : log?.energy_level === 'medium' ? 2 : log?.energy_level === 'low' ? 1 : null;
      
      return {
        date: format(parseISO(date), 'MMM d'),
        mood: moodValue,
        energy: energyValue,
        symptoms: log?.symptoms.length || 0,
      };
    });
  }, [logs]);

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
            <TrendingUp className="w-5 h-5 text-primary" />
            Symptom Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preview chart placeholder */}
          <div className="opacity-40 pointer-events-none">
            <div className="h-24 flex items-end justify-between gap-1 px-4">
              {[40, 60, 45, 70, 55, 80, 65].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary/30 rounded-t"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="p-2 rounded-full bg-primary/10">
              <Lock className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground flex-1">
              View your symptom trends over time
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

  if (isLoading) {
    return (
      <Card variant="soft" className="overflow-hidden border border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            Symptom Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card variant="soft" className="overflow-hidden border border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            Symptom Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            Start logging symptoms daily to see trends here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="soft" className="overflow-hidden border border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
          Symptom Trends
          <span className="text-xs font-normal text-muted-foreground ml-auto">
            Last 30 days
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood & Energy Trend */}
        <div>
          <p className="text-sm font-medium mb-3">Mood & Energy (14 days)</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 4]} 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  ticks={[1, 2, 3]}
                  tickFormatter={(v) => v === 1 ? 'Low' : v === 2 ? 'Med' : 'High'}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number, name: string) => {
                    if (value === null) return ['No data', name];
                    const labels = ['', 'Low', 'Medium', 'High'];
                    return [labels[value] || value, name === 'mood' ? 'Mood' : 'Energy'];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="mood"
                  stroke="hsl(var(--primary))"
                  fill="url(#moodGradient)"
                  strokeWidth={2}
                  connectNulls
                />
                <Area
                  type="monotone"
                  dataKey="energy"
                  stroke="hsl(var(--secondary))"
                  fill="url(#energyGradient)"
                  strokeWidth={2}
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Mood</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-xs text-muted-foreground">Energy</span>
            </div>
          </div>
        </div>

        {/* Symptom Frequency */}
        {symptomFrequency.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-3">Most Common Symptoms</p>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={symptomFrequency} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    type="category" 
                    dataKey="symptom" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`${value} day${value > 1 ? 's' : ''}`, 'Logged']}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {symptomFrequency.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`hsl(var(--primary) / ${1 - index * 0.12})`} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
