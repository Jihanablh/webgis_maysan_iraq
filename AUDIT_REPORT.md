# Laporan Audit: Maysan Iraq GeoAI WebGIS v1.3.2

Tanggal audit: 21 Juli 2026

## Ringkasan hasil akhir

- Instalasi bersih dengan `npm ci`: lulus
- Pemeriksaan konfigurasi dengan `npm run doctor`: lulus
- Build produksi Vite: lulus
- Audit data, geometri, aset, struktur, dan fitur: 62 lulus, 0 gagal
- Audit runtime desktop dan mobile: 47 lulus, 0 gagal
- Audit keamanan npm: 0 kerentanan
- Resource lokal yang gagal dimuat: tidak ditemukan
- Exception JavaScript saat pengujian browser: tidak ditemukan
- Overflow horizontal desktop dan mobile: tidak ditemukan

## Masalah yang ditemukan dan diperbaiki

### 1. Citra pembanding gagal dimuat pada deployment subfolder

Dua citra konteks dipanggil melalui URL absolut `/images/...`. Pola ini dapat bekerja di root domain, tetapi gagal ketika website ditempatkan di subfolder atau dibuka dari hasil build dengan base relatif. Gejala yang terlihat adalah bidang gelap dan teks alternatif gambar bertumpuk, seperti pada tangkapan layar pengguna.

Perbaikan:

- Citra dipindahkan ke `src/assets` dan diimpor langsung dari React.
- Vite kini memproses, memberi nama hash, dan menyalin kedua citra ke `dist/assets`.
- Referensi absolut `/images/...` dihapus.
- Build diuji dengan base relatif dan kedua gambar memiliki `naturalWidth` yang valid.
- Ketergantungan Google Fonts eksternal dihapus agar tampilan tetap dapat digunakan saat offline.

### 2. Kontrol perbandingan memiliki dua mekanisme geser

Komparator sebelumnya memakai tombol panah di tengah sekaligus input range dengan bulatan kuning di bagian bawah. Bulatan tersebut dapat digeser dan membingungkan karena pengguna menghendaki interaksi hanya pada tombol panah.

Perbaikan:

- Input `range` dan bulatan kuning dihapus sepenuhnya.
- Divider hanya bergerak ketika tombol panah di tengah diseret.
- Klik atau drag di area lain tidak mengubah posisi divider.
- Pointer capture dan offset drag digunakan agar gerakan stabil dan tidak meloncat.
- Kontrol tetap dapat dioperasikan melalui Arrow Left/Right, Home, End, Page Up, dan Page Down.
- Fokus keyboard dan semantik `role="slider"` dipertahankan untuk aksesibilitas.

### 3. Geometri klasifikasi tidak valid

Salah satu poligon tahun 2020 dan salah satu poligon tahun 2025 mengalami self-intersection. Beberapa poligon juga saling tumpang tindih dan sebagian keluar dari batas Maysan. Kondisi ini berisiko menghasilkan GeoJSON yang gagal diproses oleh perangkat GIS lain walaupun masih dapat terlihat pada Leaflet.

Perbaikan:

- Seluruh geometri dipotong ke batas Maysan.
- Empat kelas dipartisi agar tidak saling tumpang tindih.
- Layer setiap tahun dibuat menutup seluruh area studi tanpa celah.
- Seluruh ring dan multipolygon divalidasi ulang.
- Atribut luas tetap mengikuti ketentuan 2020–2025 dan empat kelas.

### 4. Beban JavaScript awal terlalu besar

Bundle utama sebelumnya sekitar 1,76 MB karena peta, grafik, animasi, dan mesin 3D dimuat sekaligus.

Perbaikan:

- Peta dimuat secara lazy hanya saat diperlukan.
- Paket produksi dipecah menjadi chunk React, motion, icons, charts, dan map.
- Mesin Three.js dekoratif diganti animasi CSS yang lebih ringan.
- Dependensi `three` dan `@react-three/fiber` dihapus.
- Bundle awal aplikasi turun menjadi sekitar 80 kB sebelum gzip, sedangkan modul berat dimuat terpisah.

### 5. Navigasi dan deep link

Tautan langsung seperti `#map` belum konsisten saat refresh, status masuk tidak dipertahankan dengan baik, dan navigasi dapat membuat entri riwayat duplikat.

Perbaikan:

- Deep link membuka halaman yang sesuai.
- Tombol Back dan Forward browser disinkronkan dengan halaman aktif.
- Status masuk disimpan dalam session storage.
- Judul tab browser mengikuti halaman aktif.
- Hash yang sama tidak didorong berulang kali ke riwayat.

### 6. Ekspor CSV dan GeoJSON

Object URL unduhan dibatalkan terlalu cepat dan CSV belum optimal untuk Excel pada Windows.

Perbaikan:

- Pencabutan object URL diberi jeda aman.
- CSV menggunakan UTF-8 BOM dan CRLF.
- Unduhan CSV dan GeoJSON diuji sampai file benar-benar terbentuk.
- Nama file ekspor menggunakan awalan `maysan-`.

### 7. Peta dan atribusi

Pusat koordinat, reset extent, dan atribusi basemap belum sepenuhnya konsisten. Kontrol layer juga membutuhkan status aksesibilitas yang lebih jelas.

Perbaikan:

- Pusat peta diselaraskan ke Maysan, sekitar Amarah.
- Reset peta memakai batas Maysan.
- Atribusi CARTO hanya ditampilkan saat basemap CARTO aktif.
- Scroll wheel peta tidak menangkap scroll halaman.
- Tombol peta memiliki label, status terpilih, dan status panel yang sesuai.

### 8. Chatbot dan aksesibilitas

Dialog chatbot belum memiliki semantik dialog lengkap, fokus awal, penutupan melalui Escape, dan struktur form yang baik.

Perbaikan:

- Semantik `dialog`, judul, live log, fokus input, dan Escape ditambahkan.
- Pengiriman pesan memakai form submit.
- Input kosong tidak dapat dikirim dan panjang pertanyaan dibatasi.
- Navbar, menu mobile, dock, layer, dan pilihan tahun mendapat status aksesibilitas.

### 9. Portabilitas instalasi

Lockfile masih menyimpan satu URL registry internal pada paket esbuild. Ini dapat menyebabkan instalasi gagal di luar lingkungan pengembangan awal.

Perbaikan:

- Seluruh URL paket diarahkan ke `registry.npmjs.org`.
- Instalasi ulang dilakukan dari `node_modules` kosong menggunakan `npm ci`.
- Skrip doctor memverifikasi lockfile publik, versi Node.js, dan ketersediaan Vite.

### 10. Konsistensi antarmuka mobile

Label dock mobile mencampur bahasa Inggris dan Indonesia.

Perbaikan:

- Label ringkas diubah menjadi Beranda, Peta, Ubah, Stat, dan Valid.

## Validasi data utama

- Periode analisis tetap 2020–2025.
- Jumlah kelas tetap empat.
- Total 2020: 16.072 km².
- Total 2025: 16.072 km².
- Jumlah perubahan bersih antarkelas: 0 km².
- Confusion matrix: 4 × 4 dengan 400 sampel simulasi.
- Overall accuracy simulasi: 89,25%.
- Seluruh hotspot dan ground truth berada di dalam batas Maysan.

## Hasil build produksi

Build tidak menghasilkan peringatan ukuran chunk. Modul utama dan modul berat telah dipisah:

- Entry aplikasi: sekitar 80 kB
- Modul peta: sekitar 177 kB
- React vendor: sekitar 143 kB
- Motion: sekitar 114 kB
- Charts core: sekitar 297 kB
- Charts vendor: sekitar 105 kB
- Icons: sekitar 17 kB
- Dua citra konteks: sekitar 210 kB dan 243 kB

Ukuran di atas adalah sebelum gzip dan dapat berubah sedikit saat dependensi diperbarui.

## Catatan ilmiah

Data klasifikasi, hotspot, sampel, statistik perubahan, indeks, confusion matrix, dan akurasi pada prototipe ini adalah data simulasi. Batas Maysan merupakan geometri referensi yang disederhanakan. Data simulasi harus diganti dengan hasil pengolahan dan validasi aktual sebelum digunakan sebagai kesimpulan penelitian.
