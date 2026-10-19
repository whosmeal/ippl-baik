module.exports = (...rolesDiizinkan) => (req, res, next) => {
  if (!rolesDiizinkan.includes(req.user.role)) {
    return res.status(403).json({ pesan: 'Anda tidak punya akses ke fitur ini' });
  }
  next();
};