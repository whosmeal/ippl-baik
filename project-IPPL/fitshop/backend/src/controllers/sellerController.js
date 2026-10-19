const pool = require('../config/db');

// GET /api/seller/profile (Informasi Toko & Saldo Penjual)
exports.getSellerProfile = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const sellerRes = await pool.query(
      `SELECT p.saldo, p.status_verifikasi as status_penjual,
              t.id_toko, t.nama_toko, t.alamat_toko, t.status_verifikasi as status_toko
       FROM penjual p
       LEFT JOIN toko t ON p.id_user = t.id_penjual
       WHERE p.id_user = $1`,
      [userId]
    );

    if (sellerRes.rowCount === 0) {
      return res.status(404).json({ pesan: 'Profil penjual tidak ditemukan' });
    }

    const txRes = await pool.query(
      `SELECT * FROM transaksi_keuangan WHERE id_penjual = $1 ORDER BY tanggal DESC LIMIT 10`,
      [userId]
    );

    res.json({
      toko: sellerRes.rows[0],
      transaksi: txRes.rows,
    });
  } catch (err) {
    console.error('Error getSellerProfile:', err);
    res.status(500).json({ pesan: 'Gagal mengambil profil penjual' });
  }
};

// GET /api/seller/products (Daftar Produk Toko Penjual Aktif)
exports.getMySellerProducts = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const result = await pool.query(
      `SELECT p.* FROM produk p
       JOIN toko t ON p.id_toko = t.id_toko
       WHERE t.id_penjual = $1
       ORDER BY p.id_produk DESC`,
      [userId]
    );
    res.json({ produk: result.rows });
  } catch (err) {
    console.error('Error getMySellerProducts:', err);
    res.status(500).json({ pesan: 'Gagal mengambil produk penjual' });
  }
};
