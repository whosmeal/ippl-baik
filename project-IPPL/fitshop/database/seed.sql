-- ============================================================
-- FitShop Seed Data
-- ============================================================

-- Password hash bcrypt untuk 'password123': $2b$10$wB5M.cZJ8.mE8s/tIky66u8p59Uq0aZ1yWz9j8K/15oAkmqGfX41a (atau hash bcrypt valid 10 rounds)
-- Menggunakan hash bcrypt $2b$10$epRsf4Wbf3xbFTzsG878vOQF98.1k179fY8.Ww8jV1nN0hK9eGvy.

-- 1. USERS
INSERT INTO users (id_user, nama, email, password, no_telepon, role, status) VALUES
(1, 'Admin FitShop', 'admin@fitshop.id', '$2b$10$vI8aWBnW3fID.PhXRq54de1r0L7n9H6Uu3n3C2.W2E6d2Zc1Q.qXm', '081200000001', 'admin', 'aktif'),
(2, 'Budi Santoso Penjual', 'budi@tokobudi.com', '$2b$10$vI8aWBnW3fID.PhXRq54de1r0L7n9H6Uu3n3C2.W2E6d2Zc1Q.qXm', '081200000002', 'penjual', 'aktif'),
(3, 'Siti Pembeli', 'siti@gmail.com', '$2b$10$vI8aWBnW3fID.PhXRq54de1r0L7n9H6Uu3n3C2.W2E6d2Zc1Q.qXm', '081200000003', 'pembeli', 'aktif')
ON CONFLICT (id_user) DO NOTHING;

-- 2. ADMIN
INSERT INTO admin (id_user, level_akses) VALUES
(1, 'superadmin')
ON CONFLICT (id_user) DO NOTHING;

-- 3. PENJUAL
INSERT INTO penjual (id_user, saldo, status_verifikasi) VALUES
(2, 500000.00, 'diverifikasi')
ON CONFLICT (id_user) DO NOTHING;

-- 4. PEMBELI
INSERT INTO pembeli (id_user, alamat_pengiriman, riwayat_ukuran) VALUES
(3, 'Jl. Mawar No. 12, Jakarta Selatan', 'M')
ON CONFLICT (id_user) DO NOTHING;

-- 5. TOKO
INSERT INTO toko (id_toko, id_penjual, id_admin, nama_toko, status_verifikasi, alamat_toko, foto_ktp) VALUES
(1, 2, 1, 'Budi Fashion Studio', 'diverifikasi', 'Jl. Kemang Raya No. 45, Jakarta Selatan', 'https://storage.fitshop.id/ktp/budi.jpg')
ON CONFLICT (id_toko) DO NOTHING;

-- 6. PRODUK
INSERT INTO produk (id_produk, id_toko, nama, deskripsi, harga, stok, kategori, aset_2d3d) VALUES
(1, 1, 'Kemeja Linen Santai', 'Kemeja linen ringan dengan potongan santai yang nyaman dipakai dari pagi sampai malam.', 189000.00, 25, 'Atasan', 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85'),
(2, 1, 'Outerwear Everyday', 'Lapisan ringan dengan warna bumi dan detail minimal untuk menemani aktivitas harian.', 329000.00, 15, 'Outerwear', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85'),
(3, 1, 'Basic Tee Essential', 'Kaos esensial berbahan lembut dengan siluet rapi dan mudah dipadukan.', 129000.00, 50, 'Atasan', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85'),
(4, 1, 'Celana Tailored', 'Celana berpotongan lurus yang memberi ruang gerak dan tampilan versatile.', 259000.00, 20, 'Bawahan', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=85')
ON CONFLICT (id_produk) DO NOTHING;

-- 7. DATA_TUBUH_PENGGUNA
INSERT INTO data_tubuh_pengguna (id_scan, id_pembeli, tinggi_badan, berat_badan, ukuran_dada, ukuran_pinggang) VALUES
(1, 3, 168.00, 60.00, 92.00, 78.00)
ON CONFLICT (id_scan) DO NOTHING;

-- 8. SESI_TRYON_AR
INSERT INTO sesi_tryon_ar (id_sesi, id_pembeli, id_scan, waktu_mulai, hasil_visual) VALUES
(1, 3, 1, NOW(), '{"status": "selesai", "fit_score": 95}')
ON CONFLICT (id_sesi) DO NOTHING;

-- 9. SESI_TRYON_PRODUK
INSERT INTO sesi_tryon_produk (id_sesi, id_produk) VALUES
(1, 1),
(1, 4)
ON CONFLICT (id_sesi, id_produk) DO NOTHING;

-- 10. REKOMENDASI_GAYA_AI
INSERT INTO rekomendasi_gaya_ai (id_rekomendasi, id_sesi, tanggal, daftar_produk_rekomendasi) VALUES
(1, 1, NOW(), '[{"id_produk": 1, "alasan": "Cocok dengan bentuk bahu", "rekomendasi_ukuran": "M"}]'::jsonb)
ON CONFLICT (id_rekomendasi) DO NOTHING;

-- 11. PESANAN
INSERT INTO pesanan (id_pesanan, id_pembeli, tanggal_pesan, status, total_harga) VALUES
(1, 3, NOW(), 'diproses', 189000.00)
ON CONFLICT (id_pesanan) DO NOTHING;

-- 12. DETAIL_PESANAN
INSERT INTO detail_pesanan (id_detail, id_pesanan, id_produk, jumlah, subtotal) VALUES
(1, 1, 1, 1, 189000.00)
ON CONFLICT (id_detail) DO NOTHING;

-- 13. PEMBAYARAN
INSERT INTO pembayaran (id_pembayaran, id_pesanan, metode, jumlah_bayar, status_bayar, tanggal_bayar) VALUES
(1, 1, 'Transfer Bank', 189000.00, 'lunas', NOW())
ON CONFLICT (id_pembayaran) DO NOTHING;

-- 14. ULASAN_RATING
INSERT INTO ulasan_rating (id_ulasan, id_produk, id_pembeli, rating, komentar, tanggal) VALUES
(1, 1, 3, 5, 'Bahan sangat adem dan ukuran M pas di badan saya!', NOW())
ON CONFLICT (id_ulasan) DO NOTHING;

-- 15. TRANSAKSI_KEUANGAN
INSERT INTO transaksi_keuangan (id_transaksi, id_penjual, jumlah, jenis, tanggal) VALUES
(1, 2, 189000.00, 'penjualan', NOW())
ON CONFLICT (id_transaksi) DO NOTHING;

-- Reset sequence PostgreSQL
SELECT setval(pg_get_serial_sequence('users', 'id_user'), COALESCE(MAX(id_user), 1)) FROM users;
SELECT setval(pg_get_serial_sequence('toko', 'id_toko'), COALESCE(MAX(id_toko), 1)) FROM toko;
SELECT setval(pg_get_serial_sequence('produk', 'id_produk'), COALESCE(MAX(id_produk), 1)) FROM produk;
SELECT setval(pg_get_serial_sequence('data_tubuh_pengguna', 'id_scan'), COALESCE(MAX(id_scan), 1)) FROM data_tubuh_pengguna;
SELECT setval(pg_get_serial_sequence('sesi_tryon_ar', 'id_sesi'), COALESCE(MAX(id_sesi), 1)) FROM sesi_tryon_ar;
SELECT setval(pg_get_serial_sequence('rekomendasi_gaya_ai', 'id_rekomendasi'), COALESCE(MAX(id_rekomendasi), 1)) FROM rekomendasi_gaya_ai;
SELECT setval(pg_get_serial_sequence('pesanan', 'id_pesanan'), COALESCE(MAX(id_pesanan), 1)) FROM pesanan;
SELECT setval(pg_get_serial_sequence('detail_pesanan', 'id_detail'), COALESCE(MAX(id_detail), 1)) FROM detail_pesanan;
SELECT setval(pg_get_serial_sequence('pembayaran', 'id_pembayaran'), COALESCE(MAX(id_pembayaran), 1)) FROM pembayaran;
SELECT setval(pg_get_serial_sequence('ulasan_rating', 'id_ulasan'), COALESCE(MAX(id_ulasan), 1)) FROM ulasan_rating;
SELECT setval(pg_get_serial_sequence('transaksi_keuangan', 'id_transaksi'), COALESCE(MAX(id_transaksi), 1)) FROM transaksi_keuangan;
