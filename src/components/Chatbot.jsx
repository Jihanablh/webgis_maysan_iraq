import { useEffect, useRef, useState } from 'react'
import { Bot, MessageCircle, Send, X } from 'lucide-react'

const answer = (question) => {
  const text = question.toLowerCase()

  if (text.includes('maysan') || text.includes('amarah') || text.includes('lokasi')) {
    return 'Maysan adalah governorate di tenggara Iraq dengan Amarah sebagai ibu kotanya. Prototipe ini memakai batas Maysan yang disederhanakan untuk tampilan peta, sedangkan hasil klasifikasi dan statistik perubahan masih berupa simulasi.'
  }
  if (text.includes('2020') || text.includes('baseline')) {
    return 'Tahun 2020 digunakan sebagai baseline karena Sentinel-2 sudah memiliki rangkaian data yang stabil dan tahun tersebut cukup representatif untuk kondisi awal air, vegetasi, lahan terbuka, serta area terbangun sebelum dibandingkan dengan 2025.'
  }
  if (text.includes('2025') || text.includes('terbaru')) {
    return 'Tahun 2025 dipakai sebagai kondisi terkini agar perubahan lima tahunan tetap relevan. Pada data simulasi Maysan, air dan vegetasi menurun, sedangkan lahan terbuka dan area terbangun meningkat.'
  }
  if (text.includes('random forest') || text.includes('rf')) {
    return 'Random Forest digunakan untuk mengklasifikasikan empat kelas tutupan lahan. Konfigurasi demo memakai 200 pohon, pembagian data 70% training dan 30% testing, seed 42, serta band Sentinel-2 ditambah NDVI, MNDWI, NDBI, dan BSI.'
  }
  if (text.includes('akurasi') || text.includes('accuracy') || text.includes('confusion')) {
    return 'Confusion matrix simulasi menghasilkan overall accuracy 89,25%. Nilai ini hanya contoh tampilan dan wajib diganti dengan hasil validasi model aktual dari Google Earth Engine.'
  }
  if (text.includes('ndvi')) {
    return 'NDVI dihitung dari band NIR B8 dan Red B4. Indeks ini membantu memisahkan vegetasi dari kelas nonvegetasi serta membaca kecenderungan kehilangan vegetasi.'
  }
  if (text.includes('mndwi') || text.includes('ndwi') || text.includes('air')) {
    return 'MNDWI menggunakan Green B3 dan SWIR B11 untuk membantu menonjolkan air atau wetland. Pada data simulasi, luas kelas air turun dari 2.480 km² pada 2020 menjadi 2.130 km² pada 2025.'
  }
  if (text.includes('ndbi') || text.includes('terbangun')) {
    return 'NDBI membantu menonjolkan area terbangun, tetapi tanah kering terang dapat memiliki respons spektral yang mirip. Karena itu, hasilnya perlu dikombinasikan dengan BSI, sampel ground truth, dan validasi visual.'
  }
  if (text.includes('bsi') || text.includes('lahan terbuka') || text.includes('kering')) {
    return 'BSI membantu mengidentifikasi tanah terbuka dan lahan kering. Pada data simulasi, kelas ini meningkat 600 km² atau sekitar 9,1% selama 2020–2025.'
  }
  if (text.includes('data') || text.includes('simulasi') || text.includes('dummy')) {
    return 'Luas kelas, poligon klasifikasi, hotspot, sampel, dan metrik model pada prototipe ini merupakan data simulasi. Batas Maysan menggunakan geometri referensi yang disederhanakan. Struktur aplikasi sudah disiapkan agar layer analitik dapat diganti dengan hasil GeoJSON dan CSV dari Google Earth Engine.'
  }
  if (text.includes('kelas') || text.includes('objek')) {
    return 'Empat kelas target adalah Air atau Wetland, Vegetasi, Lahan Terbuka atau Kering, dan Area Terbangun atau Aktivitas Manusia.'
  }
  if (text.includes('ekspor') || text.includes('download')) {
    return 'Gunakan tombol GeoJSON di panel peta untuk mengunduh layer aktif. Gunakan tombol CSV pada bagian statistika untuk mengunduh tabel luas kelas simulasi Maysan.'
  }
  return 'Saya dapat menjelaskan Maysan, baseline 2020, kondisi 2025, empat kelas tutupan lahan, indeks Sentinel-2, Random Forest, confusion matrix, perubahan luas, dan cara ekspor data.'
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: 'Halo, saya MARA. Tanyakan analisis perubahan tutupan lahan Maysan, Iraq, periode 2020–2025.',
    },
  ])
  const messageEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  useEffect(() => {
    if (!open) return undefined
    inputRef.current?.focus()
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  const send = () => {
    if (!text.trim()) return
    const question = text.trim()
    setMessages((current) => [
      ...current,
      { from: 'user', text: question },
      { from: 'bot', text: answer(question) },
    ])
    setText('')
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          aria-label="Buka chatbot MARA"
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 z-[900] flex items-center md:bottom-5 md:right-5 gap-3 rounded-full bg-[#e6c58b] px-4 py-3 font-semibold text-[#13201b] shadow-2xl transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/70"
        >
          <MessageCircle size={19} />
          <span className="hidden sm:inline">Tanya MARA</span>
        </button>
      )}

      {open && (
        <div role="dialog" aria-modal="false" aria-labelledby="mara-title" className="fixed bottom-20 right-3 z-[950] flex h-[min(560px,calc(100vh-7rem))] md:bottom-5 md:right-5 md:h-[min(560px,calc(100vh-2.5rem))] w-[calc(100%-2.5rem)] max-w-[390px] flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[#0c1512] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100/10 text-emerald-200">
                <Bot size={18} />
              </div>
              <div>
                <p id="mara-title" className="font-semibold text-white">MARA GeoAI Assistant</p>
                <p className="text-[10px] uppercase tracking-wider text-emerald-300">Online · rule based</p>
              </div>
            </div>
            <button type="button" aria-label="Tutup chatbot" onClick={() => setOpen(false)} className="rounded-lg p-1 text-white/50 transition hover:bg-white/5 hover:text-white">
              <X />
            </button>
          </div>

          <div role="log" aria-live="polite" aria-relevant="additions" className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div key={`${message.from}-${index}`} className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-6 ${message.from === 'user' ? 'ml-auto bg-amber-200 text-[#17201c]' : 'bg-white/[.07] text-white/70'}`}>
                {message.text}
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>

          <form
            className="flex gap-2 border-t border-white/10 p-3"
            onSubmit={(event) => {
              event.preventDefault()
              send()
            }}
          >
            <input
              ref={inputRef}
              aria-label="Pertanyaan untuk MARA"
              value={text}
              maxLength={400}
              onChange={(event) => setText(event.target.value)}
              placeholder="Contoh: di mana Maysan?"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-200/40"
            />
            <button type="submit" aria-label="Kirim pertanyaan" disabled={!text.trim()} className="grid h-10 w-10 place-items-center rounded-xl bg-amber-200 text-[#17201c] transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-45">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
