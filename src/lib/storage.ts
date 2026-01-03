import { CycleData } from './cycleCalculations';

const STORAGE_KEY = 'ancure_cycle_data';

// Local storage functions (for guests) - NO backend calls
export function saveLocalCycleData(data: CycleData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save cycle data locally:', error);
  }
}

export function loadLocalCycleData(): CycleData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as CycleData;
    }
    return null;
  } catch (error) {
    console.error('Failed to load local cycle data:', error);
    return null;
  }
}

export function clearLocalCycleData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear local cycle data:', error);
  }
}

export function hasLocalData(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

// Lazy-loaded Supabase functions - only import when user is authenticated
let supabaseModule: typeof import('@/integrations/supabase/client') | null = null;

async function getSupabase() {
  if (!supabaseModule) {
    supabaseModule = await import('@/integrations/supabase/client');
  }
  return supabaseModule.supabase;
}

export async function saveCloudCycleData(userId: string, data: CycleData): Promise<{ error: Error | null }> {
  try {
    const supabase = await getSupabase();
    const { error } = await supabase
      .from('cycle_data')
      .upsert({
        user_id: userId,
        age: data.age,
        cycle_length: data.cycleLength,
        last_period_date: data.lastPeriodDate,
        period_duration: data.periodDuration,
        is_regular: data.isRegular,
        goal: data.goal || 'track_period',
        symptoms: data.symptoms || [],
        stress_level: data.stressLevel || null,
        activity_level: data.activityLevel || null,
      }, {
        onConflict: 'user_id'
      });
    
    if (error) {
      // Log in development only
      if (import.meta.env.DEV) {
        console.error('[saveCloudCycleData] Error:', error);
      }
      throw error;
    }
    return { error: null };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[saveCloudCycleData] Failed:', error);
    }
    return { error: error as Error };
  }
}

export async function loadCloudCycleData(userId: string): Promise<CycleData | null> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('cycle_data')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      if (import.meta.env.DEV) {
        console.error('[loadCloudCycleData] Error:', error);
      }
      throw error;
    }
    if (!data) return null;
    
    return {
      age: data.age,
      cycleLength: data.cycle_length,
      lastPeriodDate: data.last_period_date,
      periodDuration: data.period_duration,
      isRegular: data.is_regular,
      goal: (data.goal as CycleData['goal']) || 'track_period',
      symptoms: data.symptoms || [],
      stressLevel: data.stress_level as CycleData['stressLevel'],
      activityLevel: data.activity_level as CycleData['activityLevel'],
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[loadCloudCycleData] Failed:', error);
    }
    return null;
  }
}

export async function deleteCloudCycleData(userId: string): Promise<{ error: Error | null }> {
  try {
    const supabase = await getSupabase();
    const { error } = await supabase
      .from('cycle_data')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      if (import.meta.env.DEV) {
        console.error('[deleteCloudCycleData] Error:', error);
      }
      throw error;
    }
    return { error: null };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[deleteCloudCycleData] Failed:', error);
    }
    return { error: error as Error };
  }
}

// Migration function - move local data to cloud when user signs in
export async function migrateLocalToCloud(userId: string): Promise<boolean> {
  const localData = loadLocalCycleData();
  if (!localData) return false;
  
  const { error } = await saveCloudCycleData(userId, localData);
  if (!error) {
    clearLocalCycleData();
    return true;
  }
  return false;
}
