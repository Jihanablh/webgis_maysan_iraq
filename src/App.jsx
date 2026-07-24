import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleGauge,
  Database,
  Download,
  Droplets,
  ExternalLink,
  Eye,
  Gauge,
  Layers3,
  Leaf,
  Map as MapIcon,
  Menu,
  Moon,
  Navigation,
  Orbit,
  PanelTop,
  Radio,
  Satellite,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Trees,
  Waves,
  X,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Opening from './components/Opening'
const MapPanel = lazy(() => import('./components/MapPanel'))
import Chatbot from './components/Chatbot'
import scene2020Image from './assets/SceneRGB2020.jpeg'
import scene2025Image from './assets/SceneRGB2025.jpeg'
import {
  accuracyMetrics,
  annualIndexData,
  changeSummary,
  classAreaData,
  classMeta,
  confusionMatrix,
  featureImportanceData,
  overallAccuracy,
  rfParameters,
  statusCards,
  storyFrames,
  transitionData,
} from './data/mockData'

const pages = [
  { id: 'dashboard', label: 'Dashboard', short: 'Beranda', icon: PanelTop },
  { id: 'map', label: 'Peta Tutupan', short: 'Peta', icon: MapIcon },
  { id: 'change', label: 'Perubahan', short: 'Ubah', icon: Layers3 },
  { id: 'statistics', label: 'Statistika', short: 'Stat', icon: BarChart3 },
  { id: 'validation', label: 'Validasi', short: 'Valid', icon: ShieldCheck },
  { id: 'about', label: 'Tentang', short: 'About', icon: Orbit },
]

const formatArea = (value) => Number(value).toLocaleString('id-ID', { maximumFractionDigits: 3 })

function ChartTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      {label !== undefined && label !== null && <p className="chart-tooltip__label">{label}</p>}
      <div className="mt-2 space-y-2">
        {payload.map((entry) => (
          <div key={`${entry.dataKey}-${entry.name}`} className="flex min-w-[150px] items-center justify-between gap-5">
            <span className="flex items-center gap-2 text-[11px] text-white/55">
              <span className="h-2 w-2 rounded-full" style={{ background: entry.color || entry.fill }} />
              {entry.name}
            </span>
            <strong className="font-display text-sm text-white">{unit.includes('km²') ? formatArea(entry.value) : entry.value}{unit}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

const totalStudyArea = 17354.805997463753

const pageVariants = {
  initial: { opacity: 0, y: 18, filter: 'blur(7px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -10, filter: 'blur(4px)' },
}

const isValidPage = (page) => pages.some((item) => item.id === page)

function getInitialPage() {
  const page = window.location.hash.slice(1)
  return isValidPage(page) ? page : 'dashboard'
}

function getInitialEntered(page) {
  try {
    return page !== 'dashboard' || window.sessionStorage.getItem('maysan-entered') === 'true'
  } catch {
    return page !== 'dashboard'
  }
}

function navigateHash(page) {
  const nextHash = `#${page}`
  if (window.location.hash !== nextHash) window.history.pushState(null, '', nextHash)
}

function getStoredTheme() {
  try {
    return window.localStorage.getItem('maysan-theme') === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

function CursorAura() {
  useEffect(() => {
    const handler = (event) => {
      document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`)
      document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`)
    }
    window.addEventListener('pointermove', handler, { passive: true })
    return () => window.removeEventListener('pointermove', handler)
  }, [])
  return <div className="cursor-aura pointer-events-none fixed inset-0 z-[1] hidden lg:block" />
}

function Navbar({ activePage, onNavigate, theme, setTheme }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const active = pages.find((item) => item.id === activePage) || pages[0]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 22)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navigate = (page) => {
    onNavigate(page)
    setOpen(false)
  }

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-[900] px-3 sm:px-5" aria-label="Navigasi utama">
        <div className={`floating-navbar mx-auto mt-3 max-w-[1580px] rounded-[24px] border backdrop-blur-2xl transition-all duration-300 ${scrolled ? 'floating-navbar--scrolled' : ''}`}>
          <div className={`flex items-center justify-between px-3.5 sm:px-5 lg:px-7 ${scrolled ? 'h-[62px]' : 'h-[68px]'}`}>
            <button type="button" onClick={() => navigate('dashboard')} className="group flex min-w-0 items-center gap-3 text-left">
              <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-cyan-100/20 bg-cyan-100/[.07]">
                <div className="absolute inset-1 animate-spin-slow rounded-full border border-dashed border-amber-100/30" />
                <BrainCircuit size={16} className="relative text-cyan-50" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-[11px] font-bold tracking-[.18em] text-white sm:text-xs">MAYSAN//GEOAI</p>
                <div className={`mt-1 items-center gap-2 truncate text-[8px] uppercase tracking-[.2em] text-white/34 ${scrolled ? 'hidden sm:flex' : 'flex'}`}>
                  <span className="h-1 w-1 shrink-0 rounded-full bg-emerald-300" />{active.label}
                </div>
              </div>
            </button>

            <div className="hidden items-center rounded-full border border-white/[.08] bg-black/20 p-1.5 xl:flex">
              {pages.map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => navigate(id)}
                  aria-current={activePage === id ? 'page' : undefined}
                  className={`relative flex items-center gap-2 rounded-full px-4 py-2.5 text-[11px] transition ${activePage === id ? 'text-[#101d19]' : 'text-white/48 hover:text-white'}`}
                >
                  {activePage === id && <motion.span layoutId="active-nav-pill" className="absolute inset-0 rounded-full bg-[#efd39a]" transition={{ type: 'spring', bounce: .18, duration: .55 }} />}
                  <Icon size={13} className="relative" />
                  <span className="relative">{label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 border-r border-white/10 pr-4 text-[9px] uppercase tracking-[.18em] text-white/35 md:flex">
                <Radio size={12} className="animate-pulse text-emerald-300" /> Data hasil analisis
              </div>
              <button
                type="button"
                aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
                title={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
                aria-pressed={theme === 'light'}
                onClick={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')}
                className="theme-toggle grid h-9 w-9 place-items-center rounded-full border transition sm:h-10 sm:w-10"
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <button
                type="button"
                aria-label={open ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
                aria-expanded={open}
                aria-controls="mobile-navigation-menu"
                onClick={() => setOpen((value) => !value)}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white xl:hidden sm:h-10 sm:w-10"
              >
                {open ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                id="mobile-navigation-menu"
                className="overflow-hidden border-t border-white/10 xl:hidden"
              >
                <div className="grid gap-1 p-3 sm:grid-cols-2">
                  {pages.map(({ id, label, icon: Icon }) => (
                    <button
                      type="button"
                      key={id}
                      onClick={() => navigate(id)}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-left text-sm ${activePage === id ? 'bg-[#efd39a] text-[#12201c]' : 'text-white/58 hover:bg-white/5'}`}
                    >
                      <span className="flex items-center gap-3"><Icon size={16} /> {label}</span><ChevronRight size={14} />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <div aria-label="Navigasi cepat mobile" className="mobile-dock fixed bottom-3 left-1/2 z-[850] flex w-[calc(100%-1.25rem)] max-w-[430px] -translate-x-1/2 items-center justify-around rounded-[22px] border p-1.5 shadow-2xl backdrop-blur-2xl md:hidden">
        {pages.slice(0, 5).map(({ id, short, icon: Icon }) => (
          <button key={id} type="button" aria-current={activePage === id ? 'page' : undefined} onClick={() => navigate(id)} className={`flex min-w-[58px] flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[9px] ${activePage === id ? 'bg-white/10 text-amber-100' : 'text-white/35'}`}>
            <Icon size={15} /><span>{short}</span>
          </button>
        ))}
      </div>
    </>
  )
}

function PageShell({ children, className = '' }) {
  return (
    <motion.section
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: .46, ease: [0.22, 1, 0.36, 1] }}
      className={`relative mx-auto min-h-[calc(100vh-78px)] max-w-[1580px] px-4 py-9 sm:px-7 lg:px-12 lg:py-14 ${className}`}
    >
      {children}
    </motion.section>
  )
}

function PageHeader({ eyebrow, title, description, children, compact = false }) {
  return (
    <header className={`${compact ? 'mb-6' : 'mb-9'} grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end`}>
      <div>
        <p className="mb-3 flex items-center gap-2 text-[9px] uppercase tracking-[.3em] text-amber-100/58"><ScanLine size={13} />{eyebrow}</p>
        <h1 className={`${compact ? 'text-3xl md:text-5xl' : 'text-4xl md:text-6xl xl:text-[4.6rem]'} max-w-6xl font-display font-semibold leading-[.95] tracking-[-.055em] text-white`}>{title}</h1>
        {description && <p className="mt-5 max-w-3xl text-sm leading-7 text-white/45 md:text-base">{description}</p>}
      </div>
      {children}
    </header>
  )
}

function MetricRail() {
  return (
    <div className="metric-rail grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
      {statusCards.map((item, index) => {
        const data = classAreaData[index]
        const accent = classMeta[item.tone].color
        const isLoss = data.change < 0
        return (
          <motion.article
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .38, delay: .04 + index * .04 }}
            className="metric-card group relative min-h-[214px] overflow-hidden border border-white/10 p-5 sm:p-6"
            style={{ '--metric-accent': accent }}
          >
            <div className="metric-card__glow absolute -right-12 -top-14 h-40 w-40 rounded-full blur-[55px]" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] uppercase tracking-[.2em] text-white/42">0{index + 1} · Tutupan lahan</p>
                  <h3 className="mt-2 max-w-[15rem] font-display text-xl font-semibold leading-tight text-white">{item.label}</h3>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold ${isLoss ? 'border-rose-200/20 bg-rose-200/[.08] text-rose-100' : 'border-emerald-200/20 bg-emerald-200/[.08] text-emerald-100'}`}>
                  {data.changePct > 0 ? '+' : ''}{data.changePct}%
                </span>
              </div>

              <div className="mt-7">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-[.18em] text-white/36">Kondisi 2025</p>
                    <p className="mt-1 font-display text-[2rem] font-semibold leading-none text-white">{formatArea(data.area2025)}<span className="ml-1 text-base text-white/50">km²</span></p>
                  </div>
                  <span className="mb-1 h-3 w-3 rounded-full shadow-[0_0_20px_var(--metric-accent)]" style={{ background: accent }} />
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-[11px]">
                  <span className="text-white/40">Baseline 2020</span>
                  <span className="font-display font-semibold text-white/82">{formatArea(data.area2020)} km²</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-white/40">Perubahan luas</span>
                  <span className={`font-display font-semibold ${isLoss ? 'text-rose-100' : 'text-emerald-100'}`}>{data.change > 0 ? '+' : ''}{formatArea(data.change)} km²</span>
                </div>
              </div>
            </div>
          </motion.article>
        )
      })}
    </div>
  )
}

function ResearchSignals() {
  const signals = [
    { label: 'Total area studi', value: `${formatArea(totalStudyArea)} km²`, detail: 'Konsisten pada dua tahun observasi', tone: '#efd39a' },
    { label: 'Kehilangan target', value: '940,942 km²', detail: 'Loss / transisi 1→0', tone: classMeta.water.color },
    { label: 'Pertambahan target', value: '117,843 km²', detail: 'Gain / transisi 0→1', tone: classMeta.nontarget.color },
    { label: 'Precision target', value: '92,68%', detail: 'Validasi testing kelas 1', tone: '#8fd8bd' },
  ]
  return (
    <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan statistik utama">
      {signals.map((item, index) => (
        <motion.article key={item.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .05 }} className="research-signal border border-white/10 bg-white/[.025] p-5" style={{ '--signal-tone': item.tone }}>
          <div className="h-1 w-10 rounded-full bg-[var(--signal-tone)]" />
          <p className="mt-5 text-[9px] uppercase tracking-[.18em] text-white/35">{item.label}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-white">{item.value}</p>
          <p className="mt-2 text-[11px] leading-5 text-white/38">{item.detail}</p>
        </motion.article>
      ))}
    </section>
  )
}

function NetChangeChart() {
  const data = classAreaData.map((item) => ({
    ...item,
    shortName: classMeta[item.classKey].short,
    fill: item.change < 0 ? '#d97777' : classMeta[item.classKey].color,
  }))

  return (
    <article className="chart-panel change-balance-panel mt-4 overflow-hidden border border-white/10 bg-[#091512] p-6 sm:p-9 lg:p-11">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-[9px] uppercase tracking-[.23em] text-white/30">Net land-cover change</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white">Kelas yang hilang dan kelas yang meluas</h2>
          <p className="mt-3 max-w-2xl text-xs leading-6 text-white/40">Sumbu nol memisahkan kehilangan di sisi kiri dan ekspansi di sisi kanan. Grafik ini menjadi ringkasan perubahan paling cepat dibaca.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-[9px] uppercase tracking-[.14em]">
          <span className="rounded-full border border-rose-200/15 bg-rose-200/[.06] px-3 py-2 text-rose-100">Loss 940,942 km²</span>
          <span className="rounded-full border border-emerald-200/15 bg-emerald-200/[.06] px-3 py-2 text-emerald-100">Gain 117,843 km²</span>
        </div>
      </div>
      <div className="mt-7 h-[330px] sm:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 28, left: 8, bottom: 8 }}>
            <CartesianGrid stroke="rgba(255,255,255,.055)" horizontal={false} />
            <XAxis type="number" domain={[-900, 900]} stroke="rgba(255,255,255,.3)" fontSize={10} tickLine={false} tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}`} />
            <YAxis dataKey="shortName" type="category" width={118} stroke="rgba(255,255,255,.42)" fontSize={10} tickLine={false} axisLine={false} />
            <ReferenceLine x={0} stroke="rgba(239,211,154,.48)" strokeDasharray="4 5" />
            <Tooltip content={<ChartTooltip unit=" km²" />} cursor={{ fill: 'rgba(255,255,255,.025)' }} />
            <Bar dataKey="change" name="Perubahan luas" radius={7} maxBarSize={34}>
              {data.map((entry) => <Cell key={entry.classKey} fill={entry.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="change-insight-strip mt-4 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
        <div className="bg-[#0a1713] p-4"><p className="text-[8px] uppercase tracking-[.18em] text-white/30">Perubahan terbesar</p><p className="mt-2 text-sm font-semibold text-white">Loss 940,942 km²</p></div>
        <div className="bg-[#0a1713] p-4"><p className="text-[8px] uppercase tracking-[.18em] text-white/30">Perubahan bersih</p><p className="mt-2 text-sm font-semibold text-white">−823,100 km²</p></div>
        <div className="bg-[#0a1713] p-4"><p className="text-[8px] uppercase tracking-[.18em] text-white/30">Interpretasi utama</p><p className="mt-2 text-sm font-semibold text-white">Target turun 77,17%</p></div>
      </div>
    </article>
  )
}

function ComparativeAreaChart() {
  const maxArea = Math.max(...classAreaData.flatMap((item) => [item.area2020, item.area2025]))
  return (
    <div className="comparison-chart mt-8 space-y-6">
      <div className="flex flex-wrap items-center gap-5 text-[9px] uppercase tracking-[.16em] text-white/38">
        <span className="flex items-center gap-2"><span className="h-2 w-5 rounded-full bg-white/20" />2020 baseline</span>
        <span className="flex items-center gap-2"><span className="h-2 w-5 rounded-full bg-[#efd39a]" />2025 terkini</span>
      </div>
      {classAreaData.map((item) => {
        const meta = classMeta[item.classKey]
        return (
          <div key={item.classKey} className="comparison-row">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white/78">{meta.label}</p>
                <p className="mt-1 text-[9px] uppercase tracking-[.14em] text-white/28">2020 → 2025</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display text-sm text-white/52">{formatArea(item.area2020)}</span>
                <ArrowRight size={12} className="text-white/20" />
                <span className="font-display text-base font-semibold text-white">{formatArea(item.area2025)} km²</span>
                <span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${item.change < 0 ? 'bg-rose-200/[.08] text-rose-100' : 'bg-emerald-200/[.08] text-emerald-100'}`}>{item.changePct > 0 ? '+' : ''}{item.changePct}%</span>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-2.5 overflow-hidden rounded-full bg-white/[.035]"><motion.div initial={{ width: 0 }} whileInView={{ width: `${(item.area2020 / maxArea) * 100}%` }} viewport={{ once: true }} transition={{ duration: .75 }} className="h-full rounded-full bg-white/16" /></div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/[.035]"><motion.div initial={{ width: 0 }} whileInView={{ width: `${(item.area2025 / maxArea) * 100}%` }} viewport={{ once: true }} transition={{ duration: .85, delay: .08 }} className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${meta.color}, color-mix(in srgb, ${meta.color} 55%, #efd39a))` }} /></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MarshPulse() {
  return (
    <div className="marsh-pulse relative mx-auto aspect-square w-full max-w-[530px]">
      <div className="marsh-pulse__halo absolute inset-[8%] rounded-full" />
      <div className="marsh-pulse__orbit marsh-pulse__orbit--one" />
      <div className="marsh-pulse__orbit marsh-pulse__orbit--two" />
      <svg className="absolute inset-[8%] h-[84%] w-[84%] overflow-visible" viewBox="0 0 500 500" role="img" aria-label="Visual abstrak perubahan tutupan lahan Maysan, Iraq">
        <defs>
          <filter id="softGlow"><feGaussianBlur stdDeviation="9" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <linearGradient id="wetlandGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#65d0de" /><stop offset=".45" stopColor="#4da379" /><stop offset="1" stopColor="#c88848" /></linearGradient>
          <clipPath id="marshClip"><path d="M110 95C153 62 220 65 260 87C309 113 347 93 382 135C417 178 381 212 397 257C413 302 446 331 405 370C364 409 317 389 279 418C241 447 199 427 166 399C133 371 90 382 72 337C54 292 89 263 78 225C67 187 62 133 110 95Z" /></clipPath>
        </defs>
        <path d="M110 95C153 62 220 65 260 87C309 113 347 93 382 135C417 178 381 212 397 257C413 302 446 331 405 370C364 409 317 389 279 418C241 447 199 427 166 399C133 371 90 382 72 337C54 292 89 263 78 225C67 187 62 133 110 95Z" fill="rgba(9,31,27,.9)" stroke="rgba(239,211,154,.42)" strokeWidth="2" />
        <g clipPath="url(#marshClip)">
          <rect width="500" height="500" fill="url(#wetlandGradient)" opacity=".72" />
          <path className="marsh-wave marsh-wave--one" d="M-30 175C73 122 156 230 257 174C353 121 431 207 535 146V270H-30Z" fill="#56c6d9" opacity=".55" />
          <path className="marsh-wave marsh-wave--two" d="M-20 255C95 201 169 310 282 247C388 188 440 289 540 226V380H-20Z" fill="#55a870" opacity=".56" />
          <path className="marsh-wave marsh-wave--three" d="M-25 337C95 284 198 388 310 321C397 269 457 347 535 316V520H-25Z" fill="#c88949" opacity=".73" />
          <g opacity=".28">
            {Array.from({ length: 11 }, (_, index) => <line key={index} x1={45 + index * 39} y1="0" x2={45 + index * 39} y2="500" stroke="white" strokeWidth=".7" />)}
            {Array.from({ length: 11 }, (_, index) => <line key={index} x1="0" y1={45 + index * 39} x2="500" y2={45 + index * 39} stroke="white" strokeWidth=".7" />)}
          </g>
          <rect className="marsh-scan" x="0" y="0" width="500" height="4" fill="#d7f9f2" filter="url(#softGlow)" opacity=".7" />
        </g>
      </svg>
      <div className="absolute left-[7%] top-[18%] rounded-full border border-cyan-100/15 bg-[#081410]/70 px-3 py-2 text-[9px] uppercase tracking-[.16em] text-cyan-50/58 backdrop-blur">Water signal −14.1%</div>
      <div className="absolute bottom-[12%] right-[2%] rounded-full border border-amber-100/15 bg-[#081410]/70 px-3 py-2 text-[9px] uppercase tracking-[.16em] text-amber-50/58 backdrop-blur">Bare land +9.1%</div>
    </div>
  )
}

function DashboardPage({ onNavigate }) {
  const [activeStory, setActiveStory] = useState(0)
  const frame = storyFrames[activeStory]

  return (
    <PageShell className="pt-5 lg:pt-7">
      <section className="dashboard-hero relative min-h-[680px] overflow-hidden border border-white/10 bg-[#081410] lg:min-h-[720px]">
        <div className="dashboard-hero__image absolute inset-y-0 right-0 w-full lg:w-[62%]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#081410_0%,rgba(8,20,16,.96)_41%,rgba(8,20,16,.58)_68%,rgba(8,20,16,.2))]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_48%,#081410_100%)]" />
        <div className="absolute inset-0 map-contours opacity-50" />
        <div className="dashboard-hero__scan absolute inset-y-0 w-px bg-cyan-100/50 shadow-[0_0_35px_rgba(113,223,211,.7)]" />

        <div className="relative z-10 grid min-h-[680px] gap-10 p-6 sm:p-9 lg:min-h-[720px] lg:grid-cols-[.9fr_1.1fr] lg:p-12 xl:p-16">
          <div className="flex max-w-3xl flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-amber-100/20 bg-amber-100/[.08] px-3 py-2 text-[9px] uppercase tracking-[.22em] text-amber-50/72">Wetland intelligence / 2020—2025</span>
                <span className="flex items-center gap-2 rounded-full border border-white/10 bg-black/15 px-3 py-2 text-[9px] uppercase tracking-[.18em] text-white/42"><Radio size={10} className="text-emerald-300" />System online</span>
              </div>
              <h1 className="mt-8 font-display text-[clamp(3.7rem,7vw,7.6rem)] font-semibold leading-[.82] tracking-[-.075em] text-white">
                Maysan
                <span className="block text-outline">in transition.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-white/54 md:text-lg">Bukan sekadar dashboard. Ini adalah cerita spasial tentang perubahan air, vegetasi, lahan kering, dan pertumbuhan area terbangun di Maysan.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <button type="button" onClick={() => onNavigate('map')} className="group flex items-center gap-3 rounded-full bg-[#efd39a] px-5 py-3.5 text-sm font-semibold text-[#10201a] transition hover:-translate-y-1 hover:bg-[#f7e0b1]">Masuk ke peta <ArrowRight size={16} className="transition group-hover:translate-x-1" /></button>
                <button type="button" onClick={() => onNavigate('change')} className="flex items-center gap-3 rounded-full border border-white/14 bg-black/15 px-5 py-3.5 text-sm text-white/62 backdrop-blur transition hover:bg-white/10 hover:text-white">Putar cerita perubahan <Layers3 size={16} /></button>
              </div>
            </div>

            <div className="mt-14 grid max-w-xl grid-cols-2 gap-x-7 gap-y-5 border-t border-white/12 pt-6 sm:grid-cols-4 lg:mt-0">
              {[
                [formatArea(totalStudyArea), 'km² area studi'],
                ['04', 'kelas utama'],
                ['05', 'tahun perubahan'],
                ['94,02', '% overall accuracy'],
              ].map(([value, label]) => <div key={label}><p className="font-display text-2xl font-semibold text-white">{value}</p><p className="mt-1 text-[9px] uppercase tracking-[.16em] text-white/31">{label}</p></div>)}
            </div>
          </div>

          <div className="hidden items-end justify-end lg:flex">
            <div className="w-full max-w-[430px] border-l border-white/15 pl-7">
              <p className="text-[9px] uppercase tracking-[.26em] text-cyan-100/48">Orbital context / USGS Landsat</p>
              <p className="mt-3 font-display text-3xl font-semibold leading-tight text-white/88">Satu governorate. Empat sinyal perubahan.</p>
              <div className="mt-7 space-y-3">
                {Object.entries(classMeta).map(([key, item], index) => (
                  <div key={key} className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
                    <span className="flex items-center gap-3 text-white/50"><span className="h-2 w-2 rounded-full" style={{ background: item.color }} />0{index + 1} · {item.short}</span>
                    <span className="font-display text-white/75">{formatArea(classAreaData[index].area2025)} km²</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <MetricRail />

      <section className="grid border-x border-b border-white/10 bg-[#081410] xl:grid-cols-[.92fr_1.08fr]">
        <div className="border-b border-white/10 p-6 sm:p-9 xl:border-b-0 xl:border-r xl:p-12">
          <p className="text-[9px] uppercase tracking-[.28em] text-amber-100/52">The Maysan pulse</p>
          <h2 className="mt-3 max-w-lg font-display text-4xl font-semibold leading-[.98] tracking-[-.045em] text-white md:text-5xl">Perubahan terlihat ketika data diberi ruang untuk bernapas.</h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/43">Visual di samping merangkum arah perubahan empat kelas. Gerak air, vegetasi, lahan kering, dan area terbangun dibuat sebagai sinyal hidup, bukan ornamen acak.</p>
          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {changeSummary.map((item) => (
              <div key={item.label} className="border-l border-white/12 pl-4">
                <p className="font-display text-2xl font-semibold text-white">{item.value}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[.14em] text-white/34">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative min-h-[560px] overflow-hidden p-4 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(54,159,132,.12),transparent_50%)]" />
          <MarshPulse />
        </div>
      </section>

      <section className="mt-16 grid gap-10 lg:grid-cols-[.62fr_1.38fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[9px] uppercase tracking-[.3em] text-amber-100/52">Story chapters</p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-[.98] tracking-[-.045em] text-white md:text-5xl">Tiga sinyal yang mengubah cara kita membaca rawa.</h2>
          <p className="mt-5 text-sm leading-7 text-white/43">Pilih bab untuk mengubah fokus narasi. Setiap animasi dan angka diarahkan untuk menjelaskan perubahan, bukan memenuhi layar.</p>
          <div className="mt-8 flex gap-2">
            <button type="button" aria-label="Bab sebelumnya" onClick={() => setActiveStory((value) => (value + storyFrames.length - 1) % storyFrames.length)} className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-white/55 transition hover:bg-white/8 hover:text-white"><ChevronLeft size={17} /></button>
            <button type="button" aria-label="Bab berikutnya" onClick={() => setActiveStory((value) => (value + 1) % storyFrames.length)} className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-white/55 transition hover:bg-white/8 hover:text-white"><ChevronRight size={17} /></button>
          </div>
        </div>

        <div>
          <div className="flex gap-2 border-b border-white/10 pb-5">
            {storyFrames.map((item, index) => (
              <button key={item.id} type="button" onClick={() => setActiveStory(index)} className={`relative flex-1 py-3 text-left text-[9px] uppercase tracking-[.16em] ${activeStory === index ? 'text-white' : 'text-white/28'}`}>
                <span>{item.index} · {item.label}</span>
                <span className="absolute bottom-[-21px] left-0 h-[2px] bg-[#efd39a] transition-all" style={{ width: activeStory === index ? '100%' : '0%' }} />
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.article key={frame.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: .4 }} className="relative mt-7 min-h-[420px] overflow-hidden border border-white/10 bg-[#091512] p-7 sm:p-10">
              <div className="absolute inset-y-0 right-0 w-[45%] opacity-40 story-texture" style={{ '--story-accent': frame.accent }} />
              <div className="relative max-w-3xl">
                <span className="font-display text-7xl font-semibold text-white/[.05]">{frame.index}</span>
                <p className="mt-5 text-[10px] uppercase tracking-[.25em]" style={{ color: frame.accent }}>{frame.label}</p>
                <h3 className="mt-4 font-display text-3xl font-semibold leading-tight text-white md:text-5xl">{frame.title}</h3>
                <p className="mt-6 max-w-2xl text-sm leading-7 text-white/45 md:text-base">{frame.text}</p>
                <div className="mt-10 flex items-end gap-4"><p className="font-display text-5xl font-semibold text-white">{frame.value}</p><span className="mb-2 text-[9px] uppercase tracking-[.18em] text-white/30">hasil analisis</span></div>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </section>

      <section className="mt-16 grid gap-px overflow-hidden border border-white/10 bg-white/10 lg:grid-cols-[1.3fr_.7fr]">
        <article className="bg-[#091512] p-6 sm:p-9 lg:p-12">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-[9px] uppercase tracking-[.25em] text-white/30">Class area / km²</p><h2 className="mt-2 font-display text-3xl font-semibold text-white">Jejak luas 2020 dan 2025</h2></div>
            <button type="button" onClick={() => onNavigate('statistics')} className="flex items-center gap-2 text-xs text-amber-100/60 transition hover:text-amber-100">Buka statistika <ArrowRight size={14} /></button>
          </div>
          <ComparativeAreaChart />
        </article>
        <article className="satellite-note relative min-h-[450px] overflow-hidden bg-[#091512] p-7 sm:p-9">
          <div className="absolute inset-0 satellite-note__image" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,17,14,.2),rgba(8,17,14,.95))]" />
          <div className="relative flex h-full min-h-[390px] flex-col justify-between">
            <div className="flex items-center justify-between"><span className="rounded-full border border-white/12 bg-black/25 px-3 py-2 text-[9px] uppercase tracking-[.18em] text-white/55 backdrop-blur">Orbital context</span><Satellite className="text-amber-100/60" /></div>
            <div>
              <p className="text-[9px] uppercase tracking-[.2em] text-white/35">Sentinel-2 RGB / 2025</p>
              <h3 className="mt-3 font-display text-3xl font-semibold text-white">Citra regional memberi identitas yang tidak bisa digantikan oleh gradient generik.</h3>
              <p className="mt-4 text-xs leading-6 text-white/45">Digunakan sebagai konteks visual, bukan sebagai hasil klasifikasi penelitian.</p>
            </div>
          </div>
        </article>
      </section>
    </PageShell>
  )
}

function MapPage() {
  return (
    <motion.section
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: .42, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-[calc(100dvh-92px)] min-h-[640px] w-full"
    >
      <Suspense
        fallback={(
          <div className="grid h-full place-items-center bg-[#08110f]" role="status" aria-live="polite">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-amber-100" />
              <p className="mt-4 text-[10px] uppercase tracking-[.2em] text-white/45">Memuat mesin peta</p>
            </div>
          </div>
        )}
      >
        <MapPanel />
      </Suspense>
    </motion.section>
  )
}

function SatelliteCompare() {
  const [reveal, setReveal] = useState(54)
  const [dragging, setDragging] = useState(false)
  const frameRef = useRef(null)
  const draggingRef = useRef(false)
  const dragOffsetRef = useRef(0)

  const updateRevealFromPointer = (clientX) => {
    const frame = frameRef.current
    if (!frame) return
    const bounds = frame.getBoundingClientRect()
    if (!bounds.width) return
    const percentage = ((clientX - dragOffsetRef.current - bounds.left) / bounds.width) * 100
    setReveal(Math.min(92, Math.max(8, percentage)))
  }

  const handlePointerDown = (event) => {
    event.preventDefault()
    const bounds = frameRef.current?.getBoundingClientRect()
    if (!bounds?.width) return
    dragOffsetRef.current = event.clientX - (bounds.left + (reveal / 100) * bounds.width)
    draggingRef.current = true
    setDragging(true)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (!draggingRef.current) return
    updateRevealFromPointer(event.clientX)
  }

  const stopDragging = (event) => {
    draggingRef.current = false
    dragOffsetRef.current = 0
    setDragging(false)
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleKeyboard = (event) => {
    const steps = {
      ArrowLeft: -2,
      ArrowDown: -2,
      ArrowRight: 2,
      ArrowUp: 2,
      PageDown: -10,
      PageUp: 10,
    }
    if (event.key === 'Home') {
      event.preventDefault()
      setReveal(8)
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      setReveal(92)
      return
    }
    if (!steps[event.key]) return
    event.preventDefault()
    setReveal((value) => Math.min(92, Math.max(8, value + steps[event.key])))
  }

  return (
    <article className="overflow-hidden border border-white/10 bg-[#07110f]">
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div><p className="text-[9px] uppercase tracking-[.24em] text-white/30">Orbital context comparison</p><h2 className="mt-1 font-display text-2xl font-semibold text-white">Scene RGB 2020 dan 2025</h2></div>
        <span className="rounded-full border border-white/10 px-3 py-2 text-[9px] uppercase tracking-[.16em] text-white/42">Seret tombol panah untuk membandingkan</span>
      </div>
      <div ref={frameRef} className={`satellite-compare relative h-[560px] overflow-hidden bg-[#0b1512] ${dragging ? 'satellite-compare--dragging' : ''}`}>
        <img src={scene2020Image} alt="Scene RGB wilayah kajian Maysan tahun 2020" className="absolute inset-0 h-full w-full select-none object-cover" draggable="false" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - reveal}% 0 0)` }} aria-hidden="true">
          <img src={scene2025Image} alt="Scene RGB wilayah kajian Maysan tahun 2025" className="absolute inset-0 h-full w-full select-none object-cover" draggable="false" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,9,8,.03),rgba(4,9,8,.42))]" />
        <div className="pointer-events-none absolute inset-y-0 z-20 w-px bg-white/90 shadow-[0_0_30px_rgba(255,255,255,.85)]" style={{ left: `${reveal}%` }}>
          <div
            role="slider"
            tabIndex={0}
            aria-label="Posisi pembanding Scene RGB 2020 dan 2025"
            aria-valuemin={8}
            aria-valuemax={92}
            aria-valuenow={Math.round(reveal)}
            aria-valuetext={`${Math.round(reveal)} persen citra 2025 terlihat`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            onLostPointerCapture={() => { draggingRef.current = false; dragOffsetRef.current = 0; setDragging(false) }}
            onKeyDown={handleKeyboard}
            className="satellite-compare__handle pointer-events-auto absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 touch-none select-none items-center justify-center gap-0 rounded-full border border-white/40 bg-[#0c1814]/95 text-white shadow-2xl outline-none transition focus-visible:ring-2 focus-visible:ring-amber-100/90"
          >
            <ChevronLeft size={17} aria-hidden="true" /><ChevronRight size={17} aria-hidden="true" />
          </div>
        </div>
        <span className="pointer-events-none absolute left-5 top-5 z-20 rounded-full bg-black/50 px-3 py-2 text-[10px] uppercase tracking-[.15em] text-white/70 backdrop-blur">2025 / Scene RGB</span>
        <span className="pointer-events-none absolute right-5 top-5 z-20 rounded-full bg-black/50 px-3 py-2 text-[10px] uppercase tracking-[.15em] text-white/70 backdrop-blur">2020 / Scene RGB</span>
        <div className="pointer-events-none absolute bottom-5 left-5 z-20 rounded-full border border-white/10 bg-black/45 px-3 py-2 text-[9px] uppercase tracking-[.14em] text-white/45 backdrop-blur">
          Posisi {Math.round(reveal)}%
        </div>
      </div>
      <p className="border-t border-white/10 px-5 py-4 text-[10px] leading-5 text-white/32 sm:px-7">Scene RGB menampilkan kondisi wilayah kajian pada 2020 dan 2025. Geser pembatas untuk membandingkan perubahan visual kedua tahun.</p>
    </article>
  )
}

function ChangePage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Change detection" title="Perubahan dibaca sebagai adegan spasial, bukan daftar angka." description="Halaman ini menyatukan pembanding citra, transisi kelas, dan interpretasi perubahan agar pengguna memahami arah transformasi kawasan secara bertahap." />
      <SatelliteCompare />

      <div className="mt-px grid gap-px bg-white/10 lg:grid-cols-[1.15fr_.85fr]">
        <article className="bg-[#091512] p-6 sm:p-9 lg:p-11">
          <p className="text-[9px] uppercase tracking-[.24em] text-white/30">Dominant transitions</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white">Arah transisi utama</h2>
          <div className="mt-6 h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transitionData} layout="vertical" margin={{ left: 14, right: 30 }}>
                <CartesianGrid stroke="rgba(255,255,255,.055)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,.3)" fontSize={10} tickLine={false} />
                <YAxis dataKey="transition" type="category" width={125} stroke="rgba(255,255,255,.4)" fontSize={10} tickLine={false} />
                <Tooltip content={<ChartTooltip unit=" km²" />} cursor={{ fill: 'rgba(255,255,255,.035)' }} />
                <Bar dataKey="area" fill="#e5c58c" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="bg-[#0a1713] p-6 sm:p-9 lg:p-11">
          <p className="text-[9px] uppercase tracking-[.24em] text-white/30">Five-year trajectory</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white">Arah perubahan per kelas</h2>
          <div className="mt-8 space-y-6">
            {classAreaData.map((item) => {
              const width = Math.min(100, Math.abs(item.changePct) * 1.6)
              return (
                <div key={item.classKey}>
                  <div className="flex items-end justify-between gap-4"><div><p className="text-xs text-white/58">{classMeta[item.classKey].label}</p><p className="mt-1 text-[9px] uppercase tracking-[.14em] text-white/25">2020 → 2025</p></div><p className={`font-display text-xl font-semibold ${item.change < 0 ? 'text-rose-200' : 'text-emerald-200'}`}>{item.change > 0 ? '+' : ''}{formatArea(item.change)} km²</p></div>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/8"><motion.div initial={{ width: 0 }} whileInView={{ width: `${width}%` }} viewport={{ once: true }} transition={{ duration: .9 }} className="h-full" style={{ background: classMeta[item.classKey].color }} /></div>
                </div>
              )
            })}
          </div>
        </article>
      </div>

      <div className="mt-14 grid gap-4 lg:grid-cols-3">
        {storyFrames.map((item) => (
          <article key={item.id} className="group relative min-h-[330px] overflow-hidden border border-white/10 bg-[#091512] p-6 sm:p-8">
            <div className="story-card-glow absolute -right-20 -top-20 h-56 w-56 rounded-full blur-[80px]" style={{ background: item.accent }} />
            <div className="relative flex h-full flex-col justify-between">
              <div><span className="font-display text-5xl font-semibold text-white/[.07]">{item.index}</span><p className="mt-5 text-[9px] uppercase tracking-[.22em]" style={{ color: item.accent }}>{item.label}</p><h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-white">{item.title}</h3></div>
              <div className="mt-8 flex items-end justify-between"><p className="font-display text-3xl font-semibold text-white">{item.value}</p><ArrowRight size={18} className="text-white/25 transition group-hover:translate-x-1 group-hover:text-white/60" /></div>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  )
}

function downloadCsv() {
  const rows = [['class', 'area_2020_km2', 'area_2025_km2', 'change_km2', 'change_percent'], ...classAreaData.map((item) => [item.className, item.area2020, item.area2025, item.change, item.changePct])]
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'maysan-land-cover-area-simulated.csv'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function StatisticsPage() {
  const pieData = classAreaData.map((item) => ({ name: item.className, value: item.area2025, color: classMeta[item.classKey].color }))
  return (
    <PageShell>
      <PageHeader eyebrow="Statistical intelligence" title="Angka dirancang untuk menjawab pertanyaan, bukan sekadar mengisi kartu." description="Bandingkan perubahan luas, tren indeks spektral, dan komposisi 2025 dalam satu alur baca yang konsisten.">
        <button type="button" onClick={downloadCsv} className="flex items-center gap-2 rounded-full bg-[#efd39a] px-4 py-3 text-xs font-semibold text-[#12201c] transition hover:-translate-y-1 hover:bg-[#f7e0b1]"><Download size={15} /> Unduh CSV</button>
      </PageHeader>
      <MetricRail />
      <ResearchSignals />
      <NetChangeChart />

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.28fr_.72fr]">
        <article className="chart-panel overflow-hidden border border-white/10 bg-[#091512] p-6 sm:p-9 lg:p-11">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[9px] uppercase tracking-[.23em] text-white/30">Spectral trajectory</p><h2 className="mt-2 font-display text-3xl font-semibold text-white">Tren indeks 2020–2025</h2></div><div className="flex flex-wrap gap-3 text-[9px] uppercase tracking-[.14em] text-white/35">{[['NDVI','#62b879'],['MNDWI','#4fc3d7'],['NDBI','#d96767'],['BSI','#d79a55']].map(([label,color]) => <span key={label} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />{label}</span>)}</div></div>
          <div className="mt-8 h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={annualIndexData} margin={{ top: 8, right: 12, left: -20, bottom: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,.055)" vertical={false} />
                <XAxis dataKey="year" stroke="rgba(255,255,255,.3)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,.3)" fontSize={10} tickLine={false} domain={[-.15, .55]} />
                <ReferenceLine y={0} stroke="rgba(239,211,154,.34)" strokeDasharray="4 5" />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,.08)' }} />
                <Line dataKey="ndvi" name="NDVI" stroke="#62b879" strokeWidth={2.8} dot={{ r: 3 }} />
                <Line dataKey="mndwi" name="MNDWI" stroke="#4fc3d7" strokeWidth={2.8} dot={{ r: 3 }} />
                <Line dataKey="ndbi" name="NDBI" stroke="#d96767" strokeWidth={2.3} dot={{ r: 3 }} />
                <Line dataKey="bsi" name="BSI" stroke="#d79a55" strokeWidth={2.3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="chart-panel overflow-hidden border border-white/10 bg-[#0a1713] p-6 sm:p-9 lg:p-11">
          <p className="text-[9px] uppercase tracking-[.23em] text-white/30">Composition 2025</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white">Komposisi area</h2>
          <div className="relative mt-7 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Tooltip content={<ChartTooltip unit=" km²" />} cursor={{ fill: 'rgba(255,255,255,.035)' }} /><Pie data={pieData} dataKey="value" innerRadius="63%" outerRadius="88%" paddingAngle={3} stroke="none">{pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie></PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="font-display text-3xl font-semibold text-white">{formatArea(totalStudyArea)}</p><p className="mt-1 text-[9px] uppercase tracking-[.16em] text-white/30">total km²</p></div></div>
          </div>
          <div className="mt-3 space-y-3">{pieData.map((item) => <div key={item.name} className="flex items-center justify-between border-b border-white/8 pb-3 text-xs"><span className="flex items-center gap-3 text-white/48"><span className="h-2 w-2 rounded-full" style={{ background: item.color }} />{item.name}</span><span className="font-display text-white/75">{formatArea(item.value)} km²</span></div>)}</div>
        </article>
      </div>

      <article className="mt-14 overflow-x-auto border border-white/10 bg-[#091512]">
        <div className="border-b border-white/10 p-6 sm:p-8"><p className="text-[9px] uppercase tracking-[.23em] text-white/30">Area table</p><h2 className="mt-2 font-display text-3xl font-semibold text-white">Ringkasan perubahan kelas</h2></div>
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-white/10 text-[9px] uppercase tracking-[.16em] text-white/30"><tr><th className="px-6 py-4">Kelas</th><th className="px-6 py-4">2020</th><th className="px-6 py-4">2025</th><th className="px-6 py-4">Perubahan</th><th className="px-6 py-4">Persentase</th></tr></thead>
          <tbody>{classAreaData.map((item) => <tr key={item.classKey} className="border-b border-white/[.06] text-white/55 transition hover:bg-white/[.025]"><td className="px-6 py-5"><span className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full" style={{ background: classMeta[item.classKey].color }} />{item.className}</span></td><td className="px-6 py-5">{formatArea(item.area2020)} km²</td><td className="px-6 py-5">{formatArea(item.area2025)} km²</td><td className={`px-6 py-5 font-semibold ${item.change < 0 ? 'text-rose-200' : 'text-emerald-200'}`}>{item.change > 0 ? '+' : ''}{formatArea(item.change)} km²</td><td className={`px-6 py-5 ${item.changePct < 0 ? 'text-rose-200' : 'text-emerald-200'}`}>{item.changePct > 0 ? '+' : ''}{item.changePct}%</td></tr>)}</tbody>
        </table>
      </article>
    </PageShell>
  )
}

function ValidationPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Model validation" title="Keandalan model ditampilkan dengan transparansi, bukan hanya satu angka besar." description="Confusion matrix, metrik per kelas, parameter Random Forest, dan feature importance disajikan bersama agar kualitas klasifikasi dapat dinilai secara utuh." />

      <section className="grid gap-px overflow-hidden border border-white/10 bg-white/10 xl:grid-cols-[.72fr_1.28fr]">
        <article className="relative overflow-hidden bg-[#091512] p-7 sm:p-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-300/10 blur-[90px]" />
          <div className="relative">
            <CircleGauge className="text-emerald-200" size={27} />
            <p className="mt-10 text-[9px] uppercase tracking-[.25em] text-white/30">Overall accuracy</p>
            <p className="mt-3 font-display text-[clamp(4.5rem,8vw,8rem)] font-semibold leading-none tracking-[-.07em] text-white">{overallAccuracy.accuracy}<span className="text-3xl text-white/35">%</span></p>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/43">Akurasi dihitung dari 184 sampel testing (30%). Untuk kelas target Air/Wetland, precision 92,68% dan F1-score 87,36%.</p>
            <div className="mt-10 grid grid-cols-3 gap-3">{[['Precision',overallAccuracy.macroPrecision],['Recall',overallAccuracy.macroRecall],['F1',overallAccuracy.macroF1]].map(([label,value]) => <div key={label} className="border-l border-white/12 pl-3"><p className="font-display text-xl font-semibold text-white">{value}%</p><p className="mt-1 text-[8px] uppercase tracking-[.14em] text-white/28">{label}</p></div>)}</div>
          </div>
        </article>

        <article className="bg-[#0a1713] p-6 sm:p-9 lg:p-11">
          <div className="flex items-center justify-between"><div><p className="text-[9px] uppercase tracking-[.23em] text-white/30">Confusion matrix</p><h2 className="mt-2 font-display text-3xl font-semibold text-white">Prediksi versus referensi</h2></div><ShieldCheck className="text-amber-100/55" /></div>
          <div className="mt-8 overflow-x-auto">
            <div className="min-w-[620px]">
              <div className="grid gap-2 text-center text-[9px] uppercase tracking-[.12em] text-white/30" style={{ gridTemplateColumns: `135px repeat(${confusionMatrix.labels.length}, minmax(0, 1fr))` }}><span />{confusionMatrix.labels.map((label) => <span key={label}>{label}</span>)}</div>
              {confusionMatrix.values.map((row, rowIndex) => (
                <div key={confusionMatrix.labels[rowIndex]} className="mt-2 grid gap-2" style={{ gridTemplateColumns: `135px repeat(${confusionMatrix.labels.length}, minmax(0, 1fr))` }}>
                  <div className="flex items-center text-xs text-white/45">{confusionMatrix.labels[rowIndex]}</div>
                  {row.map((value, colIndex) => <div key={`${rowIndex}-${colIndex}`} className={`matrix-cell grid h-20 place-items-center border text-lg font-semibold ${rowIndex === colIndex ? 'border-emerald-200/22 bg-emerald-200/[.1] text-emerald-100' : 'border-white/8 bg-white/[.025] text-white/42'}`} style={{ '--matrix-alpha': value / 100 }}><span>{value}</span></div>)}
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <div className="mt-px grid gap-px bg-white/10 xl:grid-cols-[1.15fr_.85fr]">
        <article className="bg-[#091512] p-6 sm:p-9 lg:p-11">
          <p className="text-[9px] uppercase tracking-[.23em] text-white/30">Feature importance</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white">Kontribusi fitur model</h2>
          <div className="mt-7 h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportanceData} layout="vertical" margin={{ left: 12, right: 30 }}>
                <CartesianGrid stroke="rgba(255,255,255,.055)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,.28)" fontSize={10} tickLine={false} />
                <YAxis type="category" dataKey="feature" width={82} stroke="rgba(255,255,255,.42)" fontSize={10} tickLine={false} />
                <Tooltip content={<ChartTooltip unit="%" />} cursor={{ fill: 'rgba(255,255,255,.035)' }} />
                <Bar dataKey="importance" fill="#7acbb2" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="bg-[#0a1713] p-6 sm:p-9 lg:p-11">
          <div className="flex items-center gap-3"><BrainCircuit className="text-emerald-200" /><div><p className="text-[9px] uppercase tracking-[.23em] text-white/30">Model profile</p><h2 className="mt-1 font-display text-3xl font-semibold text-white">Random Forest</h2></div></div>
          <div className="mt-8 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2">{rfParameters.map((item) => <div key={item.label} className="bg-[#0a1713] p-4"><p className="text-[8px] uppercase tracking-[.15em] text-white/27">{item.label}</p><p className="mt-2 text-sm font-semibold text-white/72">{item.value}</p></div>)}</div>
          <div className="mt-7 border-l-2 border-amber-100/35 pl-5"><p className="font-display text-xl font-semibold text-amber-50">Akurasi tinggi tetap perlu dibaca kritis.</p><p className="mt-3 text-xs leading-6 text-white/40">Distribusi sampel, independensi data uji, keseimbangan kelas, kualitas label, dan verifikasi visual harus diperiksa sebelum peta digunakan sebagai kesimpulan ilmiah.</p></div>
        </article>
      </div>

      <article className="mt-14 border border-white/10 bg-[#091512] p-6 sm:p-9">
        <div className="grid gap-7 lg:grid-cols-[.38fr_.62fr] lg:items-center"><div><p className="text-[9px] uppercase tracking-[.23em] text-white/30">Per-class metrics</p><h2 className="mt-2 font-display text-3xl font-semibold text-white">Kinerja setiap kelas</h2></div><div className="grid gap-3 sm:grid-cols-2">{accuracyMetrics.map((item) => <div key={item.className} className="border border-white/8 bg-white/[.02] p-4"><p className="text-xs font-medium text-white/68">{item.className}</p><div className="mt-4 grid grid-cols-3 gap-2">{[['P',item.precision],['R',item.recall],['F1',item.f1]].map(([label,value]) => <div key={label}><p className="text-[8px] uppercase tracking-wider text-white/25">{label}</p><p className="mt-1 font-display text-lg font-semibold text-white/78">{value}%</p></div>)}</div></div>)}</div></div>
      </article>
    </PageShell>
  )
}

function AboutPage({ onNavigate }) {
  return (
    <PageShell>
      <PageHeader eyebrow="About the landscape" title="Satu governorate, banyak lanskap, satu sistem observasi." description="Maysan berada di tenggara Iraq dengan Amarah sebagai ibu kota governorate. WebGIS ini menyajikan eksplorasi perubahan tutupan lahan 2020–2025 berbasis Sentinel-2 dan Random Forest." />

      <section className="about-hero relative min-h-[720px] overflow-hidden border border-white/10 bg-[#081410]">
        <div className="about-hero__image absolute inset-0" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,12,10,.97)_0%,rgba(5,12,10,.8)_47%,rgba(5,12,10,.16)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_48%,rgba(5,12,10,.96))]" />
        <div className="relative grid min-h-[720px] gap-12 p-6 sm:p-10 lg:grid-cols-[.9fr_1.1fr] lg:p-14 xl:p-16">
          <div className="flex max-w-2xl flex-col justify-between">
            <div>
              <span className="rounded-full border border-white/12 bg-black/25 px-3 py-2 text-[9px] uppercase tracking-[.18em] text-white/55 backdrop-blur">Maysan, Iraq</span>
              <h2 className="mt-8 font-display text-5xl font-semibold leading-[.9] tracking-[-.055em] text-white md:text-7xl">Where rivers, wetlands, farms, and drylands meet.</h2>
              <p className="mt-7 text-base leading-8 text-white/50">Maysan memiliki mosaik sungai, wetland, lahan pertanian, permukaan kering, dan kawasan perkotaan. Kontras ini menjadi dasar empat kelas target dalam prototipe klasifikasi.</p>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-5 border-t border-white/12 pt-6 sm:grid-cols-4">{Object.entries(classMeta).map(([key,item],index) => <div key={key}><span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} /><p className="mt-4 text-[9px] uppercase tracking-[.16em] text-white/34">0{index+1}</p><p className="mt-1 text-xs text-white/62">{item.short}</p></div>)}</div>
          </div>
          <div className="hidden items-end justify-end lg:flex"><div className="w-full max-w-sm border-l border-white/15 pl-7"><Navigation className="text-amber-100/60" /><p className="mt-6 text-[9px] uppercase tracking-[.22em] text-white/34">Study center</p><p className="mt-2 font-display text-4xl font-semibold text-white">31.84° N<br />47.14° E</p><p className="mt-5 text-xs leading-6 text-white/42">Koordinat pusat tampilan berada di sekitar Amarah. Batas governorate disederhanakan dari data Natural Earth, sementara hasil klasifikasi tetap simulasi.</p></div></div>
        </div>
      </section>

      <div className="mt-px grid gap-px bg-white/10 lg:grid-cols-3">
        {[
          ['2020', 'Baseline stabil', 'Sentinel-2 pada 2020 digunakan sebagai kondisi awal yang relatif baru dan konsisten.'],
          ['2025', 'Kondisi terkini', 'Tahun terbaru memperlihatkan arah perubahan yang relevan untuk interpretasi saat ini.'],
          ['05Y', 'Jarak proporsional', 'Rentang lima tahun cukup panjang untuk memperlihatkan perubahan tanpa kehilangan relevansi.'],
        ].map(([value,title,text]) => <article key={title} className="bg-[#091512] p-6 sm:p-9"><p className="font-display text-5xl font-semibold text-white/[.13]">{value}</p><h3 className="mt-6 font-display text-2xl font-semibold text-white">{title}</h3><p className="mt-3 text-sm leading-7 text-white/42">{text}</p></article>)}
      </div>

      <section className="mt-14 grid gap-px overflow-hidden border border-white/10 bg-white/10 lg:grid-cols-[1.2fr_.8fr]">
        <article className="bg-[#091512] p-6 sm:p-10 lg:p-12"><p className="text-[9px] uppercase tracking-[.24em] text-white/30">System statement</p><h2 className="mt-3 max-w-4xl font-display text-4xl font-semibold leading-tight text-white md:text-5xl">Visual yang kuat tetap harus dibaca bersama batas ilmiah data.</h2><p className="mt-6 max-w-4xl text-sm leading-7 text-white/44">Angka luas, gain, loss, dan metrik validasi telah diperbarui menggunakan hasil analisis 2020–2025. Geometri batas dan poligon tampilan tetap berfungsi sebagai representasi visual yang disederhanakan.</p></article>
        <article className="bg-[#0a1713] p-6 sm:p-10 lg:p-12"><Sparkles className="text-amber-100/60" /><h2 className="mt-7 font-display text-3xl font-semibold text-white">Lanjutkan eksplorasi</h2><p className="mt-4 text-sm leading-7 text-white/42">Peta adalah tempat terbaik untuk memahami hubungan antar kelas dan hotspot perubahan.</p><button type="button" onClick={() => onNavigate('map')} className="mt-8 flex w-full items-center justify-between rounded-2xl bg-[#efd39a] px-5 py-4 text-sm font-semibold text-[#10201a] transition hover:bg-[#f7e0b1]">Buka peta <ExternalLink size={16} /></button></article>
      </section>
    </PageShell>
  )
}

function AppPage({ page, onNavigate }) {
  if (page === 'map') return <MapPage />
  if (page === 'change') return <ChangePage />
  if (page === 'statistics') return <StatisticsPage />
  if (page === 'validation') return <ValidationPage />
  if (page === 'about') return <AboutPage onNavigate={onNavigate} />
  return <DashboardPage onNavigate={onNavigate} />
}

export default function App() {
  const initialPage = useMemo(getInitialPage, [])
  const [entered, setEntered] = useState(() => getInitialEntered(initialPage))
  const [activePage, setActivePage] = useState(initialPage)
  const [theme, setTheme] = useState(getStoredTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    try {
      window.localStorage.setItem('maysan-theme', theme)
    } catch {
      // Storage can be unavailable in privacy-restricted or embedded contexts.
    }
  }, [theme])

  useEffect(() => {
    const syncHash = () => {
      const next = window.location.hash.slice(1)
      setActivePage(isValidPage(next) ? next : 'dashboard')
    }
    window.addEventListener('hashchange', syncHash)
    window.addEventListener('popstate', syncHash)
    return () => {
      window.removeEventListener('hashchange', syncHash)
      window.removeEventListener('popstate', syncHash)
    }
  }, [])

  useEffect(() => {
    const current = pages.find((item) => item.id === activePage)
    document.title = `${current?.label || 'Dashboard'} · MAYSAN//GEOAI`
  }, [activePage])

  const navigate = (page) => {
    if (!isValidPage(page)) return
    setActivePage(page)
    navigateHash(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const enterApplication = () => {
    try {
      window.sessionStorage.setItem('maysan-entered', 'true')
    } catch {
      // Session storage may be unavailable in privacy-restricted contexts.
    }
    setEntered(true)
    navigate(activePage)
  }

  if (!entered) return <Opening onEnter={enterApplication} />

  return (
    <div data-theme={theme} className={`app-shell theme-${theme} min-h-screen overflow-x-hidden`}>
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-mask opacity-[.12]" />
      <div className="pointer-events-none fixed inset-0 z-0 grain" />
      <CursorAura />
      <Navbar activePage={activePage} onNavigate={navigate} theme={theme} setTheme={setTheme} />
      <main className="relative z-10 pt-[92px]">
        <AnimatePresence mode="wait">
          <AppPage key={activePage} page={activePage} onNavigate={navigate} />
        </AnimatePresence>
      </main>
      {activePage !== 'map' && (
        <footer className="relative z-10 border-t border-white/10 px-4 pb-24 pt-8 text-[9px] uppercase tracking-[.17em] text-white/28 sm:px-7 md:pb-8 lg:px-12">
          <div className="mx-auto grid max-w-[1580px] gap-4 sm:grid-cols-3"><span>MAYSAN//GEOAI · Iraq Observatory</span><span className="sm:text-center">Sentinel-2 · Random Forest · Data hasil analisis</span><span className="sm:text-right">Scene RGB 2020 / 2025</span></div>
        </footer>
      )}
      <Chatbot />
    </div>
  )
}
