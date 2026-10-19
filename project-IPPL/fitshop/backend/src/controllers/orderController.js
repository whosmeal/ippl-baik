const pool = require('../config/db');

// POST /api/orders (Buat Pesanan Baru dari Keranjang)
exports.createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    const { items, alamat_pengiriman } = req.body;
    const idPembeli = req.user.id_user;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ pesan: 'Item keranjang belanja tidak boleh kosong' });
    }

    await client.query('BEGIN');

    // Update alamat jika disediakan
    if (alamat_pengiriman) {
      await client.query(
        'UPDATE pembeli SET alamat_pengiriman = $1 WHERE id_user = $2',
        [alamat_pengiriman, idPembeli]
      );
    }

    // Hitung total harga & validasi ketersediaan produk
    let totalHarga = 0;
    const detailToInsert = [];

    for (const item of items) {
      const prodRes = await client.query(
        'SELECT id_produk, harga, stok, nama FROM produk WHERE id_produk = $1',
        [item.id_produk]
      );

      if (prodRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ pesan: `Produk dengan ID ${item.id_produk} tidak ditemukan` });
      }

      const prod = prodRes.rows[0];
      const jumlah = Number(item.jumlah) || 1;

      if (prod.stok < jumlah) {
        await client.query('ROLLBACK');
        return res.status(400).json({ pesan: `Stok produk ${prod.nama} tidak mencukupi (sisa ${prod.stok})` });
      }

      const subtotal = Number(prod.harga) * jumlah;
      totalHarga += subtotal;

      detailToInsert.push({
        id_produk: prod.id_produk,
        jumlah,
        subtotal,
      });

      // Kurangi stok
      await client.query(
        'UPDATE produk SET stok = stok - $1 WHERE id_produk = $2',
        [jumlah, prod.id_produk]
      );
    }

    // Insert pesanan
    const orderRes = await client.query(
      `INSERT INTO pesanan (id_pembeli, status, total_harga)
       VALUES ($1, 'menunggu_pembayaran', $2)
       RETURNING *`,
      [idPembeli, totalHarga]
    );
    const order = orderRes.rows[0];

    // Insert detail_pesanan
    for (const d of detailToInsert) {
      await client.query(
        `INSERT INTO detail_pesanan (id_pesanan, id_produk, jumlah, subtotal)
         VALUES ($1, $2, $3, $4)`,
        [order.id_pesanan, d.id_produk, d.jumlah, d.subtotal]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ pesan: 'Pesanan berhasil dibuat', pesanan: order });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error createOrder:', err);
    res.status(500).json({ pesan: 'Gagal membuat pesanan' });
  } finally {
    client.release();
  }
};

// GET /api/orders (Riwayat Pesanan Pembeli atau Toko)
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const role = req.user.role;

    let query = '';
    let params = [userId];

    if (role === 'pembeli') {
      query = `
        SELECT p.*, pm.status_bayar, pm.metode,
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'id_detail', dp.id_detail,
                   'id_produk', pr.id_produk,
                   'nama_produk', pr.nama,
                   'harga', pr.harga,
                   'jumlah', dp.jumlah,
                   'subtotal', dp.subtotal,
                   'gambar', pr.aset_2d3d
                 )
               ) AS items
        FROM pesanan p
        LEFT JOIN pembayaran pm ON p.id_pesanan = pm.id_pesanan
        JOIN detail_pesanan dp ON p.id_pesanan = dp.id_pesanan
        JOIN produk pr ON dp.id_produk = pr.id_produk
        WHERE p.id_pembeli = $1
        GROUP BY p.id_pesanan, pm.id_pembayaran
        ORDER BY p.tanggal_pesan DESC
      `;
    } else if (role === 'penjual') {
      query = `
        SELECT p.*, pm.status_bayar, u.nama as nama_pembeli,
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'id_detail', dp.id_detail,
                   'id_produk', pr.id_produk,
                   'nama_produk', pr.nama,
                   'harga', pr.harga,
                   'jumlah', dp.jumlah,
                   'subtotal', dp.subtotal
                 )
               ) AS items
        FROM pesanan p
        JOIN detail_pesanan dp ON p.id_pesanan = dp.id_pesanan
        JOIN produk pr ON dp.id_produk = pr.id_produk
        JOIN toko t ON pr.id_toko = t.id_toko
        JOIN users u ON p.id_pembeli = u.id_user
        LEFT JOIN pembayaran pm ON p.id_pesanan = pm.id_pesanan
        WHERE t.id_penjual = $1
        GROUP BY p.id_pesanan, pm.id_pembayaran, u.nama
        ORDER BY p.tanggal_pesan DESC
      `;
    } else {
      // Admin: semua pesanan
      query = `
        SELECT p.*, pm.status_bayar, u.nama as nama_pembeli
        FROM pesanan p
        JOIN users u ON p.id_pembeli = u.id_user
        LEFT JOIN pembayaran pm ON p.id_pesanan = pm.id_pesanan
        ORDER BY p.tanggal_pesan DESC
      `;
      params = [];
    }

    const result = await pool.query(query, params);
    res.json({ pesanan: result.rows });
  } catch (err) {
    console.error('Error getMyOrders:', err);
    res.status(500).json({ pesan: 'Gagal mengambil data pesanan' });
  }
};

// GET /api/orders/:id (Detail Pesanan Spesifik)
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id_user;
    const role = req.user.role;

    const orderRes = await pool.query(
      `SELECT p.*, u.nama as nama_pembeli, u.email as email_pembeli,
              pb.alamat_pengiriman, pm.id_pembayaran, pm.status_bayar, pm.metode, pm.jumlah_bayar
       FROM pesanan p
       JOIN users u ON p.id_pembeli = u.id_user
       JOIN pembeli pb ON u.id_user = pb.id_user
       LEFT JOIN pembayaran pm ON p.id_pesanan = pm.id_pesanan
       WHERE p.id_pesanan = $1`,
      [id]
    );

    if (orderRes.rowCount === 0) {
      return res.status(404).json({ pesan: 'Pesanan tidak ditemukan' });
    }

    const order = orderRes.rows[0];

    // Cek otorisasi
    if (role === 'pembeli' && order.id_pembeli !== userId) {
      return res.status(403).json({ pesan: 'Akses pesanan ditolak' });
    }

    const itemsRes = await pool.query(
      `SELECT dp.*, pr.nama as nama_produk, pr.kategori, pr.aset_2d3d
       FROM detail_pesanan dp
       JOIN produk pr ON dp.id_produk = pr.id_produk
       WHERE dp.id_pesanan = $1`,
      [id]
    );

    res.json({
      pesanan: {
        ...order,
        items: itemsRes.rows,
      },
    });
  } catch (err) {
    console.error('Error getOrderById:', err);
    res.status(500).json({ pesan: 'Gagal mengambil detail pesanan' });
  }
};
