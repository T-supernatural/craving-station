const API_HOST = import.meta.env.VITE_DJANGO_API_BASE_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = `${API_HOST.replace(/\/$/, '')}/api`;

class TokenManager {
  constructor() {
    this.accessTokenKey = 'craving_station_access_token';
    this.refreshTokenKey = 'craving_station_refresh_token';
    this.userKey = 'craving_station_user';
  }

  setTokens(accessToken, refreshToken, user) {
    if (accessToken) localStorage.setItem(this.accessTokenKey, accessToken);
    if (refreshToken) localStorage.setItem(this.refreshTokenKey, refreshToken);
    if (user) localStorage.setItem(this.userKey, JSON.stringify(user));
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
    return !!accessToken && !this.isTokenExpired(accessToken);
  }
}

const tokenManager = new TokenManager();

const getValidAccessToken = async () => {
  const accessToken = tokenManager.getAccessToken();
  if (accessToken && !tokenManager.isTokenExpired(accessToken)) return accessToken;

  const refreshTokenValue = tokenManager.getRefreshToken();
  if (!refreshTokenValue || tokenManager.isTokenExpired(refreshTokenValue)) {
    throw new Error('No valid refresh token available');
  }

  const result = await refreshToken();
  return result.access;
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

const register = async (email, password, phoneOrFormData, fullName = null) => {
  const payload = typeof phoneOrFormData === 'string'
    ? { email, password, phone: phoneOrFormData, full_name: fullName }
    : { email, password, phone: phoneOrFormData?.phone || '', full_name: phoneOrFormData?.full_name || '' };

  const res = await fetch(`${API_BASE_URL}/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || err?.email?.[0] || `Django register failed: ${res.status}`);
  }

  const user = await res.json();
  tokenManager.setTokens(null, null, user);
  return { user, backend: 'django' };
};

const login = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || 'Django login failed');
  }

  const { access, refresh, user } = await res.json();
  tokenManager.setTokens(access, refresh, user);
  return { user, access, refresh, backend: 'django' };
};

async function refreshToken() {
  const refreshTokenValue = tokenManager.getRefreshToken();
  if (!refreshTokenValue) throw new Error('No refresh token available');

  const res = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ refresh: refreshTokenValue }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    tokenManager.clearTokens();
    throw new Error(err?.detail || 'Token refresh failed');
  }

  const { access } = await res.json();
  localStorage.setItem(tokenManager.accessTokenKey, access);
  return { access };
}

const getProfile = async () => {
  const headers = await getAuthHeader();
  if (!headers.Authorization) throw new Error('No valid access token available for Django profile request');

  const res = await fetch(`${API_BASE_URL}/auth/profile/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...headers },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Django getProfile failed: ${res.status}`);
  }

  const user = await res.json();
  tokenManager.setTokens(tokenManager.getAccessToken(), tokenManager.getRefreshToken(), user);
  return { user, backend: 'django' };
};

const updateProfile = async (profileData) => {
  const headers = await getAuthHeader();
  if (!headers.Authorization) throw new Error('No valid access token available for Django profile update');

  const res = await fetch(`${API_BASE_URL}/auth/profile/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...headers },
    body: JSON.stringify(profileData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || 'Django updateProfile failed');
  }

  const user = await res.json();
  tokenManager.setTokens(tokenManager.getAccessToken(), tokenManager.getRefreshToken(), user);
  return { user, backend: 'django' };
};

const logout = async () => {
  tokenManager.clearTokens();
  return true;
};

const resetPassword = async (email) => {
  const res = await fetch(`${API_BASE_URL}/auth/password-reset/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Password reset failed: ${res.status}`);
  }

  return await res.json();
};

const isAdmin = () => {
  const user = tokenManager.getStoredUser();
  return user?.role === 'admin';
};

const isAuthenticated = () => tokenManager.hasValidToken();

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
