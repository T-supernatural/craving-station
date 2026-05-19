import authApi from './authApi';

const API_HOST = import.meta.env.VITE_DJANGO_API_BASE_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = `${API_HOST.replace(/\/$/, '')}/api`;

/**
 * Fetch settings (public endpoint, no auth required).
 */
export const fetchSettings = async () => {
  const response = await fetch(`${API_BASE_URL}/settings/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) throw new Error(`Failed to fetch settings: ${response.status}`);
  return await response.json();
};

/**
 * Update settings (admin only).
 */
export const updateSettings = async (settingsData) => {
  const headers = await authApi.getAuthHeader();
  if (!headers.Authorization) throw new Error('No valid token for settings update');

  const response = await fetch(`${API_BASE_URL}/settings/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    body: JSON.stringify(settingsData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to update settings: ${response.status}`);
  }

  return await response.json();
};
