# FitShop

Prototype marketplace fashion dengan frontend React + Vite dan backend Express.

## Menjalankan aplikasi

Jalankan backend, PostgreSQL, dan frontend yang sudah dibangun bersama-sama:

```powershell
cd backend
npm start
```

Setelah proses siap, buka `http://localhost:5000`. Perintah ini membangun
frontend terlebih dahulu, lalu menyalakan PostgreSQL dan server backend. API
dan tampilan frontend dilayani dari alamat dan port yang sama.

Untuk pengembangan frontend dengan hot reload, jalankan `npm run db` dan
`node server.js` dari folder `backend` di dua terminal, lalu jalankan
`npm run dev` dari folder `frontend`. Vite menggunakan
`http://localhost:5000/api` untuk API selama mode pengembangan.

## Status fitur

- Beranda, katalog contoh, pencarian, filter, detail produk, dan keranjang berjalan
  di frontend.
- Login menyediakan pilihan peran pembeli, penjual, dan admin; peran tetap
  diverifikasi dari respons backend. Registrasi mengirim permintaan ke endpoint
  autentikasi backend.
- Dashboard penjual dan panel admin menyediakan navigasi serta tampilan responsif.
- Foto pada kartu katalog dan halaman detail menggunakan rasio tampilan 4:5
  dengan crop konsisten.
- Checkout, status pembayaran demo, riwayat pesanan, ulasan, serta data panel
  penjual disimpan di `localStorage` browser; data tersebut bukan transaksi
  atau data toko yang tersimpan di server.
- Fit Check dapat menampilkan preview kamera setelah izin diberikan. Fitur ini
  belum melakukan deteksi pose, pengukuran tubuh otomatis, atau render pakaian
  2D/3D.
- Dashboard admin menampilkan status kosong sampai API administrasi tersedia.
- Pembayaran, pengiriman, katalog bersama, aset penjual, dan laporan belum
  terhubung ke backend.

Jangan gunakan checkout demo untuk transaksi sungguhan. Data `localStorage`
bersifat khusus untuk browser dan perangkat yang sedang digunakan.