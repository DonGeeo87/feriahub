import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  onExploreDemoOrganizador,
}: {
  onChooseRol: (rol: 'expositor' | 'organizador') => void
  onExploreDemo: () => void
  onExploreDemoOrganizador?: () => void
}) {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [nearEnd, setNearEnd] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [setMovil, setSetMovil] = useState(false) // true = usar frames-movil (vertical)
  const [ready, setReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
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

  // Al montar la landing (p.ej. al volver de una demo), resetear el scroll al inicio
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Puntos de swipe en móvil: el CENTRO de la zona de lectura de cada capítulo
  // (donde opacity=1 y el texto está completo). Calculado como inicio + 50% del rango.
  // 01→0.13, 02→0.36, 03→0.66, 04→0.88, cierre→1.0
  const hitos = [0.13, 0.36, 0.66, 0.88, 1.0]

  // Swipe vertical en móvil: un gesto avanza/retrocede al siguiente capítulo
  useEffect(() => {
    if (reduced) return
    const el = containerRef.current
    if (!el) return
    let y0: number | null = null
    const onTouchStart = (e: TouchEvent) => { y0 = e.touches[0].clientY }
    const onTouchEnd = (e: TouchEvent) => {
      if (y0 === null) return
      const dy = e.changedTouches[0].clientY - y0
      const umbral = 50
      if (Math.abs(dy) < umbral) return
      const el2 = containerRef.current
      if (!el2) return
      const totalScroll = el2.offsetHeight - window.innerHeight
      const actual = Math.max(0, Math.min(1, -el2.getBoundingClientRect().top / Math.max(totalScroll, 1)))
      // siguiente hito hacia arriba (avanzar) o hacia abajo (retroceder)
      let target: number
      if (dy < 0) {
        target = hitos.find(h => h > actual) ?? 1
      } else {
        target = [...hitos].reverse().find(h => h < actual) ?? 0
      }
      window.scrollTo({ top: target * totalScroll, behavior: 'smooth' })
    }
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [reduced, setMovil])

  // Video visible + scroll controla currentTime (sin canvas).
  // Lenis intercepta el scroll nativo, así que usamos loop de rAF que lee la posición real.
  useEffect(() => {
    if (reduced) return
    const videoSrc = setMovil ? '/scrub_feria_movil.mp4' : '/scrub_feria.mp4'
    const video = videoRef.current
    if (!video) return

    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.src = videoSrc

    // Mostrar el primer frame: cargar + pausar en 0 (no reproducir)
    video.onloadeddata = () => {
      video.currentTime = 0
      video.pause()
      setReady(true)
    }

    // Loop continuo de rAF: ajusta video.currentTime según la posición real del contenedor.
    let raf = 0
    let lastTime = -1
    let lastProgress = -1
    let lastNearEnd: boolean | null = null
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const el = containerRef.current
      if (!el) return
      const viewportH = window.innerHeight
      const totalScroll = el.offsetHeight - viewportH
      const scrolled = Math.max(0, Math.min(1, -el.getBoundingClientRect().top / Math.max(totalScroll, 1)))

      // Solo hacer seek si el progreso cambió
      if (video.duration) {
        const t = Math.round(scrolled * video.duration * 10)
        if (t !== lastTime) {
          lastTime = t
          video.currentTime = scrolled * video.duration
        }
      }
      if (Math.abs(scrolled - lastProgress) > 0.005) {
        lastProgress = scrolled
        setProgress(scrolled)
      }
      const end = scrolled > 0.955
      if (end !== lastNearEnd) {
        lastNearEnd = end
        setNearEnd(end)
        if (end && !trackedEnd.current) {
          trackedEnd.current = true
          track('landing_final')
        }
      }
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
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

          {/* NAVBAR morphinglass — se ve el fondo a través */}
          <header className="absolute top-0 inset-x-0 z-40">
            <div className="px-4 sm:px-6 h-14 flex items-center justify-between"
              style={{ background: 'rgba(20,14,12,0.25)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
              <button onClick={() => navigate('/')} className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-feria-accent text-white flex items-center justify-center">
                  <Storefront size={18} weight="bold" />
                </span>
                <span className="font-display font-bold text-lg text-white" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>FeriaHub</span>
              </button>

              <nav className="flex items-center gap-2">
                <button onClick={() => navigate('/login')} className="rounded-lg px-3 py-1.5 text-sm font-medium text-white/90 hover:bg-white/10 transition-colors"
                  style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                  Ingresar
                </button>
                <button onClick={() => navigate('/register')} className="rounded-lg bg-feria-accent px-4 py-1.5 text-sm font-semibold text-white hover:bg-feria-accent/90 transition-colors">
                  Crear cuenta
                </button>
              </nav>
            </div>
          </header>

          {/* PANTALLA DE CARGA — overlay mientras precarga el video */}
          {!ready && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-feria-800 transition-opacity duration-500">
              <div className="text-center px-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-feria-accent text-white flex items-center justify-center font-display text-2xl font-bold animate-pulse">F</div>
                <h2 className="mt-5 font-display text-2xl font-bold text-white">FeriaHub</h2>
                <p className="mt-2 text-sm text-white/70">Preparando el recorrido por las ferias de Chile…</p>
                <div className="mt-5 mx-auto w-8 h-8 border-2 border-white/20 border-t-feria-accent rounded-full animate-spin" />
              </div>
            </div>
          )}

          {/* VIDEO visible directo (sin canvas) — el scroll controla currentTime.
              El video se decodifica solo y muestra cada frame según la posición de scroll */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            playsInline
            preload="auto"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/25 pointer-events-none" />

          {/* SALTAR historia */}
          <button
            onClick={saltar}
            className="absolute top-16 right-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-black/60 hover:text-white transition-colors"
          >
            <SkipForward size={14} weight="bold" /> Saltar
          </button>

          {/* VOLVER ARRIBA — aparece al avanzar la historia */}
          {progress > 0.1 && (
            <button
              onClick={volverArriba}
              className="absolute top-16 left-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-black/60 hover:text-white transition-colors"
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
                  <p className="text-feria-accent2 font-display text-sm tracking-[0.3em] font-bold uppercase" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>Estamos dando los primeros pasos</p>
                </CierraItem>
                <CierraItem d="0.1s">
                  <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-white">FeriaHub es una plataforma gratuita en desarrollo</h2>
                </CierraItem>
                <CierraItem d="0.2s">
                  <p className="mt-3 text-white/80 text-sm">Queremos que postular a una feria deje de ser un trámite engorroso para los expositores y los organizadores. Solo lo lograremos con tu participación: prueba las demos y cuéntanos qué necesitas.</p>
                </CierraItem>

                {/* DEMOS — el foco principal */}
                <CierraItem d="0.3s">
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button onClick={() => { track('landing_ver_demo'); onExploreDemo() }}
                      className="bg-feria-accent rounded-xl p-5 text-left hover:bg-feria-accent/90 transition-colors">
                      <Storefront size={24} weight="duotone" className="text-white" />
                      <div className="mt-2 font-semibold text-white">Probar la demo de expositor</div>
                      <div className="text-xs text-white/80 mt-1">Cómo postular a ferias</div>
                    </button>
                    {onExploreDemoOrganizador && (
                      <button onClick={() => { track('demo_ver_organizador'); onExploreDemoOrganizador() }}
                        className="bg-white rounded-xl p-5 text-left hover:bg-feria-50 transition-colors">
                        <MapPin size={24} weight="duotone" className="text-feria-accent" />
                        <div className="mt-2 font-semibold text-feria-800">Probar la demo de organizador</div>
                        <div className="text-xs text-feria-500 mt-1">Cómo gestionar una convocatoria</div>
                      </button>
                    )}
                  </div>
                </CierraItem>

                {/* ENCUESTA — segundo foco */}
                <CierraItem d="0.4s">
                  <button
                    onClick={() => { track('landing_encuesta'); navigate('/encuesta') }}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/40 bg-white/10 backdrop-blur px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                  >
                    ¿Te interesa? Ayúdanos a saberlo: encuesta de 2 minutos →
                  </button>
                </CierraItem>

                <CierraItem d="0.5s">
                  <p className="mt-3 text-white/50 text-xs">Cada aporte ayuda a que una plataforma gratuita y de calidad llegue a las ferias de todo Chile.</p>
                </CierraItem>

                <CierraItem d="0.62s">
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
