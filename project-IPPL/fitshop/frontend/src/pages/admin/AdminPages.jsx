import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api.js';

const adminLinks = [
  ['/admin', 'Ringkasan', '▦'],
  ['/admin/stores', 'Verifikasi toko', '◫'],
  ['/admin/users', 'Kelola pengguna', '♙'],
  ['/admin/reports', 'Laporan keuangan', '◈'],
];

function AdminShell({ active, eyebrow, title, description, children }) {
  return (
    <section className="page-container admin-page">
      <div className="workspace-heading">
        <div>
          <span className="section-kicker">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <span className="admin-role-badge"><span /> Administrator</span>
      </div>
      <div className="admin-workspace">
        <aside className="workspace-sidebar admin-sidebar">
          <span className="workspace-store">
            <span className="store-avatar admin-avatar">A</span>
            <span><strong>FitShop Admin</strong><small>Panel platform</small></span>
          </span>
          <span className="workspace-nav-label">ADMINISTRASI</span>
          {adminLinks.map(([to, label, icon]) => (
            <Link className={active === to ? 'workspace-nav-active' : ''} to={to} key={to}>
              {icon} <span>{label}</span>
            </Link>
          ))}
          <Link to="/">← <span>Kembali ke toko</span></Link>
          <div className="workspace-sidebar-note">Data operasional hanya tampil setelah API admin tersedia.</div>
        </aside>
        <div className="workspace-content">{children}</div>
      </div>
    </section>
  );
}

function Metric({ label, value, note }) {
  return (
    <div className="metric-card admin-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

function PlaceholderPanel({ title, description }) {
  return (
    <div className="admin-unavailable">
      <span className="admin-empty-icon">◌</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <span className="status-pill">Menunggu integrasi backend</span>
    </div>
  );
}

export function AdminDashboard() {
  const [health, setHealth] = useState({ status: 'checking', message: 'Memeriksa koneksi server…' });

  useEffect(() => {
    let active = true;
    apiRequest('/health')
      .then(() => {
        if (active) setHealth({ status: 'online', message: 'Server API terhubung' });
      })
      .catch((error) => {
        if (!active) return;
        const status = error.message.includes('HTTP ')
          ? 'unhealthy'
          : 'offline';
        setHealth({ status, message: error.message });
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminShell
      active="/admin"
      eyebrow="OVERVIEW PLATFORM"
      title="Ringkasan FitShop."
      description="Pantau kesiapan platform dan akses panel administrasi."
    >
      <div className="admin-status-banner">
        <span className={`admin-status-dot admin-status-${health.status}`} />
        <span><strong>{health.status === 'online' ? 'API aktif' : health.status === 'offline' ? 'API belum tersambung' : health.status === 'unhealthy' ? 'API merespons, pemeriksaan gagal' : 'Memeriksa API'}</strong><small>{health.message}</small></span>
        <span className="admin-api-label">FITSHOP API</span>
      </div>
      <div className="metric-grid admin-metrics">
        <Metric label="Total pengguna" value="—" note="Menunggu endpoint statistik" />
        <Metric label="Toko perlu ditinjau" value="—" note="Menunggu endpoint verifikasi" />
        <Metric label="Transaksi platform" value="—" note="Menunggu integrasi pembayaran" />
        <Metric label="GMV periode ini" value="—" note="Belum ada data finansial" />
      </div>
      <div className="admin-section-heading">
        <div><span className="section-kicker">PENGELOLAAN</span><h2>Pusat administrasi</h2></div>
        <span>4 modul</span>
      </div>
      <div className="admin-module-grid">
        <AdminModule to="/admin/stores" icon="◫" title="Verifikasi toko" description="Tinjau pendaftaran, dokumen, dan status toko." />
        <AdminModule to="/admin/users" icon="♙" title="Pengguna" description="Kelola akun serta status akses pembeli dan penjual." />
        <AdminModule to="/admin/reports" icon="◈" title="Laporan keuangan" description="Pantau transaksi, GMV, dan ringkasan pendapatan." />
        <div className="admin-module-card admin-module-static"><span className="admin-module-icon">⌁</span><span className="section-kicker">KEAMANAN</span><h3>Akses terproteksi</h3><p>Halaman admin dilindungi berdasarkan role akun.</p><span className="admin-module-status">JWT · role admin</span></div>
      </div>
      <div className="admin-notice"><span>i</span><p><strong>Dashboard siap untuk integrasi.</strong> API backend saat ini menyediakan autentikasi dan pemeriksaan health, belum menyediakan data pengguna, toko, atau laporan keuangan.</p></div>
    </AdminShell>
  );
}

function AdminModule({ to, icon, title, description }) {
  return (
    <Link className="admin-module-card" to={to}>
      <span className="admin-module-icon">{icon}</span>
      <span className="section-kicker">BUKA MODUL →</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="admin-module-status">Data menunggu API</span>
    </Link>
  );
}

function AdminSubpage({ active, eyebrow, title, description, emptyTitle, emptyText }) {
  return (
    <AdminShell active={active} eyebrow={eyebrow} title={title} description={description}>
      <div className="admin-subpage-toolbar">
        <div><span className="section-kicker">DATA PLATFORM</span><h2>{title}</h2></div>
        <span className="status-pill">Belum terhubung</span>
      </div>
      <PlaceholderPanel title={emptyTitle} description={emptyText} />
      <p className="admin-subpage-note">Tampilan tabel, pencarian, dan tindakan administratif akan aktif setelah endpoint API yang sesuai tersedia.</p>
    </AdminShell>
  );
}

export function VerifyStore() {
  return <AdminSubpage active="/admin/stores" eyebrow="PENGELOLAAN TOKO" title="Verifikasi toko." description="Tinjau pengajuan dan status toko penjual." emptyTitle="Belum ada data pengajuan" emptyText="API daftar dan verifikasi toko belum tersedia. Status toko tidak ditampilkan sebagai data contoh." />;
}

export function ManageUsers() {
  return <AdminSubpage active="/admin/users" eyebrow="MANAJEMEN AKUN" title="Pengguna platform." description="Tinjau akun dan status akses pembeli maupun penjual." emptyTitle="Data pengguna belum tersedia" emptyText="Backend belum menyediakan API untuk daftar, pencarian, atau pengelolaan pengguna." />;
}

export function FinancialReport() {
  return <AdminSubpage active="/admin/reports" eyebrow="ANALITIK & KEUANGAN" title="Laporan platform." description="Ringkasan transaksi dan performa marketplace." emptyTitle="Belum ada data laporan" emptyText="Laporan menunggu endpoint transaksi dan pembayaran tervalidasi agar angka finansial akurat." />;
}
