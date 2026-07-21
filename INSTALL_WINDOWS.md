# Instalasi pada Windows

## Cara otomatis

Klik dua kali `run-windows.bat`. Skrip akan:

1. Menghapus `node_modules` yang tidak lengkap.
2. Menggunakan registry publik `https://registry.npmjs.org/`.
3. Menjalankan `npm ci`.
4. Memeriksa konfigurasi proyek.
5. Menjalankan build produksi.
6. Menjalankan development server.

## Cara manual melalui PowerShell

Pastikan PowerShell berada di folder yang memuat `package.json`, kemudian jalankan:

```powershell
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
npm cache verify
npm ci --registry=https://registry.npmjs.org/
npm run doctor
npm run build
npm run dev
```

## Jika muncul EPERM

`EPERM` berarti folder atau file di dalam `node_modules` sedang dikunci Windows. Tutup development server, terminal lain, File Explorer yang sedang membuka folder proyek, dan VS Code bila masih mengunci file. Setelah itu hapus `node_modules` dan ulangi instalasi.

## Jika koneksi tetap timeout

Periksa registry aktif:

```powershell
npm config get registry
```

Untuk proyek Maysan ini, hasil yang diharapkan adalah:

```text
https://registry.npmjs.org/
```

Periksa juga apakah konfigurasi proxy lama masih aktif:

```powershell
npm config get proxy
npm config get https-proxy
```

Hanya hapus konfigurasi tersebut apabila kamu memang tidak menggunakan proxy kantor atau kampus:

```powershell
npm config delete proxy
npm config delete https-proxy
```
