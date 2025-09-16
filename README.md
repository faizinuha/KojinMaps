# JapanMaps 🗺️

Selamat datang di **JapanMaps**, sebuah aplikasi peta interaktif berbasis web yang dirancang untuk menjelajahi Jepang dengan mudah. Dibangun dengan teknologi modern seperti Next.js, React, dan Leaflet, aplikasi ini menyediakan berbagai fitur untuk membantu Anda menemukan lokasi, tempat menarik, dan mendapatkan informasi detail di seluruh Jepang.

## ✨ Fitur Utama

*   **Peta Interaktif**: Jelajahi Jepang dengan peta yang responsif, didukung oleh Leaflet.
*   **Pilihan Layer Peta**: Ganti tampilan antara peta **Standard** (OpenStreetMap) dan **Satelit** (Esri World Imagery) untuk perspektif yang berbeda.
*   **Pencarian Lokasi Canggih**: Cari tempat, alamat, atau landmark di seluruh Jepang menggunakan data dari Nominatim (OpenStreetMap).
*   **Filter Tempat Menarik (POI)**: Tampilkan atau sembunyikan berbagai kategori tempat di peta, seperti:
    *   🚻 Toilet Umum
    *   🍜 Restoran
    *   🏪 Konbini (Convenience Store)
    *   🚇 Stasiun Kereta
    *   ⛩️ Kuil
    *   🌳 Taman
    *   Dan banyak lagi!
*   **Panel Informasi Detail**: Klik pada sebuah lokasi untuk melihat informasi lengkap, termasuk alamat, koordinat, jam buka, dan rating (jika tersedia).
*   **Simulasi Rute**: Dapatkan estimasi rute (mock-up) ke tujuan Anda dengan mode berkendara, bersepeda, atau berjalan kaki.
*   **Favorit**: Simpan lokasi-lokasi favorit Anda untuk akses cepat di lain waktu.
*   **Gambaran Kota (City View)**: Dapatkan pratinjau visual dari lokasi yang dipilih (saat ini menggunakan gambar placeholder).
*   **Manajemen Cache**: Menggunakan caching di sisi klien (`localStorage`) untuk mempercepat pemuatan data yang sering diakses dan mengurangi panggilan API.
*   **Desain Responsif**: Tampilan yang optimal baik di desktop maupun perangkat mobile.

## 🚀 Teknologi yang Digunakan

*   **Framework**: Next.js
*   **Library UI**: React
*   **Peta**: Leaflet & React-Leaflet
*   **Styling**: Tailwind CSS
*   **Ikon**: Lucide React
*   **Data Peta**: OpenStreetMap, Overpass API, Nominatim
*   **Bahasa**: TypeScript

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
    Buka  di browser Anda untuk melihat aplikasi berjalan.

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

Kontribusi untuk meningkatkan JapanMaps sangat kami hargai. Jika Anda menemukan bug atau memiliki ide untuk fitur baru, silakan buat *issue* atau *pull request*.

---

*Proyek ini dibuat sebagai alat bantu untuk eksplorasi dan tidak dimaksudkan untuk navigasi dunia nyata yang presisi.*