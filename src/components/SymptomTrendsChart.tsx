import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, parseISO, startOfDay } from 'date-fns';
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

const MOOD_COLORS: Record<string, string> = {
  happy: 'hsl(142, 76%, 36%)',
  neutral: 'hsl(48, 96%, 53%)',
  sad: 'hsl(217, 91%, 60%)',
};

const ENERGY_COLORS: Record<string, string> = {
  high: 'hsl(142, 76%, 36%)',
  medium: 'hsl(48, 96%, 53%)',
  low: 'hsl(0, 84%, 60%)',
};

export function SymptomTrendsChart() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadLogs();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadLogs = async () => {
    if (!user) return;
    
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
  };

  // Calculate symptom frequency
  const symptomFrequency = () => {
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
  };

  // Prepare daily mood/energy trend data
  const trendData = () => {
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
  };

  if (!user) {
    return (
      <Card variant="soft" className="overflow-hidden border border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            Symptom Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sign in to view your symptom trends over time.
          </p>
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
          <motion.div
            className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
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

  const freqData = symptomFrequency();
  const trends = trendData();

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
              <AreaChart data={trends} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
        {freqData.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-3">Most Common Symptoms</p>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={freqData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
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
                    {freqData.map((entry, index) => (
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
}
