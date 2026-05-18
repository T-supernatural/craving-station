import authApi from './authApi';

const API_HOST = import.meta.env.VITE_DJANGO_API_BASE_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = `${API_HOST.replace(/\/$/, '')}/api`;

// Enforce Django-only product APIs for this migration phase
const FORCE_DJANGO = true;

const normalizeBackendProductList = (payload) => {
  const items = Array.isArray(payload)
    ? payload
    : payload.results ?? payload.data ?? [];

  return {
    items,
    meta: {
      count: payload.count ?? items.length,
      next: payload.next || null,
      previous: payload.previous || null,
    },
  };
};

const buildQueryString = (params) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.set(key, String(value));
  });

  return query.toString();
};

const fetchDjangoProducts = async (params = {}) => {
  const query = buildQueryString(params);
  const url = `${API_BASE_URL}/products/${query ? `?${query}` : ''}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Django products request failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  return normalizeBackendProductList(payload);
};

// (Legacy Supabase product listing removed during Django migration)

const fetchProducts = async (params = {}) => {
  if (!FORCE_DJANGO) throw new Error('Django products not enabled');
  return await fetchDjangoProducts(params);
};

const fetchProductById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/products/${id}/`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Django product detail request failed: ${response.status} ${errorText}`);
  }

  return await response.json();
};

const uploadProductImage = async (file, options = {}) => {
  const useBackend = options.useBackend ?? USE_DJANGO_PRODUCTS;
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  if (!FORCE_DJANGO) throw new Error('Django uploads not enabled');

  const formData = new FormData();
  formData.append('file', file, fileName);
  const headers = await authApi.getAuthHeader();

  if (!headers.Authorization) throw new Error('No valid JWT token available for image upload');

  const response = await fetch(`${API_BASE_URL}/products/upload-image/`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Django image upload failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  return payload.image_url;
};

const createProduct = async (productData, options = {}) => {
  const useBackend = options.useBackend ?? USE_DJANGO_PRODUCTS;

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(await authApi.getAuthHeader()),
  };

  const response = await fetch(`${API_BASE_URL}/products/create/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Django create product failed: ${response.status} ${errorText}`);
  }

  return await response.json();
};

const updateProduct = async (id, productData, options = {}) => {
  const useBackend = options.useBackend ?? USE_DJANGO_PRODUCTS;

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(await authApi.getAuthHeader()),
  };

  const response = await fetch(`${API_BASE_URL}/products/${id}/update/`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Django update product failed: ${response.status} ${errorText}`);
  }

  return await response.json();
};

const deleteProduct = async (id, options = {}) => {
  const useBackend = options.useBackend ?? USE_DJANGO_PRODUCTS;

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(await authApi.getAuthHeader()),
  };

  const response = await fetch(`${API_BASE_URL}/products/${id}/delete/`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Django delete product failed: ${response.status} ${errorText}`);
  }

  return true;
};

export {
  fetchProducts,
  fetchProductById,
  fetchDjangoProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
};
