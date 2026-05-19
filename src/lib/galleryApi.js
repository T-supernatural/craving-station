import authApi from './authApi';

const API_HOST = import.meta.env.VITE_DJANGO_API_BASE_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = `${API_HOST.replace(/\/$/, '')}/api`;

/**
 * Fetch all gallery images.
 */
export const fetchGalleryImages = async (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.set(key, String(value));
  });

  const url = `${API_BASE_URL}/gallery/${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) throw new Error(`Failed to fetch gallery images: ${response.status}`);
  return await response.json();
};

/**
 * Upload a gallery image.
 */
export const uploadGalleryImage = async (file, caption = '') => {
  const headers = await authApi.getAuthHeader();
  if (!headers.Authorization) throw new Error('No valid token for gallery upload');

  const formData = new FormData();
  formData.append('file', file);
  if (caption) formData.append('caption', caption);

  const response = await fetch(`${API_BASE_URL}/gallery/upload/`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to upload gallery image: ${response.status} ${err}`);
  }

  const result = await response.json();
  return result.image_url || result.url;
};

/**
 * Delete a gallery image.
 */
export const deleteGalleryImage = async (id) => {
  const headers = await authApi.getAuthHeader();
  if (!headers.Authorization) throw new Error('No valid token for gallery delete');

  const response = await fetch(`${API_BASE_URL}/gallery/${id}/delete/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to delete gallery image: ${response.status}`);
  }

  return true;
};
