import { apiRequest } from './api.js';

export async function fetchProducts(params = {}) {
  const query = new URLSearchParams();
  if (params.kategori) query.set('kategori', params.kategori);
  if (params.search) query.set('search', params.search);
  if (params.minPrice) query.set('minPrice', params.minPrice);
  if (params.maxPrice) query.set('maxPrice', params.maxPrice);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const data = await apiRequest(`/products${qs}`);
  return data.produk || [];
}

export async function fetchProductById(id) {
  return apiRequest(`/products/${id}`);
}

export async function createProduct(payload) {
  return apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(id, payload) {
  return apiRequest(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(id) {
  return apiRequest(`/products/${id}`, {
    method: 'DELETE',
  });
}
