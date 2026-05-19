import { createContext, useContext, useEffect, useState } from 'react';
import authApi from '../lib/authApi';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth from stored JWT tokens only (Django-only)
    const initializeAuth = async () => {
      try {
        const storedUser = authApi.tokenManager.getStoredUser();
        if (storedUser && authApi.tokenManager.hasValidToken()) {
          const profile = await authApi.getProfile();
          setUser(profile.user);
          setSession({ user: profile.user });
          console.log('AuthContext: Initialized from stored JWT token');
        } else if (storedUser && !authApi.tokenManager.isTokenExpired(authApi.tokenManager.getRefreshToken())) {
          await authApi.refreshToken();
          const profile = await authApi.getProfile();
          setUser(profile.user);
          setSession({ user: profile.user });
          console.log('AuthContext: Refreshed access token and restored session');
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('AuthContext: Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // No Supabase listeners; Django-only auth flow
    return undefined;
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
      if (result?.user) {
        setUser(result.user);
        setSession({ user: result.user });
      }
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