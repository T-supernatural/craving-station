import { supabase } from './supabaseClient';

const API_HOST = import.meta.env.VITE_DJANGO_API_BASE_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = `${API_HOST.replace(/\/$/, '')}/api`;
const USE_DJANGO_AUTH = import.meta.env.VITE_USE_DJANGO_AUTH === 'true';

/**
 * Token management for JWT tokens stored in localStorage.
 */
class TokenManager {
  constructor() {
    this.accessTokenKey = 'craving_station_access_token';
    this.refreshTokenKey = 'craving_station_refresh_token';
    this.userKey = 'craving_station_user';
  }

  setTokens(accessToken, refreshToken, user) {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  getAccessToken() {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getStoredUser() {
    try {
      const user = localStorage.getItem(this.userKey);
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error('TokenManager: Failed to parse stored user', e);
      return null;
    }
  }

  clearTokens() {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  isTokenExpired(token) {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (e) {
      return true;
    }
  }

  hasValidToken() {
    const accessToken = this.getAccessToken();
    return accessToken && !this.isTokenExpired(accessToken);
  }
}

const tokenManager = new TokenManager();

const getValidAccessToken = async () => {
  const accessToken = tokenManager.getAccessToken();
  if (accessToken && !tokenManager.isTokenExpired(accessToken)) {
    return accessToken;
  }

  const refreshTokenValue = tokenManager.getRefreshToken();
  if (!refreshTokenValue || tokenManager.isTokenExpired(refreshTokenValue)) {
    throw new Error('No valid refresh token available');
  }

  const refreshResult = await refreshToken();
  return refreshResult.access;
};

const getAuthHeader = async () => {
  try {
    const accessToken = await getValidAccessToken();
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  } catch (error) {
    console.error('authApi: Failed to get valid auth header', error);
    return {};
  }
};

/**
 * Register a new user with Django backend.
 */
const register = async (email, password, phoneOrFormData, fullName = null) => {
  const useBackend = USE_DJANGO_AUTH;

  if (useBackend) {
    try {
      let payload;

      // Handle both old API (email, password, metadata) and new form data
      if (typeof phoneOrFormData === 'string') {
        // Old API: (email, password, phone, fullName)
        payload = {
          email,
          password,
          phone: phoneOrFormData,
          full_name: fullName,
        };
      } else {
        // New API: (email, password, formData)
        payload = {
          email,
          password,
          phone: phoneOrFormData?.phone || '',
          full_name: phoneOrFormData?.full_name || '',
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || errorData?.email?.[0] || `Django register failed: ${response.status}`);
      }

      const user = await response.json();
      return { user, backend: 'django' };
    } catch (error) {
      console.error('Django register failed, falling back to Supabase.', {
        error: error.message,
        apiUrl: API_BASE_URL,
      });
    }
  }

  // Supabase fallback for register
  const metadata = typeof phoneOrFormData === 'string'
    ? { phone: phoneOrFormData, full_name: fullName }
    : phoneOrFormData;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) throw error;

  // Create profile record
  if (data.user) {
    await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        full_name: metadata?.full_name || null,
        phone: metadata?.phone || null,
        role: 'customer',
      });
  }

  return { user: data.user, backend: 'supabase' };
};

/**
 * Login user with Django backend (email + password).
 */
const login = async (email, password) => {
  const useBackend = USE_DJANGO_AUTH;

  if (useBackend) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || 'Django login failed');
      }

      const { access, refresh, user } = await response.json();

      // Store tokens and user data
      tokenManager.setTokens(access, refresh, user);

      return { user, access, refresh, backend: 'django' };
    } catch (error) {
      console.error('Django login failed, falling back to Supabase.', {
        error: error.message,
        apiUrl: API_BASE_URL,
      });
    }
  }

  // Supabase fallback for login
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return { user: data.user, session: data.session, backend: 'supabase' };
};

/**
 * Refresh JWT access token.
 */
async function refreshToken() {
  const useBackend = USE_DJANGO_AUTH;
  const refreshTokenValue = tokenManager.getRefreshToken();

  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }

  if (useBackend) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refresh: refreshTokenValue }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || 'Token refresh failed');
      }

      const { access } = await response.json();
      localStorage.setItem(tokenManager.accessTokenKey, access);

      return { access, backend: 'django' };
    } catch (error) {
      console.error('Django token refresh failed, clearing tokens.', {
        error: error.message,
        apiUrl: API_BASE_URL,
      });
      tokenManager.clearTokens();
      throw error;
    }
  }

  // Supabase fallback for refresh
  const { data, error } = await supabase.auth.refreshSession();
  if (error) {
    tokenManager.clearTokens();
    throw error;
  }

  return { session: data.session, backend: 'supabase' };
};

/**
 * Get current user profile.
 */
const getProfile = async () => {
  const useBackend = USE_DJANGO_AUTH;

  if (useBackend) {
    try {
      const headers = await getAuthHeader();
      if (!headers.Authorization) {
        throw new Error('No valid access token available for Django profile request');
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || `Django getProfile failed: ${response.status}`);
      }

      const user = await response.json();
      tokenManager.setTokens(tokenManager.getAccessToken(), tokenManager.getRefreshToken(), user);
      return { user, backend: 'django' };
    } catch (error) {
      console.error('Django getProfile failed, falling back to Supabase.', {
        error: error.message,
        apiUrl: API_BASE_URL,
      });
    }
  }

  // Supabase fallback for profile
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;

  return { user: data.user, backend: 'supabase' };
};

/**
 * Update user profile.
 */
const updateProfile = async (profileData) => {
  const useBackend = USE_DJANGO_AUTH;

  if (useBackend) {
    try {
      const headers = await getAuthHeader();
      if (!headers.Authorization) {
        throw new Error('No valid access token available for Django profile update');
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...headers,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || 'Django updateProfile failed');
      }

      const user = await response.json();
      tokenManager.setTokens(tokenManager.getAccessToken(), tokenManager.getRefreshToken(), user);
      return { user, backend: 'django' };
    } catch (error) {
      console.error('Django updateProfile failed, falling back to Supabase.', {
        error: error.message,
        apiUrl: API_BASE_URL,
      });
    }
  }

  // Supabase fallback for profile update
  const { data, error } = await supabase.auth.updateUser(profileData);
  if (error) throw error;

  return { user: data.user, backend: 'supabase' };
};

/**
 * Logout and clear tokens.
 */
const logout = async () => {
  const useBackend = USE_DJANGO_AUTH;

  if (useBackend) {
    // No explicit Django logout endpoint needed; just clear tokens
    tokenManager.clearTokens();
    console.log('Django logout: Tokens cleared');
  }

  // Supabase logout
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Supabase logout error:', error);
  }

  tokenManager.clearTokens();
};

/**
 * Reset password.
 */
const resetPassword = async (email) => {
  // Supabase handles password reset for now
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
};

/**
 * Check if user has admin role.
 */
const isAdmin = () => {
  const user = tokenManager.getStoredUser();
  return user?.role === 'admin';
};

/**
 * Check if user is authenticated.
 */
const isAuthenticated = () => {
  return tokenManager.hasValidToken();
};

export default {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  resetPassword,
  getAuthHeader,
  isAdmin,
  isAuthenticated,
  tokenManager,
};
