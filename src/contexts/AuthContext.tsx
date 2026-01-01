import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  initializeAuth: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
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

  // Initialize auth - only called when user wants to sign in or access auth features
  const initializeAuth = useCallback(async () => {
    if (initialized || initializingRef.current) return;
    
    initializingRef.current = true;
    setLoading(true);
    
    try {
      const supabase = await getSupabase();
      
      // Set up auth state listener
      supabase.auth.onAuthStateChange((event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      // Check for existing session
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setInitialized(true);
      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setLoading(false);
      setInitialized(true);
    } finally {
      initializingRef.current = false;
    }
  }, [initialized, getSupabase]);

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

  const signOut = useCallback(async () => {
    const supabase = await getSupabase();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, [getSupabase]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      initialized,
      initializeAuth,
      signInWithMagicLink, 
      signOut 
    }}>
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
