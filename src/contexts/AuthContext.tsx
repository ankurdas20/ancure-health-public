import { createContext, useContext, useState, useCallback, useRef, ReactNode, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  initializeAuth: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  cleanup: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // Use ref to store supabase client to avoid re-renders
  const supabaseRef = useRef<typeof import('@/integrations/supabase/client').supabase | null>(null);
  const initializingRef = useRef(false);

  // Lazy-load Supabase only when needed
  const getSupabase = useCallback(async () => {
    if (supabaseRef.current) return supabaseRef.current;
    
    const { supabase } = await import('@/integrations/supabase/client');
    supabaseRef.current = supabase;
    return supabase;
  }, []);

  // Fetch user profile from database
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data as UserProfile;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      return null;
    }
  }, [getSupabase]);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  }, [user?.id, fetchProfile]);

  // Store subscription ref for cleanup
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  // Initialize auth - only called when user wants to sign in or access auth features
  const initializeAuth = useCallback(async () => {
    if (initialized || initializingRef.current) return;
    
    initializingRef.current = true;
    setLoading(true);
    
    try {
      const supabase = await getSupabase();
      
      // Set up auth state listener FIRST (before checking session)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        // Only synchronous state updates in callback
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Defer Supabase calls to prevent deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id).then(setProfile);
          }, 0);
        } else {
          setProfile(null);
        }
      });
      
      // Store subscription for cleanup
      subscriptionRef.current = subscription;

      // THEN check for existing session
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      // Fetch profile if user exists
      if (existingSession?.user) {
        const profileData = await fetchProfile(existingSession.user.id);
        setProfile(profileData);
      }
      
      setInitialized(true);
      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setLoading(false);
      setInitialized(true);
    } finally {
      initializingRef.current = false;
    }
  }, [initialized, getSupabase, fetchProfile]);

  // Cleanup subscription on unmount
  const cleanup = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    const supabase = await getSupabase();
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    
    return { error };
  }, [getSupabase]);

  const signInWithGoogle = useCallback(async () => {
    const supabase = await getSupabase();
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
    
    return { error };
  }, [getSupabase]);

  const signOut = useCallback(async () => {
    const supabase = await getSupabase();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  }, [getSupabase]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user, 
    session, 
    profile,
    loading, 
    initialized,
    isAuthenticated: !!user,
    initializeAuth,
    signInWithMagicLink,
    signInWithGoogle,
    signOut,
    refreshProfile,
    cleanup,
  }), [user, session, profile, loading, initialized, initializeAuth, signInWithMagicLink, signInWithGoogle, signOut, refreshProfile, cleanup]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
