export { classificationByYear } from './classificationData.js'

export const classMeta = {
  water: { label: 'Air / Wetland', color: '#4fc3d7', short: 'Air' },
  vegetation: { label: 'Vegetasi', color: '#62b879', short: 'Vegetasi' },
  bare: { label: 'Lahan terbuka / kering', color: '#d79a55', short: 'Lahan terbuka' },
  built: { label: 'Area terbangun / aktivitas manusia', color: '#d96767', short: 'Terbangun' },
}

export const classAreaData = [
  { classKey: 'water', className: 'Air / Wetland', area2020: 2480, area2025: 2130, change: -350, changePct: -14.1 },
  { classKey: 'vegetation', className: 'Vegetasi', area2020: 6420, area2025: 6050, change: -370, changePct: -5.8 },
  { classKey: 'bare', className: 'Lahan terbuka / kering', area2020: 6580, area2025: 7180, change: 600, changePct: 9.1 },
  { classKey: 'built', className: 'Area terbangun', area2020: 592, area2025: 712, change: 120, changePct: 20.3 },
]

export const statusCards = [
  { label: 'Air / Wetland', value: '2.130 km²', note: 'Kondisi simulasi 2025', trend: '-14,1%', tone: 'water' },
  { label: 'Vegetasi', value: '6.050 km²', note: 'Kondisi simulasi 2025', trend: '-5,8%', tone: 'vegetation' },
  { label: 'Lahan Terbuka', value: '7.180 km²', note: 'Kondisi simulasi 2025', trend: '+9,1%', tone: 'bare' },
  { label: 'Area Terbangun', value: '712 km²', note: 'Kondisi simulasi 2025', trend: '+20,3%', tone: 'built' },
]

export const changeSummary = [
  { label: 'Kehilangan air', value: '350 km²', detail: 'Perubahan 2020–2025', classKey: 'water' },
  { label: 'Kehilangan vegetasi', value: '370 km²', detail: 'Perubahan 2020–2025', classKey: 'vegetation' },
  { label: 'Ekspansi lahan kering', value: '600 km²', detail: 'Perubahan 2020–2025', classKey: 'bare' },
]

export const annualIndexData = [
  { year: '2020', ndvi: 0.44, mndwi: 0.18, ndbi: -0.03, bsi: 0.09 },
  { year: '2021', ndvi: 0.43, mndwi: 0.17, ndbi: -0.02, bsi: 0.10 },
  { year: '2022', ndvi: 0.42, mndwi: 0.16, ndbi: -0.01, bsi: 0.11 },
  { year: '2023', ndvi: 0.41, mndwi: 0.15, ndbi: 0.00, bsi: 0.12 },
  { year: '2024', ndvi: 0.40, mndwi: 0.14, ndbi: 0.00, bsi: 0.13 },
  { year: '2025', ndvi: 0.39, mndwi: 0.13, ndbi: 0.01, bsi: 0.14 },
]

export const transitionData = [
  { transition: 'Air → Kering', area: 230 },
  { transition: 'Vegetasi → Kering', area: 310 },
  { transition: 'Vegetasi → Terbangun', area: 78 },
  { transition: 'Kering → Terbangun', area: 42 },
  { transition: 'Kering → Vegetasi', area: 26 },
]

// Batas Maysan disederhanakan dari Natural Earth Admin-1 / Wikimedia Commons (CC0).
export const studyBoundary = {
  type: 'Feature',
  properties: {
    name: 'Maysan Governorate, Iraq',
    source: 'Natural Earth Admin-1, simplified for this prototype',
    license: 'CC0',
  },
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [47.0584, 32.49448], [47.20547, 32.46404], [47.38412, 32.41257],
      [47.50767, 32.19984], [47.6178, 32.04187], [47.76171, 31.87165],
      [47.83727, 31.78447], [47.67893, 31.40785], [47.67609, 31.23659],
      [47.39476, 31.27915], [47.211, 31.24494], [47.12615, 31.12981],
      [46.95096, 31.14048], [46.80668, 31.15665], [46.7426, 31.20592],
      [46.7395, 31.297], [46.69403, 31.34855], [46.58892, 31.43733],
      [46.59915, 31.54162], [46.50882, 31.63262], [46.43265, 31.69122],
      [46.41436, 31.77881], [46.33705, 31.8879], [46.31741, 32.00544],
      [46.48205, 32.00533], [46.57683, 31.98358], [46.6037, 32.13372],
      [46.45022, 32.22191], [46.42862, 32.2495], [46.47626, 32.36986],
      [46.47492, 32.55274], [46.54613, 32.76697], [46.6006, 32.82252],
      [46.71589, 32.75601], [46.75733, 32.7162], [47.0584, 32.49448],
    ]],
  },
}


export const changeHotspots = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Hotspot A', transition: 'Air → lahan terbuka', area: 230, color: '#f3a451' },
      geometry: { type: 'Polygon', coordinates: [[[47.46,31.86],[47.57,31.87],[47.64,31.76],[47.59,31.64],[47.47,31.66],[47.42,31.76],[47.46,31.86]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Hotspot B', transition: 'Vegetasi → lahan terbuka', area: 310, color: '#e77d55' },
      geometry: { type: 'Polygon', coordinates: [[[46.72,32.28],[46.86,32.31],[46.94,32.18],[46.87,32.04],[46.73,32.07],[46.67,32.17],[46.72,32.28]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Hotspot C', transition: 'Vegetasi → area terbangun', area: 78, color: '#d95f76' },
      geometry: { type: 'Polygon', coordinates: [[[47.07,31.93],[47.20,31.93],[47.24,31.84],[47.18,31.77],[47.07,31.78],[47.02,31.86],[47.07,31.93]]] },
    },
  ],
}

export const samplePoints = [
  { name: 'GT-W-01', position: [31.82, 47.51], classKey: 'water', split: 'Training', source: 'Interpretasi citra manual' },
  { name: 'GT-W-02', position: [32.18, 46.94], classKey: 'water', split: 'Testing', source: 'Interpretasi citra manual' },
  { name: 'GT-V-01', position: [31.96, 46.92], classKey: 'vegetation', split: 'Training', source: 'Interpretasi citra manual' },
  { name: 'GT-V-02', position: [31.43, 46.91], classKey: 'vegetation', split: 'Testing', source: 'Interpretasi citra manual' },
  { name: 'GT-B-01', position: [32.47, 47.08], classKey: 'bare', split: 'Training', source: 'Interpretasi citra manual' },
  { name: 'GT-B-02', position: [31.86, 46.52], classKey: 'bare', split: 'Testing', source: 'Interpretasi citra manual' },
  { name: 'GT-U-01', position: [31.85, 47.14], classKey: 'built', split: 'Training', source: 'Interpretasi citra manual' },
  { name: 'GT-U-02', position: [31.56, 47.19], classKey: 'built', split: 'Testing', source: 'Interpretasi citra manual' },
]

export const rfParameters = [
  { label: 'Number of trees', value: '200' },
  { label: 'Training / testing', value: '70% / 30%' },
  { label: 'Random seed', value: '42' },
  { label: 'Bag fraction', value: '0,7' },
  { label: 'Min. leaf population', value: '1' },
  { label: 'Input features', value: 'Bands + 4 indices' },
]

export const confusionMatrix = {
  labels: ['Air', 'Vegetasi', 'Lahan terbuka', 'Terbangun'],
  values: [
    [92, 4, 3, 1],
    [5, 86, 7, 2],
    [2, 6, 88, 4],
    [1, 3, 5, 91],
  ],
}

export const accuracyMetrics = [
  { className: 'Air / Wetland', precision: 92.0, recall: 92.0, f1: 92.0 },
  { className: 'Vegetasi', precision: 86.9, recall: 86.0, f1: 86.4 },
  { className: 'Lahan terbuka / kering', precision: 85.4, recall: 88.0, f1: 86.7 },
  { className: 'Area terbangun', precision: 92.9, recall: 91.0, f1: 91.9 },
]

export const overallAccuracy = {
  accuracy: 89.25,
  macroPrecision: 89.3,
  macroRecall: 89.25,
  macroF1: 89.25,
  samples: 400,
}

export const featureImportanceData = [
  { feature: 'MNDWI', importance: 23.8, group: 'Indeks air' },
  { feature: 'NDVI', importance: 21.6, group: 'Indeks vegetasi' },
  { feature: 'B8 / NIR', importance: 15.2, group: 'Band Sentinel-2' },
  { feature: 'BSI', importance: 13.7, group: 'Indeks lahan terbuka' },
  { feature: 'B11 / SWIR', importance: 11.9, group: 'Band Sentinel-2' },
  { feature: 'NDBI', importance: 8.6, group: 'Indeks terbangun' },
  { feature: 'B4 / Red', importance: 5.2, group: 'Band Sentinel-2' },
]

export const storyFrames = [
  {
    id: 'water',
    index: '01',
    label: 'Hydrological signal',
    title: 'Ruang air Maysan menyusut di wetland timur dan sepanjang koridor hidrologis.',
    text: 'Skenario perubahan menunjukkan kehilangan air sebesar 350 km². Angka simulasi ini menjadi sinyal awal untuk memeriksa perubahan suplai air, konektivitas Sungai Tigris, dan kekeringan musiman.',
    value: '-350 km²',
    accent: '#4fc3d7',
  },
  {
    id: 'vegetation',
    index: '02',
    label: 'Ecological signal',
    title: 'Vegetasi dan lahan pertanian kehilangan sebagian kontinuitas spasialnya.',
    text: 'Penurunan NDVI dan pertambahan kelas lahan terbuka mengindikasikan tekanan pada bentang lahan Maysan yang perlu diverifikasi menggunakan sampel manual independen.',
    value: '-370 km²',
    accent: '#62b879',
  },
  {
    id: 'pressure',
    index: '03',
    label: 'Human pressure',
    title: 'Aktivitas manusia tumbuh di sekitar Amarah dan koridor permukiman selatan.',
    text: 'Kelas terbangun bertambah pada skenario 2025. Karena tanah terang dapat memiliki respons spektral serupa, interpretasi NDBI perlu dibaca bersama BSI dan konteks spasial.',
    value: '+120 km²',
    accent: '#d96767',
  },
]
