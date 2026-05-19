import authApi from './authApi';

const API_HOST = import.meta.env.VITE_DJANGO_API_BASE_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = `${API_HOST.replace(/\/$/, '')}/api`;

const getOptionalAuthHeader = async () => {
  try {
    return await authApi.getAuthHeader();
  } catch {
    return {};
  }
};

/**
 * Fetch reservations for the authenticated user.
 */
export const fetchUserReservations = async (params = {}) => {
  const headers = await authApi.getAuthHeader();
  if (!headers.Authorization) throw new Error('No valid token for reservations fetch');

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.set(key, String(value));
  });

  const url = `${API_BASE_URL}/reservations/${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
  });

  if (!response.ok) throw new Error(`Failed to fetch user reservations: ${response.status}`);
  return await response.json();
};

/**
 * Fetch all reservations (admin).
 */
export const fetchReservations = async (params = {}) => {
  const headers = await authApi.getAuthHeader();
  if (!headers.Authorization) throw new Error('No valid token for reservations fetch');

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.set(key, String(value));
  });

  const url = `${API_BASE_URL}/reservations/${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
  });

  if (!response.ok) throw new Error(`Failed to fetch reservations: ${response.status}`);
  return await response.json();
};

/**
 * Create a new reservation.
 */
export const createReservation = async (reservationData) => {
  const headers = await getOptionalAuthHeader();

  const response = await fetch(`${API_BASE_URL}/reservations/create/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    body: JSON.stringify(reservationData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to create reservation: ${response.status}`);
  }

  return await response.json();
};

/**
 * Update reservation status.
 */
export const updateReservationStatus = async (id, status, adminNotes = '') => {
  const headers = await authApi.getAuthHeader();
  if (!headers.Authorization) throw new Error('No valid token for reservation update');

  const payload = { status };
  if (adminNotes) payload.admin_notes = adminNotes;

  const response = await fetch(`${API_BASE_URL}/reservations/${id}/update/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to update reservation: ${response.status}`);
  }

  return await response.json();
};
