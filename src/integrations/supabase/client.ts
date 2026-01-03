import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Validate environment variables
if (!SUPABASE_URL) {
  throw new Error(
    'Missing VITE_SUPABASE_URL environment variable.\n' +
    'Please set it in your .env file or environment configuration:\n' +
    '  VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
    'For Cloudflare Pages, add this in Settings → Environment Variables.'
  );
}

if (!SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY) environment variable.\n' +
    'Please set it in your .env file or environment configuration:\n' +
    '  VITE_SUPABASE_ANON_KEY=your-anon-key\n' +
    'For Cloudflare Pages, add this in Settings → Environment Variables.'
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});