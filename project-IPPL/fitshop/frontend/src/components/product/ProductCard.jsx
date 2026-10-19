import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../data/products.js';
import { useCart } from '../../context/CartContext.jsx';
import { useFavorites } from '../../context/FavoritesContext.jsx';

export default function ProductCard({ product, compact = false }) {
  const { ids, toggleFavorite } = useFavorites();
  const favorite = ids.includes(product.id);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  function addToCart() {
    addItem(product.id, product.sizes[0]);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <article className="product-card">
      <div className={`product-image-wrap${compact ? ' product-image-compact' : ''}`}>
        <Link to={`/produk/${product.id}`} aria-label={`Lihat ${product.name}`}>
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>
        {product.label && <span className="product-label">{product.label}</span>}
        <button
          className={`favorite-button${favorite ? ' is-favorite' : ''}`}
          type="button"
          aria-label={favorite ? 'Hapus dari favorit' : 'Simpan ke favorit'}
          aria-pressed={favorite}
          onClick={() => toggleFavorite(product.id)}
        >
          {favorite ? '♥' : '♡'}
        </button>
        <button className="quick-add" type="button" onClick={addToCart}>
          {added ? '✓ Ditambahkan' : '+ Tambah ke tas'}
        </button>
      </div>
      <div className="product-info">
        <div className="product-title-row">
          <Link to={`/produk/${product.id}`}><h3>{product.name}</h3></Link>
          <span className="rating">★ {product.rating}</span>
        </div>
        <p className="product-color">{product.color} · {product.category}</p>
        <div className="price-row">
          <strong>{formatPrice(product.price)}</strong>
          {product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}
        </div>
      </div>
    </article>
  );
}