import { apiRequest } from './api.js';

export async function fetchSellerProfile() {
  return apiRequest('/seller/profile');
}

export async function fetchSellerProducts() {
  const data = await apiRequest('/seller/products');
  return data.produk || [];
}
