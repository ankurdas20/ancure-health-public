import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';

interface LazyAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isInitialized: boolean;
  initializeAuth: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const LazyAuthContext = createContext<LazyAuthContextType | undefined>(undefined);

export function LazyAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [supabaseClient, setSupabaseClient] = useState<any>(null);

  // Lazy load supabase client only when needed
  const getSupabaseClient = useCallback(async () => {
    if (supabaseClient) return supabaseClient;
    const { supabase } = await import('@/integrations/supabase/client');
    setSupabaseClient(supabase);
    return supabase;
  }, [supabaseClient]);

  // Initialize auth - only called when user wants to sign in or check session
  const initializeAuth = useCallback(async () => {
    if (isInitialized) return;
    
    setLoading(true);
    try {
      const supabase = await getSupabaseClient();
      
      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event: string, session: Session | null) => {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );

      // Check for existing session
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setIsInitialized(true);
      setLoading(false);

      // Store subscription for cleanup
      (window as any).__authSubscription = subscription;
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setLoading(false);
    }
  }, [isInitialized, getSupabaseClient]);

  // Check for existing session on mount (but don't block render)
  useEffect(() => {
    // Defer auth check to not block initial render
    const checkExistingSession = async () => {
      try {
        const supabase = await getSupabaseClient();
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (existingSession) {
          // User has an existing session, initialize fully
          await initializeAuth();
        }
      } catch (error) {
        // Silently fail - user is not logged in
      }
    };

    // Use requestIdleCallback or setTimeout to defer
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(checkExistingSession);
    } else {
      setTimeout(checkExistingSession, 100);
    }
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    setLoading(true);
    try {
      const supabase = await getSupabaseClient();
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      
      if (!isInitialized) {
        await initializeAuth();
      }
      
      setLoading(false);
      return { error };
    } catch (error) {
      setLoading(false);
      return { error: error as Error };
    }
  }, [getSupabaseClient, isInitialized, initializeAuth]);

  const signOut = useCallback(async () => {
    try {
      const supabase = await getSupabaseClient();
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  }, [getSupabaseClient]);

  return (
    <LazyAuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      isInitialized,
      initializeAuth,
      signInWithMagicLink, 
      signOut 
    }}>
      {children}
    </LazyAuthContext.Provider>
  );
}

export function useLazyAuth() {
  const context = useContext(LazyAuthContext);
  if (context === undefined) {
    throw new Error('useLazyAuth must be used within a LazyAuthProvider');
  }
  return context;
}
