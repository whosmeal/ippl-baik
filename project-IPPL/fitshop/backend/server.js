require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const pool = require('./src/config/db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  const r = await pool.query('SELECT NOW()');
  res.json({ status: 'ok', waktu_db: r.rows[0].now });
});

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/products', require('./src/routes/product'));
app.use('/api/orders', require('./src/routes/order'));
app.use('/api/payment', require('./src/routes/payment'));
app.use('/api/reviews', require('./src/routes/review'));
app.use('/api/tryon', require('./src/routes/tryon'));
app.use('/api/seller', require('./src/routes/seller'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/upload', require('./src/routes/upload'));

// Serve Direktori Uploads Media
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const auth = require('./src/middleware/authMiddleware');
const role = require('./src/middleware/roleMiddleware');

app.get('/api/saya', auth, (req, res) => res.json({ user: req.user }));
app.get('/api/khusus-admin', auth, role('admin'), (req, res) =>
  res.json({ pesan: 'Halo admin' })
);

// Serve Frontend Static Build jika ada
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Fallback untuk SPA routing (Express v5 menggunakan middleware biasa untuk catch-all)
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    pesan: err.message || 'Terjadi kesalahan internal server',
  });
});

app.listen(process.env.PORT, () =>
  console.log(`Server FitShop jalan di http://localhost:${process.env.PORT}`)
);