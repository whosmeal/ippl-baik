import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFavorites } from '../../context/FavoritesContext.jsx';
import { products } from '../../data/products.js';
import { PageHeading } from '../../components/common/Layout.jsx';
import ProductCard from '../../components/product/ProductCard.jsx';

export function Favorites() {
  const { ids } = useFavorites();
  const savedProducts = products.filter((product) => ids.includes(product.id));

  return (
    <section className="page-container">
      <PageHeading
        eyebrow="KOLEKSI PRIBADI"
        title="Yang kamu suka."
        description="Simpan produk untuk membandingkan dan menemukannya lagi nanti."
      />
      {savedProducts.length ? (
        <div className="product-grid">
          {savedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-panel">
          <div className="empty-icon">♡</div>
          <h2>Belum ada produk favorit</h2>
          <p>Tekan ikon hati pada produk untuk menyimpannya di sini.</p>
          <Link className="button button-dark" to="/produk">
            Temukan favoritmu <span>→</span>
          </Link>
        </div>
      )}
    </section>
  );
}

export function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user.role === 'admin'
    ? [['/admin', 'Dashboard admin', 'Ringkasan platform dan menu administrasi.']]
    : user.role === 'penjual'
      ? [['/seller', 'Dashboard toko', 'Kelola katalog dan aktivitas tokomu.']]
      : [['/orders', 'Pesanan saya', 'Lihat riwayat dan status pesanan.']];

  return (
    <section className="page-container narrow-page">
      <PageHeading
        eyebrow="AKUN FITSHOP"
        title="Halo, kamu."
        description="Informasi akun dasar dan pintasan sesuai peran."
      />
      <div className="account-card">
        <div className="account-avatar" aria-hidden="true">
          {(user.nama || 'F').trim().charAt(0).toUpperCase()}
        </div>
        <div className="account-profile">
          <span className="section-kicker">{user.role.toUpperCase()}</span>
          <h2>{user.nama}</h2>
          <p>{user.email}</p>
        </div>
        <span className="status-pill status-paid">Akun aktif</span>
      </div>
      <div className="account-menu">
        {links.map(([to, title, description]) => (
          <Link className="account-menu-item" to={to} key={to}>
            <span><strong>{title}</strong><small>{description}</small></span>
            <span aria-hidden="true">→</span>
          </Link>
        ))}
        {user.role === 'pembeli' && (
          <Link className="account-menu-item" to="/favorit">
            <span><strong>Produk favorit</strong><small>Daftar produk yang kamu simpan.</small></span>
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
      <p className="demo-notice">
        Profil hanya menampilkan informasi dari sesi masuk. Pengubahan profil
        belum tersedia di backend.
      </p>
      <button
        className="button button-outline account-logout"
        type="button"
        onClick={() => {
          logout();
          navigate('/');
        }}
      >
        Keluar dari akun
      </button>
    </section>
  );
}

export function About() {
  return (
    <section className="page-container about-page">
      <div className="about-hero">
        <span className="section-kicker">TENTANG FITSHOP</span>
        <h1>Gaya seharusnya terasa <em>seperti dirimu.</em></h1>
        <p>
          FitShop adalah konsep marketplace fashion yang membantu pembeli
          menjelajahi gaya, memahami pilihan ukuran, dan berbelanja dengan lebih
          percaya diri.
        </p>
        <Link className="button button-dark" to="/produk">Jelajahi koleksi <span>→</span></Link>
      </div>
      <div className="about-values">
        <article><span>01</span><h2>Pilihan bermakna</h2><p>Koleksi demo menampilkan informasi produk, bahan, dan ukuran secara mudah dibaca.</p></article>
        <article><span>02</span><h2>Fit lebih personal</h2><p>Fit Check memberi preview kamera lokal dan panduan ukuran awal tanpa mengunggah video.</p></article>
        <article><span>03</span><h2>Belanja transparan</h2><p>Prototype membedakan fitur simulasi lokal dari pembayaran dan layanan nyata.</p></article>
      </div>
      <div className="about-contact">
        <div><span className="section-kicker">BUTUH BANTUAN?</span><h2>Kami siap membantu.</h2><p>Untuk demonstrasi proyek ini, hubungi tim FitShop melalui kanal yang disediakan pengelola.</p></div>
        <Link className="text-link" to="/produk">Kembali berbelanja →</Link>
      </div>
    </section>
  );
}
