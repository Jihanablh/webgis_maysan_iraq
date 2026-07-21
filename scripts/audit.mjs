import fs from 'node:fs'
import path from 'node:path'
import {
  changeHotspots,
  classAreaData,
  classificationByYear,
  confusionMatrix,
  overallAccuracy,
  samplePoints,
  studyBoundary,
} from '../src/data/mockData.js'

const failures = []
const passes = []
const pass = (message) => passes.push(message)
const fail = (message) => failures.push(message)
const closeTo = (a, b, epsilon = 0.001) => Math.abs(a - b) <= epsilon
const samePoint = (a, b, epsilon = 1e-9) => closeTo(a[0], b[0], epsilon) && closeTo(a[1], b[1], epsilon)

function polygonsFromGeometry(geometry) {
  if (geometry?.type === 'Polygon') return [geometry.coordinates]
  if (geometry?.type === 'MultiPolygon') return geometry.coordinates
  return []
}

function ringsFromGeometry(geometry) {
  return polygonsFromGeometry(geometry).flat()
}

function signedRingArea(ring) {
  let sum = 0
  for (let index = 0; index < ring.length - 1; index += 1) {
    const [x1, y1] = ring[index]
    const [x2, y2] = ring[index + 1]
    sum += x1 * y2 - x2 * y1
  }
  return sum / 2
}

function geometryArea(geometry) {
  return polygonsFromGeometry(geometry).reduce((total, polygon) => {
    const [outer, ...holes] = polygon
    return total + Math.abs(signedRingArea(outer)) - holes.reduce((sum, hole) => sum + Math.abs(signedRingArea(hole)), 0)
  }, 0)
}

function orientation(a, b, c) {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
}

function pointOnSegment(point, start, end, epsilon = 1e-9) {
  if (Math.abs(orientation(start, end, point)) > epsilon) return false
  return point[0] >= Math.min(start[0], end[0]) - epsilon
    && point[0] <= Math.max(start[0], end[0]) + epsilon
    && point[1] >= Math.min(start[1], end[1]) - epsilon
    && point[1] <= Math.max(start[1], end[1]) + epsilon
}

function properSegmentCross(a, b, c, d, epsilon = 1e-9) {
  const o1 = orientation(a, b, c)
  const o2 = orientation(a, b, d)
  const o3 = orientation(c, d, a)
  const o4 = orientation(c, d, b)
  return ((o1 > epsilon && o2 < -epsilon) || (o1 < -epsilon && o2 > epsilon))
    && ((o3 > epsilon && o4 < -epsilon) || (o3 < -epsilon && o4 > epsilon))
}

function ringIsSimple(ring) {
  if (!Array.isArray(ring) || ring.length < 4 || !samePoint(ring[0], ring.at(-1))) return false
  const unique = ring.slice(0, -1)
  for (let index = 0; index < unique.length; index += 1) {
    for (let other = index + 1; other < unique.length; other += 1) {
      if (other === index + 1) continue
      if (samePoint(unique[index], unique[other])) return false
    }
  }

  const segmentCount = ring.length - 1
  for (let first = 0; first < segmentCount; first += 1) {
    for (let second = first + 1; second < segmentCount; second += 1) {
      const adjacent = second === first + 1 || (first === 0 && second === segmentCount - 1)
      if (adjacent) continue
      if (properSegmentCross(ring[first], ring[first + 1], ring[second], ring[second + 1], 1e-12)) return false
    }
  }
  return Math.abs(signedRingArea(ring)) > 1e-10
}

function pointInRing(point, ring, includeBoundary = true) {
  for (let index = 0; index < ring.length - 1; index += 1) {
    if (pointOnSegment(point, ring[index], ring[index + 1])) return includeBoundary
  }
  let inside = false
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    const [xi, yi] = ring[index]
    const [xj, yj] = ring[previous]
    const intersects = ((yi > point[1]) !== (yj > point[1]))
      && point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi
    if (intersects) inside = !inside
  }
  return inside
}

function pointInGeometry(point, geometry, includeBoundary = true) {
  return polygonsFromGeometry(geometry).some(([outer, ...holes]) => {
    if (!pointInRing(point, outer, includeBoundary)) return false
    return holes.every((hole) => !pointInRing(point, hole, !includeBoundary))
  })
}

function geometryIsValid(geometry) {
  const polygons = polygonsFromGeometry(geometry)
  if (polygons.length === 0) return false
  return polygons.every((polygon) => polygon.length > 0 && polygon.every(ringIsSimple))
}

function geometryInside(inner, outer) {
  return ringsFromGeometry(inner).every((ring) => ring.every((point) => pointInGeometry(point, outer, true)))
}

function geometriesOverlap(firstGeometry, secondGeometry) {
  const firstRings = ringsFromGeometry(firstGeometry)
  const secondRings = ringsFromGeometry(secondGeometry)

  for (const firstRing of firstRings) {
    for (const secondRing of secondRings) {
      for (let first = 0; first < firstRing.length - 1; first += 1) {
        for (let second = 0; second < secondRing.length - 1; second += 1) {
          if (properSegmentCross(firstRing[first], firstRing[first + 1], secondRing[second], secondRing[second + 1])) return true
        }
      }
    }
  }

  const firstExteriorPoints = polygonsFromGeometry(firstGeometry).flatMap((polygon) => polygon[0].slice(0, -1))
  const secondExteriorPoints = polygonsFromGeometry(secondGeometry).flatMap((polygon) => polygon[0].slice(0, -1))
  return firstExteriorPoints.some((point) => pointInGeometry(point, secondGeometry, false))
    || secondExteriorPoints.some((point) => pointInGeometry(point, firstGeometry, false))
}

const total2020 = classAreaData.reduce((sum, item) => sum + item.area2020, 0)
const total2025 = classAreaData.reduce((sum, item) => sum + item.area2025, 0)
const totalChange = classAreaData.reduce((sum, item) => sum + item.change, 0)

closeTo(total2020, total2025)
  ? pass(`Total area konsisten: ${total2020.toFixed(1)} km² pada 2020 dan 2025`)
  : fail(`Total area tidak konsisten: ${total2020} vs ${total2025}`)
closeTo(totalChange, 0)
  ? pass('Jumlah perubahan luas antarkelas seimbang (0 km²)')
  : fail(`Jumlah perubahan luas tidak seimbang: ${totalChange}`)

const matrix = confusionMatrix.values
const squareMatrix = matrix.length === confusionMatrix.labels.length && matrix.every((row) => row.length === matrix.length)
squareMatrix ? pass('Confusion matrix berbentuk persegi 4 × 4') : fail('Confusion matrix tidak valid')

const matrixTotal = matrix.flat().reduce((sum, value) => sum + value, 0)
const diagonal = matrix.reduce((sum, row, index) => sum + row[index], 0)
const computedAccuracy = (diagonal / matrixTotal) * 100
closeTo(computedAccuracy, overallAccuracy.accuracy)
  ? pass(`Overall accuracy konsisten: ${computedAccuracy.toFixed(2)}%`)
  : fail(`Overall accuracy berbeda: ${computedAccuracy.toFixed(2)}% vs ${overallAccuracy.accuracy}%`)
closeTo(matrixTotal, overallAccuracy.samples)
  ? pass(`Jumlah sampel confusion matrix konsisten: ${matrixTotal}`)
  : fail(`Jumlah sampel confusion matrix berbeda: ${matrixTotal} vs ${overallAccuracy.samples}`)

geometryIsValid(studyBoundary.geometry)
  ? pass('Geometri batas Maysan valid dan bebas self-intersection')
  : fail('Geometri batas Maysan tidak valid')

const boundaryArea = geometryArea(studyBoundary.geometry)
for (const year of [2020, 2025]) {
  const collection = classificationByYear[year]
  const keys = new Set(collection.features.map((item) => item.properties.classKey))
  const allClasses = ['water', 'vegetation', 'bare', 'built'].every((key) => keys.has(key))
  allClasses ? pass(`Empat kelas tersedia pada layer ${year}`) : fail(`Kelas layer ${year} tidak lengkap`)

  const expectedAreas = Object.fromEntries(classAreaData.map((item) => [item.classKey, item[`area${year}`]]))
  for (const item of collection.features) {
    const name = item.properties.name
    geometryIsValid(item.geometry) ? pass(`Geometri ${name} ${year} valid`) : fail(`Geometri ${name} ${year} tidak valid atau self-intersection`)
    geometryInside(item.geometry, studyBoundary.geometry) ? pass(`Geometri ${name} ${year} berada di dalam Maysan`) : fail(`Geometri ${name} ${year} keluar dari batas Maysan`)
    closeTo(item.properties.area, expectedAreas[item.properties.classKey])
      ? pass(`Atribut luas ${item.properties.classKey} ${year} konsisten`)
      : fail(`Atribut luas ${item.properties.classKey} ${year} tidak konsisten`)
  }

  for (let first = 0; first < collection.features.length; first += 1) {
    for (let second = first + 1; second < collection.features.length; second += 1) {
      const a = collection.features[first]
      const b = collection.features[second]
      if (geometriesOverlap(a.geometry, b.geometry)) fail(`Layer ${year} tumpang tindih: ${a.properties.classKey} dan ${b.properties.classKey}`)
    }
  }

  const classifiedArea = collection.features.reduce((sum, item) => sum + geometryArea(item.geometry), 0)
  closeTo(classifiedArea, boundaryArea, 0.00001)
    ? pass(`Layer ${year} menutup seluruh area studi tanpa celah`)
    : fail(`Cakupan geometri ${year} tidak penuh: ${((classifiedArea / boundaryArea) * 100).toFixed(2)}%`)
}

for (const hotspot of changeHotspots.features) {
  geometryIsValid(hotspot.geometry) ? pass(`${hotspot.properties.name} valid`) : fail(`${hotspot.properties.name} tidak valid`)
  geometryInside(hotspot.geometry, studyBoundary.geometry) ? pass(`${hotspot.properties.name} berada di dalam Maysan`) : fail(`${hotspot.properties.name} keluar dari Maysan`)
}

const samplesInside = samplePoints.every((point) => pointInGeometry([point.position[1], point.position[0]], studyBoundary.geometry, true))
samplesInside ? pass('Seluruh titik ground truth berada di dalam Maysan') : fail('Ada titik ground truth di luar Maysan')

const imageryAssets = [
  path.resolve('src/assets/maysan-regional-2019-usgs.webp'),
  path.resolve('src/assets/maysan-regional-2024-usgs.webp'),
]
const imageryReady = imageryAssets.every((asset) => fs.existsSync(asset) && fs.statSync(asset).size > 10000)
imageryReady ? pass('Dua aset citra satelit konteks tersedia dan tidak kosong') : fail('Aset citra satelit konteks tidak lengkap')

const mapSource = fs.readFileSync(path.resolve('src/components/MapPanel.jsx'), 'utf8')
const immersiveControls = ['Klasifikasi', 'Perubahan', 'GeoJSON', 'Ground truth'].every((label) => mapSource.includes(label))
immersiveControls ? pass('Konsol peta memiliki kontrol utama') : fail('Kontrol utama konsol peta belum lengkap')
mapSource.includes('scrollWheelZoom={false}') && mapSource.includes('doubleClickZoom={false}') && mapSource.includes('forwardWheelToPage')
  ? pass('Zoom peta tenang dan roda mouse diteruskan untuk scroll halaman')
  : fail('Konfigurasi scroll atau sensitivitas zoom peta belum aman')
mapSource.includes('aria-label="Perbesar peta"') && mapSource.includes('aria-label="Perkecil peta"') && mapSource.includes('aria-label="Pusatkan kembali peta"')
  ? pass('Kontrol zoom manual dan reset peta tersedia')
  : fail('Kontrol zoom manual peta belum lengkap')
mapSource.includes('MAYSAN_CENTER = [31.84, 47.14]')
  ? pass('Pusat peta konsisten dengan informasi koordinat Maysan')
  : fail('Pusat peta tidak konsisten')

const appSource = fs.readFileSync(path.resolve('src/App.jsx'), 'utf8')
const requiredPages = ['dashboard', 'map', 'change', 'statistics', 'validation', 'about']
const pagesComplete = requiredPages.every((page) => appSource.includes(`id: '${page}'`))
pagesComplete ? pass('Enam halaman internal navbar tersedia') : fail('Halaman internal navbar belum lengkap')
appSource.includes('fixed inset-x-0 top-0') && appSource.includes('pt-[92px]')
  ? pass('Navbar fixed memiliki kompensasi ruang konten')
  : fail('Navbar fixed atau kompensasi kontennya belum lengkap')
appSource.includes('lazy(() => import(\'./components/MapPanel\'))')
  ? pass('Mesin peta dimuat secara lazy untuk mengurangi beban awal')
  : fail('Mesin peta belum dipisahkan dari bundle awal')
appSource.includes('maysan-entered') && appSource.includes('getInitialPage')
  ? pass('Deep link dan status masuk aplikasi dipertahankan saat refresh')
  : fail('Deep link atau status masuk aplikasi belum aman')
appSource.includes('Baseline 2020') && appSource.includes('Perubahan luas') && appSource.includes('ResearchSignals')
  ? pass('Kartu statistik memuat baseline, kondisi terkini, delta, dan ringkasan utama')
  : fail('Informasi kartu statistik belum lengkap')
appSource.includes('ChartTooltip') && appSource.includes('ComparativeAreaChart') && appSource.includes('NetChangeChart') && appSource.includes('ReferenceLine')
  ? pass('Grafik memiliki tooltip kustom, sumbu referensi, dan ringkasan perubahan bersih')
  : fail('Penyempurnaan visual grafik belum lengkap')


const comparatorReady = appSource.includes('role="slider"')
  && appSource.includes('onPointerDown={handlePointerDown}')
  && appSource.includes('onPointerMove={handlePointerMove}')
  && appSource.includes('clipPath: `inset(0 ${100 - reveal}% 0 0)`')
  && !appSource.includes('type="range"')
comparatorReady
  ? pass('Pembanding citra hanya digeser melalui tombol panah dan mendukung keyboard')
  : fail('Interaksi pembanding citra belum aman atau masih memakai range slider lama')

const imageryImportsReady = appSource.includes("from './assets/maysan-regional-2019-usgs.webp'")
  && appSource.includes("from './assets/maysan-regional-2024-usgs.webp'")
  && !appSource.includes('src="/images/')
imageryImportsReady
  ? pass('Citra pembanding dibundel sebagai aset relatif dan aman untuk subfolder deployment')
  : fail('Referensi citra masih berisiko gagal pada deployment subfolder')

const themeReady = appSource.includes("value === 'dark' ? 'light' : 'dark'") && appSource.includes('data-theme={theme}') && appSource.includes('maysan-theme')
themeReady ? pass('Mode terang dan gelap aktif serta tersimpan di localStorage') : fail('Implementasi tema terang belum lengkap')

const cssSource = fs.readFileSync(path.resolve('src/index.css'), 'utf8')
cssSource.includes('.theme-light') && cssSource.includes("html[data-theme='light']") && cssSource.includes('overscroll-behavior: auto')
  ? pass('Tema daylight dan scroll chaining peta tersedia pada CSS')
  : fail('CSS tema daylight atau scroll peta belum lengkap')


cssSource.includes('.satellite-compare__handle') && cssSource.includes('cursor: ew-resize') && !cssSource.includes("input[type='range']")
  ? pass('CSS pembanding citra tidak lagi menampilkan bulatan range slider')
  : fail('CSS pembanding citra masih menyisakan kontrol range lama')

const sourceFiles = fs.readdirSync(path.resolve('src'), { recursive: true })
  .filter((name) => typeof name === 'string' && /\.(js|jsx|css)$/.test(name))
const sourceContent = sourceFiles.map((name) => fs.readFileSync(path.resolve('src', name), 'utf8')).join('\n')
const staleLocations = ['hawizeh', 'hoveizeh', 'hoor al-azim', 'khuzestan']
const foundStale = staleLocations.filter((term) => sourceContent.toLowerCase().includes(term))
foundStale.length === 0 ? pass('Tidak ada referensi lokasi lama di source code') : fail(`Referensi lokasi lama ditemukan: ${foundStale.join(', ')}`)

const forbiddenPhrases = ['Research scope', 'List Bagian Data', 'List Bagian Geografis', 'Penyusunan bahan presentasi']
const distIndex = path.resolve('dist/index.html')
if (fs.existsSync(distIndex)) {
  const distFiles = fs.readdirSync(path.resolve('dist/assets')).filter((name) => name.endsWith('.js') || name.endsWith('.css'))
  const builtContent = [fs.readFileSync(distIndex, 'utf8'), ...distFiles.map((name) => fs.readFileSync(path.resolve('dist/assets', name), 'utf8'))].join('\n')
  const found = forbiddenPhrases.filter((phrase) => builtContent.includes(phrase))
  found.length === 0 ? pass('Daftar pekerjaan penelitian tidak tampil di build website') : fail(`Konten terlarang masih tampil: ${found.join(', ')}`)
  const builtImages = fs.readdirSync(path.resolve('dist/assets')).filter((name) => /^maysan-regional-20(19|24)-usgs-.*\.webp$/.test(name))
  builtImages.length === 2
    ? pass('Dua citra konteks masuk ke dist/assets dengan nama hashed')
    : fail(`Aset citra hasil build tidak lengkap: ${builtImages.join(', ')}`)
  const distHtmlContent = fs.readFileSync(distIndex, 'utf8')
  distHtmlContent.includes('src="./assets/') && distHtmlContent.includes('href="./assets/')
    ? pass('Build menggunakan referensi aset relatif untuk deployment subfolder')
    : fail('Build masih menggunakan referensi aset absolut')
  pass('Build production dist/index.html tersedia')
} else {
  fail('Build production belum tersedia')
}

console.log('\nWEBGIS AUDIT')
console.log('============')
for (const message of passes) console.log(`PASS  ${message}`)
for (const message of failures) console.log(`FAIL  ${message}`)
console.log(`\nHasil: ${passes.length} lulus, ${failures.length} gagal.`)
if (failures.length > 0) process.exit(1)
