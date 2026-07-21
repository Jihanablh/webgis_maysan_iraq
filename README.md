# Maysan Iraq GeoAI WebGIS

WebGIS interaktif untuk prototipe analisis perubahan tutupan lahan di Maysan Governorate, Iraq, periode 2020–2025 menggunakan Sentinel-2 dan Random Forest.

## Cakupan wilayah

- Wilayah studi: Maysan Governorate, Iraq
- Pusat tampilan: sekitar Amarah
- Luas acuan wilayah: 16.072 km²
- Batas wilayah: geometri Natural Earth Admin-1 yang disederhanakan untuk menjaga performa peta
- Data klasifikasi, hotspot, sampel, statistik perubahan, dan metrik model: simulasi

## Fitur utama

- Opening sinematik dengan identitas Maysan
- Dashboard storytelling perubahan tutupan lahan
- Perbandingan citra regional 2019 dan 2024 dengan aset lokal yang dibundel ke build
- Divider perbandingan yang hanya dapat digeser melalui tombol panah di tengah, termasuk dukungan keyboard
- Empat kelas: air/wetland, vegetasi, lahan terbuka/kering, dan area terbangun
- Statistik baseline 2020, kondisi 2025, delta luas, dan persentase perubahan
- Grafik perubahan kelas dan indeks NDVI, MNDWI, NDBI, serta BSI
- Peta Maysan dengan klasifikasi, hotspot perubahan, ground truth, legenda, dan ekspor GeoJSON
- Ekspor CSV statistik Maysan yang kompatibel dengan Excel
- Dark mode dan daylight mode
- Halaman Perubahan, Statistika, Validasi, dan Tentang
- Chatbot MARA tanpa API eksternal
- Deep link, riwayat browser, navbar fixed, dan navigasi mobile
- Lazy loading peta serta pemisahan bundle produksi

## Menjalankan proyek

Persyaratan minimum:

- Node.js 18 atau lebih baru
- npm 9 atau lebih baru

Instalasi yang direkomendasikan:

```bash
npm ci
npm run doctor
npm run dev
```

Build produksi:

```bash
npm run build
npm run preview
```

Pemeriksaan data dan build:

```bash
npm run check
```

Audit runtime memerlukan Chromium dengan remote debugging pada port 9223, kemudian jalankan:

```bash
npm run audit:runtime
```

## Struktur penting

- `src/App.jsx`: halaman, tema, statistik, navigasi, grafik, komparator citra, dan ekspor CSV
- `src/assets/`: dua citra konteks regional yang ikut dibundel oleh Vite
- `src/components/MapPanel.jsx`: peta interaktif Maysan dan ekspor GeoJSON
- `src/components/Opening.jsx`: opening
- `src/components/Chatbot.jsx`: chatbot lokal
- `src/data/mockData.js`: statistik, hotspot, sampel, dan batas Maysan
- `src/data/classificationData.js`: geometri klasifikasi valid untuk 2020 dan 2025
- `scripts/doctor.mjs`: pemeriksaan lingkungan dan portabilitas lockfile
- `scripts/audit.mjs`: audit data, geometri, struktur, aset, dan fitur
- `scripts/runtime-audit.mjs`: audit browser desktop dan mobile
- `AUDIT_REPORT.md`: rincian masalah dan perbaikan

## Hasil audit v1.3.2

- Audit data, aset, dan struktur: 62 lulus, 0 gagal
- Audit runtime desktop dan mobile: 47 lulus, 0 gagal
- Audit keamanan npm: 0 kerentanan
- Build produksi: lulus
- Error resource lokal dan exception JavaScript: tidak ditemukan

## Catatan ilmiah

Citra USGS Landsat digunakan sebagai konteks visual regional. Seluruh hasil analitik pada prototipe wajib diganti dengan hasil pengolahan dan validasi aktual sebelum digunakan sebagai kesimpulan penelitian.
