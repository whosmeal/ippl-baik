-- ============================================================
-- FitShop Database Schema
-- Sesuai dengan Spesifikasi ERD & Hubungan Relasi
-- ============================================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
  id_user    SERIAL PRIMARY KEY,
  nama       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  no_telepon VARCHAR(20),
  role       VARCHAR(10) NOT NULL CHECK (role IN ('pembeli', 'penjual', 'admin')),
  status     VARCHAR(10) NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif', 'diblokir')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PEMBELI (Generalization: id_user sebagai PK sekaligus FK ke users)
CREATE TABLE IF NOT EXISTS pembeli (
  id_user           INT PRIMARY KEY REFERENCES users(id_user) ON DELETE CASCADE,
  alamat_pengiriman TEXT,
  riwayat_ukuran    TEXT
);

-- 3. PENJUAL (Generalization: id_user sebagai PK sekaligus FK ke users)
CREATE TABLE IF NOT EXISTS penjual (
  id_user           INT PRIMARY KEY REFERENCES users(id_user) ON DELETE CASCADE,
  saldo             NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (saldo >= 0),
  status_verifikasi VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status_verifikasi IN ('pending', 'diverifikasi', 'ditolak'))
);

-- 4. ADMIN (Generalization: id_user sebagai PK sekaligus FK ke users)
CREATE TABLE IF NOT EXISTS admin (
  id_user     INT PRIMARY KEY REFERENCES users(id_user) ON DELETE CASCADE,
  level_akses VARCHAR(50) NOT NULL DEFAULT 'superadmin'
);

-- 5. TOKO (1 penjual = 1 toko, id_admin opsional sebagai pemverifikasi)
CREATE TABLE IF NOT EXISTS toko (
  id_toko           SERIAL PRIMARY KEY,
  id_penjual        INT UNIQUE NOT NULL REFERENCES penjual(id_user) ON DELETE CASCADE,
  id_admin          INT REFERENCES admin(id_user) ON DELETE SET NULL,
  nama_toko         VARCHAR(100) NOT NULL,
  status_verifikasi VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status_verifikasi IN ('pending', 'diverifikasi', 'ditolak')),
  alamat_toko       TEXT,
  foto_ktp          VARCHAR(255),
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PRODUK (Milik Toko)
CREATE TABLE IF NOT EXISTS produk (
  id_produk SERIAL PRIMARY KEY,
  id_toko   INT NOT NULL REFERENCES toko(id_toko) ON DELETE CASCADE,
  nama      VARCHAR(150) NOT NULL,
  deskripsi TEXT,
  harga     NUMERIC(12, 2) NOT NULL CHECK (harga >= 0),
  stok      INT NOT NULL DEFAULT 0 CHECK (stok >= 0),
  kategori  VARCHAR(50),
  aset_2d3d VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. DATA_TUBUH_PENGGUNA (1 pembeli = 1 data tubuh)
CREATE TABLE IF NOT EXISTS data_tubuh_pengguna (
  id_scan         SERIAL PRIMARY KEY,
  id_pembeli      INT UNIQUE NOT NULL REFERENCES pembeli(id_user) ON DELETE CASCADE,
  tinggi_badan    NUMERIC(5, 2) NOT NULL, -- dalam cm (misal 175.50)
  berat_badan     NUMERIC(5, 2),          -- dalam kg (misal 65.00)
  ukuran_dada     NUMERIC(5, 2),          -- dalam cm
  ukuran_pinggang NUMERIC(5, 2),          -- dalam cm
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. SESI_TRYON_AR
CREATE TABLE IF NOT EXISTS sesi_tryon_ar (
  id_sesi      SERIAL PRIMARY KEY,
  id_pembeli   INT NOT NULL REFERENCES pembeli(id_user) ON DELETE CASCADE,
  id_scan      INT REFERENCES data_tubuh_pengguna(id_scan) ON DELETE SET NULL,
  waktu_mulai  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hasil_visual TEXT
);

-- 9. SESI_TRYON_PRODUK (Tabel Penghubung Many-to-Many Sesi Tryon & Produk)
CREATE TABLE IF NOT EXISTS sesi_tryon_produk (
  id_sesi   INT NOT NULL REFERENCES sesi_tryon_ar(id_sesi) ON DELETE CASCADE,
  id_produk INT NOT NULL REFERENCES produk(id_produk) ON DELETE CASCADE,
  PRIMARY KEY (id_sesi, id_produk)
);

-- 10. REKOMENDASI_GAYA_AI
CREATE TABLE IF NOT EXISTS rekomendasi_gaya_ai (
  id_rekomendasi            SERIAL PRIMARY KEY,
  id_sesi                   INT NOT NULL REFERENCES sesi_tryon_ar(id_sesi) ON DELETE CASCADE,
  tanggal                   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  daftar_produk_rekomendasi JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 11. PESANAN
CREATE TABLE IF NOT EXISTS pesanan (
  id_pesanan    SERIAL PRIMARY KEY,
  id_pembeli    INT NOT NULL REFERENCES pembeli(id_user) ON DELETE RESTRICT,
  tanggal_pesan TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status        VARCHAR(20) NOT NULL DEFAULT 'menunggu_pembayaran' 
                CHECK (status IN ('menunggu_pembayaran', 'diproses', 'dikirim', 'selesai', 'dibatalkan')),
  total_harga   NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (total_harga >= 0)
);

-- 12. DETAIL_PESANAN
CREATE TABLE IF NOT EXISTS detail_pesanan (
  id_detail  SERIAL PRIMARY KEY,
  id_pesanan INT NOT NULL REFERENCES pesanan(id_pesanan) ON DELETE CASCADE,
  id_produk  INT NOT NULL REFERENCES produk(id_produk) ON DELETE RESTRICT,
  jumlah     INT NOT NULL DEFAULT 1 CHECK (jumlah > 0),
  subtotal   NUMERIC(14, 2) NOT NULL CHECK (subtotal >= 0)
);

-- 13. PEMBAYARAN (1 pesanan = 1 pembayaran)
CREATE TABLE IF NOT EXISTS pembayaran (
  id_pembayaran SERIAL PRIMARY KEY,
  id_pesanan    INT UNIQUE NOT NULL REFERENCES pesanan(id_pesanan) ON DELETE CASCADE,
  metode        VARCHAR(50) NOT NULL,
  jumlah_bayar  NUMERIC(14, 2) NOT NULL CHECK (jumlah_bayar >= 0),
  status_bayar  VARCHAR(20) NOT NULL DEFAULT 'menunggu_verifikasi' 
                CHECK (status_bayar IN ('menunggu_verifikasi', 'lunas', 'gagal', 'kadaluwarsa')),
  tanggal_bayar TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. ULASAN_RATING
CREATE TABLE IF NOT EXISTS ulasan_rating (
  id_ulasan  SERIAL PRIMARY KEY,
  id_produk  INT NOT NULL REFERENCES produk(id_produk) ON DELETE CASCADE,
  id_pembeli INT NOT NULL REFERENCES pembeli(id_user) ON DELETE CASCADE,
  rating     INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  komentar   TEXT,
  tanggal    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. TRANSAKSI_KEUANGAN (Riwayat Finansial Penjual)
CREATE TABLE IF NOT EXISTS transaksi_keuangan (
  id_transaksi SERIAL PRIMARY KEY,
  id_penjual   INT NOT NULL REFERENCES penjual(id_user) ON DELETE CASCADE,
  jumlah       NUMERIC(14, 2) NOT NULL,
  jenis        VARCHAR(20) NOT NULL CHECK (jenis IN ('penjualan', 'penarikan', 'refund', 'potongan_admin')),
  tanggal      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index performa untuk Foreign Keys dan kueri umum
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_produk_toko ON produk(id_toko);
CREATE INDEX IF NOT EXISTS idx_pesanan_pembeli ON pesanan(id_pembeli);
CREATE INDEX IF NOT EXISTS idx_detail_pesanan_pesanan ON detail_pesanan(id_pesanan);
CREATE INDEX IF NOT EXISTS idx_detail_pesanan_produk ON detail_pesanan(id_produk);
CREATE INDEX IF NOT EXISTS idx_ulasan_produk ON ulasan_rating(id_produk);
CREATE INDEX IF NOT EXISTS idx_transaksi_keuangan_penjual ON transaksi_keuangan(id_penjual);
