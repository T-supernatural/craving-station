import { createContext, useContext, useEffect, useState } from 'react';
import authApi from '../lib/authApi';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth: check for stored JWT token first, then Supabase session
    const initializeAuth = async () => {
      try {
        const storedUser = authApi.tokenManager.getStoredUser();
        if (storedUser && authApi.tokenManager.hasValidToken()) {
          try {
            const profile = await authApi.getProfile();
            setUser(profile.user);
            setSession({ user: profile.user });
            console.log('AuthContext: Initialized from stored JWT token');
          } catch (profileError) {
            console.warn('AuthContext: Stored JWT token valid but profile fetch failed, falling back to Supabase', profileError);
            const { data: { session: supabaseSession }, error: supabaseError } = await supabase.auth.getSession();
            setSession(supabaseSession);
            setUser(supabaseSession?.user ?? null);
          }
        } else if (storedUser && !authApi.tokenManager.isTokenExpired(authApi.tokenManager.getRefreshToken())) {
          try {
            await authApi.refreshToken();
            const profile = await authApi.getProfile();
            setUser(profile.user);
            setSession({ user: profile.user });
            console.log('AuthContext: Refreshed access token and restored session');
          } catch (error) {
            console.error('AuthContext: Failed to refresh token, falling back to Supabase', error);
            const { data: { session: supabaseSession }, error: supabaseError } = await supabase.auth.getSession();
            setSession(supabaseSession);
            setUser(supabaseSession?.user ?? null);
          }
        } else {
          const { data: { session: supabaseSession }, error: supabaseError } = await supabase.auth.getSession();
          if (supabaseError) {
            console.error('AuthContext: Error getting Supabase session:', supabaseError);
          }
          setSession(supabaseSession);
          setUser(supabaseSession?.user ?? null);
        }
      } catch (error) {
        console.error('AuthContext: Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for Supabase auth changes as fallback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          authApi.tokenManager.clearTokens();
          setUser(null);
          setSession(null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      const result = await authApi.login(email, password);
      setUser(result.user);
      setSession({ user: result.user });
      console.log('AuthContext: signIn backend:', result.backend);
      return result;
    } catch (error) {
      console.error('AuthContext: signIn error', error);
      throw error;
    }
  };

  const signUp = async (email, password, metadata) => {
    try {
      const result = await authApi.register(email, password, metadata);
      // Don't auto-login after signup; require verification
      return result;
    } catch (error) {
      console.error('AuthContext: signUp error', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authApi.logout();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('AuthContext: signOut error', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await authApi.resetPassword(email);
    } catch (error) {
      console.error('AuthContext: resetPassword error', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAdmin: authApi.isAdmin,
    isAuthenticated: authApi.isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}