import { apiRequest } from './api.js';

export async function createOrder(payload) {
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchMyOrders() {
  const data = await apiRequest('/orders');
  return data.pesanan || [];
}

export async function fetchOrderById(id) {
  const data = await apiRequest(`/orders/${id}`);
  return data.pesanan || null;
}
