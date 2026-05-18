import authApi from './authApi';

const API_HOST = import.meta.env.VITE_DJANGO_API_BASE_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = `${API_HOST.replace(/\/$/, '')}/api`;

/**
 * Fetch orders for the authenticated user.
 */
export const fetchUserOrders = async (params = {}) => {
  const headers = await authApi.getAuthHeader();
  if (!headers.Authorization) throw new Error('No valid token for order fetch');

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.set(key, String(value));
  });

  const url = `${API_BASE_URL}/orders/${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
  });

  if (!response.ok) throw new Error(`Failed to fetch user orders: ${response.status}`);
  return await response.json();
};

/**
 * Fetch all orders (admin).
 */
export const fetchOrders = async (params = {}) => {
  const headers = await authApi.getAuthHeader();
  if (!headers.Authorization) throw new Error('No valid token for orders fetch');

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.set(key, String(value));
  });

  const url = `${API_BASE_URL}/orders/${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
  });

  if (!response.ok) throw new Error(`Failed to fetch orders: ${response.status}`);
  return await response.json();
};

/**
 * Create a new order.
 */
export const createOrder = async (orderData) => {
  const headers = await authApi.getAuthHeader();
  if (!headers.Authorization) throw new Error('No valid token for order creation');

  const response = await fetch(`${API_BASE_URL}/orders/create/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to create order: ${response.status}`);
  }

  return await response.json();
};

/**
 * Update order status.
 */
export const updateOrderStatus = async (id, status) => {
  const headers = await authApi.getAuthHeader();
  if (!headers.Authorization) throw new Error('No valid token for order update');

  const response = await fetch(`${API_BASE_URL}/orders/${id}/update/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to update order: ${response.status}`);
  }

  return await response.json();
};
