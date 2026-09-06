"use client";

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/lib/types';

interface User {
  id: string;
  email: string;
  email_confirmed_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: string | null }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null }>;
  updateProfile: (data: { username?: string; full_name?: string; avatar_url?: string }) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(true);

  const loadProfile = async (userId: string) => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        // Profile doesn't exist yet, that's okay for existing users
        if (error.code === 'PGRST116') {
          setProfile(null);
        } else {
          console.error('Error loading profile:', error);
          setProfile(null);
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    if (!supabase) {
      console.log('Supabase not configured, skipping auth initialization');
      if (isMounted) {
        setLoading(false);
        loadingRef.current = false;
      }
      return;
    }

    const supabaseClient = supabase;

    // Check active session on mount
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        console.log('Initial session check:', session ? 'Session found' : 'No session');
        const currentUser = session?.user ? { id: session.user.id, email: session.user.email || '' } : null;
        if (isMounted) {
          setUser(currentUser);
          if (currentUser) {
            await loadProfile(currentUser.id);
          }
          setLoading(false);
          loadingRef.current = false;
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setLoading(false);
          loadingRef.current = false;
        }
      }
    };

    initializeAuth();

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isMounted && loadingRef.current) {
        console.log('Auth loading timeout reached, forcing load complete');
        setLoading(false);
        loadingRef.current = false;
      }
    }, 10000); // 10 second timeout

    // Listen for auth changes
    let subscription: { unsubscribe: () => void } | null = null;
    if (supabaseClient) {
      const {
        data: { subscription: sub },
      } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
        
        // Skip INITIAL_SESSION event since we already check session on mount
        if (event === 'INITIAL_SESSION') {
          return;
        }
        
        // Handle token refresh errors gracefully
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.log('Token refresh failed, clearing user session');
          if (isMounted) {
            setUser(null);
            setProfile(null);
            setLoading(false);
            loadingRef.current = false;
          }
          return;
        }
        
        const currentUser = session?.user ? { id: session.user.id, email: session.user.email || '' } : null;
        if (isMounted) {
          setUser(currentUser);
          if (currentUser) {
            await loadProfile(currentUser.id);
          } else {
            setProfile(null);
          }
          setLoading(false);
          loadingRef.current = false;
        }
      });
      subscription = sub;
    }

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase not configured' };
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error?.message || null };
  };

  const signUp = async (email: string, password: string, username: string) => {
    if (!supabase) return { error: 'Supabase not configured' };
    
    console.log('Attempting signup with:', email, 'username:', username);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Supabase signup error:', error);
      return { error: error.message };
    }

    console.log('Signup successful:', data);

    // Create user profile with custom username
    if (data.user && username) {
      try {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            username,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't fail signup if profile creation fails, user can set it in settings
        } else {
          console.log('Profile created successfully');
        }
      } catch (e) {
        console.error('Profile creation exception:', e);
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const deleteAccount = async () => {
    if (!user) return { error: 'No user logged in' };
    
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        return { error: data.error || 'Failed to delete account' };
      }

      // Sign out after successful deletion
      await signOut();
      return { error: null };
    } catch (error) {
      return { error: 'Failed to delete account' };
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!supabase) return { error: 'Supabase not configured' };
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  };

  const updateProfile = async (data: { username?: string; full_name?: string; avatar_url?: string }) => {
    if (!user || !supabase) return { error: 'No user logged in or Supabase not configured' };
    
    const { error } = await supabase
      .from('user_profiles')
      .update(data)
      .eq('id', user.id);

    if (error) {
      return { error: error.message };
    }

    // Reload profile after update
    await loadProfile(user.id);
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, deleteAccount, updatePassword, updateProfile }}>
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
