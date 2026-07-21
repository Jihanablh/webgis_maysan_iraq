import { useEffect, useMemo, useRef, useState } from 'react'
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer, Tooltip } from 'react-leaflet'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  Layers3,
  LocateFixed,
  MapPinned,
  Minus,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ScanSearch,
  Satellite,
  SlidersHorizontal,
  Target,
} from 'lucide-react'
import {
  changeHotspots,
  classificationByYear,
  classMeta,
  samplePoints,
  studyBoundary,
} from '../data/mockData'

const MAYSAN_CENTER = [31.84, 47.14]
const MAYSAN_BOUNDS = [[31.12, 46.31], [32.83, 47.84]]

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/geo+json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function MapPanel() {
  const mapRef = useRef(null)
  const stageRef = useRef(null)
  const [year, setYear] = useState(2025)
  const [base, setBase] = useState('dark')
  const [mode, setMode] = useState('classification')
  const [showSamples, setShowSamples] = useState(true)
  const [legendOpen, setLegendOpen] = useState(true)
  const [controlsOpen, setControlsOpen] = useState(() => typeof window === 'undefined' || window.innerWidth >= 768)
  const [activeClasses, setActiveClasses] = useState({ water: true, vegetation: true, bare: true, built: true })

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined

    const forwardWheelToPage = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      const scrollingElement = document.scrollingElement
      if (!scrollingElement) return
      const maxScroll = scrollingElement.scrollHeight - window.innerHeight
      if (maxScroll <= 0) return
      const movingDown = event.deltaY > 0
      const canMove = movingDown ? window.scrollY < maxScroll - 1 : window.scrollY > 1
      if (!canMove) return
      event.preventDefault()
      event.stopPropagation()
      window.scrollBy({ top: event.deltaY, left: 0, behavior: 'auto' })
    }

    stage.addEventListener('wheel', forwardWheelToPage, { passive: false, capture: true })
    return () => stage.removeEventListener('wheel', forwardWheelToPage, { capture: true })
  }, [])

  const filteredClassification = useMemo(() => ({
    ...classificationByYear[year],
    features: classificationByYear[year].features.filter((item) => activeClasses[item.properties.classKey]),
  }), [activeClasses, year])

  const toggleClass = (key) => setActiveClasses((current) => ({ ...current, [key]: !current[key] }))

  const exportDisplayedLayer = () => {
    const data = mode === 'classification' ? filteredClassification : changeHotspots
    const suffix = mode === 'classification' ? `classification-${year}` : 'change-2020-2025'
    downloadJson(data, `maysan-${suffix}-simulated.geojson`)
  }

  const zoomIn = () => mapRef.current?.setZoom(Math.min(13, mapRef.current.getZoom() + 0.5), { animate: true })
  const zoomOut = () => mapRef.current?.setZoom(Math.max(7, mapRef.current.getZoom() - 0.5), { animate: true })
  const resetView = () => mapRef.current?.fitBounds(MAYSAN_BOUNDS, { padding: [24, 24], animate: true, duration: 1.15 })

  return (
    <section ref={stageRef} className="map-stage flex h-full min-h-0 flex-col overflow-hidden border-y border-white/10 bg-[#08110f] shadow-[0_35px_100px_rgba(0,0,0,.35)]">
      <div className="map-stage__topbar relative z-[600] flex shrink-0 flex-col gap-3 border-b border-white/10 bg-[#07110f]/94 px-4 py-3 backdrop-blur-2xl sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-cyan-100/16 bg-cyan-100/[.06]"><Satellite size={17} className="text-cyan-50/75" /></div>
          <div className="min-w-0">
            <p className="truncate text-[8px] uppercase tracking-[.22em] text-white/31">Sentinel-2 land-cover console</p>
            <h1 className="mt-1 truncate font-display text-base font-semibold text-white sm:text-xl">Maysan spatial explorer</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={mode === 'classification'} onClick={() => setMode('classification')} className={`map-console-pill ${mode === 'classification' ? 'map-console-pill--active' : ''}`}><MapPinned size={14} /> Klasifikasi</button>
          <button type="button" aria-pressed={mode === 'change'} onClick={() => setMode('change')} className={`map-console-pill ${mode === 'change' ? 'map-console-pill--active' : ''}`}><ScanSearch size={14} /> Perubahan</button>
          <button type="button" aria-expanded={controlsOpen} aria-controls="map-layer-panel" onClick={() => setControlsOpen((value) => !value)} className={`map-console-pill ${controlsOpen ? 'map-console-pill--active' : ''}`}>{controlsOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />} Layer</button>
          <button type="button" onClick={exportDisplayedLayer} className="map-console-pill"><Download size={14} /> GeoJSON</button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <MapContainer
          ref={mapRef}
          center={MAYSAN_CENTER}
          zoom={8}
          minZoom={7}
          maxZoom={13}
          zoomSnap={0.5}
          zoomDelta={0.5}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          boxZoom={false}
          touchZoom
          keyboard
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            key={base}
            attribution={base === 'dark' ? '&copy; OpenStreetMap contributors &copy; CARTO' : '&copy; OpenStreetMap contributors'}
            url={base === 'dark' ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
          />
          <GeoJSON data={studyBoundary} style={{ color: '#f0d39d', weight: 2, dashArray: '8 8', fillOpacity: 0.025 }}>
            <Tooltip sticky>Batas Maysan Governorate, Iraq · disederhanakan dari Natural Earth</Tooltip>
          </GeoJSON>

          {mode === 'classification' && (
            <GeoJSON
              key={`classification-${year}-${JSON.stringify(activeClasses)}`}
              data={filteredClassification}
              style={(item) => ({ color: item.properties.color, fillColor: item.properties.color, fillOpacity: 0.6, weight: 1.6 })}
              onEachFeature={(item, layer) => {
                layer.bindPopup(`<strong>${item.properties.name}</strong><br/>Kelas: ${item.properties.className}<br/>Luas simulasi: ${item.properties.area.toLocaleString('id-ID')} km²<br/>Confidence: ${(item.properties.confidence * 100).toFixed(0)}%`)
              }}
            />
          )}

          {mode === 'change' && (
            <GeoJSON
              key="change-hotspots"
              data={changeHotspots}
              style={(item) => ({ color: item.properties.color, fillColor: item.properties.color, fillOpacity: 0.64, weight: 2, dashArray: '5 4' })}
              onEachFeature={(item, layer) => {
                layer.bindPopup(`<strong>${item.properties.name}</strong><br/>Transisi: ${item.properties.transition}<br/>Luas simulasi: ${item.properties.area.toLocaleString('id-ID')} km²`)
              }}
            />
          )}

          {showSamples && samplePoints.map((point) => (
            <CircleMarker key={point.name} center={point.position} radius={6} pathOptions={{ color: point.split === 'Training' ? '#f5d690' : '#ffffff', fillColor: classMeta[point.classKey].color, fillOpacity: 1, weight: 2 }}>
              <Popup><strong>{point.name}</strong><br />Kelas: {classMeta[point.classKey].label}<br />Split: {point.split}<br />Sumber: {point.source}</Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        <div className="pointer-events-none absolute inset-0 z-[450] map-vignette" />
        <div className="pointer-events-none absolute inset-0 z-[451] map-scan-grid" />

        {controlsOpen && (
          <aside id="map-layer-panel" aria-label="Kontrol layer peta" className="map-layer-panel absolute left-3 top-3 z-[550] w-[calc(100%-1.5rem)] max-w-[286px] border border-white/10 bg-[#07110f]/94 p-4 shadow-2xl backdrop-blur-2xl sm:left-5 sm:top-5">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-[8px] uppercase tracking-[.2em] text-white/27">Layer control</p><p className="mt-1 font-display text-base font-semibold text-white">{mode === 'classification' ? `Klasifikasi ${year}` : 'Perubahan 2020–2025'}</p></div>
              <button type="button" aria-label="Tutup panel layer" onClick={() => setControlsOpen(false)} className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 text-white/42 transition hover:bg-white/8 hover:text-white"><PanelLeftClose size={14} /></button>
            </div>
            <div className="mt-4 space-y-2">
              {Object.entries(classMeta).map(([key, item]) => (
                <button type="button" key={key} aria-pressed={activeClasses[key]} disabled={mode === 'change'} onClick={() => toggleClass(key)} className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-[11px] transition disabled:cursor-not-allowed disabled:opacity-35 ${activeClasses[key] ? 'border-white/10 bg-white/[.045] text-white/70' : 'border-white/[.06] text-white/28'}`}>
                  <span className="flex min-w-0 items-center gap-3"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: item.color }} /><span className="truncate">{item.short}</span></span>{activeClasses[key] ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
              ))}
            </div>
            <button type="button" aria-pressed={showSamples} onClick={() => setShowSamples((value) => !value)} className={`mt-3 flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-[11px] ${showSamples ? 'border-emerald-100/18 bg-emerald-100/[.06] text-emerald-50/72' : 'border-white/8 text-white/32'}`}><span className="flex items-center gap-3"><Target size={13} />Ground truth</span>{showSamples ? 'ON' : 'OFF'}</button>
          </aside>
        )}

        <div className="absolute right-3 top-3 z-[560] flex flex-col gap-2 sm:right-5 sm:top-5">
          <button type="button" aria-label="Perbesar peta" onClick={zoomIn} className="map-tool-button"><Plus size={17} /></button>
          <button type="button" aria-label="Perkecil peta" onClick={zoomOut} className="map-tool-button"><Minus size={17} /></button>
          <button type="button" aria-label="Pusatkan kembali peta" onClick={resetView} className="map-tool-button"><LocateFixed size={17} /></button>
          <button type="button" aria-label={`Ganti basemap, saat ini ${base === 'dark' ? 'CARTO dark' : 'OpenStreetMap'}`} aria-pressed={base === 'street'} onClick={() => setBase((value) => value === 'dark' ? 'street' : 'dark')} className="map-tool-button"><Layers3 size={17} /></button>
          <button type="button" aria-label="Tampilkan atau sembunyikan legenda" aria-pressed={legendOpen} onClick={() => setLegendOpen((value) => !value)} className={`map-tool-button ${legendOpen ? 'map-tool-button--active' : ''}`}><SlidersHorizontal size={17} /></button>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-3 z-[540] hidden -translate-x-1/2 rounded-full border border-white/10 bg-[#07110f]/84 px-4 py-2 text-[9px] uppercase tracking-[.14em] text-white/40 backdrop-blur-xl lg:block">
          Scroll halaman aktif · zoom peta melalui tombol +/− atau pinch
        </div>

        <AnimateLegend open={legendOpen} mode={mode} year={year} />

        <div className="absolute bottom-[5.4rem] left-1/2 z-[570] md:bottom-5 w-[calc(100%-1.5rem)] max-w-[570px] -translate-x-1/2 rounded-[20px] border border-white/10 bg-[#07110f]/94 p-2 shadow-2xl backdrop-blur-2xl ">
          {mode === 'classification' ? (
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <button type="button" aria-pressed={year === 2020} onClick={() => setYear(2020)} className={`map-year-button rounded-[14px] ${year === 2020 ? 'map-year-button--active' : ''}`}><span className="text-[8px] uppercase tracking-[.15em] opacity-55">Baseline</span><strong>2020</strong></button>
              <div className="flex items-center gap-1 text-white/22"><ChevronLeft size={13} /><div className="h-px w-5 bg-white/15" /><ChevronRight size={13} /></div>
              <button type="button" aria-pressed={year === 2025} onClick={() => setYear(2025)} className={`map-year-button rounded-[14px] ${year === 2025 ? 'map-year-button--active' : ''}`}><span className="text-[8px] uppercase tracking-[.15em] opacity-55">Terkini</span><strong>2025</strong></button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 px-3 py-2"><div><p className="text-[8px] uppercase tracking-[.16em] text-white/28">Change detection</p><p className="mt-1 truncate text-[11px] text-white/60">Air → kering · vegetasi → kering · vegetasi → terbangun</p></div><ScanSearch size={18} className="shrink-0 text-amber-100/55" /></div>
          )}
        </div>

        <div className="map-coordinate-readout absolute bottom-24 right-3 z-[540] hidden text-right text-[8px] uppercase tracking-[.14em] text-white/30 sm:right-5 md:block"><p>31.84° N · 47.14° E</p><p className="mt-1">Basemap {base === 'dark' ? 'CARTO dark' : 'OpenStreetMap'}</p></div>
      </div>
    </section>
  )
}

function AnimateLegend({ open, mode, year }) {
  if (!open) return null
  return (
    <aside className="absolute bottom-24 right-3 z-[550] hidden w-[238px] rounded-[18px] border border-white/10 bg-[#07110f]/94 p-4 shadow-2xl backdrop-blur-2xl md:block sm:right-5">
      <div className="flex items-center gap-3"><Layers3 size={15} className="text-amber-100/55" /><div><p className="text-[8px] uppercase tracking-[.18em] text-white/27">Map legend</p><p className="mt-1 text-xs font-medium text-white/68">{mode === 'classification' ? `Tutupan lahan ${year}` : 'Transisi 2020–2025'}</p></div></div>
      {mode === 'classification' ? (
        <div className="mt-4 space-y-3">{Object.entries(classMeta).map(([key, item]) => <div key={key} className="flex items-center justify-between text-[10px] text-white/45"><span className="flex items-center gap-3"><span className="h-2 w-2 rounded-full" style={{ background: item.color }} />{item.short}</span><span>Class</span></div>)}</div>
      ) : (
        <div className="mt-4 space-y-3">{changeHotspots.features.map((item) => <div key={item.properties.name} className="flex items-center justify-between text-[10px] text-white/45"><span className="flex items-center gap-3"><span className="h-2 w-2 rounded-full" style={{ background: item.properties.color }} />{item.properties.transition}</span><span>{item.properties.area.toLocaleString('id-ID')} km²</span></div>)}</div>
      )}
    </aside>
  )
}
