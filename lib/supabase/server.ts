import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const isConfigured =
  SUPABASE_URL.startsWith('https://') && SUPABASE_URL.includes('.supabase.co');

const SAFE_URL = isConfigured ? SUPABASE_URL : 'https://placeholder.supabase.co';
const SAFE_KEY = isConfigured ? SUPABASE_ANON_KEY : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.placeholder';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    SAFE_URL,
    SAFE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component - ignored when middleware refreshes session
          }
        },
      },
    }
  );
}
