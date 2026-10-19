import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

const navItems = [
  ['/', 'Beranda'],
  ['/produk', 'Koleksi'],
  ['/try-on/linen-shirt', 'Fit Check'],
];

export function Layout({ children }) {
  const [query, setQuery] = useState('');
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  function submitSearch(event) {
    event.preventDefault();
    navigate(`/produk${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
  }

  const roleHome =
    user?.role === 'penjual'
      ? ['/seller', 'Dashboard toko']
      : user?.role === 'admin'
        ? ['/admin', 'Dashboard admin']
        : null;

  return (
    <div className="storefront app-shell">
      <div className="announcement">
        <span>Gratis ongkir untuk pesanan pertama</span>
        <Link to="/produk">Belanja sekarang <span aria-hidden="true">→</span></Link>
      </div>
      <header className="site-header app-header">
        <Link className="brand" to="/" aria-label="FitShop beranda">
          fit<span>shop</span><i>.</i>
        </Link>
        <nav className="main-nav" aria-label="Navigasi utama">
          {navItems.map(([to, label]) => (
            <NavLink
              end={to === '/'}
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? 'nav-active' : '')}
            >
              {label}
            </NavLink>
          ))}
          {user?.role === 'pembeli' && <NavLink to="/orders">Pesanan</NavLink>}
          {roleHome && <NavLink to={roleHome[0]}>{roleHome[1]}</NavLink>}
        </nav>
        <div className="header-actions">
          <form className="search-box" onSubmit={submitSearch} role="search">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Cari produk"
              placeholder="Cari outfit..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </form>
          <Link
            className="icon-button cart-button"
            to="/cart"
            aria-label={`Keranjang, ${count} barang`}
          >
            <span aria-hidden="true">♧</span>
            {count > 0 && <span className="cart-count">{count}</span>}
          </Link>
          <Link className="favorite-header-link" to="/favorit" aria-label="Produk favorit">
            <span aria-hidden="true">♡</span>
          </Link>
          {user ? (
            <div className="account-actions">
              <Link className="account-name" to="/account">{user.nama}</Link>
              <button
                className="login-link"
                type="button"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Keluar
              </button>
            </div>
          ) : (
            <Link className="login-link" to="/login">Masuk</Link>
          )}
        </div>
      </header>
      <nav className="mobile-nav" aria-label="Navigasi seluler">
        {navItems.map(([to, label]) => (
          <NavLink end={to === '/'} key={to} to={to}>
            {label}
          </NavLink>
        ))}
        <NavLink to="/favorit">Favorit</NavLink>
        {user ? (
          <NavLink to={user.role === 'pembeli' ? '/orders' : '/account'}>
            {user.role === 'pembeli' ? 'Pesanan' : 'Akun'}
          </NavLink>
        ) : (
          <NavLink to="/login">Masuk</NavLink>
        )}
        <NavLink to="/cart">Tas ({count})</NavLink>
      </nav>
      <main className="app-main">{children}</main>
      <footer className="site-footer app-footer" id="footer">
        <Link className="brand" to="/">fit<span>shop</span><i>.</i></Link>
        <p>Gaya yang pas untuk jadi dirimu sendiri.</p>
        <nav className="footer-links" aria-label="Tautan informasi">
          <Link to="/tentang">Tentang FitShop</Link>
          <Link to="/produk">Koleksi</Link>
          <Link to="/favorit">Favorit</Link>
        </nav>
        <span>© 2026 FitShop · Demo marketplace fashion</span>
      </footer>
    </div>
  );
}

export function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="section-kicker">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
