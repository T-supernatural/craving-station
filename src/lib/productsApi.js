import { supabase } from './supabaseClient';
import authApi from './authApi';

const API_HOST = import.meta.env.VITE_DJANGO_API_BASE_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = `${API_HOST.replace(/\/$/, '')}/api`;
const USE_DJANGO_PRODUCTS = String(import.meta.env.VITE_USE_DJANGO_PRODUCTS).toLowerCase() === 'true';

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

const fetchSupabaseProducts = async (params = {}) => {
  const { category, available, featured, search } = params;
  let query = supabase.from('menu_items').select('*').order('created_at', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }
  if (available !== undefined) {
    query = query.eq('available', available);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  let items = data || [];

  if (featured !== undefined) {
    items = items.filter((item) => Boolean(item.featured) === Boolean(featured));
  }

  if (search) {
    const term = String(search).toLowerCase();
    items = items.filter((item) =>
      String(item.name || '').toLowerCase().includes(term) ||
      String(item.description || '').toLowerCase().includes(term)
    );
  }

  return {
    items,
    meta: {
      count: items.length,
      next: null,
      previous: null,
    },
  };
};

const fetchProducts = async (params = {}, options = {}) => {
  const useBackend = options.useBackend ?? USE_DJANGO_PRODUCTS;

  if (useBackend) {
    try {
      return await fetchDjangoProducts(params);
    } catch (error) {
      console.error('Django products API failed, falling back to Supabase.', {
        error,
        params,
        apiUrl: API_BASE_URL,
        useBackend,
      });
    }
  }

  return fetchSupabaseProducts(params);
};

const fetchProductById = async (id, options = {}) => {
  const useBackend = options.useBackend ?? USE_DJANGO_PRODUCTS;

  if (useBackend) {
    try {
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
    } catch (error) {
      console.warn('Django product detail failed, falling back to Supabase:', error);
    }
  }

  const { data, error } = await supabase.from('menu_items').select('*').eq('id', id).single();
  if (error) {
    throw error;
  }
  return data;
};

const uploadProductImage = async (file, options = {}) => {
  const useBackend = options.useBackend ?? USE_DJANGO_PRODUCTS;
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  if (useBackend) {
    try {
      const formData = new FormData();
      formData.append('file', file, fileName);
      const headers = await authApi.getAuthHeader();

      if (!headers.Authorization) {
        throw new Error('No valid JWT token available for image upload');
      }

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
    } catch (error) {
      console.error('Django image upload failed, falling back to Supabase.', {
        error,
        fileName,
        apiUrl: API_BASE_URL,
        hasAuthToken: !!authApi.tokenManager.getAccessToken(),
      });
    }
  }

  const filePath = `bakery-items/${fileName}`;
  const { error } = await supabase.storage.from('menu-images').upload(filePath, file);
  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from('menu-images').getPublicUrl(filePath);
  return data.publicUrl;
};

const createProduct = async (productData, options = {}) => {
  const useBackend = options.useBackend ?? USE_DJANGO_PRODUCTS;

  if (useBackend) {
    try {
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
    } catch (error) {
      console.error('Django create product failed, falling back to Supabase.', {
        error,
        productData,
        apiUrl: API_BASE_URL,
        hasAuthToken: !!authApi.tokenManager.getAccessToken(),
      });
    }
  }

  const { data, error } = await supabase.from('menu_items').insert(productData).select().single();
  if (error) {
    throw error;
  }
  return data;
};

const updateProduct = async (id, productData, options = {}) => {
  const useBackend = options.useBackend ?? USE_DJANGO_PRODUCTS;

  if (useBackend) {
    try {
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
    } catch (error) {
      console.error('Django update product failed, falling back to Supabase.', {
        error,
        id,
        productData,
        apiUrl: API_BASE_URL,
        hasAuthToken: !!authApi.tokenManager.getAccessToken(),
      });
    }
  }

  const { data, error } = await supabase.from('menu_items').update(productData).eq('id', id).select().single();
  if (error) {
    throw error;
  }
  return data;
};

const deleteProduct = async (id, options = {}) => {
  const useBackend = options.useBackend ?? USE_DJANGO_PRODUCTS;

  if (useBackend) {
    try {
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
    } catch (error) {
      console.error('Django delete product failed, falling back to Supabase.', {
        error,
        id,
        apiUrl: API_BASE_URL,
        hasAuthToken: !!authApi.tokenManager.getAccessToken(),
      });
    }
  }

  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) {
    throw error;
  }
  return true;
};

export {
  fetchProducts,
  fetchProductById,
  fetchDjangoProducts,
  fetchSupabaseProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
};
