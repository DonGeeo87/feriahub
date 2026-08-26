import { useEffect, useState } from 'react'
import { MapPin, CalendarBlank, Users, ArrowLeft, Check, Warning } from '@phosphor-icons/react'
import { api, ApiError, type Feria, type Perfil } from '../../lib/api'
import { fmtFecha } from '../../lib/format'

export default function DetalleFeria({ feriaId, onBack, onPostulada }: { feriaId: number; onBack: () => void; onPostulada: () => void }) {
  const [feria, setFeria] = useState<Feria | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [perfilOk, setPerfilOk] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  useEffect(() => {
    api.get<Feria>(`/ferias/${feriaId}`).then(setFeria)
    api.get<Perfil>('/perfiles/mio').then(p => { setPerfil(p); setPerfilOk(p.pct_perfil >= 60) }).catch(() => setPerfilOk(false))
  }, [feriaId])

  const postular = async () => {
    setEnviando(true); setError(''); setExito('')
    try {
      await api.post('/postulaciones', { feriaId })
      setExito('¡Listo! Tu postulación fue enviada.')
      setConfirmando(false)
      setTimeout(onPostulada, 1500)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al postular')
    } finally {
      setEnviando(false)
    }
  }

  if (!feria) return <div className="max-w-3xl mx-auto px-4 py-12 text-feria-500">Cargando feria…</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-feria-600 hover:text-feria-800 mb-4">
        <ArrowLeft size={18} weight="bold" /> Volver
      </button>

      {/* hero de la feria */}
      <div className="card overflow-hidden">
        <div className="h-40 bg-gradient-to-br from-feria-600 to-feria-800 flex items-center justify-center">
          <span className="font-display text-3xl font-extrabold text-white/90">{feria.nombre[0]}</span>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-2xl font-bold text-feria-800">{feria.nombre}</h1>
            <span className={`badge-status shrink-0 ${feria.estado === 'abierta' ? 'bg-feria-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {feria.estado === 'abierta' ? 'Postulaciones abiertas' : feria.estado === 'proxima' ? 'Próxima' : 'Cerrada'}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-feria-600">
            <span className="inline-flex items-center gap-2"><MapPin size={16} weight="bold" />{feria.lugar}, {feria.ciudad}</span>
            <span className="inline-flex items-center gap-2"><CalendarBlank size={16} weight="bold" />{fmtFecha(feria.fecha)}</span>
            <span className="inline-flex items-center gap-2"><Users size={16} weight="bold" />{feria.cupos - feria.postulados} cupos disponibles</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(feria.rubros || []).map(r => <span key={r} className="chip">{r}</span>)}
          </div>
          <p className="mt-4 text-feria-700">{feria.requisitos || 'Sin requisitos específicos publicados.'}</p>
        </div>
      </div>

      {/* acción principal: postular */}
      <div className="mt-6 card p-6">
        <h2 className="font-display text-lg font-bold text-feria-800">¿Quieres participar?</h2>

        {exito ? (
          <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-700 flex items-center gap-2">
            <Check size={20} weight="bold" /> {exito}
          </div>
        ) : perfilOk ? (
          <div className="mt-4">
            <div className="rounded-lg bg-feria-50 border border-feria-200 px-4 py-3 text-sm text-feria-700">
              <span className="inline-flex items-center gap-2"><Check size={18} weight="bold" className="text-emerald-600" />
                Tu perfil cumple los requisitos. Postulas con un solo clic.
              </span>
            </div>
            <button onClick={() => setConfirmando(true)} disabled={enviando} className="mt-4 btn-accent w-full text-base">
              {enviando ? 'Enviando…' : 'Postular a esta feria'}
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
              <Warning size={20} weight="bold" /> Te falta completar tu perfil para postular a esta feria.
            </div>
            <button onClick={() => { onPostulada() }} className="mt-4 btn-primary w-full">Completar mi perfil</button>
          </div>
        )}

        {/* confirmación */}
        {confirmando && !exito && perfilOk && (
          <div className="mt-4 rounded-lg border border-feria-200 bg-white p-5">
            <p className="font-semibold text-feria-800">Postulación a {feria.nombre}</p>
            <div className="mt-3 space-y-1.5 text-sm text-feria-700">
              <div>✓ Información comercial: <span className="font-medium">{perfil?.rubro || '—'}</span></div>
              <div>✓ Categorías: {(perfil?.categorias || []).join(', ') || '—'}</div>
              <div>✓ Comuna: {perfil?.ciudad || '—'}</div>
            </div>
            <p className="mt-3 text-sm text-feria-500">¿Enviar postulación?</p>
            <div className="mt-3 flex gap-2">
              <button onClick={postular} disabled={enviando} className="btn-accent flex-1">{enviando ? 'Enviando…' : 'Confirmar postulación'}</button>
              <button onClick={() => setConfirmando(false)} className="btn-ghost">Cancelar</button>
            </div>
            {error && <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">{error}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
