const API_HOST = import.meta.env.VITE_DJANGO_API_BASE_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = `${API_HOST.replace(/\/$/, '')}/api`;

/**
 * Subscribe to newsletter.
 */
export const subscribeToNewsletter = async (email) => {
  const response = await fetch(`${API_BASE_URL}/subscriptions/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to subscribe: ${response.status}`);
  }

  return await response.json();
};
