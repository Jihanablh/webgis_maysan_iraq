@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0repair-windows.ps1"
if errorlevel 1 (
  echo.
  echo Perbaikan belum berhasil. Baca pesan kesalahan di atas.
  pause
  exit /b 1
)
echo.
echo Menjalankan development server...
npm run dev
pause
