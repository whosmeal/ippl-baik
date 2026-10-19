const jwt = require('jsonwebtoken');
const pool = require('../config/db');

module.exports = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ pesan: 'Token tidak ditemukan, silakan login' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // { id, role }
    
    // Verifikasi bahwa user masih aktif di database
    const userResult = await pool.query('SELECT id_user, nama, email, role, status FROM users WHERE id_user = $1', [decoded.id]);
    if (userResult.rowCount === 0) {
      return res.status(401).json({ pesan: 'Pengguna tidak ditemukan' });
    }
    const user = userResult.rows[0];
    if (user.status !== 'aktif') {
      return res.status(403).json({ pesan: 'Akun Anda dinonaktifkan atau diblokir' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ pesan: 'Token tidak valid atau sudah kedaluwarsa' });
  }
};