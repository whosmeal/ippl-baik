const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan subdirektori tujuan ada
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Konfigurasi storage penyimpanan lokal di backend
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'products';
    if (file.fieldname === 'model' || file.mimetype.includes('octet-stream') || file.originalname.match(/\.(glb|gltf|obj)$/i)) {
      folder = 'models';
    } else if (file.fieldname === 'ktp') {
      folder = 'ktp';
    }
    const dest = path.join(__dirname, '../../uploads', folder);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// Filter jenis file (gambar & model 3D)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(jpeg|jpg|png|webp|glb|gltf|obj)$/i;
  const isExtMatch = allowedExtensions.test(path.extname(file.originalname));

  if (isExtMatch) {
    cb(null, true);
  } else {
    cb(new Error('Tipe berkas tidak didukung. Harap unggah berkas gambar (JPG/PNG/WEBP) atau model 3D (GLB/GLTF/OBJ).'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // Maksimal 25MB (cocok untuk aset 3D & foto high-res)
  },
  fileFilter,
});

module.exports = upload;
