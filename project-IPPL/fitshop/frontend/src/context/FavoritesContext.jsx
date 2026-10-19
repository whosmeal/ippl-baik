import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const FavoritesContext = createContext(null);
const STORAGE_KEY = 'fitshop-favorites';

function readFavorites() {
  try {
    const favorites = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(favorites) ? favorites : [];
  } catch (error) {
    console.error('Daftar favorit tidak dapat dibaca.', error);
    return [];
  }
}

export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState(readFavorites);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  function toggleFavorite(productId) {
    setIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  const value = useMemo(
    () => ({ ids, toggleFavorite }),
    [ids],
  );
  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites harus digunakan di dalam FavoritesProvider.');
  }
  return context;
}
