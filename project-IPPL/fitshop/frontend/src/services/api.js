const baseUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const storedSession = localStorage.getItem('fitshop-session');
  if (storedSession) {
    try {
      const session = JSON.parse(storedSession);
      if (session.token) headers.set('Authorization', `Bearer ${session.token}`);
    } catch (error) {
      console.error('Sesi autentikasi tidak dapat dibaca.', error);
    }
  }
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  } catch (error) {
    throw new Error(
      'Tidak dapat terhubung ke server FitShop. Periksa koneksi backend lalu coba lagi.',
      { cause: error },
    );
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.pesan || `Permintaan gagal (HTTP ${response.status}).`);
  }
  return result;
}