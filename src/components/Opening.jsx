import { motion } from 'framer-motion'
import { ArrowRight, BrainCircuit, Layers3, MapPinned, ScanLine, Satellite, TimerReset } from 'lucide-react'
import MarshScene from './MarshScene'

const explorerItems = [
  { label: 'Lokasi', value: 'Maysan, Iraq', icon: MapPinned },
  { label: 'Objek', value: '4 kelas tutupan', icon: Layers3 },
  { label: 'Periode', value: '2020—2025', icon: TimerReset },
]

export default function Opening({ onEnter }) {
  return (
    <section className="opening-shell relative min-h-screen overflow-hidden bg-[#060b0a] text-white">
      <div className="opening-satellite absolute inset-0" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,9,8,.96)_0%,rgba(4,9,8,.88)_38%,rgba(4,9,8,.42)_70%,rgba(4,9,8,.72)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,6,.15),rgba(3,7,6,.15)_58%,rgba(3,7,6,.96))]" />
      <div className="absolute inset-0 bg-grid-mask opacity-20" />
      <div className="absolute inset-0 grain" />
      <div className="opening-scan absolute inset-x-0 top-0 z-[2] h-px bg-cyan-200/70 shadow-[0_0_38px_rgba(96,217,211,.8)]" />

      <div className="pointer-events-none absolute right-[-24%] top-[4%] z-[3] h-[70%] w-[105%] opacity-40 sm:right-[-15%] lg:right-[2%] lg:h-[80%] lg:w-[52%] lg:opacity-70">
        <MarshScene />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1580px] flex-col px-5 py-6 sm:px-8 lg:px-12 xl:px-16">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-cyan-100/25 bg-cyan-100/10 backdrop-blur-xl">
              <div className="absolute inset-1 animate-spin-slow rounded-full border border-dashed border-amber-100/35" />
              <BrainCircuit size={18} className="relative text-cyan-50" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold tracking-[.2em]">MAYSAN//GEOAI</p>
              <p className="mt-1 text-[9px] uppercase tracking-[.26em] text-white/42">Maysan land-change observatory</p>
            </div>
          </div>
          <div className="hidden items-center gap-5 md:flex">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.18em] text-white/45">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
              Interactive research prototype
            </div>
            <div className="h-6 w-px bg-white/10" />
            <p className="text-[10px] uppercase tracking-[.18em] text-white/35">Maysan · Iraq</p>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-14 py-14 lg:grid-cols-[1.02fr_.98fr] lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .95, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl"
          >
            <div className="mb-7 flex items-center gap-3 text-[10px] uppercase tracking-[.3em] text-amber-100/75">
              <ScanLine size={15} /> Sentinel-2 · Random Forest · Change intelligence
            </div>
            <h1 className="font-display text-[clamp(3.5rem,7.2vw,7.6rem)] font-semibold leading-[.82] tracking-[-.075em] text-white">
              The landscape
              <span className="block text-outline">is changing.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-8 text-white/58 md:text-lg">
              WebGIS imersif untuk membaca perubahan air, vegetasi, lahan kering, dan area terbangun di Maysan Governorate, Iraq, antara 2020 dan 2025.
            </p>

            <div className="mt-9 grid max-w-3xl gap-2 sm:grid-cols-3">
              {explorerItems.map(({ label, value, icon: Icon }, index) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: .35 + index * .09 }}
                  className="group border border-white/10 bg-black/25 px-4 py-4 backdrop-blur-xl transition hover:border-white/22 hover:bg-black/35 sm:first:rounded-l-2xl sm:last:rounded-r-2xl"
                >
                  <div className="flex items-center justify-between text-[9px] uppercase tracking-[.2em] text-white/34">
                    {label}<Icon size={14} className="text-amber-100/55" />
                  </div>
                  <p className="mt-3 font-display text-sm font-semibold text-white/84">{value}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={onEnter}
                className="group flex items-center gap-4 rounded-full bg-[#efd39a] px-6 py-3.5 text-sm font-semibold text-[#12201c] shadow-[0_18px_60px_rgba(226,190,123,.2)] transition hover:-translate-y-1 hover:bg-[#f6dfb1] focus:outline-none focus:ring-2 focus:ring-white/70"
              >
                Buka dashboard analisis
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#13211d] text-white transition group-hover:translate-x-1">
                  <ArrowRight size={15} />
                </span>
              </button>
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-[.18em] text-white/34">
                <Satellite size={15} className="text-cyan-100/55" />
                <span>Data analitik masih simulasi</span>
              </div>
            </div>
          </motion.div>

          <div className="hidden self-end pb-10 lg:block">
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: .45, duration: .9 }}
              className="ml-auto max-w-[330px] border-l border-white/15 pl-6"
            >
              <p className="text-[9px] uppercase tracking-[.28em] text-cyan-100/48">Satellite context</p>
              <p className="mt-3 font-display text-2xl font-semibold leading-tight text-white/88">Maysan’s river, wetland, agricultural, and dryland mosaic, observed from orbit.</p>
              <p className="mt-4 text-xs leading-6 text-white/40">Latar citra digunakan sebagai konteks regional. Klasifikasi 2020–2025 pada prototipe tetap berupa data simulasi.</p>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-[9px] uppercase tracking-[.16em] text-white/28">
                <span>31.84° N</span><span>47.14° E</span><span>USGS / Landsat</span>
              </div>
            </motion.div>
          </div>
        </div>

        <footer className="grid gap-4 border-t border-white/10 pt-5 text-[9px] uppercase tracking-[.2em] text-white/32 sm:grid-cols-3">
          <span>Maysan Governorate / Iraq</span>
          <span className="sm:text-center">Water · Vegetation · Bare · Built-up</span>
          <span className="sm:text-right">Guided spatial exploration</span>
        </footer>
      </div>
    </section>
  )
}
