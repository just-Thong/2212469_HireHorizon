import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const isConfigured =
  SUPABASE_URL.startsWith('https://') && SUPABASE_URL.includes('.supabase.co');

// Fallback URL/key that passes validation but won't make real requests
const SAFE_URL = isConfigured ? SUPABASE_URL : 'https://placeholder.supabase.co';
const SAFE_KEY = isConfigured ? SUPABASE_ANON_KEY : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.placeholder';

export function createClient() {
  return createBrowserClient(SAFE_URL, SAFE_KEY);
}

export { isConfigured as isSupabaseConfigured };

