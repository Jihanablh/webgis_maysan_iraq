$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "=== Maysan WebGIS - Perbaikan Instalasi Windows ===" -ForegroundColor Cyan
Write-Host "Menggunakan registry publik npm: https://registry.npmjs.org/"

if (Test-Path "node_modules") {
  Write-Host "Menghapus node_modules yang tidak lengkap..." -ForegroundColor Yellow
  try {
    Remove-Item "node_modules" -Recurse -Force
  }
  catch {
    Write-Host "Folder node_modules sedang dikunci Windows." -ForegroundColor Red
    Write-Host "Tutup terminal lain, Vite, File Explorer pada folder ini, dan VS Code bila perlu. Jalankan skrip ini kembali." -ForegroundColor Yellow
    exit 1
  }
}

Write-Host "Memeriksa cache npm..." -ForegroundColor Cyan
npm cache verify
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Menginstal dependensi..." -ForegroundColor Cyan
npm ci --registry=https://registry.npmjs.org/
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Memeriksa konfigurasi proyek..." -ForegroundColor Cyan
npm run doctor
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Menguji build produksi dan data..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm run audit
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Instalasi dan build berhasil. Jalankan: npm run dev" -ForegroundColor Green
