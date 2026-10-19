import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { formatPrice, getProduct, products } from '../../data/products.js';
import { findOrder, readOrders, saveOrders, updateOrder } from '../../data/orders.js';
import ProductCard from '../../components/product/ProductCard.jsx';
import { PageHeading } from '../../components/common/Layout.jsx';

const shippingFee = 15000;

export function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState('Semua');
  const [sort, setSort] = useState('featured');
  const query = searchParams.get('q') || '';
  const shownProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = category === 'Semua' || product.category === category;
      const matchesQuery = `${product.name} ${product.category} ${product.color}`
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
    if (sort === 'low') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'high') filtered.sort((a, b) => b.price - a.price);
    return filtered;
  }, [category, query, sort]);

  return (
    <section className="page-container">
      <PageHeading eyebrow="KOLEKSI FITSHOP" title="Pilih yang terasa kamu." description="Temukan potongan favorit dari koleksi pilihan kami." />
      <label className="catalog-search">
        <span aria-hidden="true">⌕</span>
        <input
          aria-label="Cari nama atau kategori produk"
          placeholder="Cari nama atau kategori produk..."
          value={query}
          onChange={(event) => setSearchParams(event.target.value ? { q: event.target.value } : {})}
        />
      </label>
      <div className="catalog-controls">
        <div className="category-tabs" aria-label="Filter kategori">
          {['Semua', 'Atasan', 'Bawahan', 'Outerwear'].map((item) => (
            <button className={category === item ? 'tab-active' : ''} key={item} type="button" onClick={() => setCategory(item)}>{item}</button>
          ))}
        </div>
        <label className="sort-control">Urutkan
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="featured">Pilihan</option>
            <option value="low">Harga terendah</option>
            <option value="high">Harga tertinggi</option>
          </select>
        </label>
      </div>
      <p className="catalog-count">{shownProducts.length} produk ditemukan</p>
      {shownProducts.length ? (
        <div className="product-grid">
          {shownProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="empty-panel"><h2>Produk belum ditemukan</h2><p>Coba kata pencarian atau kategori yang berbeda.</p><button className="button button-dark" type="button" onClick={() => { setCategory('Semua'); setSearchParams({}); }}>Reset pencarian</button></div>
      )}
    </section>
  );
}

export function ProductDetail() {
  const { productId } = useParams();
  const product = getProduct(productId);
  const [size, setSize] = useState('');
  const [notice, setNotice] = useState('');
  const { addItem } = useCart();
  if (!product) return <NotFoundProduct />;

  function add() {
    if (!size) {
      setNotice('Pilih ukuran terlebih dahulu.');
      return;
    }
    addItem(product.id, size);
    setNotice(`${product.name} ukuran ${size} ditambahkan ke keranjang.`);
  }

  return (
    <section className="page-container">
      <div className="breadcrumbs"><Link to="/">Beranda</Link><span>/</span><Link to="/produk">Koleksi</Link><span>/</span><span>{product.name}</span></div>
      <div className="detail-layout">
        <div className="detail-image"><img src={product.image} alt={product.name} /></div>
        <div className="detail-copy">
          <span className="section-kicker">{product.category.toUpperCase()} · {product.color.toUpperCase()}</span>
          <h1>{product.name}</h1>
          <div className="detail-rating">★ {product.rating} <span>· Ulasan pelanggan</span></div>
          <p className="detail-price">{formatPrice(product.price)} {product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}</p>
          <p className="detail-description">{product.description}</p>
          <div className="size-heading"><strong>Pilih ukuran</strong><Link to={`/try-on/${product.id}`}>Butuh bantuan ukuran?</Link></div>
          <div className="size-options">
            {product.sizes.map((item) => <button className={size === item ? 'size-selected' : ''} key={item} type="button" aria-pressed={size === item} onClick={() => { setSize(item); setNotice(''); }}>{item}</button>)}
          </div>
          <button className="button button-dark full-button" type="button" onClick={add}>Tambah ke keranjang <span>→</span></button>
          {notice && <p className={`form-message ${size ? 'success-message' : 'error-message'}`} role="status">{notice}</p>}
          <div className="detail-perks"><span>✓ Pembayaran aman</span><span>✓ Pengiriman ke seluruh Indonesia</span><span>✓ Bantuan ukuran Fit Check</span></div>
        </div>
      </div>
      <section className="related-products"><div className="section-heading"><div><span className="section-kicker">PILIHAN LAIN</span><h2>Lengkapi <em>gayamu.</em></h2></div></div><div className="product-grid">{products.filter((item) => item.id !== product.id).slice(0, 3).map((item) => <ProductCard key={item.id} product={item} />)}</div></section>
    </section>
  );
}

function NotFoundProduct() {
  return <section className="page-container"><div className="empty-panel"><h1>Produk tidak ditemukan</h1><p>Produk ini mungkin sudah tidak tersedia.</p><Link className="button button-dark" to="/produk">Kembali ke koleksi</Link></div></section>;
}

export function Cart() {
  const { items, subtotal, setQuantity, removeItem } = useCart();
  return (
    <section className="page-container">
      <PageHeading eyebrow="TAS BELANJA" title="Keranjangmu." description="Periksa kembali pilihan sebelum melanjutkan." />
      {!items.length ? (
        <div className="empty-panel"><div className="empty-icon">♧</div><h2>Tasmu masih kosong</h2><p>Yuk, temukan sesuatu yang cocok untukmu.</p><Link className="button button-dark" to="/produk">Mulai belanja <span>→</span></Link></div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map(({ product, size, quantity }) => (
              <article className="cart-item" key={`${product.id}-${size}`}>
                <Link to={`/produk/${product.id}`} className="cart-item-image"><img src={product.image} alt={product.name} /></Link>
                <div className="cart-item-details"><Link to={`/produk/${product.id}`}><h2>{product.name}</h2></Link><p>{product.color} · Ukuran {size}</p><strong>{formatPrice(product.price)}</strong>
                  <div className="quantity-control"><button type="button" aria-label="Kurangi jumlah" onClick={() => setQuantity(product.id, size, quantity - 1)}>−</button><span>{quantity}</span><button type="button" aria-label="Tambah jumlah" onClick={() => setQuantity(product.id, size, quantity + 1)}>+</button></div>
                </div>
                <button className="remove-link" type="button" onClick={() => removeItem(product.id, size)}>Hapus</button>
              </article>
            ))}
            <Link className="text-link" to="/produk">← Lanjut belanja</Link>
          </div>
          <OrderSummary subtotal={subtotal} action={<Link className="button button-dark full-button" to="/checkout">Lanjut checkout <span>→</span></Link>} />
        </div>
      )}
    </section>
  );
}

function OrderSummary({ subtotal, action, showShipping = true }) {
  const total = subtotal + (showShipping && subtotal ? shippingFee : 0);
  return (
    <aside className="summary-card">
      <h2>Ringkasan pesanan</h2>
      <div className="summary-line"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
      {showShipping && <div className="summary-line"><span>Pengiriman</span><strong>{subtotal ? formatPrice(shippingFee) : '—'}</strong></div>}
      <div className="summary-line summary-total"><span>Total</span><strong>{formatPrice(total)}</strong></div>
      {action}
      <p className="summary-note">Biaya pengiriman dapat berubah sesuai alamat tujuan.</p>
    </aside>
  );
}

export function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  if (!items.length) {
    return <section className="page-container"><PageHeading eyebrow="CHECKOUT" title="Keranjang kosong." description="Tambahkan produk sebelum checkout." /><Link className="button button-dark" to="/produk">Lihat koleksi</Link></section>;
  }

  function placeOrder(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const order = {
      id: `FS-${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      status: 'Menunggu pembayaran',
      paymentStatus: 'Menunggu pembayaran',
      customer: user.nama,
      address: Object.fromEntries(form.entries()),
      items: items.map(({ product, size, quantity }) => ({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        size,
        quantity,
      })),
      subtotal,
      shipping: shippingFee,
      total: subtotal + shippingFee,
      method: form.get('method'),
    };
    try {
      saveOrders([order, ...readOrders()]);
      clearCart();
      navigate(`/payment/${order.id}`);
    } catch (saveError) {
      console.error('Pesanan lokal gagal disimpan.', saveError);
      setError('Pesanan tidak dapat disimpan di browser ini. Coba periksa penyimpanan lokal.');
    }
  }

  return (
    <section className="page-container">
      <PageHeading eyebrow="CHECKOUT" title="Selesaikan pesanan." description="Isi alamat dan pilih metode pembayaran." />
      <form className="checkout-layout" onSubmit={placeOrder}>
        <div className="form-card">
          <h2>Informasi penerima</h2>
          <div className="form-grid">
            <label>Nama penerima<input name="nama" defaultValue={user.nama} required autoComplete="name" /></label>
            <label>Email<input name="email" type="email" defaultValue={user.email} required autoComplete="email" /></label>
            <label className="field-wide">Nomor telepon<input name="telepon" type="tel" required autoComplete="tel" placeholder="08xxxxxxxxxx" /></label>
            <label className="field-wide">Alamat lengkap<textarea name="alamat" required rows="3" autoComplete="street-address" placeholder="Jalan, nomor rumah, RT/RW" /></label>
            <label>Kota<input name="kota" required autoComplete="address-level2" /></label>
            <label>Kode pos<input name="kode_pos" required inputMode="numeric" autoComplete="postal-code" /></label>
          </div>
          <h2 className="form-section-title">Metode pembayaran</h2>
          <div className="payment-options">
            <label><input type="radio" name="method" value="Transfer bank" defaultChecked /> Transfer bank</label>
            <label><input type="radio" name="method" value="E-wallet" /> E-wallet</label>
            <label><input type="radio" name="method" value="Bayar di tempat" /> Bayar di tempat</label>
          </div>
          <p className="demo-notice">Checkout dan pembayaran saat ini tersimpan sebagai simulasi lokal; belum memproses pembayaran sungguhan.</p>
          {error && <p className="form-message error-message" role="alert">{error}</p>}
        </div>
        <OrderSummary subtotal={subtotal} action={<button className="button button-dark full-button" type="submit">Buat pesanan <span>→</span></button>} />
      </form>
    </section>
  );
}

export function Payment() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(() => findOrder(orderId));
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function confirmPayment() {
    try {
      const updated = updateOrder(orderId, { status: 'Diproses', paymentStatus: 'Lunas (simulasi)' });
      if (!updated) {
        setError('Pesanan tidak ditemukan di penyimpanan lokal.');
        return;
      }
      setOrder(updated);
    } catch (saveError) {
      console.error('Status pembayaran tidak dapat disimpan.', saveError);
      setError('Status pesanan tidak dapat disimpan. Coba lagi.');
    }
  }

  if (!order) return <section className="page-container"><div className="empty-panel"><h1>Pesanan tidak ditemukan</h1><Link className="button button-dark" to="/orders">Lihat pesanan</Link></div></section>;
  return (
    <section className="page-container narrow-page">
      <PageHeading eyebrow="PEMBAYARAN DEMO" title={order.paymentStatus === 'Lunas (simulasi)' ? 'Pesanan dikonfirmasi.' : 'Pesanan dibuat.'} description={`Nomor pesanan ${order.id}`} />
      <div className="payment-panel">
        <span className="payment-status">{order.paymentStatus}</span>
        <div className="summary-line"><span>Metode</span><strong>{order.method}</strong></div>
        <div className="summary-line"><span>Total</span><strong>{formatPrice(order.total)}</strong></div>
        <p>Ini hanya simulasi antarmuka. Tidak ada transaksi atau pembayaran sungguhan yang dilakukan.</p>
        {error && <p className="form-message error-message" role="alert">{error}</p>}
        {order.paymentStatus !== 'Lunas (simulasi)' && <button className="button button-dark full-button" type="button" onClick={confirmPayment}>Simulasikan pembayaran berhasil</button>}
        <button className="button button-outline full-button" type="button" onClick={() => navigate(`/orders/${order.id}`)}>Lihat detail pesanan</button>
      </div>
    </section>
  );
}

export function MyOrders() {
  const orders = readOrders();
  return (
    <section className="page-container">
      <PageHeading eyebrow="AKUN PEMBELI" title="Pesanan saya." description="Pantau status dan detail belanja terakhirmu." />
      {!orders.length ? <div className="empty-panel"><h2>Belum ada pesanan</h2><p>Pesanan yang kamu buat akan muncul di sini.</p><Link className="button button-dark" to="/produk">Jelajahi produk</Link></div> : (
        <div className="order-list">{orders.map((order) => <article className="order-card" key={order.id}><div className="order-card-top"><div><span className="section-kicker">PESANAN {order.id}</span><p>{new Date(order.createdAt).toLocaleString('id-ID')}</p></div><span className={`status-pill ${order.paymentStatus === 'Lunas (simulasi)' ? 'status-paid' : ''}`}>{order.status}</span></div><div className="order-products">{order.items.map((item) => <div className="order-product" key={`${item.productId}-${item.size}`}><img src={item.image} alt="" /><span>{item.name} · {item.size} × {item.quantity}</span><strong>{formatPrice(item.price * item.quantity)}</strong></div>)}</div><div className="order-card-bottom"><strong>Total {formatPrice(order.total)}</strong><Link className="text-link" to={`/orders/${order.id}`}>Detail & lacak →</Link></div></article>)}</div>
      )}
    </section>
  );
}

export function TrackOrder() {
  const { orderId } = useParams();
  const order = findOrder(orderId);
  if (!order) return <section className="page-container"><div className="empty-panel"><h1>Pesanan tidak ditemukan</h1><Link className="button button-dark" to="/orders">Kembali ke pesanan</Link></div></section>;
  const paid = order.paymentStatus === 'Lunas (simulasi)';
  return (
    <section className="page-container narrow-page">
      <PageHeading eyebrow="PELACAKAN PESANAN" title="Status pesanan." description={`Nomor pesanan ${order.id}`} />
      <div className="tracking-card">
        <div className="tracking-step done"><span>✓</span><div><strong>Pesanan dibuat</strong><small>{new Date(order.createdAt).toLocaleString('id-ID')}</small></div></div>
        <div className={`tracking-step ${paid ? 'done' : ''}`}><span>{paid ? '✓' : '2'}</span><div><strong>Pembayaran {paid ? 'dikonfirmasi' : 'menunggu'}</strong><small>{paid ? 'Status simulasi berhasil' : 'Selesaikan pembayaran untuk melanjutkan'}</small></div></div>
        <div className={`tracking-step ${paid ? 'current' : ''}`}><span>3</span><div><strong>Pesanan diproses</strong><small>Informasi pengiriman nyata belum tersedia</small></div></div>
        <p className="demo-notice">Pelacakan ini menggunakan data demo di browser dan tidak terhubung ke ekspedisi.</p>
        <Link className="text-link" to={`/review/${order.id}`}>Tulis ulasan produk →</Link>
      </div>
    </section>
  );
}

export function ReviewPage() {
  const { orderId } = useParams();
  const order = findOrder(orderId);
  const [saved, setSaved] = useState(false);
  const [rating, setRating] = useState('5');
  if (!order) return <section className="page-container"><div className="empty-panel"><h1>Pesanan tidak ditemukan</h1><Link className="button button-dark" to="/orders">Kembali ke pesanan</Link></div></section>;
  function submitReview(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const reviews = JSON.parse(localStorage.getItem('fitshop-reviews') || '[]');
    reviews.unshift({ orderId, rating, message: form.get('ulasan'), createdAt: new Date().toISOString() });
    localStorage.setItem('fitshop-reviews', JSON.stringify(reviews));
    setSaved(true);
  }
  return <section className="page-container narrow-page"><PageHeading eyebrow="BAGIKAN PENGALAMAN" title="Bagaimana fit-nya?" description={`Ulasan untuk pesanan ${order.id} · tersimpan di browser demo.`} />
    {saved ? <div className="empty-panel"><h2>Terima kasih atas ulasanmu!</h2><Link className="button button-dark" to="/orders">Kembali ke pesanan</Link></div> : <form className="form-card review-form" onSubmit={submitReview}><label>Rating<select value={rating} onChange={(event) => setRating(event.target.value)}>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} bintang</option>)}</select></label><label>Ceritakan pengalamanmu<textarea name="ulasan" rows="5" required minLength="8" placeholder="Bagikan detail ukuran, bahan, dan pengalaman belanjamu..." /></label><button className="button button-dark" type="submit">Kirim ulasan</button></form>}
  </section>;
}

export function TryOn() {
  const { productId } = useParams();
  const product = getProduct(productId) || products[0];
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraError, setCameraError] = useState('');
  const [cameraOn, setCameraOn] = useState(false);
  const [size, setSize] = useState('');
  const [height, setHeight] = useState('');

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

  async function startCamera() {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Browser ini tidak mendukung akses kamera. Coba gunakan browser modern melalui localhost atau HTTPS.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch (error) {
      console.error('Akses kamera Fit Check gagal.', error);
      setCameraError(error.name === 'NotAllowedError' ? 'Izin kamera ditolak. Izinkan akses kamera di pengaturan browser lalu coba lagi.' : 'Kamera tidak dapat dibuka. Pastikan kamera tersedia dan tidak sedang dipakai aplikasi lain.');
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  const estimatedSize = Number(height) > 0
    ? Number(height) < 158 ? 'S'
      : Number(height) < 170 ? 'M'
        : Number(height) < 180 ? 'L' : 'XL'
    : '';

  return (
    <section className="page-container">
      <PageHeading eyebrow="FIT CHECK" title="Coba sebelum memilih." description="Izinkan kamera untuk melihat preview. Fitur overlay pakaian 3D dan pengukuran otomatis belum tersedia di demo ini." />
      <div className="tryon-layout">
        <div className="camera-panel">
          <div className={`camera-view${cameraOn ? ' camera-active' : ''}`}>
            <video ref={videoRef} autoPlay muted playsInline aria-label="Preview kamera" />
            {!cameraOn && <div className="camera-placeholder"><span>◉</span><strong>Preview kamera</strong><small>Kameramu tidak direkam atau diunggah.</small></div>}
            {cameraOn && <div className="camera-guide" aria-hidden="true"><span /></div>}
          </div>
          {cameraError && <p className="form-message error-message" role="alert">{cameraError}</p>}
          <div className="camera-actions">{cameraOn ? <button className="button button-outline" type="button" onClick={stopCamera}>Matikan kamera</button> : <button className="button button-dark" type="button" onClick={startCamera}>Izinkan kamera</button>}<Link className="text-link" to={`/produk/${product.id}`}>Kembali ke produk</Link></div>
        </div>
        <aside className="fit-guide form-card">
          <span className="section-kicker">PANDUAN UKURAN</span>
          <h2>{product.name}</h2>
          <p className="detail-price">{formatPrice(product.price)}</p>
          <label>Tinggi badan (cm)<input type="number" min="100" max="230" value={height} onChange={(event) => setHeight(event.target.value)} placeholder="Contoh: 168" /></label>
          {estimatedSize && <div className="size-estimate"><span>Estimasi awal</span><strong>Ukuran {estimatedSize}</strong><small>Perkiraan berdasarkan tinggi saja, bukan rekomendasi ukuran akurat. Periksa tabel ukuran penjual.</small></div>}
          <label>Pilih ukuran untuk keranjang<select value={size} onChange={(event) => setSize(event.target.value)}><option value="">Pilih ukuran</option>{product.sizes.map((item) => <option key={item}>{item}</option>)}</select></label>
          <AddToCartButton product={product} size={size} />
          <p className="demo-notice">Preview kamera hanya menampilkan video langsung. Tidak ada analisis pose atau visualisasi pakaian.</p>
        </aside>
      </div>
    </section>
  );
}

function AddToCartButton({ product, size }) {
  const { addItem } = useCart();
  const [message, setMessage] = useState('');
  return <><button className="button button-dark full-button" type="button" onClick={() => {
    if (!size) { setMessage('Pilih ukuran untuk melanjutkan.'); return; }
    addItem(product.id, size);
    setMessage(`Ukuran ${size} ditambahkan ke keranjang.`);
  }}>Tambah ukuran pilihan ke tas</button>{message && <p className="form-message success-message" role="status">{message}</p>}</>;
}
