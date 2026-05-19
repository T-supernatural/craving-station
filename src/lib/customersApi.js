import authApi from './authApi';

const API_HOST = import.meta.env.VITE_DJANGO_API_BASE_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = `${API_HOST.replace(/\/$/, '')}/api`;

/**
 * Fetch customer list with order counts (admin only).
 */
export const fetchCustomers = async (params = {}) => {
  const headers = await authApi.getAuthHeader();
  if (!headers.Authorization) throw new Error('No valid token for customers fetch');

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.set(key, String(value));
  });

  const url = `${API_BASE_URL}/stats/customers/${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
  });

  if (!response.ok) throw new Error(`Failed to fetch customers: ${response.status}`);
  return await response.json();
};
