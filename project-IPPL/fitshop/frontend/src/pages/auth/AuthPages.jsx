import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export function Login() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState('pembeli');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const user = await login({ email: form.get('email'), password: form.get('password') });
      if (user.role !== role) {
        logout();
        setError(
          `Akun ini terdaftar sebagai ${user.role}. Pilih peran yang sesuai lalu coba lagi.`,
        );
        return;
      }
      const rolePath = user.role === 'admin' ? '/admin' : user.role === 'penjual' ? '/seller' : '/';
      navigate(location.state?.from?.pathname || rolePath, { replace: true });
    } catch (requestError) {
      console.error('Login FitShop gagal.', requestError);
      setError(requestError.message || 'Tidak dapat terhubung ke layanan autentikasi.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-aside">
        <Link className="brand" to="/">fit<span>shop</span><i>.</i></Link>
        <div><span className="section-kicker">WELCOME BACK</span><h1>Temukan fit<br /><em>terbaikmu.</em></h1><p>Masuk untuk melihat pesanan dan melanjutkan gaya favoritmu.</p></div>
        <span className="auth-footnote">FITSHOP · STYLE THAT FEELS LIKE YOU</span>
      </div>
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit}>
          <span className="section-kicker">AKUN FITSHOP</span>
          <h2>Selamat datang.</h2>
          <p>Pilih jenis akun, lalu masuk dengan akun terdaftar.</p>
          <fieldset className="role-picker">
            <legend>Masuk sebagai</legend>
            {[
              ['pembeli', 'Pembeli', 'Belanja dan lacak pesanan'],
              ['penjual', 'Penjual', 'Kelola toko dan produk'],
              ['admin', 'Admin', 'Administrasi platform'],
            ].map(([value, label, description]) => (
              <label className={role === value ? 'role-option role-option-active' : 'role-option'} key={value}>
                <input
                  type="radio"
                  name="role-choice"
                  value={value}
                  checked={role === value}
                  onChange={() => {
                    setRole(value);
                    setError('');
                  }}
                />
                <span className="role-option-mark">{role === value ? '✓' : ''}</span>
                <span><strong>{label}</strong><small>{description}</small></span>
              </label>
            ))}
          </fieldset>
          <label>Email<input name="email" type="email" autoComplete="email" placeholder="nama@email.com" required /></label>
          <label>Kata sandi<div className="password-field"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Masukkan kata sandi" required /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Sembunyikan' : 'Lihat'}</button></div></label>
          {error && <p className="form-message error-message" role="alert">{error}</p>}
          <button className="button button-dark full-button" type="submit" disabled={busy}>{busy ? 'Memproses...' : 'Masuk ke akun'} <span>→</span></button>
          {role === 'admin' && <p className="role-help">Akses admin hanya untuk akun yang sudah diberi peran admin oleh sistem.</p>}
          <p className="auth-switch">Belum punya akun? <Link to="/register">Daftar sekarang</Link></p>
          <Link className="auth-back" to="/">← Kembali ke beranda</Link>
        </form>
      </div>
    </section>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    const form = new FormData(event.currentTarget);
    if (form.get('password') !== form.get('confirmPassword')) {
      setError('Konfirmasi kata sandi tidak cocok.');
      setBusy(false);
      return;
    }
    try {
      const result = await register({
        nama: form.get('nama'),
        email: form.get('email'),
        password: form.get('password'),
        role: form.get('role'),
      });
      setSuccess(result.pesan || 'Akun berhasil dibuat. Silakan masuk.');
      window.setTimeout(() => navigate('/login'), 900);
    } catch (requestError) {
      console.error('Registrasi FitShop gagal.', requestError);
      setError(requestError.message || 'Tidak dapat terhubung ke layanan autentikasi.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-aside">
        <Link className="brand" to="/">fit<span>shop</span><i>.</i></Link>
        <div><span className="section-kicker">JOIN THE COMMUNITY</span><h1>Gaya baru,<br /><em>cerita baru.</em></h1><p>Buat akun untuk memulai perjalanan belanja yang lebih personal.</p></div>
        <span className="auth-footnote">FITSHOP · STYLE THAT FEELS LIKE YOU</span>
      </div>
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit}>
          <span className="section-kicker">BUAT AKUN</span>
          <h2>Gabung FitShop.</h2>
          <p>Lengkapi data di bawah untuk membuat akun.</p>
          <label>Nama lengkap<input name="nama" autoComplete="name" placeholder="Nama kamu" required maxLength="100" /></label>
          <label>Email<input name="email" type="email" autoComplete="email" placeholder="nama@email.com" required maxLength="100" /></label>
          <label>Daftar sebagai<select name="role" defaultValue="pembeli"><option value="pembeli">Pembeli</option><option value="penjual">Penjual</option></select></label>
          <label>Kata sandi<input name="password" type="password" autoComplete="new-password" placeholder="Minimal 8 karakter" minLength="8" required /></label>
          <label>Konfirmasi kata sandi<input name="confirmPassword" type="password" autoComplete="new-password" placeholder="Ulangi kata sandi" minLength="8" required /></label>
          {error && <p className="form-message error-message" role="alert">{error}</p>}
          {success && <p className="form-message success-message" role="status">{success}</p>}
          <button className="button button-dark full-button" type="submit" disabled={busy}>{busy ? 'Membuat akun...' : 'Buat akun'} <span>→</span></button>
          <p className="auth-switch">Sudah punya akun? <Link to="/login">Masuk</Link></p>
          <Link className="auth-back" to="/">← Kembali ke beranda</Link>
        </form>
      </div>
    </section>
  );
}
