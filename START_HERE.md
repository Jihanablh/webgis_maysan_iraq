# Mulai di Sini

## Windows

1. Ekstrak ZIP ke folder biasa.
2. Buka folder `maysan-iraq-webgis`.
3. Klik dua kali `run-windows.bat`.

Alternatif PowerShell:

```powershell
npm ci --registry=https://registry.npmjs.org/
npm run doctor
npm run dev
```

Alamat development server biasanya `http://localhost:5173`.

## Linux atau macOS

```bash
chmod +x run-linux-mac.sh
./run-linux-mac.sh
```

## Build produksi

```bash
npm run build
npm run preview
```

## Audit

```bash
npm run check
```

Versi paket: 1.3.2
