const pool = require('../config/db');

// GET /api/products (Katalog dengan filter & search)
exports.getAllProducts = async (req, res) => {
  try {
    const { kategori, search, minPrice, maxPrice } = req.query;
    let query = `
      SELECT p.*, t.nama_toko, 
             COALESCE(AVG(u.rating), 0)::numeric(2,1) AS rating_avg,
             COUNT(u.id_ulasan)::int AS total_review
      FROM produk p
      JOIN toko t ON p.id_toko = t.id_toko
      LEFT JOIN ulasan_rating u ON p.id_produk = u.id_produk
      WHERE 1=1
    `;
    const params = [];

    if (kategori && kategori !== 'semua') {
      params.push(kategori);
      query += ` AND LOWER(p.kategori) = LOWER($${params.length})`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (p.nama ILIKE $${params.length} OR p.deskripsi ILIKE $${params.length})`;
    }
    if (minPrice) {
      params.push(minPrice);
      query += ` AND p.harga >= $${params.length}`;
    }
    if (maxPrice) {
      params.push(maxPrice);
      query += ` AND p.harga <= $${params.length}`;
    }

    query += ` GROUP BY p.id_produk, t.nama_toko ORDER BY p.id_produk DESC`;

    const result = await pool.query(query, params);
    res.json({ produk: result.rows });
  } catch (err) {
    console.error('Error getAllProducts:', err);
    res.status(500).json({ pesan: 'Gagal mengambil data produk' });
  }
};

// GET /api/products/:id (Detail Produk beserta Ulasan)
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const prodResult = await pool.query(
      `SELECT p.*, t.nama_toko, t.alamat_toko, t.id_penjual
       FROM produk p
       JOIN toko t ON p.id_toko = t.id_toko
       WHERE p.id_produk = $1`,
      [id]
    );

    if (prodResult.rowCount === 0) {
      return res.status(404).json({ pesan: 'Produk tidak ditemukan' });
    }

    const reviewResult = await pool.query(
      `SELECT u.*, us.nama as nama_pembeli
       FROM ulasan_rating u
       JOIN pembeli pb ON u.id_pembeli = pb.id_user
       JOIN users us ON pb.id_user = us.id_user
       WHERE u.id_produk = $1
       ORDER BY u.tanggal DESC`,
      [id]
    );

    res.json({
      produk: prodResult.rows[0],
      ulasan: reviewResult.rows,
    });
  } catch (err) {
    console.error('Error getProductById:', err);
    res.status(500).json({ pesan: 'Gagal mengambil detail produk' });
  }
};

// POST /api/products (Khusus Penjual: Tambah Produk Baru)
exports.createProduct = async (req, res) => {
  try {
    const { nama, deskripsi, harga, stok, kategori, aset_2d3d } = req.body;
    const userId = req.user.id_user;

    // Ambil toko milik penjual
    const tokoResult = await pool.query('SELECT id_toko FROM toko WHERE id_penjual = $1', [userId]);
    if (tokoResult.rowCount === 0) {
      return res.status(400).json({ pesan: 'Anda belum memiliki toko terdaftar' });
    }
    const id_toko = tokoResult.rows[0].id_toko;

    if (!nama || !harga) {
      return res.status(400).json({ pesan: 'Nama dan harga produk wajib diisi' });
    }

    const result = await pool.query(
      `INSERT INTO produk (id_toko, nama, deskripsi, harga, stok, kategori, aset_2d3d)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id_toko, nama, deskripsi || '', harga, stok || 0, kategori || 'Umum', aset_2d3d || '']
    );

    res.status(201).json({ pesan: 'Produk berhasil ditambahkan', produk: result.rows[0] });
  } catch (err) {
    console.error('Error createProduct:', err);
    res.status(500).json({ pesan: 'Gagal menambahkan produk' });
  }
};

// PUT /api/products/:id (Khusus Penjual: Edit Produk)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, deskripsi, harga, stok, kategori, aset_2d3d } = req.body;
    const userId = req.user.id_user;

    // Verifikasi kepemilikan toko
    const cek = await pool.query(
      `SELECT p.id_produk FROM produk p 
       JOIN toko t ON p.id_toko = t.id_toko 
       WHERE p.id_produk = $1 AND t.id_penjual = $2`,
      [id, userId]
    );

    if (cek.rowCount === 0) {
      return res.status(403).json({ pesan: 'Anda tidak memiliki hak mengubah produk ini' });
    }

    const result = await pool.query(
      `UPDATE produk 
       SET nama = COALESCE($1, nama),
           deskripsi = COALESCE($2, deskripsi),
           harga = COALESCE($3, harga),
           stok = COALESCE($4, stok),
           kategori = COALESCE($5, kategori),
           aset_2d3d = COALESCE($6, aset_2d3d)
       WHERE id_produk = $7
       RETURNING *`,
      [nama, deskripsi, harga, stok, kategori, aset_2d3d, id]
    );

    res.json({ pesan: 'Produk berhasil diperbarui', produk: result.rows[0] });
  } catch (err) {
    console.error('Error updateProduct:', err);
    res.status(500).json({ pesan: 'Gagal memperbarui produk' });
  }
};

// DELETE /api/products/:id (Khusus Penjual: Hapus Produk)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id_user;

    const cek = await pool.query(
      `SELECT p.id_produk FROM produk p 
       JOIN toko t ON p.id_toko = t.id_toko 
       WHERE p.id_produk = $1 AND t.id_penjual = $2`,
      [id, userId]
    );

    if (cek.rowCount === 0) {
      return res.status(403).json({ pesan: 'Anda tidak memiliki hak menghapus produk ini' });
    }

    await pool.query('DELETE FROM produk WHERE id_produk = $1', [id]);
    res.json({ pesan: 'Produk berhasil dihapus' });
  } catch (err) {
    console.error('Error deleteProduct:', err);
    res.status(500).json({ pesan: 'Gagal menghapus produk' });
  }
};
