import { useState, useEffect, useRef } from 'react'
import { Storefront, MapPin, ArrowLeft, ArrowRight, Check, Repeat, Trophy, Users, ShareNetwork, WhatsappLogo } from '@phosphor-icons/react'

/* ═══════════════════════════════════════════════════════
   Encuesta Ferias Chile — FeriaHub edition
   Paleta cálida FeriaHub (café/terracota/ámbar)
   Una pregunta por pantalla + barra de progreso
   Submit → /api/leads (proxy del backend FeriaHub → codigoguerrero.dev)
═══════════════════════════════════════════════════════ */

const EXPOSITOR_QUESTIONS = [
  { id: 'a1', q: '¿Cómo postulas hoy a las ferias?', multi: true, options: ['Por WhatsApp', 'Por correo con formulario', 'Google Forms / formulario web', 'Word, PDF o Excel', 'Nunca he postulado'] },
  { id: 'a2', q: '¿Cuánto tiempo demoras en preparar cada postulación?', multi: false, options: ['Menos de 30 min', '30-60 min', '1-3 horas', 'Más de 3 horas'] },
  { id: 'a3', q: '¿A cuántas ferias postulaste el último año?', multi: false, options: ['Ninguna', '1-3', '4-6', '7-10', 'Más de 10'] },
  { id: 'a4', q: '¿Te ha pasado esto?', multi: true, options: ['Me pidieron repetir info ya entregada', 'Perdí mi documentación a medio camino', 'No sabía qué faltaba para estar completo', 'Tuve que rearmar catálogo y fotos cada vez', 'Perdí oportunidades por no alcanzar el plazo'] },
  { id: 'a5', q: '¿Te interesaría crear tu perfil UNA VEZ y reutilizarlo?', multi: false, options: ['Sí, muchísimo', 'Me interesa', 'No me interesa', 'No lo entiendo'] },
]

const ORGANIZADOR_QUESTIONS = [
  { id: 'b1', q: '¿Cómo recibes hoy las postulaciones?', multi: true, options: ['WhatsApp', 'Correo', 'Google Forms', 'Documentos', 'No tengo un método organizado'] },
  { id: 'b2', q: '¿Cuántas postulaciones recibes por evento?', multi: false, options: ['Menos de 20', '20-50', '50-100', 'Más de 100'] },
  { id: 'b3', q: '¿Cuánto te toma administrarlas?', multi: false, options: ['Menos de 1 hora', '1-3 horas', 'Medio día', 'Un día o más'] },
  { id: 'b4', q: '¿Cuántos eventos organizas al año?', multi: false, options: ['1', '2-5', '6-10', 'Más de 10'] },
  { id: 'b5', q: '¿Te gustaría centralizar todo en un panel?', multi: false, options: ['Sí, mucho', 'Me interesa', 'No me interesa', 'Ya tengo herramienta'] },
]

const PAIN_QUESTIONS = [
  '¿Cansado de rellenar formularios para cada postulación?',
  '¿Cansado de repetir tu catálogo y fotos en cada feria?',
  '¿Perdiendo tiempo armando la misma info una y otra vez?',
  '¿Tienes que organizar postulaciones revueltas por WhatsApp y correo?',
  '¿Comparar postulantes te toma un día entero?',
]

function RotatingPainHeadline() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI(x => (x + 1) % PAIN_QUESTIONS.length), 3800)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="min-h-[6em] sm:min-h-[4.5em] flex items-center justify-center mb-5">
      <h1 key={i} className="animate-[fadeSlide_0.4s_ease] font-display text-3xl md:text-5xl font-extrabold leading-[1.1] tracking-tight text-feria-900">
        {PAIN_QUESTIONS[i]}
      </h1>
    </div>
  )
}

function QuestionStep({ data, value, onChange, onNext }: {
  data: { id: string; q: string; multi: boolean; options: string[] }
  value: string[] | string
  onChange: (id: string, val: string[] | string) => void
  onNext: () => void
}) {
  const multi = data.multi
  const selected: string[] = multi ? (value as string[] || []) : (value ? [value as string] : [])
  const answered = multi ? selected.length > 0 : Boolean(value)

  const toggle = (opt: string) => {
    if (multi) onChange(data.id, selected.includes(opt) ? selected.filter(x => x !== opt) : [...selected, opt])
    else { onChange(data.id, opt); setTimeout(onNext, 250) }
  }

  return (
    <div key={data.id} className="animate-[fadeIn_0.35s_ease]">
      <h2 className="font-display text-2xl md:text-4xl leading-tight mb-1 text-feria-900">
        {data.q}
        {multi && <span className="block font-sans text-xs md:text-sm text-feria-500 mt-2 font-normal">Elige todas las que apliquen</span>}
      </h2>
      <div className="mt-8 space-y-3">
        {data.options.map(opt => {
          const active = selected.includes(opt)
          return (
            <button key={opt} type="button" onClick={() => toggle(opt)}
              className={`group w-full text-left px-5 py-4 rounded-xl border-2 font-sans text-sm md:text-base transition-all duration-200 active:scale-[0.98] ${
                active
                  ? 'border-feria-accent bg-feria-accent/10 text-feria-900 shadow-soft'
                  : 'border-feria-100 bg-white text-feria-800 hover:border-feria-accent/50 hover:translate-x-1'
              }`}>
              <span className="flex items-center justify-between gap-3">
                <span>{opt}</span>
                {active && <Check className="w-4 h-4 text-feria-accent shrink-0" weight="bold" />}
              </span>
            </button>
          )
        })}
      </div>
      {answered && (
        <div className="mt-8 flex justify-end">
          <button type="button" onClick={onNext}
            className="inline-flex items-center gap-2 bg-feria-accent text-white px-7 py-3.5 rounded-lg font-sans font-semibold text-sm transition-all hover:-translate-y-[2px] active:scale-[0.97] shadow-lift">
            Siguiente <ArrowRight className="w-4 h-4" weight="bold" />
          </button>
        </div>
      )}
    </div>
  )
}

function SurveyForm() {
  const [role, setRole] = useState<'expositor' | 'organizador' | null>(null)
  const [answers, setAnswers] = useState<Record<string, string[] | string>>({})
  const [step, setStep] = useState(0)
  const [openNote, setOpenNote] = useState('')
  const [contact, setContact] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const surveyRef = useRef<HTMLDivElement>(null)

  const questions = role === 'expositor' ? EXPOSITOR_QUESTIONS : ORGANIZADOR_QUESTIONS
  const total = questions.length + 1
  const progress = ((step + 1) / total) * 100
  const isLast = step === total - 1
  const currentQ = step < questions.length ? questions[step] : null
  const allAnswered = questions.every(q => q.multi ? (answers[q.id] as string[] || []).length > 0 : Boolean(answers[q.id]))

  const setAns = (id: string, val: string[] | string) => setAnswers(prev => ({ ...prev, [id]: val }))
  const goNext = () => { if (step < total - 1) setStep(s => s + 1) }
  const goBack = () => { if (step > 0) setStep(s => s - 1) }

  useEffect(() => { surveyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, [step])

  const handleSubmit = async () => {
    setSubmitting(true); setError('')
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'feria-survey',
          phone: 'no-telefono',
          name: '',
          business_name: contact || 'Respuesta anónima',
          email: contact?.includes('@') ? contact : '',
          timestamp: new Date().toISOString(),
          answers: { role, answers, open_note: openNote },
          message: JSON.stringify({ role, answers, open_note: openNote }),
        }),
      })
      setDone(true)
    } catch {
      setError('Ocurrió un problema al enviar. Inténtalo de nuevo.')
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full bg-feria-accent/15 flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-feria-accent" weight="bold" />
        </div>
        <h2 className="font-display text-3xl mb-3 text-feria-900">Gracias por tu respuesta</h2>
        <p className="font-sans text-sm text-feria-600 leading-relaxed mb-6">
          Tu opinión nos ayuda a construir una plataforma que de verdad resuelva el problema de postular a las ferias.
        </p>
        <div className="rounded-2xl border border-feria-100 bg-white p-6 text-left mb-6 shadow-soft">
          <h3 className="font-display text-xl mb-2 text-feria-900">Esto es lo que vamos a construir</h3>
          <ul className="space-y-2.5 font-sans text-sm text-feria-700">
            <li className="flex items-start gap-2"><Repeat className="w-4 h-4 text-feria-accent shrink-0 mt-0.5" /> Tu perfil y catálogo, cargados una vez.</li>
            <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 text-feria-accent shrink-0 mt-0.5" /> Postula a cualquier feria con un clic.</li>
            <li className="flex items-start gap-2"><Trophy className="w-4 h-4 text-feria-accent shrink-0 mt-0.5" /> Historial, logros y certificados verificables.</li>
          </ul>
          <div className="mt-5 border-t border-feria-100 pt-4">
            <p className="font-sans text-sm font-semibold text-feria-800 mb-1">Sé de los primeros</p>
            <p className="font-sans text-xs text-feria-500 mb-3">Queremos que lo prueben quienes ya mostraron el dolor.</p>
            <a href={`https://wa.me/56939688275?text=${encodeURIComponent('Hola, respondí la encuesta de ferias y quiero estar entre los primeros en la plataforma.')}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full bg-feria-accent text-white px-6 py-3 rounded-lg font-semibold text-sm shadow-lift">
              <WhatsappLogo weight="fill" /> Quiero estar entre los primeros
            </a>
          </div>
        </div>
        <button type="button" onClick={() => { navigator.clipboard?.writeText('https://feriahub.codigoguerrero.dev/encuesta') }}
          className="inline-flex items-center gap-2 font-sans text-sm text-feria-600 hover:text-feria-800 transition-colors">
          Copiar enlace para compartir
        </button>
      </div>
    )
  }

  if (!role) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-display text-3xl md:text-5xl mb-3 text-feria-900">¿De qué lado estás?</h2>
        <p className="font-sans text-sm md:text-base text-feria-600 mb-10">Esto cambia las preguntas. Son 5, toma menos de 2 minutos.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-lg mx-auto">
          <button type="button" onClick={() => { setRole('expositor'); setStep(0) }}
            className="group rounded-2xl border-2 border-feria-100 bg-white p-8 text-left hover:border-feria-accent/50 transition-all hover:-translate-y-1 active:scale-[0.98] shadow-soft">
            <div className="w-12 h-12 rounded-xl bg-feria-accent/12 flex items-center justify-center mb-5">
              <Storefront className="w-6 h-6 text-feria-accent" weight="duotone" />
            </div>
            <h3 className="font-display text-xl mb-1 text-feria-900">Expositor</h3>
            <p className="font-sans text-sm text-feria-500">Artesano, emprendedor, foodtruck, marca</p>
          </button>
          <button type="button" onClick={() => { setRole('organizador'); setStep(0) }}
            className="group rounded-3xl border-2 border-feria-100 bg-white p-8 text-left hover:border-feria-accent/50 transition-all hover:-translate-y-1 active:scale-[0.98] shadow-soft">
            <div className="w-12 h-12 rounded-xl bg-feria-accent/10 flex items-center justify-center mb-5">
              <MapPin className="w-6 h-6 text-feria-accent" weight="duotone" />
            </div>
            <h3 className="font-display text-xl mb-1 text-feria-900">Organizador</h3>
            <p className="font-sans text-sm text-feria-500">Feria, municipalidad, productor de eventos</p>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={surveyRef} className="max-w-xl mx-auto scroll-mt-24">
      <div className="mb-2 flex items-center justify-between font-sans text-xs text-feria-500">
        <span>{role === 'expositor' ? 'Expositor' : 'Organizador'}</span>
        <span>{Math.min(step + 1, total)} / {total}</span>
      </div>
      <div className="h-1.5 rounded-full bg-feria-100 overflow-hidden mb-8">
        <div className="h-full rounded-full bg-feria-accent transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {currentQ ? (
        <QuestionStep key={currentQ.id} data={currentQ} value={answers[currentQ.id]} onChange={setAns} onNext={goNext} />
      ) : (
        <div key="final" className="animate-[fadeIn_0.35s_ease]">
          <h2 className="font-display text-2xl md:text-4xl mb-6 text-feria-900">Casi listo</h2>
          <div className="space-y-5">
            <div>
              <label className="font-sans text-sm font-semibold block mb-2 text-feria-800">¿Cuál es la parte más molesta del proceso de postulación?</label>
              <textarea value={openNote} onChange={e => setOpenNote(e.target.value)} rows={3} placeholder="Cuéntanos en una o dos frases..."
                className="w-full bg-white border border-feria-100 rounded-xl px-5 py-4 font-sans text-sm placeholder:text-feria-300 focus:outline-none focus:border-feria-accent focus:ring-2 focus:ring-feria-accent/30" />
            </div>
            <div>
              <label className="font-sans text-sm font-semibold block mb-2 text-feria-800">¿Quieres enterarte cuando esté lista la nueva plataforma?</label>
              <input value={contact} onChange={e => setContact(e.target.value)} type="text" placeholder="Deja tu WhatsApp o correo"
                className="w-full bg-white border border-feria-100 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-feria-accent focus:ring-2 focus:ring-feria-accent/15" />
            </div>
          </div>
          {error && <p className="text-sm text-rose-600 mt-4 text-center">{error}</p>}
          <button type="button" onClick={handleSubmit} disabled={!allAnswered || submitting}
            className={`mt-8 w-full py-4 rounded-lg font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all ${
              allAnswered && !submitting ? 'bg-feria-accent text-white shadow-lift hover:-translate-y-[2px] active:scale-[0.98]' : 'bg-feria-100 text-feria-400 cursor-not-allowed'
            }`}>
            {submitting ? 'Enviando...' : 'Enviar respuesta'} <ArrowRight className="w-4 h-4" weight="bold" />
          </button>
          <p className="text-xs text-center mt-3 text-feria-400">{allAnswered ? 'Se guarda de forma anónima.' : 'Falta responder las 5 preguntas para poder enviar.'}</p>
        </div>
      )}

      {step > 0 && (
        <button type="button" onClick={goBack} className="mt-8 inline-flex items-center gap-2 font-sans text-sm text-feria-600 hover:text-feria-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
      )}
    </div>
  )
}

export default function EncuestaView() {
  return (
    <div className="bg-feria-50 min-h-screen">
      {/* Hero */}
      <div className="max-w-2xl mx-auto text-center pt-10 pb-10 px-5">
        <div className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.15em] text-feria-accent font-semibold mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-feria-accent inline-block" />
          Ferias y eventos de Chile
        </div>
        <RotatingPainHeadline />
        <p className="font-sans text-sm md:text-base text-feria-600 max-w-lg mx-auto mb-8">
          Vamos a construir la plataforma que les da a los expositores un perfil único para postular a todas las ferias de Chile. Primero queremos escuchar a los que ya postulan. Toma menos de 2 minutos.
        </p>
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          {[
            { icon: Repeat, text: 'Perfil único' },
            { icon: Users, text: 'Postular en un clic' },
            { icon: Trophy, text: 'Historial real' },
          ].map((f, i) => (
            <div key={i} className="rounded-xl border border-feria-100 bg-white p-3 text-center shadow-soft">
              <f.icon className="w-5 h-5 text-feria-accent mx-auto mb-1.5" weight="duotone" />
              <p className="font-sans text-[11px] text-feria-600 leading-tight">{f.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Encuesta */}
      <div className="pb-16 px-5">
        <SurveyForm />
      </div>

      {/* CTA compartir */}
      <div className="max-w-xl mx-auto text-center pb-20 pt-4 px-5">
        <h2 className="font-display text-2xl md:text-3xl mb-3 text-feria-900">Ayúdanos a difundir</h2>
        <p className="font-sans text-sm text-feria-600 mb-6">¿Conoces a un expositor u organizador? Comparte el enlace para tener más datos.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button type="button" onClick={() => { if (navigator.share) navigator.share({ title: 'Encuesta Ferias Chile', url: 'https://feriahub.codigoguerrero.dev/encuesta' }); else navigator.clipboard?.writeText('https://feriahub.codigoguerrero.dev/encuesta'); }}
            className="inline-flex items-center justify-center gap-2 bg-feria-accent text-white px-6 py-3 rounded-lg font-semibold text-sm shadow-lift">
            <ShareNetwork weight="bold" /> Compartir
          </button>
          <a href={`https://wa.me/?text=${encodeURIComponent('Ayúdanos con 2 minutos de tu tiempo: https://feriahub.codigoguerrero.dev/encuesta')}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-feria-100 bg-white px-6 py-3 font-semibold text-sm text-feria-700">
            <WhatsappLogo weight="fill" /> Enviar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
