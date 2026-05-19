import authApi from './authApi';

const API_HOST = import.meta.env.VITE_DJANGO_API_BASE_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = `${API_HOST.replace(/\/$/, '')}/api`;

/**
 * Fetch dashboard statistics (admin only).
 */
export const fetchDashboardStats = async () => {
  const headers = await authApi.getAuthHeader();
  if (!headers.Authorization) throw new Error('No valid token for dashboard stats fetch');

  const response = await fetch(`${API_BASE_URL}/stats/dashboard/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to fetch dashboard stats: ${response.status}`);
  }

  return await response.json();
};
