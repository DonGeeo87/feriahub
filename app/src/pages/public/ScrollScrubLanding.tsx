import { useEffect, useRef, useState } from 'react'
import { Storefront, MapPin, ArrowDown, SkipForward, ArrowUp } from '@phosphor-icons/react'
import WordReveal from '../../components/ux/WordReveal'
import { track } from '../../lib/track'

const TOTAL_FRAMES = 120

type Capitulo = {
  inicio: number
  fin: number
  num: string
  titulo: string
  texto?: string
  fullScreen?: boolean
}

const CAPITULOS: Capitulo[] = [
  { inicio: 0.06, fin: 0.20, num: '01', titulo: 'Cada feria es un encuentro entre quienes crean y quienes las hacen posibles', texto: 'Expositores con su talento y organizadores con su convocatoria. FeriaHub los une.' },
  { inicio: 0.20, fin: 0.52, num: '02', titulo: 'Hoy, participar es un caos para ambos lados', texto: 'Expositores repiten información y documentos en cada convocatoria. Organizadores reciben postulaciones dispersas por WhatsApp, correo y formularios.', fullScreen: true },
  { inicio: 0.52, fin: 0.80, num: '03', titulo: 'FeriaHub reúne todo en un solo lugar', texto: 'El expositor crea su perfil UNA vez y postula con un clic. El organizador ve todas las postulaciones ordenadas en un panel y decide con un clic.' },
  { inicio: 0.80, fin: 0.96, num: '04', titulo: 'Cada participación construye tu trayectoria', texto: 'Participaciones verificadas, certificados y logros. Tu historial profesional dentro de las ferias, y para el organizador, un historial de confianza.', fullScreen: true },
]

function chapterAnim(inicio: number, fin: number, progress: number): { opacity: number; y: number } {
  if (progress < inicio || progress > fin) return { opacity: 0, y: 20 }
  const local = (progress - inicio) / (fin - inicio)
  const ENTRAR = 0.18
  const SALIR = 0.82
  let opacity = 1
  let y = 0
  if (local < ENTRAR) {
    opacity = local / ENTRAR
    y = 20 - (20 * local) / ENTRAR
  } else if (local > SALIR) {
    const out = (local - SALIR) / (1 - SALIR)
    opacity = 1 - out
    y = -20 * out
  }
  return { opacity, y }
}

function capituloActivo(progress: number): number {
  let idx = 0
  for (let i = 0; i < CAPITULOS.length; i++) {
    if (progress >= CAPITULOS[i].inicio) idx = i
    if (progress <= CAPITULOS[i].fin && progress >= CAPITULOS[i].inicio) { idx = i; break }
  }
  return idx
}

export default function ScrollScrubLanding({
  onChooseRol,
  onExploreDemo,
}: {
  onChooseRol: (rol: 'expositor' | 'organizador') => void
  onExploreDemo: () => void
}) {
  const [progress, setProgress] = useState(0)
  const [nearEnd, setNearEnd] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [setMovil, setSetMovil] = useState(false) // true = usar frames-movil (vertical)
  const [ready, setReady] = useState(false)
  const [loadedCount, setLoadedCount] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const cacheRef = useRef<Record<string, string>>({}) // url → dataURL (caché en memoria)
  const trackedEnd = useRef(false)
  const trackedRol = useRef<string | null>(null)

  // prefers-reduced-motion + detectar si es vertical (usar frames móviles)
  useEffect(() => {
    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mqReduced.matches)
    const detectar = () => setSetMovil(window.innerHeight > window.innerWidth)
    detectar()
    window.addEventListener('resize', detectar)
    return () => window.removeEventListener('resize', detectar)
  }, [])

  // Precarga TODOS los frames del set activo en caché, y actualiza el <img> sin re-render.
  useEffect(() => {
    if (reduced) return
    const base = setMovil ? '/frames-movil' : '/frames'
    const cache = cacheRef.current

    const setSrc = (idx: number) => {
      if (!frameRef.current) return
      const url = cache[String(idx)] ?? `${base}/frame_${String(idx).padStart(3, '0')}.webp`
      // solo cambia si el frame cambió
      if (frameRef.current.dataset.idx !== String(idx)) {
        frameRef.current.style.backgroundImage = `url("${url}")`
        frameRef.current.dataset.idx = String(idx)
      }
    }

    // Precargar todos (120) en paralelo
    let loaded = 0
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const url = `${base}/frame_${String(i).padStart(3, '0')}.webp`
      const img = new Image()
      img.onload = () => {
        cache[String(i)] = url
        loaded++
        setLoadedCount(loaded)
        if (loaded === TOTAL_FRAMES) setReady(true)
      }
      img.src = url
    }

    // Scroll → actualizar <img> imperativamente con rAF (sin re-render de React)
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const el = containerRef.current
        if (!el) return
        const viewportH = window.innerHeight
        const totalScroll = el.offsetHeight - viewportH
        const scrolled = Math.max(0, Math.min(1, -el.getBoundingClientRect().top / Math.max(totalScroll, 1)))
        setProgress(scrolled)
        const idx = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(1 + scrolled * (TOTAL_FRAMES - 1))))
        setSrc(idx)
        const end = scrolled > 0.955
        setNearEnd(end)
        if (end && !trackedEnd.current) {
          trackedEnd.current = true
          track('landing_final')
        }
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // mostrar frame 1 de inmediato
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [reduced, setMovil])

  const base = setMovil ? '/frames-movil' : '/frames'

  const elegir = (rol: 'expositor' | 'organizador') => {
    if (trackedRol.current !== rol) { trackedRol.current = rol; track('landing_rol', rol) }
    onChooseRol(rol)
  }

  const saltar = () => {
    track('landing_saltar')
    window.scrollTo({ top: containerRef.current?.offsetHeight ?? 99999, behavior: 'smooth' })
  }

  const volverArriba = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const heroOut = Math.min(1, Math.max(0, (progress - 0.05) / 0.035))
  const heroOpacity = Math.max(0, 1 - heroOut)
  const heroY = -24 * heroOut
  const idxActivo = capituloActivo(progress)
  const numActual = CAPITULOS[idxActivo].num

  return (
    <div>
      <div ref={containerRef} className="relative" style={{ height: '560vh' }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">

          {/* PANTALLA DE CARGA — overlay mientras precargan los 120 frames */}
          {!ready && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-feria-800 transition-opacity duration-500">
              <div className="text-center px-6">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-feria-600 text-white flex items-center justify-center font-display text-2xl font-bold animate-pulse">F</div>
                <h2 className="mt-4 font-display text-xl font-bold text-white">FeriaHub</h2>
                <p className="mt-1 text-sm text-white/70">Preparando el recorrido por las ferias de Chile…</p>
                <div className="mt-4 w-48 h-1.5 bg-white/15 rounded-full overflow-hidden mx-auto">
                  <div className="h-full bg-feria-accent rounded-full transition-[width] duration-200" style={{ width: `${(loadedCount / TOTAL_FRAMES) * 100}%` }} />
                </div>
              </div>
            </div>
          )}

          <div
            ref={frameRef}
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            data-idx="1"
            style={{ backgroundImage: `url("${base}/frame_001.webp")`, willChange: 'background-image' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/25 pointer-events-none" />

          {/* SALTAR historia */}
          <button
            onClick={saltar}
            className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-black/60 hover:text-white transition-colors"
          >
            <SkipForward size={14} weight="bold" /> Saltar
          </button>

          {/* VOLVER ARRIBA — aparece al avanzar la historia */}
          {progress > 0.1 && (
            <button
              onClick={volverArriba}
              className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-black/60 hover:text-white transition-colors"
            >
              <ArrowUp size={14} weight="bold" /> Subir
            </button>
          )}

          {/* HERO */}
          <div
            className="absolute inset-0 flex items-center justify-center px-6 transition-opacity duration-700"
            style={{
              opacity: heroOpacity * (ready ? 1 : 0),
              transform: `translateY(${heroY}px)`,
            }}
          >
            <div className="text-center max-w-2xl rounded-3xl px-6 py-8 sm:px-10"
              style={{ backgroundColor: 'rgba(20,14,12,0.4)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
              <p className="text-feria-accent2 font-display text-sm tracking-[0.4em] font-bold mb-4 uppercase" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>El camino hacia tu próxima feria</p>
              <h1 className="font-display font-extrabold text-white leading-none text-[15vw] sm:text-[11vw] lg:text-[6.5rem]"
                style={{ textShadow: '0 3px 10px rgba(0,0,0,0.85), 0 8px 30px rgba(0,0,0,0.6)' }}>
                FeriaHub
              </h1>
              <p className="mt-4 text-white text-sm sm:text-base" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>Desplázate y recorre las ferias de Chile. Para quienes exponen y para quienes las organizan.</p>
            </div>
          </div>

          {/* CAPÍTULOS */}
          {CAPITULOS.map(c => {
            const anim = chapterAnim(c.inicio, c.fin, progress)
            if (anim.opacity <= 0.01) return null
            const estilo = { opacity: anim.opacity, transform: `translateY(${anim.y}px)` }

            if (c.fullScreen) {
              return (
                <div key={c.num} className="absolute inset-0 flex items-center justify-center px-6" style={estilo}>
                  <div className="text-center max-w-3xl relative rounded-3xl px-6 py-8 sm:px-10"
                    style={{ backgroundColor: 'rgba(20,14,12,0.4)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
                    <div className="text-feria-accent2 font-display font-bold text-sm tracking-[0.3em] mb-3" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.85)' }}>{c.num}</div>
                    <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-[1.1]"
                      style={{ textShadow: '0 3px 10px rgba(0,0,0,0.85), 0 8px 30px rgba(0,0,0,0.55)' }}>
                      <WordReveal text={c.titulo} progress={Math.min(1, Math.max(0, (progress - c.inicio) / (c.fin - c.inicio) * 2.5))} />
                    </h2>
                    {c.texto && (
                      <p className="mt-4 text-base sm:text-lg text-white/90 max-w-xl mx-auto" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{c.texto}</p>
                    )}
                  </div>
                </div>
              )
            }

            return (
              <div key={c.num} className="absolute inset-x-0 bottom-[12%] flex justify-center p-4 sm:p-6" style={estilo}>
                <div className="max-w-lg w-full rounded-2xl shadow-lift px-5 py-4 sm:px-6 sm:py-5 text-center"
                  style={{ backgroundColor: 'rgba(20,14,12,0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
                  <div className="text-feria-accent2 font-display text-xs tracking-[0.3em] font-bold mb-1.5" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.7)' }}>{c.num}</div>
                  <h2 className="font-display text-lg sm:text-2xl font-bold text-white leading-snug" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                    <WordReveal text={c.titulo} progress={Math.min(1, Math.max(0, (progress - c.inicio) / (c.fin - c.inicio) * 2.5))} />
                  </h2>
                  {c.texto && (
                    <p className="mt-1.5 text-sm text-white/90" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.7)' }}>{c.texto}</p>
                  )}
                </div>
              </div>
            )
          })}

          {/* indicador de avance con capítulo */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/90 text-xs font-medium">
            <ArrowDown size={16} weight="bold" className="animate-bounce" />
            <span className="tracking-[0.3em]">{numActual} / 04</span>
            <div className="w-36 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-feria-accent transition-all" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>

          {/* cierre */}
          {nearEnd && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-6 overflow-y-auto">
              <div className="text-center max-w-lg py-4">
                <CierraItem d="0s">
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">FeriaHub te invita a probarlo</h2>
                </CierraItem>
                <CierraItem d="0.12s">
                  <p className="mt-2 text-white/80 text-sm">Estamos construyéndolo con personas como tú. Pruébalo gratis y cuéntanos qué necesitas.</p>
                </CierraItem>

                <CierraItem d="0.24s">
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button onClick={() => elegir('expositor')}
                      className="bg-white rounded-xl p-5 text-left hover:bg-feria-50 transition-colors">
                      <Storefront size={28} weight="duotone" className="text-feria-600" />
                      <div className="mt-2 font-semibold text-feria-800">Soy expositor</div>
                      <div className="text-xs text-feria-500 mt-1">Busco ferias y postulo</div>
                    </button>
                    <button onClick={() => elegir('organizador')}
                      className="bg-white rounded-xl p-5 text-left hover:bg-feria-50 transition-colors">
                      <MapPin size={28} weight="duotone" className="text-feria-accent" />
                      <div className="mt-2 font-semibold text-feria-800">Soy organizador</div>
                      <div className="text-xs text-feria-500 mt-1">Publico y selecciono</div>
                    </button>
                  </div>
                </CierraItem>

                <CierraItem d="0.36s">
                  <button onClick={() => { track('landing_ver_demo'); onExploreDemo() }}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/10 backdrop-blur px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors">
                    Ver la demo sin registrarme
                  </button>
                </CierraItem>

                <CierraItem d="0.42s">
                  <a
                    href="https://codigoguerrero.dev/ferias/encuesta"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track('landing_encuesta')}
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                  >
                    Responder la encuesta de 2 minutos →
                  </a>
                </CierraItem>

                <CierraItem d="0.52s">
                  <p className="mt-2 text-white/50 text-xs">Tu opinión define hacia dónde crece la plataforma.</p>
                </CierraItem>

                <CierraItem d="0.64s">
                  <div className="mt-6 pt-4 border-t border-white/10 inline-flex items-center gap-2 text-white/40 text-xs">
                    <span className="w-4 h-4 rounded bg-white/15 flex items-center justify-center text-[9px] font-bold text-white/70">CG</span>
                    <span>Hecho por <span className="text-white/60 font-medium">Código Guerrero Dev</span> · Chile</span>
                  </div>
                </CierraItem>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CierraItem({ d, children }: { d: string; children: React.ReactNode }) {
  return (
    <div
      className="will-change-transform"
      style={{ opacity: 0, animation: `cierraIn 0.5s ease-out ${d} forwards` }}
    >
      {children}
    </div>
  )
}
