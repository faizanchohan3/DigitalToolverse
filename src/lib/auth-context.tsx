import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase/client";

type Profile = { id: string; email: string | null; full_name: string | null; is_admin: boolean };

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function loadProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, is_admin")
    .eq("id", userId)
    .maybeSingle();
  return (data as Profile) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      const sessUser = data.session?.user ?? null;
      setUser(sessUser);
      setProfile(sessUser ? await loadProfile(sessUser.id) : null);
      setIsLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session: Session | null) => {
      const sessUser = session?.user ?? null;
      setUser(sessUser);
      setProfile(sessUser ? await loadProfile(sessUser.id) : null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin: Boolean(profile?.is_admin),
        isLoading,
        signUp,
        signIn,
        signOut,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
