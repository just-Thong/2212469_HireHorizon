'use client';

import { useEffect } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { fetchProfile, setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    // If Supabase not configured yet, mark as done loading with no user
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Initial session fetch
    fetchProfile();

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(profile);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile, setUser, setProfile, setLoading]);

  return <>{children}</>;
}
