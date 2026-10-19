const pool = require('../config/db');

// POST /api/tryon/body-data (Simpan/Perbarui Data Tubuh Pengguna)
exports.saveBodyData = async (req, res) => {
  try {
    const { tinggi_badan, berat_badan, ukuran_dada, ukuran_pinggang } = req.body;
    const idPembeli = req.user.id_user;

    if (!tinggi_badan) {
      return res.status(400).json({ pesan: 'Tinggi badan wajib diisi' });
    }

    const result = await pool.query(
      `INSERT INTO data_tubuh_pengguna (id_pembeli, tinggi_badan, berat_badan, ukuran_dada, ukuran_pinggang, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (id_pembeli) DO UPDATE
       SET tinggi_badan = EXCLUDED.tinggi_badan,
           berat_badan = EXCLUDED.berat_badan,
           ukuran_dada = EXCLUDED.ukuran_dada,
           ukuran_pinggang = EXCLUDED.ukuran_pinggang,
           updated_at = NOW()
       RETURNING *`,
      [idPembeli, tinggi_badan, berat_badan || null, ukuran_dada || null, ukuran_pinggang || null]
    );

    res.json({ pesan: 'Data tubuh berhasil disimpan', data_tubuh: result.rows[0] });
  } catch (err) {
    console.error('Error saveBodyData:', err);
    res.status(500).json({ pesan: 'Gagal menyimpan data tubuh' });
  }
};

// GET /api/tryon/body-data (Ambil Data Tubuh Pengguna Aktif)
exports.getMyBodyData = async (req, res) => {
  try {
    const idPembeli = req.user.id_user;
    const result = await pool.query('SELECT * FROM data_tubuh_pengguna WHERE id_pembeli = $1', [idPembeli]);
    res.json({ data_tubuh: result.rows[0] || null });
  } catch (err) {
    console.error('Error getMyBodyData:', err);
    res.status(500).json({ pesan: 'Gagal mengambil data tubuh' });
  }
};

// POST /api/tryon/session (Mulai Sesi TryOn AR & Rekomendasi Ukuran)
exports.createTryOnSession = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id_produk, tinggi_badan } = req.body;
    const idPembeli = req.user.id_user;

    await client.query('BEGIN');

    // Cek atau buat data tubuh
    let scanId = null;
    const scanRes = await client.query('SELECT id_scan, tinggi_badan FROM data_tubuh_pengguna WHERE id_pembeli = $1', [idPembeli]);
    if (scanRes.rowCount > 0) {
      scanId = scanRes.rows[0].id_scan;
    } else if (tinggi_badan) {
      const newScan = await client.query(
        'INSERT INTO data_tubuh_pengguna (id_pembeli, tinggi_badan) VALUES ($1, $2) RETURNING id_scan',
        [idPembeli, tinggi_badan]
      );
      scanId = newScan.rows[0].id_scan;
    }

    // Buat sesi
    const sessionRes = await client.query(
      `INSERT INTO sesi_tryon_ar (id_pembeli, id_scan, hasil_visual)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [idPembeli, scanId, JSON.stringify({ status: 'berhasil', mode: 'camera_preview' })]
    );
    const sesi = sessionRes.rows[0];

    // Hubungkan dengan produk jika disediakan
    if (id_produk) {
      await client.query(
        'INSERT INTO sesi_tryon_produk (id_sesi, id_produk) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [sesi.id_sesi, id_produk]
      );

      // Hitung estimasi ukuran rekomendasi
      const t = Number(tinggi_badan) || (scanRes.rows[0] ? Number(scanRes.rows[0].tinggi_badan) : 170);
      const ukuran = t < 158 ? 'S' : t < 170 ? 'M' : t < 180 ? 'L' : 'XL';

      const rekomendasi = [
        {
          id_produk,
          rekomendasi_ukuran: ukuran,
          alasan: `Berdasarkan estimasi proporsi tinggi ${t} cm`,
        },
      ];

      await client.query(
        `INSERT INTO rekomendasi_gaya_ai (id_sesi, daftar_produk_rekomendasi)
         VALUES ($1, $2)`,
        [sesi.id_sesi, JSON.stringify(rekomendasi)]
      );
      sesi.rekomendasi = rekomendasi;
    }

    await client.query('COMMIT');
    res.status(201).json({ pesan: 'Sesi TryOn AR berhasil dicatat', sesi });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error createTryOnSession:', err);
    res.status(500).json({ pesan: 'Gagal membuat sesi TryOn' });
  } finally {
    client.release();
  }
};
