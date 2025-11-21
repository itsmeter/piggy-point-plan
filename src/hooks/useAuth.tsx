import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  signIn: (emailOrUsername: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username
        }
      }
    });

    // Trigger now handles initialization atomically
    return { error };
  };

  const signIn = async (emailOrUsername: string, password: string) => {
    // Check if it's an email or username
    const isEmail = emailOrUsername.includes('@');
    
    if (isEmail) {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailOrUsername,
        password
      });
      // Use generic error message to prevent email enumeration
      if (error) {
        return { error: { message: 'Invalid credentials' } };
      }
      return { error };
    } else {
      // Query profile by username to get email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', emailOrUsername)
        .single();

      if (!profile) {
        // Generic error to prevent username enumeration
        return { error: { message: 'Invalid credentials' } };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password
      });
      
      // Use generic error message
      if (error) {
        return { error: { message: 'Invalid credentials' } };
      }
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
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
