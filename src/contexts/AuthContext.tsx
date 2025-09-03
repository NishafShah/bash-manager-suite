import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Helper to ensure a profile row exists for the authenticated user
    const ensureProfile = async (u: User) => {
      try {
        const { data: existing, error: selErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', u.id)
          .maybeSingle();
        if (selErr) {
          console.error('Profile select error:', selErr);
          return;
        }
        if (!existing) {
          const md: any = u.user_metadata || {};
          await supabase.from('profiles').insert({
            id: u.id,
            first_name: md.first_name ?? null,
            last_name: md.last_name ?? null,
            phone: md.phone ?? null,
          });
        }
      } catch (e) {
        console.error('ensureProfile error:', e);
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Defer supabase calls to avoid deadlocks
        if (session?.user) {
          setTimeout(() => {
            ensureProfile(session.user!);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        ensureProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};