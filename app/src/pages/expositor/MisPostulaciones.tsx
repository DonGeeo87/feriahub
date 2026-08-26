import { useEffect, useState } from 'react'
import { MapPin, CalendarBlank, Check } from '@phosphor-icons/react'
import { api, type Postulacion } from '../../lib/api'
import { fmtFecha, estadoMeta } from '../../lib/format'

export default function MisPostulaciones() {
  const [posts, setPosts] = useState<Postulacion[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    api.get<Postulacion[]>('/postulaciones/mias').then(p => { setPosts(p); setLoaded(true) })
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-feria-800">Mis postulaciones</h1>
      <p className="text-feria-600 mt-1">Estamos esperando la decisión del organizador.</p>

      <div className="mt-6 space-y-4">
        {!loaded && <p className="text-feria-500">Cargando…</p>}
        {loaded && posts.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-feria-600 font-medium">Aún no tienes postulaciones</p>
            <p className="text-sm text-feria-500 mt-1">Encuentra una feria y haz tu primera postulación.</p>
          </div>
        )}
        {posts.map(p => {
          const meta = estadoMeta[p.estado] ?? estadoMeta.recibida
          return (
            <div key={p.id} className="card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-feria-800 text-lg">{p.feria_nombre}</div>
                  <div className="text-sm text-feria-500 flex items-center gap-3 mt-1">
                    <span className="inline-flex items-center gap-1"><MapPin size={14} />{p.feria_ciudad}</span>
                    <span className="inline-flex items-center gap-1"><CalendarBlank size={14} />{fmtFecha(p.feria_fecha)}</span>
                  </div>
                </div>
                <span className={`badge-status ${meta.cls}`}>{meta.label}</span>
              </div>

              {/* línea temporal de estados */}
              <div className="mt-4 flex items-center gap-1 text-xs">
                <TimelineStep done estado="Postulada" />
                <TimelineStep done={['en_revision', 'aceptada', 'rechazada', 'en_espera'].includes(p.estado)} estado="En revisión" />
                <TimelineStep done={p.estado === 'aceptada'} estado={p.estado === 'rechazada' ? 'Decisión' : 'Decisión'} />
                <TimelineStep done={p.estado === 'aceptada'} estado="Participación" />
              </div>

              {p.estado === 'aceptada' && (
                <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm text-emerald-700 flex items-center gap-2">
                  <Check size={18} weight="bold" /> ¡Fuiste seleccionado! Próximo paso: confirmar participación.
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TimelineStep({ done, estado }: { done: boolean; estado: string }) {
  return (
    <div className="flex items-center gap-1 flex-1">
      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${done ? 'bg-feria-600 text-white' : 'bg-feria-100 text-feria-400'}`}>
        {done ? '✓' : '•'}
      </span>
      <span className={`text-[10px] ${done ? 'text-feria-700 font-medium' : 'text-feria-400'}`}>{estado}</span>
      <span className="flex-1 h-px bg-feria-100 ml-1" />
    </div>
  )
}
