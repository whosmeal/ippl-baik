const pool = require('../config/db');

// POST /api/payment/pay (Simulasi / Proses Pembayaran)
exports.processPayment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id_pesanan, metode } = req.body;
    const userId = req.user.id_user;

    if (!id_pesanan || !metode) {
      return res.status(400).json({ pesan: 'ID pesanan dan metode pembayaran wajib diisi' });
    }

    await client.query('BEGIN');

    // Cek pesanan
    const orderRes = await client.query(
      'SELECT * FROM pesanan WHERE id_pesanan = $1 AND id_pembeli = $2',
      [id_pesanan, userId]
    );

    if (orderRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ pesan: 'Pesanan tidak ditemukan atau bukan milik Anda' });
    }

    const order = orderRes.rows[0];
    if (order.status !== 'menunggu_pembayaran') {
      await client.query('ROLLBACK');
      return res.status(400).json({ pesan: `Pesanan sudah dalam status: ${order.status}` });
    }

    // Insert pembayaran (1 pesanan = 1 pembayaran)
    const payRes = await client.query(
      `INSERT INTO pembayaran (id_pesanan, metode, jumlah_bayar, status_bayar)
       VALUES ($1, $2, $3, 'lunas')
       ON CONFLICT (id_pesanan) DO UPDATE 
       SET status_bayar = 'lunas', metode = EXCLUDED.metode, tanggal_bayar = NOW()
       RETURNING *`,
      [id_pesanan, metode, order.total_harga]
    );

    // Update status pesanan
    await client.query(
      `UPDATE pesanan SET status = 'diproses' WHERE id_pesanan = $1`,
      [id_pesanan]
    );

    // Cari penjual terkait dan catat transaksi keuangan serta tambahkan saldo toko
    const itemsRes = await client.query(
      `SELECT pr.id_toko, t.id_penjual, SUM(dp.subtotal) as total_toko
       FROM detail_pesanan dp
       JOIN produk pr ON dp.id_produk = pr.id_produk
       JOIN toko t ON pr.id_toko = t.id_toko
       WHERE dp.id_pesanan = $1
       GROUP BY pr.id_toko, t.id_penjual`,
      [id_pesanan]
    );

    for (const row of itemsRes.rows) {
      // Tambah saldo penjual
      await client.query(
        'UPDATE penjual SET saldo = saldo + $1 WHERE id_user = $2',
        [row.total_toko, row.id_penjual]
      );

      // Catat transaksi keuangan
      await client.query(
        `INSERT INTO transaksi_keuangan (id_penjual, jumlah, jenis)
         VALUES ($1, $2, 'penjualan')`,
        [row.id_penjual, row.total_toko]
      );
    }

    await client.query('COMMIT');
    res.json({
      pesan: 'Pembayaran berhasil dikonfirmasi',
      pembayaran: payRes.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error processPayment:', err);
    res.status(500).json({ pesan: 'Gagal memproses pembayaran' });
  } finally {
    client.release();
  }
};
