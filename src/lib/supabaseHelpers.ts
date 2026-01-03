/**
 * Supabase Helper Utilities
 * Production-ready error handling, connection checking, and data operations
 */

// Error message mapping for user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  'Invalid login credentials': 'Incorrect email or password. Please try again.',
  'Email not confirmed': 'Please verify your email address before signing in.',
  'User already registered': 'An account with this email already exists.',
  'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
  'Invalid email': 'Please enter a valid email address.',
  'Signup requires a valid password': 'Please enter a valid password.',
  
  // Session errors
  'JWT expired': 'Your session has expired. Please sign in again.',
  'Invalid JWT': 'Your session is invalid. Please sign in again.',
  'refresh_token_not_found': 'Your session has expired. Please sign in again.',
  
  // RLS errors
  'new row violates row-level security policy': 'You do not have permission to perform this action.',
  'row-level security': 'Access denied. Please ensure you are signed in.',
  
  // Network errors
  'Failed to fetch': 'Unable to connect to the server. Please check your internet connection.',
  'NetworkError': 'Network error. Please check your internet connection.',
  'ECONNREFUSED': 'Unable to reach the server. Please try again later.',
  
  // Database errors
  'duplicate key value': 'This record already exists.',
  'violates unique constraint': 'This record already exists.',
  'violates foreign key constraint': 'This operation references data that does not exist.',
  
  // Generic
  'An unexpected error occurred': 'Something went wrong. Please try again.',
};

/**
 * Convert raw Supabase/PostgreSQL errors to user-friendly messages
 */
export function getUserFriendlyError(error: unknown): string {
  if (!error) return 'An unknown error occurred.';
  
  const errorMessage = error instanceof Error 
    ? error.message 
    : typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message: unknown }).message)
      : String(error);
  
  // Check for known error patterns
  for (const [pattern, friendlyMessage] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.toLowerCase().includes(pattern.toLowerCase())) {
      return friendlyMessage;
    }
  }
  
  // If no match found, return a generic message in production, or the actual error in development
  if (import.meta.env.DEV) {
    console.error('[Supabase Error]', error);
    return errorMessage;
  }
  
  return 'Something went wrong. Please try again later.';
}

/**
 * Log errors in development mode only
 */
export function logError(context: string, error: unknown): void {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error);
  }
}

/**
 * Check if error is an auth session error (requires re-login)
 */
export function isSessionError(error: unknown): boolean {
  if (!error) return false;
  
  const errorMessage = error instanceof Error 
    ? error.message 
    : typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message: unknown }).message)
      : String(error);
  
  const sessionErrors = [
    'jwt expired',
    'invalid jwt',
    'refresh_token_not_found',
    'not authenticated',
    'session_not_found',
  ];
  
  return sessionErrors.some(e => errorMessage.toLowerCase().includes(e));
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (!error) return false;
  
  const errorMessage = error instanceof Error 
    ? error.message 
    : String(error);
  
  const networkErrors = [
    'failed to fetch',
    'networkerror',
    'econnrefused',
    'network request failed',
    'net::err_',
  ];
  
  return networkErrors.some(e => errorMessage.toLowerCase().includes(e));
}

/**
 * Wrapper for Supabase queries with error handling
 */
export async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: Error | null }>,
  context: string
): Promise<{ data: T | null; error: string | null; isSessionError: boolean }> {
  try {
    const { data, error } = await queryFn();
    
    if (error) {
      logError(context, error);
      return {
        data: null,
        error: getUserFriendlyError(error),
        isSessionError: isSessionError(error),
      };
    }
    
    return { data, error: null, isSessionError: false };
  } catch (err) {
    logError(context, err);
    return {
      data: null,
      error: getUserFriendlyError(err),
      isSessionError: isSessionError(err),
    };
  }
}

/**
 * Wrapper for Supabase mutations (insert, update, delete) with error handling
 */
export async function safeMutation<T>(
  mutationFn: () => Promise<{ data: T | null; error: Error | null }>,
  context: string
): Promise<{ success: boolean; data: T | null; error: string | null; isSessionError: boolean }> {
  try {
    const { data, error } = await mutationFn();
    
    if (error) {
      logError(context, error);
      return {
        success: false,
        data: null,
        error: getUserFriendlyError(error),
        isSessionError: isSessionError(error),
      };
    }
    
    return { success: true, data, error: null, isSessionError: false };
  } catch (err) {
    logError(context, err);
    return {
      success: false,
      data: null,
      error: getUserFriendlyError(err),
      isSessionError: isSessionError(err),
    };
  }
}

/**
 * Connection status checker
 */
let connectionCheckPromise: Promise<boolean> | null = null;

export async function checkSupabaseConnection(): Promise<boolean> {
  // Debounce connection checks
  if (connectionCheckPromise) {
    return connectionCheckPromise;
  }
  
  connectionCheckPromise = (async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Try a lightweight query to test connection
      const { error } = await supabase.from('profiles').select('id').limit(1);
      
      // RLS errors are expected for unauthenticated users, but mean the connection works
      if (error && !error.message.includes('row-level security')) {
        return false;
      }
      
      return true;
    } catch (err) {
      logError('Connection check', err);
      return false;
    } finally {
      // Clear the promise after a delay to allow retries
      setTimeout(() => {
        connectionCheckPromise = null;
      }, 5000);
    }
  })();
  
  return connectionCheckPromise;
}
