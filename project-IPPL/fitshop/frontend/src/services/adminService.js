import { apiRequest } from './api.js';

export async function fetchOverview() {
  return apiRequest('/admin/overview');
}

export async function fetchStores() {
  const data = await apiRequest('/admin/stores');
  return data.toko || [];
}

export async function verifyStore(id, status) {
  return apiRequest(`/admin/stores/${id}/verify`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function fetchUsers() {
  const data = await apiRequest('/admin/users');
  return data.users || [];
}

export async function updateUserStatus(id, status) {
  return apiRequest(`/admin/users/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}
