const pool = require('../config/db');

// GET /api/admin/overview (Statistik Platform)
exports.getOverview = async (req, res) => {
  try {
    const userCount = await pool.query('SELECT COUNT(*)::int as count FROM users');
    const storeCount = await pool.query('SELECT COUNT(*)::int as count FROM toko');
    const pendingStores = await pool.query("SELECT COUNT(*)::int as count FROM toko WHERE status_verifikasi = 'pending'");
    const orderCount = await pool.query('SELECT COUNT(*)::int as count FROM pesanan');
    const gmvRes = await pool.query("SELECT COALESCE(SUM(total_harga), 0)::numeric as gmv FROM pesanan WHERE status != 'dibatalkan'");

    res.json({
      total_pengguna: userCount.rows[0].count,
      total_toko: storeCount.rows[0].count,
      toko_pending: pendingStores.rows[0].count,
      total_pesanan: orderCount.rows[0].count,
      gmv: gmvRes.rows[0].gmv,
    });
  } catch (err) {
    console.error('Error getOverview:', err);
    res.status(500).json({ pesan: 'Gagal mengambil statistik admin' });
  }
};

// GET /api/admin/stores (Daftar Toko & Verifikasi)
exports.getAllStores = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, u.nama as nama_pemilik, u.email as email_pemilik
       FROM toko t
       JOIN penjual p ON t.id_penjual = p.id_user
       JOIN users u ON p.id_user = u.id_user
       ORDER BY t.created_at DESC`
    );
    res.json({ toko: result.rows });
  } catch (err) {
    console.error('Error getAllStores:', err);
    res.status(500).json({ pesan: 'Gagal mengambil daftar toko' });
  }
};

// PUT /api/admin/stores/:id/verify (Verifikasi Toko oleh Admin)
exports.verifyStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'diverifikasi' atau 'ditolak'
    const idAdmin = req.user.id_user;

    if (!['diverifikasi', 'ditolak'].includes(status)) {
      return res.status(400).json({ pesan: 'Status verifikasi tidak valid' });
    }

    const result = await pool.query(
      `UPDATE toko 
       SET status_verifikasi = $1, id_admin = $2
       WHERE id_toko = $3
       RETURNING *`,
      [status, idAdmin, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ pesan: 'Toko tidak ditemukan' });
    }

    // Selaraskan status di tabel penjual
    await pool.query(
      'UPDATE penjual SET status_verifikasi = $1 WHERE id_user = $2',
      [status, result.rows[0].id_penjual]
    );

    res.json({ pesan: `Toko berhasil di-${status}`, toko: result.rows[0] });
  } catch (err) {
    console.error('Error verifyStore:', err);
    res.status(500).json({ pesan: 'Gagal memverifikasi toko' });
  }
};

// GET /api/admin/users (Kelola Semua Pengguna)
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id_user, nama, email, no_telepon, role, status, created_at 
       FROM users 
       ORDER BY id_user ASC`
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error('Error getAllUsers:', err);
    res.status(500).json({ pesan: 'Gagal mengambil data pengguna' });
  }
};

// PUT /api/admin/users/:id/status (Ubah Status Pengguna: aktif/diblokir)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'aktif', 'nonaktif', 'diblokir'

    if (!['aktif', 'nonaktif', 'diblokir'].includes(status)) {
      return res.status(400).json({ pesan: 'Status pengguna tidak valid' });
    }

    const result = await pool.query(
      `UPDATE users SET status = $1 WHERE id_user = $2 RETURNING id_user, nama, email, role, status`,
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ pesan: 'Pengguna tidak ditemukan' });
    }

    res.json({ pesan: 'Status pengguna berhasil diperbarui', user: result.rows[0] });
  } catch (err) {
    console.error('Error updateUserStatus:', err);
    res.status(500).json({ pesan: 'Gagal memperbarui status pengguna' });
  }
};
