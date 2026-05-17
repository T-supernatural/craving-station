import { supabase } from './supabaseClient';

const API_BASE_URL = import.meta.env.VITE_DJANGO_API_BASE_URL || '/api';
const USE_DJANGO_PRODUCTS = import.meta.env.VITE_USE_DJANGO_PRODUCTS === 'true';

const normalizeBackendProductList = (payload) => {
  const items = Array.isArray(payload) ? payload : payload.results || [];
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
      console.warn('Django products API failed, falling back to Supabase:', error);
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

export { fetchProducts, fetchProductById, fetchDjangoProducts, fetchSupabaseProducts };
