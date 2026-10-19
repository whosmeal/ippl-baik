import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeading } from '../../components/common/Layout.jsx';
import { formatPrice } from '../../data/products.js';
import { readOrders } from '../../data/orders.js';

const productKey = 'fitshop-seller-products';

function readSellerProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem(productKey) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.error('Data produk penjual tidak dapat dibaca.', error);
    return [];
  }
}

export function SellerDashboard() {
  const products = readSellerProducts();
  const orders = readOrders();
  const recentOrders = orders.slice(0, 4);
  return (
    <section className="page-container seller-dashboard-page">
      <div className="workspace-heading">
        <div><span className="section-kicker">RUANG PENJUAL</span><h1>Dashboard tokomu.</h1><p>Ringkasan aktivitas untuk membantu mengelola tokomu.</p></div>
        <Link className="button button-dark" to="/seller/products/new">+ Tambah produk</Link>
      </div>
      <div className="seller-workspace">
        <aside className="workspace-sidebar">
          <span className="workspace-store"><span className="store-avatar">F</span><span><strong>Toko FitShop</strong><small>Mode demo lokal</small></span></span>
          <span className="workspace-nav-label">TOKO SAYA</span>
          <Link className="workspace-nav-active" to="/seller">▦ <span>Ringkasan</span></Link>
          <Link to="/seller/products">◫ <span>Produk saya</span><b>{products.length}</b></Link>
          <Link to="/seller/orders">▤ <span>Pesanan masuk</span><b>{orders.length}</b></Link>
          <Link to="/seller/assets">▧ <span>Aset produk</span></Link>
          <Link to="/seller/balance">◈ <span>Saldo toko</span></Link>
          <div className="workspace-sidebar-note">Toko belum terhubung ke sistem marketplace.</div>
        </aside>
        <div className="workspace-content">
          <div className="metric-grid seller-metrics">
            <Metric label="Produk draft" value={products.length} />
            <Metric label="Pesanan demo" value={orders.length} />
            <Metric label="Saldo tersedia" value="—" />
            <Metric label="Status toko" value="Draft" />
          </div>
          <div className="seller-dashboard-grid">
            <section className="dashboard-card seller-chart-card">
              <div className="dashboard-card-heading"><div><span className="section-kicker">PERFORMA TOKO</span><h2>Ringkasan penjualan</h2></div><span className="status-pill">Belum ada data</span></div>
              <div className="empty-chart" aria-label="Grafik penjualan belum tersedia">
                <div className="chart-grid"><span /><span /><span /><span /></div>
                <div className="chart-empty-message"><strong>Data penjualan belum tersedia</strong><small>Grafik akan muncul setelah data transaksi tersambung.</small></div>
                <div className="chart-months"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>Mei</span><span>Jun</span></div>
              </div>
            </section>
            <section className="dashboard-card seller-quick-card">
              <div className="dashboard-card-heading"><div><span className="section-kicker">AKSES CEPAT</span><h2>Kelola tokomu</h2></div></div>
              <Link className="quick-action-row" to="/seller/products/new"><span className="quick-action-icon">＋</span><span><strong>Tambah produk</strong><small>Buat draft produk baru</small></span><b>→</b></Link>
              <Link className="quick-action-row" to="/seller/assets"><span className="quick-action-icon">▧</span><span><strong>Kelola aset</strong><small>Foto dan model 3D</small></span><b>→</b></Link>
              <Link className="quick-action-row" to="/seller/balance"><span className="quick-action-icon">◈</span><span><strong>Ringkasan saldo</strong><small>Lihat status keuangan</small></span><b>→</b></Link>
            </section>
            <section className="dashboard-card seller-orders-card">
              <div className="dashboard-card-heading"><div><span className="section-kicker">AKTIVITAS</span><h2>Pesanan terbaru</h2></div><Link className="text-link" to="/seller/orders">Lihat semua →</Link></div>
              {recentOrders.length ? <div className="seller-recent-orders">{recentOrders.map((order) => <div className="seller-recent-order" key={order.id}><span className="order-initial">{order.customer?.charAt(0) || 'P'}</span><span><strong>{order.customer || 'Pembeli demo'}</strong><small>{order.id} · {order.items.length} item</small></span><span className="seller-order-total">{formatPrice(order.total)}<small>{order.status}</small></span></div>)}</div> : <div className="seller-empty-orders"><span>▤</span><strong>Belum ada pesanan</strong><small>Pesanan yang tersedia akan muncul di sini.</small></div>}
            </section>
            <section className="seller-onboarding">
              <div><span className="section-kicker">LANGKAH SELANJUTNYA</span><h2>Siapkan tokomu untuk pembeli.</h2><p>Lengkapi informasi produk dan aset agar katalog siap ditinjau.</p></div>
              <Link className="button button-outline" to="/seller/products">Kelola produk <span>→</span></Link>
            </section>
          </div>
          <p className="demo-notice">Data produk dan pesanan di panel ini masih lokal di browser. Saldo, penjualan, verifikasi, dan publikasi belum tersambung ke backend.</p>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return <div className="metric-card"><span>{label}</span><strong>{value}</strong></div>;
}

export function SellerProducts() {
  const products = readSellerProducts();
  function remove(id) {
    const remaining = products.filter((product) => product.id !== id);
    localStorage.setItem(productKey, JSON.stringify(remaining));
    window.location.reload();
  }
  return <section className="page-container"><PageHeading eyebrow="KATALOG TOKO" title="Produk saya." description="Produk yang dibuat di sini hanya tersimpan di browser ini." action={<div className="form-actions"><Link className="button button-outline" to="/seller/assets">Aset produk</Link><Link className="button button-dark" to="/seller/products/new">+ Tambah produk</Link></div>} />
    {products.length ? <div className="seller-table-wrap"><table className="seller-table"><thead><tr><th>Produk</th><th>Kategori</th><th>Harga</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td>{product.name}</td><td>{product.category}</td><td>{formatPrice(Number(product.price))}</td><td><span className="status-pill">Draft</span></td><td><button className="remove-link" type="button" onClick={() => remove(product.id)}>Hapus</button></td></tr>)}</tbody></table></div> : <div className="empty-panel"><h2>Belum ada produk</h2><p>Mulai dengan menambahkan produk pertama tokomu.</p><Link className="button button-dark" to="/seller/products/new">Tambah produk</Link></div>}
  </section>;
}

export function SellerProductForm() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const product = { id: `local-${Date.now()}`, name: form.get('nama'), category: form.get('kategori'), price: Number(form.get('harga')), description: form.get('deskripsi'), createdAt: new Date().toISOString() };
    try {
      localStorage.setItem(productKey, JSON.stringify([product, ...readSellerProducts()]));
      setMessage('Produk tersimpan sebagai draft lokal.');
      event.currentTarget.reset();
    } catch (saveError) {
      console.error('Draft produk tidak dapat disimpan.', saveError);
      setError('Produk tidak dapat disimpan di browser ini.');
    }
  }
  return <section className="page-container narrow-page"><PageHeading eyebrow="KATALOG TOKO" title="Tambah produk." description="Informasi akan disimpan sebagai draft lokal, belum diterbitkan ke marketplace." />
    <form className="form-card" onSubmit={submit}><label>Nama produk<input name="nama" required maxLength="120" /></label><label>Kategori<select name="kategori"><option>Atasan</option><option>Bawahan</option><option>Outerwear</option><option>Aksesori</option></select></label><label>Harga (Rp)<input name="harga" type="number" min="1" required /></label><label>Deskripsi<textarea name="deskripsi" rows="4" required /></label><p className="demo-notice">Penerbitan produk, upload gambar, stok, dan verifikasi toko memerlukan endpoint backend yang belum tersedia.</p>{error && <p className="form-message error-message" role="alert">{error}</p>}{message && <p className="form-message success-message" role="status">{message}</p>}<div className="form-actions"><Link className="button button-outline" to="/seller/products">Kembali</Link><button className="button button-dark" type="submit">Simpan draft</button></div></form>
  </section>;
}

export function SellerAssets() {
  const [files, setFiles] = useState([]);
  const allowed = /\.(glb|gltf|obj|png|jpe?g|webp)$/i;
  function chooseFiles(event) {
    const selected = [...event.target.files];
    const invalid = selected.filter((file) => !allowed.test(file.name));
    if (invalid.length) {
      event.target.setCustomValidity(`Format tidak didukung: ${invalid.map((file) => file.name).join(', ')}`);
      event.target.reportValidity();
    } else {
      event.target.setCustomValidity('');
      setFiles(selected.map((file) => ({ name: file.name, size: file.size })));
    }
  }
  return <section className="page-container narrow-page"><PageHeading eyebrow="ASET PRODUK" title="Aset 2D / 3D." description="Pilih gambar atau model 3D untuk memeriksa nama file. Upload server belum tersedia." />
    <div className="form-card"><label className="upload-drop">Pilih gambar atau model<input type="file" accept=".glb,.gltf,.obj,.png,.jpg,.jpeg,.webp" multiple onChange={chooseFiles} /><small>Format: GLB, GLTF, OBJ, PNG, JPG, WEBP</small></label>{files.length > 0 && <ul className="file-list">{files.map((file) => <li key={file.name}>{file.name}<span>{Math.ceil(file.size / 1024)} KB</span></li>)}</ul>}<p className="demo-notice">File tidak diunggah atau disimpan. Integrasi penyimpanan aset harus ditambahkan di backend.</p></div>
  </section>;
}

export function SellerOrders() {
  const orders = readOrders();
  return <section className="page-container"><PageHeading eyebrow="PESANAN TOKO" title="Pesanan masuk." description="Daftar ini membaca pesanan demo yang tersimpan pada browser." />
    {!orders.length ? <div className="empty-panel"><h2>Belum ada pesanan</h2><p>Pesanan pembeli akan ditampilkan setelah API toko tersedia.</p></div> : <div className="order-list">{orders.map((order) => <article className="order-card" key={order.id}><div className="order-card-top"><div><span className="section-kicker">{order.id}</span><p>{order.customer} · {new Date(order.createdAt).toLocaleDateString('id-ID')}</p></div><span className="status-pill">{order.status}</span></div><div className="order-card-bottom"><span>{order.items.length} item</span><strong>{formatPrice(order.total)}</strong></div></article>)}</div>}
    <p className="demo-notice">Pesanan belum difilter per toko dan status pengiriman tidak terhubung ke layanan kurir.</p>
  </section>;
}

export function SellerBalance() {
  return <section className="page-container"><PageHeading eyebrow="KEUANGAN TOKO" title="Ringkasan saldo." description="Ringkasan finansial untuk membantu memahami tampilan dashboard." />
    <div className="metric-grid"><Metric label="Saldo tersedia" value="Rp0" /><Metric label="Dalam proses" value="Rp0" /><Metric label="Pencairan" value="—" /></div>
    <div className="dashboard-card"><span className="section-kicker">BELUM TERHUBUNG</span><h2>Belum ada transaksi penjualan</h2><p>Saldo, pencairan, GMV, dan riwayat transaksi memerlukan data pembayaran yang tervalidasi dari backend.</p></div>
  </section>;
}
