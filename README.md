# KojinMaps 🗺️

Selamat datang di **KojinMaps**, sebuah aplikasi peta interaktif berbasis web yang dirancang untuk menjelajahi Jepang dengan mudah. Dibangun dengan teknologi modern seperti Next.js, React, dan Leaflet, aplikasi ini menyediakan berbagai fitur untuk membantu Anda menemukan lokasi, tempat menarik, dan mendapatkan informasi detail di seluruh Jepang.

## ✨ Fitur Utama

### 🗺️ **Peta & Navigasi**

- **Peta Interaktif**: Jelajahi seluruh Jepang (Hokkaido - Okinawa) dengan peta yang responsif, didukung oleh Leaflet
- **Pilihan Layer Peta**: Ganti tampilan antara peta **Standard** (OpenStreetMap) dan **Satelit** (Esri World Imagery)
- **Coverage Luas**: Jangkauan diperluas ke seluruh Jepang, tidak hanya Tokyo
- **Dynamic Marker Visibility**: Marker muncul/hilang berdasarkan zoom level untuk performa optimal

### 🔍 **Pencarian & Filter**

- **Pencarian Lokasi Canggih**: Cari tempat, alamat, atau landmark di seluruh Jepang menggunakan Nominatim (OpenStreetMap)
- **15 Kategori Lokasi**: Filter tempat menarik (POI) dengan 15 kategori berbeda:
  - 🚻 Toilet Umum
  - 🍜 Restoran
  - ☕ Kafe
  - 🏪 Konbini (Convenience Store)
  - 🚇 Stasiun Kereta
  - ⛩️ Kuil Buddha
  - ⛩️ Kuil Shinto
  - 🌳 Taman
  - 🏦 Bank
  - 💳 ATM
  - 🏥 Rumah Sakit
  - 💊 Apotek
  - 🏨 Hotel
  - 🏛️ Museum
  - 🌄 Pemandangan (Viewpoints)

### 📍 **Informasi Lokasi**

- **Panel Informasi Lengkap**: Klik lokasi untuk melihat detail di sidebar (tanpa popup mengganggu)
- **Foto Lokasi**: Tampilan foto dari Wikimedia Commons (jika tersedia)
- **Informasi Lengkap**: Alamat, koordinat, telepon, website, jam buka, rating
- **Copy Koordinat**: Salin koordinat dengan satu klik
- **Open in Google Maps**: Buka lokasi di Google Maps untuk navigasi lengkap
- **Share Location**: Bagikan lokasi via native share atau copy link

### 🔖 **Bookmark (Tanpa Login!)**

- **Simpan Favorit**: Bookmark lokasi favorit tanpa perlu login
- **Cookie-Based Storage**: Data tersimpan di browser (365 hari)
- **Maksimal 50 Bookmark**: Cukup untuk kebutuhan sehari-hari
- **Sort by Proximity**: Urutkan bookmark berdasarkan jarak terdekat
- **Export/Import**: Backup dan restore bookmark sebagai JSON
- **Persistent**: Bookmark tetap ada saat kembali ke website

### ⚡ **Performa & Caching**

- **IndexedDB Caching**: Cache data lebih besar dan lebih cepat dari localStorage
- **Auto-Cleanup**: Hapus cache expired otomatis setiap 5 menit
- **Stale Cache Fallback**: Tetap bisa akses data lama saat offline
- **30 Menit Cache**: Data tersimpan lebih lama untuk mengurangi API calls
- **Optimized API**: Rate limit 1.5s, timeout 30s, hasil 150 per query

### 🎨 **UI/UX Modern**

- **Toast Notifications**: Notifikasi smooth untuk aksi user
- **Smooth Animations**: Transisi halus untuk pengalaman lebih baik
- **Mobile Optimized**: Responsive design untuk semua ukuran layar
- **Sidebar Info Panel**: Informasi lokasi di sidebar, tidak menghalangi peta
- **Modern Design**: Gradient, rounded corners, shadow effects

### 🛣️ **Navigasi & Rute**

- **Simulasi Rute**: Estimasi rute dengan mode berkendara, bersepeda, atau berjalan kaki
- **City View**: Pratinjau visual dari lokasi yang dipilih
- **Geolocation**: Deteksi lokasi user otomatis

## 🚀 Teknologi yang Digunakan

- **Framework**: Next.js
- **Library UI**: React
- **Peta**: Leaflet & React-Leaflet
- **Styling**: Tailwind CSS
- **Ikon**: Lucide React
- **Data Peta**: OpenStreetMap, Overpass API, Nominatim
- **Bahasa**: TypeScript

## 🛠️ Instalasi dan Menjalankan Proyek

Untuk menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah berikut:

1.  **Clone repositori ini:**

    ```bash
    git clone https://[URL_REPOSITORI_ANDA].git
    cd kojinmap
    ```

2.  **Install dependensi:**
    Gunakan `npm`, `yarn`, atau `pnpm` untuk menginstal semua paket yang dibutuhkan.

    ```bash
    npm install
    # atau
    yarn install
    # atau
    pnpm install
    ```

3.  **Jalankan server development:**

    ```bash
    npm run dev
    # atau
    yarn dev
    # atau
    pnpm dev
    ```

4.  **Buka di browser:**
    Buka di browser Anda untuk melihat aplikasi berjalan.

## 📂 Struktur Proyek

```
kojinmap/
├── src/
│   ├── app/                # Halaman utama dan layout aplikasi
│   ├── components/         # Komponen-komponen React (Map, Panel, dll.)
│   ├── lib/                # Logika bisnis, service API, dan utilitas
│   └── ...
├── public/                 # Aset statis (gambar, ikon, dll.)
├── README.md               # Anda sedang membacanya
└── ...                     # File konfigurasi lainnya
```

## 🤝 Kontribusi

Kontribusi untuk meningkatkan JapanMaps sangat kami hargai. Jika Anda menemukan bug atau memiliki ide untuk fitur baru, silakan buat _issue_ atau _pull request_.

---

_Proyek ini dibuat sebagai alat bantu untuk eksplorasi dan tidak dimaksudkan untuk navigasi dunia nyata yang presisi. Website ini 100% GRATIS dan tidak memungut biaya sepeserpun._
