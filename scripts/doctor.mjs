import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const major = Number(process.versions.node.split('.')[0])
const lockPath = resolve(root, 'package-lock.json')
const npmrcPath = resolve(root, '.npmrc')
const viteBin = process.platform === 'win32'
  ? resolve(root, 'node_modules', '.bin', 'vite.cmd')
  : resolve(root, 'node_modules', '.bin', 'vite')

let failed = false
const check = (condition, ok, bad) => {
  if (condition) console.log(`PASS  ${ok}`)
  else {
    console.error(`FAIL  ${bad}`)
    failed = true
  }
}

console.log(`Node.js ${process.versions.node}`)
check(major >= 18, 'Node.js memenuhi minimum versi 18', 'Gunakan Node.js versi 18 atau lebih baru')
check(existsSync(npmrcPath), '.npmrc proyek tersedia', '.npmrc proyek tidak ditemukan')

if (existsSync(lockPath)) {
  const lock = readFileSync(lockPath, 'utf8')
  check(!lock.includes('applied-caas-gateway') && !lock.includes('internal.api.openai.org'), 'Lockfile menggunakan registry publik', 'Lockfile masih mengandung registry internal')
  check(lock.includes('https://registry.npmjs.org/'), 'URL paket mengarah ke registry.npmjs.org', 'URL registry publik tidak ditemukan pada lockfile')
} else {
  console.error('FAIL  package-lock.json tidak ditemukan')
  failed = true
}

if (existsSync(viteBin)) console.log('PASS  Vite sudah terpasang dan siap dijalankan')
else console.log('INFO  Vite belum terpasang. Jalankan npm install terlebih dahulu.')

if (failed) process.exit(1)
