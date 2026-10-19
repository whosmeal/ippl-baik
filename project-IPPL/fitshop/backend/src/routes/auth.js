const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();

// UC-001 Registrasi
router.post('/register', async (req, res) => {
  const { nama, email, password, role } = req.body;

  if (!nama || !email || !password || !role) {
    return res.status(400).json({ pesan: 'Semua kolom wajib diisi' });
  }
  if (!['pembeli', 'penjual'].includes(role)) {
    return res.status(400).json({ pesan: 'Peran tidak valid' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ pesan: 'Format email tidak valid' });
  }
  if (password.length < 8) {
    return res.status(400).json({ pesan: 'Password minimal 8 karakter' });
  }

  try {
    const cek = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (cek.rowCount > 0) {
      return res.status(409).json({ pesan: 'Email sudah digunakan' });
    }

    const hash = await bcrypt.hash(password, 10);
    const client = await pool.connect();
    let userBaru;
    try {
      await client.query('BEGIN');
      const hasil = await client.query(
        `INSERT INTO users (nama, email, password, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id_user, nama, email, role`,
        [nama, email, hash, role]
      );
      userBaru = hasil.rows[0];

      if (role === 'pembeli') {
        await client.query(
          `INSERT INTO pembeli (id_user) VALUES ($1)`,
          [userBaru.id_user]
        );
      } else if (role === 'penjual') {
        await client.query(
          `INSERT INTO penjual (id_user, saldo, status_verifikasi) VALUES ($1, 0, 'pending')`,
          [userBaru.id_user]
        );
        // Buat toko default
        await client.query(
          `INSERT INTO toko (id_penjual, nama_toko, status_verifikasi) VALUES ($1, $2, 'pending')`,
          [userBaru.id_user, `Toko ${nama}`]
        );
      }
      await client.query('COMMIT');
    } catch (dbErr) {
      await client.query('ROLLBACK');
      throw dbErr;
    } finally {
      client.release();
    }

    res.status(201).json({ pesan: 'Registrasi berhasil', user: userBaru });
  } catch (err) {
    console.error(err);
    res.status(500).json({ pesan: 'Terjadi kesalahan server' });
  }
});

// UC-002 Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hasil = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = hasil.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ pesan: 'Email atau Password tidak cocok' });
    }
    if (user.status !== 'aktif') {
      return res.status(403).json({ pesan: 'Akun diblokir' });
    }

    const token = jwt.sign(
      { id: user.id_user, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({
      token,
      user: { id_user: user.id_user, nama: user.nama, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ pesan: 'Terjadi kesalahan server' });
  }
});

module.exports = router;