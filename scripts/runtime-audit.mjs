import fs from 'node:fs'
import path from 'node:path'
import { build, stop } from 'esbuild'

const debugUrl = process.env.CHROME_DEBUG_URL || 'http://127.0.0.1:9223'
const downloadDir = path.resolve('/tmp/maysan-runtime-downloads')
fs.rmSync(downloadDir, { recursive: true, force: true })
fs.mkdirSync(downloadDir, { recursive: true })

const auditBuild = await build({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  write: false,
  outdir: '/tmp/maysan-runtime-bundle',
  format: 'iife',
  platform: 'browser',
  jsx: 'automatic',
  loader: { '.jsx': 'jsx', '.png': 'dataurl', '.svg': 'dataurl', '.webp': 'dataurl' },
  define: { 'process.env.NODE_ENV': '"production"' },
  minify: true,
})
const js = auditBuild.outputFiles.find((file) => file.path.endsWith('.js'))?.text
const distHtml = fs.readFileSync(path.resolve('dist/index.html'), 'utf8')
const cssAsset = distHtml.match(/href="\.\/(assets\/[^\"]+\.css)"/)?.[1]
let css = cssAsset ? fs.readFileSync(path.resolve('dist', cssAsset), 'utf8') : ''
for (const prefix of ['maysan-regional-2019-usgs', 'maysan-regional-2024-usgs']) {
  const filename = fs.readdirSync(path.resolve('dist/assets')).find((name) => name.startsWith(prefix) && name.endsWith('.webp'))
  if (!filename) continue
  const dataUrl = `data:image/webp;base64,${fs.readFileSync(path.resolve('dist/assets', filename)).toString('base64')}`
  css = css.split(`url(./${filename})`).join(`url(${dataUrl})`)
}
if (!js || !css) throw new Error('Audit bundle could not be generated')
const inlineHtml = `<!doctype html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WebGIS Audit</title><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`


const target = await fetch(`${debugUrl}/json/new?about:blank`, { method: 'PUT' }).then((response) => {
  if (!response.ok) throw new Error(`Cannot create Chromium target: ${response.status}`)
  return response.json()
})

class CDP {
  constructor(url) { this.url = url; this.id = 0; this.pending = new Map(); this.listeners = new Map() }
  async connect() {
    this.ws = new WebSocket(this.url)
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true })
      this.ws.addEventListener('error', reject, { once: true })
    })
    this.ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id)
        this.pending.delete(message.id)
        message.error ? reject(new Error(message.error.message)) : resolve(message.result)
        return
      }
      for (const handler of this.listeners.get(message.method) || []) handler(message.params)
    })
  }
  send(method, params = {}) {
    const id = ++this.id
    this.ws.send(JSON.stringify({ id, method, params }))
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }))
  }
  on(method, handler) { this.listeners.set(method, [...(this.listeners.get(method) || []), handler]) }
  close() { this.ws.close() }
}

const cdp = new CDP(target.webSocketDebuggerUrl)
await cdp.connect()
await cdp.send('Page.enable')
await cdp.send('Runtime.enable')
await cdp.send('Log.enable')
await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
  source: `try { sessionStorage.removeItem('maysan-entered'); localStorage.removeItem('maysan-theme'); } catch {}`,
})
await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloadDir })

const errors = []
cdp.on('Runtime.exceptionThrown', ({ exceptionDetails }) => errors.push(exceptionDetails.exception?.description || exceptionDetails.text || 'JavaScript exception'))
cdp.on('Log.entryAdded', ({ entry }) => {
  if (entry.level === 'error' && !entry.text.includes('Failed to load resource')) errors.push(entry.text)
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
async function evaluate(expression) {
  const result = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text)
  return result.result.value
}
async function clickText(text, exact = false) {
  return evaluate(`(() => {
    const nodes = [...document.querySelectorAll('button,a')];
    const el = nodes.find((node) => ${exact ? `node.textContent.trim() === ${JSON.stringify(text)}` : `node.textContent.trim().includes(${JSON.stringify(text)})`});
    if (!el) return false; el.click(); return true;
  })()`)
}
async function screenshot(filePath) {
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  fs.writeFileSync(filePath, Buffer.from(data, 'base64'))
}
async function loadInline(hash = '') {
  await cdp.send('Page.navigate', { url: `about:blank${hash}` })
  await sleep(120)
  const { frameTree } = await cdp.send('Page.getFrameTree')
  await cdp.send('Page.setDocumentContent', { frameId: frameTree.frame.id, html: inlineHtml })
  await sleep(4200)
}

const results = []
const record = (name, ok, detail = '') => {
  const item = { name, ok: Boolean(ok), detail }
  results.push(item)
  console.log(`${item.ok ? 'PASS' : 'FAIL'}  ${item.name}${item.detail ? ` (${item.detail})` : ''}`)
}

await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
await loadInline()
record('Opening tampil', await evaluate(`document.body.innerText.includes('Buka dashboard analisis')`))
record('Latar citra opening berhasil dimuat', await evaluate(`getComputedStyle(document.querySelector('.opening-satellite')).backgroundImage !== 'none'`))
await screenshot('/tmp/maysan-opening-audit.png')
record('Tombol masuk dapat diklik', await clickText('Buka dashboard analisis'))
await sleep(1700)
record('Dashboard terbuka', await evaluate(`document.body.innerText.includes('in transition.') && location.hash === '#dashboard'`))
record('Desktop tanpa overflow horizontal', await evaluate(`document.documentElement.scrollWidth <= window.innerWidth + 1`), await evaluate(`document.documentElement.scrollWidth + ' / ' + window.innerWidth`))
await screenshot('/tmp/maysan-dashboard-audit.png')
record('Navbar menggunakan posisi fixed', await evaluate(`getComputedStyle(document.querySelector('nav[aria-label="Navigasi utama"]')).position === 'fixed'`))
await evaluate(`window.scrollTo(0, 650)`)
await sleep(350)
record('Navbar tetap terlihat saat halaman digulir', await evaluate(`(() => { const nav = document.querySelector('nav[aria-label="Navigasi utama"]'); const rect = nav.getBoundingClientRect(); return rect.top === 0 && rect.bottom > 55 })()`))
await evaluate(`document.querySelector('.comparison-chart')?.scrollIntoView({ block: 'center' })`)
await sleep(450)
await screenshot('/tmp/maysan-comparison-audit.png')
await evaluate(`window.scrollTo(0, 0)`)

for (const [label, hash, expected] of [
  ['Peta Tutupan', '#map', 'Maysan spatial explorer'],
  ['Perubahan', '#change', 'Perubahan dibaca sebagai adegan spasial'],
  ['Statistika', '#statistics', 'Angka dirancang untuk menjawab pertanyaan'],
  ['Validasi', '#validation', 'Keandalan model ditampilkan'],
  ['Tentang', '#about', 'Satu governorate, banyak lanskap'],
]) {
  const clicked = await clickText(label, true)
  await sleep(label === 'Peta Tutupan' ? 1600 : 700)
  record(`Navigasi ${label}`, clicked && await evaluate(`location.hash === ${JSON.stringify(hash)} && document.body.innerText.includes(${JSON.stringify(expected)})`))
}

await clickText('Perubahan', true)
await sleep(850)
await evaluate(`document.querySelector('.satellite-compare')?.scrollIntoView({ block: 'center' })`)
await sleep(250)
record('Dua citra pembanding berhasil dimuat', await evaluate(`(() => { const images = [...document.querySelectorAll('.satellite-compare img')]; return images.length === 2 && images.every((image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0) })()`))
record('Range slider lama sudah dihapus', await evaluate(`!document.querySelector('.satellite-compare input[type="range"]')`))
record('Tombol panah menjadi satu-satunya slider', await evaluate(`Boolean(document.querySelector('.satellite-compare [role="slider"]'))`))
const compareBefore = await evaluate(`Number(document.querySelector('.satellite-compare [role="slider"]')?.getAttribute('aria-valuenow'))`)
const compareFrame = await evaluate(`(() => { const rect = document.querySelector('.satellite-compare')?.getBoundingClientRect(); return rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null })()`)
if (compareFrame) {
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', buttons: 1, clickCount: 1, x: compareFrame.x + compareFrame.width * .82, y: compareFrame.y + compareFrame.height - 18 })
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', buttons: 0, clickCount: 1, x: compareFrame.x + compareFrame.width * .82, y: compareFrame.y + compareFrame.height - 18 })
  await sleep(120)
}
const compareAfterOutsideClick = await evaluate(`Number(document.querySelector('.satellite-compare [role="slider"]')?.getAttribute('aria-valuenow'))`)
record('Klik di luar tombol panah tidak menggeser pembanding', compareAfterOutsideClick === compareBefore, `${compareBefore} → ${compareAfterOutsideClick}`)
const compareAfterDragSimulated = await evaluate(`(async () => {
  const slider = document.querySelector('.satellite-compare [role="slider"]')
  const frame = document.querySelector('.satellite-compare')
  if (!slider || !frame) return null
  const frameRect = frame.getBoundingClientRect()
  const sliderRect = slider.getBoundingClientRect()
  const startX = sliderRect.left + sliderRect.width / 2
  const startY = sliderRect.top + sliderRect.height / 2
  slider.setPointerCapture = () => {}
  slider.hasPointerCapture = () => false
  slider.releasePointerCapture = () => {}
  slider.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'mouse', buttons: 1, clientX: startX, clientY: startY }))
  slider.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1, pointerType: 'mouse', buttons: 1, clientX: Math.min(frameRect.right - 12, startX + 220), clientY: startY }))
  slider.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, pointerType: 'mouse', buttons: 0, clientX: Math.min(frameRect.right - 12, startX + 220), clientY: startY }))
  await new Promise((resolve) => setTimeout(resolve, 150))
  return Number(slider.getAttribute('aria-valuenow'))
})()`)
const compareAfterDrag = compareAfterDragSimulated
record('Seret tombol panah menggeser pembanding', compareAfterDrag > compareBefore + 5, `${compareBefore} → ${compareAfterDrag}`)
const compareBeforeKeyboard = await evaluate(`(() => { const slider = document.querySelector('.satellite-compare [role="slider"]'); if (!slider) return null; slider.focus(); return Number(slider.getAttribute('aria-valuenow')) })()`)
await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowLeft', code: 'ArrowLeft' })
await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowLeft', code: 'ArrowLeft' })
await sleep(120)
const compareAfterKeyboard = await evaluate(`Number(document.querySelector('.satellite-compare [role="slider"]')?.getAttribute('aria-valuenow'))`)
record('Tombol panah mendukung keyboard', compareBeforeKeyboard !== null && compareAfterKeyboard === Math.max(8, compareBeforeKeyboard - 2), `${compareBeforeKeyboard} → ${compareAfterKeyboard}`)
await screenshot('/tmp/maysan-comparison-audit.png')

await clickText('Statistika', true)
await sleep(850)
record('Kartu statistik tampil lengkap', await evaluate(`document.querySelectorAll('.metric-card').length === 4 && document.body.innerText.includes('Baseline 2020') && document.body.innerText.includes('Perubahan luas')`))
record('Teks kartu statistik memiliki kontras tinggi', await evaluate(`(() => { const el = document.querySelector('.metric-card h3'); if (!el) return false; const color = getComputedStyle(el).color; return color !== 'rgb(0, 0, 0)' && color !== 'rgba(0, 0, 0, 1)' && color !== 'transparent' })()`))
record('Grafik tidak memakai kotak putih', await evaluate(`(() => { const surfaces = [...document.querySelectorAll('.recharts-surface')]; return surfaces.length > 0 && surfaces.every((el) => { const bg = getComputedStyle(el).backgroundColor; return bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent' }) })()`))
await screenshot('/tmp/maysan-statistics-audit.png')
record('Grafik perubahan bersih tersedia', await evaluate(`Boolean(document.querySelector('.change-balance-panel')) && document.body.innerText.includes('Kelas yang hilang dan kelas yang meluas')`))
record('Unduhan CSV dapat dipicu', await clickText('Unduh CSV', true))
await sleep(650)
record('File CSV berhasil dibuat', fs.existsSync(path.join(downloadDir, 'maysan-land-cover-area-simulated.csv')))
const darkBackground = await evaluate(`getComputedStyle(document.querySelector('.app-shell')).backgroundColor`)
record('Mode terang dapat diaktifkan', await evaluate(`(() => { const button = document.querySelector('button[aria-label="Aktifkan mode terang"]'); if (!button) return false; button.click(); return true })()`))
await sleep(650)
record('Tema berubah menjadi daylight', await evaluate(`document.querySelector('.app-shell')?.dataset.theme === 'light' && document.documentElement.dataset.theme === 'light'`))
record('Latar mode terang benar-benar berubah', await evaluate(`getComputedStyle(document.querySelector('.app-shell')).backgroundColor !== ${JSON.stringify(darkBackground)}`))
record('Panel grafik mode terang tidak gelap', await evaluate(`(() => { const panel = document.querySelector('.chart-panel'); if (!panel) return false; const c = getComputedStyle(panel).backgroundColor; return c !== 'rgb(9, 21, 18)' && c !== 'rgb(10, 23, 19)' })()`))
await screenshot('/tmp/maysan-statistics-light-audit.png')

await clickText('Peta Tutupan', true)
await sleep(1400)
record('Peta Leaflet dirender', await evaluate(`Boolean(document.querySelector('.leaflet-container'))`))
record('Peta memenuhi area utama viewport', await evaluate(`(() => { const stage = document.querySelector('.map-stage'); return stage && stage.getBoundingClientRect().height >= window.innerHeight - 110 })()`))
record('Scroll wheel peta dinonaktifkan', await evaluate(`(async () => { const pane = document.querySelector('.leaflet-map-pane'); const map = document.querySelector('.leaflet-container'); if (!pane || !map) return false; const before = pane.style.transform; map.dispatchEvent(new WheelEvent('wheel', { deltaY: -500, bubbles: true, clientX: 700, clientY: 450 })); await new Promise(r => setTimeout(r, 350)); return pane.style.transform === before })()`))
record('Kontrol zoom manual tersedia', await evaluate(`Boolean(document.querySelector('button[aria-label="Perbesar peta"]')) && Boolean(document.querySelector('button[aria-label="Perkecil peta"]'))`))
record('Unduhan GeoJSON dapat dipicu', await clickText('GeoJSON', true))
await sleep(650)
record('File GeoJSON berhasil dibuat', fs.existsSync(path.join(downloadDir, 'maysan-classification-2025-simulated.geojson')))
await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 560, deviceScaleFactor: 1, mobile: false })
await sleep(250)
await evaluate(`window.scrollTo(0, 0)`)
record('Roda mouse di atas peta menggulir halaman', await evaluate(`(async () => { const map = document.querySelector('.leaflet-container'); if (!map || document.documentElement.scrollHeight <= window.innerHeight) return false; map.dispatchEvent(new WheelEvent('wheel', { deltaY: 260, bubbles: true, cancelable: true, clientX: 700, clientY: 360 })); await new Promise(r => setTimeout(r, 250)); return window.scrollY > 0 })()`))
await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
await sleep(200)
await screenshot('/tmp/maysan-map-audit.png')
record('Mode perubahan peta dapat dipilih', await evaluate(`(() => { const buttons = [...document.querySelectorAll('button')]; const matches = buttons.filter((node) => node.textContent.trim() === 'Perubahan' && node.querySelector('svg')); const el = matches.at(-1); if (!el) return false; el.click(); return true })()`))
await sleep(500)
record('Layer hotspot tampil', await evaluate(`document.body.innerText.includes('Perubahan 2020–2025') && document.body.innerText.includes('Air → kering')`))

record('Chatbot dapat dibuka', await evaluate(`(() => { const el = document.querySelector('button[aria-label="Buka chatbot MARA"]'); if (!el) return false; el.click(); return true })()`))
await sleep(350)
record('Input chatbot tersedia', await evaluate(`Boolean(document.querySelector('input[aria-label="Pertanyaan untuk MARA"]'))`))
await evaluate(`(() => { const input = document.querySelector('input[aria-label="Pertanyaan untuk MARA"]'); if (!input) return false; const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(input, 'Mengapa 2020 dipilih?'); input.dispatchEvent(new Event('input', { bubbles: true })); return true })()`)
await sleep(100)
await evaluate(`(() => { const el = document.querySelector('button[aria-label="Kirim pertanyaan"]'); if (!el) return false; el.click(); return true })()`)
await sleep(450)
record('Chatbot memberikan respons', await evaluate(`document.body.innerText.includes('Tahun 2020 digunakan sebagai baseline')`))

await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 1, mobile: true })
await loadInline()
await clickText('Buka dashboard analisis')
await sleep(1100)
record('Mobile tanpa overflow horizontal', await evaluate(`document.documentElement.scrollWidth <= window.innerWidth + 1`), await evaluate(`document.documentElement.scrollWidth + ' / ' + window.innerWidth`))
record('Menu mobile dapat dibuka', await evaluate(`(() => { const b = document.querySelector('button[aria-label="Buka menu navigasi"]'); if (!b) return false; b.click(); return true })()`))
await sleep(300)
record('Menu mobile menampilkan halaman', await evaluate(`document.body.innerText.includes('Peta Tutupan') && document.body.innerText.includes('Validasi')`))
await clickText('Peta Tutupan', true)
await sleep(950)
record('Panel layer mobile tidak menutupi peta saat pertama dibuka', await evaluate(`!document.querySelector('.map-layer-panel')`))
record('Peta mobile tanpa overflow horizontal', await evaluate(`document.documentElement.scrollWidth <= window.innerWidth + 1`), await evaluate(`document.documentElement.scrollWidth + ' / ' + window.innerWidth`))
await screenshot('/tmp/maysan-mobile-audit.png')

record('Hash #map konsisten dengan halaman peta mobile', await evaluate(`location.hash === '#map' && Boolean(document.querySelector('.leaflet-container'))`))

record('Tidak ada exception JavaScript', errors.length === 0, errors.join(' | '))

console.log('\nRUNTIME AUDIT')
console.log('=============')
const failed = results.filter((item) => !item.ok)
console.log(`\nHasil: ${results.length - failed.length} lulus, ${failed.length} gagal.`)
if (errors.length) console.log('Errors:', errors)

cdp.close()
await fetch(`${debugUrl}/json/close/${target.id}`).catch(() => {})
stop()
process.exit(failed.length ? 1 : 0)
