import { apiRequest } from './api.js';

export async function payOrder(id_pesanan, metode) {
  return apiRequest('/payment/pay', {
    method: 'POST',
    body: JSON.stringify({ id_pesanan, metode }),
  });
}
