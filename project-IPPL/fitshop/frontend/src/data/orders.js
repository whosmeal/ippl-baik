const STORAGE_KEY = 'fitshop-orders';

export function readOrders() {
  try {
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(orders) ? orders : [];
  } catch (error) {
    console.error('Riwayat pesanan lokal tidak dapat dibaca.', error);
    return [];
  }
}

export function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function findOrder(orderId) {
  return readOrders().find((order) => order.id === orderId);
}

export function updateOrder(orderId, changes) {
  const orders = readOrders();
  const index = orders.findIndex((order) => order.id === orderId);
  if (index < 0) return null;
  orders[index] = { ...orders[index], ...changes };
  saveOrders(orders);
  return orders[index];
}
