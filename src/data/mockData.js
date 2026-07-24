export { classificationByYear } from './classificationData.js'

export const classMeta = {
  water: { label: 'Air / Wetland', color: '#4fc3d7', short: 'Air' },
  nontarget: { label: 'Nontarget', color: '#d79a55', short: 'Nontarget' },
  vegetation: { label: 'Vegetasi', color: '#62b879', short: 'Vegetasi' },
  bare: { label: 'Lahan terbuka / kering', color: '#d79a55', short: 'Lahan terbuka' },
  built: { label: 'Area terbangun / aktivitas manusia', color: '#d96767', short: 'Terbangun' },
}

export const classAreaData = [
  { classKey: 'water', className: 'Air / Wetland', area2020: 1066.6645943089637, area2025: 243.56498572577788, change: -823.0996085831858, changePct: -77.16573822501461 },
  { classKey: 'nontarget', className: 'Nontarget', area2020: 16275.356800730684, area2025: 17098.45640904218, change: 823.099608311496, changePct: 5.057338377929335 },
]

export const statusCards = [
  { label: 'Air / Wetland', value: '243,565 km²', note: 'Hasil klasifikasi 2025', trend: '-77,17%', tone: 'water' },
  { label: 'Nontarget', value: '17.491,241 km²', note: 'Hasil klasifikasi 2025', trend: '+4,94%', tone: 'nontarget' },
]

export const changeSummary = [
  { label: 'Gain / 0→1', value: '117,843 km²', detail: 'Nontarget menjadi target', classKey: 'water' },
  { label: 'Loss / 1→0', value: '940,942 km²', detail: 'Target menjadi nontarget', classKey: 'nontarget' },
  { label: 'Net change', value: '−823,100 km²', detail: 'Perubahan bersih target', classKey: 'water' },
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
  { transition: 'Tetap nontarget (0→0)', area: 16157.514030508464 },
  { transition: 'Gain (0→1)', area: 117.84276995221871 },
  { transition: 'Loss (1→0)', area: 940.9423785337187 },
  { transition: 'Tetap target (1→1)', area: 125.72221577331598 },
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
  { label: 'Target biner', value: 'Air/Wetland = 1' },
  { label: 'Training / testing', value: '416 (70%) / 184 (30%)' },
  { label: 'Jumlah fitur', value: '59' },
  { label: 'Threshold', value: '0,4' },
  { label: 'Bobot RF', value: '0,7' },
  { label: 'Bobot spectral', value: '0,2' },
]

export const confusionMatrix = {
  labels: ['Nontarget', 'Air / Wetland'],
  values: [
    [135, 3],
    [8, 38],
  ],
}

export const accuracyMetrics = [
  { className: 'Air / Wetland (kelas 1)', precision: 92.68, recall: 82.61, f1: 87.36 },
  { className: 'Nontarget (kelas 0)', precision: 94.41, recall: 97.83, f1: 96.09 },
]

export const overallAccuracy = {
  accuracy: 94.02,
  macroPrecision: 93.54,
  macroRecall: 90.22,
  macroF1: 91.72,
  samples: 184,
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
    title: 'Luas Air/Wetland Maysan berkurang tajam selama 2020–2025.',
    text: 'Luas target turun dari 1.066,665 km² pada 2020 menjadi 243,565 km² pada 2025. Perubahan bersihnya −823,100 km² atau −77,17% dari baseline.',
    value: '−823,100 km²',
    accent: '#4fc3d7',
  },
  {
    id: 'vegetation',
    index: '02',
    label: 'Ecological signal',
    title: 'Loss jauh lebih besar dibandingkan gain.',
    text: 'Area target yang berubah menjadi nontarget mencapai 940,942 km², sedangkan area nontarget yang berubah menjadi target hanya 117,843 km².',
    value: '940,942 km² loss',
    accent: '#62b879',
  },
  {
    id: 'pressure',
    index: '03',
    label: 'Human pressure',
    title: 'Model biner menunjukkan presisi tinggi untuk kelas target.',
    text: 'Pada 184 sampel testing, precision kelas Air/Wetland mencapai 92,68% dan F1-score 87,36%. Confusion matrix terdiri atas TN 135, FP 3, FN 8, dan TP 38.',
    value: 'F1 87,36%',
    accent: '#d96767',
  },
]
