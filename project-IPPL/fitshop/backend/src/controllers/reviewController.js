const pool = require('../config/db');

// POST /api/reviews (Tambah Ulasan Produk)
exports.addReview = async (req, res) => {
  try {
    const { id_produk, rating, komentar } = req.body;
    const idPembeli = req.user.id_user;

    if (!id_produk || !rating) {
      return res.status(400).json({ pesan: 'ID produk dan rating wajib diisi' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ pesan: 'Rating harus antara 1 sampai 5' });
    }

    // Pastikan user adalah pembeli
    const pembeliCek = await pool.query('SELECT 1 FROM pembeli WHERE id_user = $1', [idPembeli]);
    if (pembeliCek.rowCount === 0) {
      return res.status(403).json({ pesan: 'Hanya pembeli yang dapat memberikan ulasan' });
    }

    const result = await pool.query(
      `INSERT INTO ulasan_rating (id_produk, id_pembeli, rating, komentar)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id_produk, idPembeli, rating, komentar || '']
    );

    res.status(201).json({ pesan: 'Ulasan berhasil dikirim', ulasan: result.rows[0] });
  } catch (err) {
    console.error('Error addReview:', err);
    res.status(500).json({ pesan: 'Gagal menambahkan ulasan' });
  }
};

// GET /api/reviews/product/:id (Ambil Ulasan Produk Tertentu)
exports.getProductReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT u.*, us.nama as nama_pembeli
       FROM ulasan_rating u
       JOIN pembeli pb ON u.id_pembeli = pb.id_user
       JOIN users us ON pb.id_user = us.id_user
       WHERE u.id_produk = $1
       ORDER BY u.tanggal DESC`,
      [id]
    );
    res.json({ ulasan: result.rows });
  } catch (err) {
    console.error('Error getProductReviews:', err);
    res.status(500).json({ pesan: 'Gagal mengambil ulasan' });
  }
};
