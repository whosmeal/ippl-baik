const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/authMiddleware');

// POST /api/upload - Unggah satu berkas media (foto produk, KTP, atau aset 3D)
router.post('/', auth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ pesan: 'Tidak ada berkas yang diunggah' });
    }

    const folder = req.file.destination.split(/[\/\\]/).pop();
    const fileUrl = `/uploads/${folder}/${req.file.filename}`;

    res.status(201).json({
      pesan: 'Berkas berhasil diunggah',
      fileUrl,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (err) {
    console.error('Error saat upload berkas:', err);
    res.status(500).json({ pesan: 'Gagal mengunggah berkas' });
  }
});

module.exports = router;
