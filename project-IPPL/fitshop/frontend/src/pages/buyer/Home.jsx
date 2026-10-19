import { Link } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard.jsx';
import { products } from '../../data/products.js';

export default function Home() {
  return (
    <>
      <section className="hero" id="koleksi">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" />STYLE YANG PAS, MULAI DARI SINI</div>
          <h1>Pakai yang<br /><em>paling kamu.</em></h1>
          <p>Temukan potongan yang nyaman, gaya yang terasa personal, dan ukuran yang benar-benar pas untukmu.</p>
          <div className="hero-actions">
            <Link className="button button-dark" to="/produk">Jelajahi koleksi <span>→</span></Link>
            <Link className="text-link" to="/try-on/linen-shirt">Kenali ukuranku</Link>
          </div>
          <div className="hero-proof">
            <div className="avatar-stack" aria-hidden="true"><span>R</span><span>A</span><span>D</span></div>
            <p><strong>2.000+</strong> gaya sudah menemukan pemiliknya</p>
          </div>
        </div>
        <div className="hero-visual">
          <img
            className="hero-image"
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1500&q=90"
            alt="Dua teman menikmati gaya sehari-hari di kota"
          />
          <div className="hero-image-shade" />
          <div className="hero-note"><span className="note-icon">✦</span><span><strong>Made for your fit</strong><small>Nyaman dari ukuran pertama</small></span></div>
          <div className="hero-index"><span>01</span><i /><span>03</span></div>
        </div>
        <div className="hero-side-label">PILIH GAYA · TEMUKAN FIT · JADI DIRI SENDIRI</div>
      </section>

      <section className="benefits" aria-label="Keunggulan FitShop">
        <div><span className="benefit-number">01</span><p><strong>Fit yang lebih personal</strong><small>Rekomendasi ukuran untukmu</small></p></div>
        <div><span className="benefit-number">02</span><p><strong>Pilihan terkurasi</strong><small>Temukan yang cocok dengan gayamu</small></p></div>
        <div><span className="benefit-number">03</span><p><strong>Belanja tanpa ragu</strong><small>Deskripsi jelas, pengalaman mudah</small></p></div>
      </section>

      <section className="product-section" id="produk">
        <div className="section-heading">
          <div><span className="section-kicker">PILIHAN MINGGU INI</span><h2>Temukan <em>favoritmu.</em></h2></div>
          <Link className="all-products-link" to="/produk">Lihat semua produk <span>→</span></Link>
        </div>
        <div className="product-grid">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="fit-banner" id="fit-check">
        <div className="fit-banner-mark">✦</div>
        <div><span className="section-kicker">COBA SEBELUM MEMILIH</span><h2>Ukuran pas, hati <em>lebih tenang.</em></h2><p>Lihat panduan ukuran dan coba pengalaman kamera Fit Check.</p></div>
        <Link className="button button-light" to="/try-on/linen-shirt">Mulai Fit Check <span>→</span></Link>
      </section>
    </>
  );
}