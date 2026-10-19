import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getProduct } from '../data/products.js';

const CartContext = createContext(null);
const STORAGE_KEY = 'fitshop-cart';

function readCart() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.error('Data keranjang lokal tidak dapat dibaca.', error);
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function updateItems(updater) {
    setItems(updater);
  }

  function addItem(productId, size = 'M', quantity = 1) {
    if (!getProduct(productId)) return;
    updateItems((current) => {
      const existing = current.find(
        (item) => item.productId === productId && item.size === size,
      );
      return existing
        ? current.map((item) =>
            item === existing
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )
        : [...current, { productId, size, quantity }];
    });
  }

  function setQuantity(productId, size, quantity) {
    updateItems((current) =>
      quantity < 1
        ? current.filter(
            (item) => item.productId !== productId || item.size !== size,
          )
        : current.map((item) =>
            item.productId === productId && item.size === size
              ? { ...item, quantity }
              : item,
          ),
    );
  }

  function removeItem(productId, size) {
    setQuantity(productId, size, 0);
  }

  function clearCart() {
    updateItems(() => []);
  }

  const value = useMemo(() => {
    const detailedItems = items
      .map((item) => ({ ...item, product: getProduct(item.productId) }))
      .filter((item) => item.product);
    return {
      items: detailedItems,
      count: detailedItems.reduce((total, item) => total + item.quantity, 0),
      subtotal: detailedItems.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0,
      ),
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart harus digunakan di dalam CartProvider.');
  return context;
}