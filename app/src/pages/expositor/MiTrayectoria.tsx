import { useEffect, useState } from 'react'
import { Check, MapPin, CalendarBlank } from '@phosphor-icons/react'
import { api, type Participacion } from '../../lib/api'
import { fmtFecha } from '../../lib/format'
import { useAuth } from '../../lib/auth'

export default function MiTrayectoria() {
  const { user } = useAuth()
  const [participaciones, setParticipaciones] = useState<Participacion[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    api.get<Participacion[]>('/participaciones/mias').then(p => { setParticipaciones(p); setLoaded(true) })
  }, [])

  const feriasDistintas = new Set(participaciones.map(p => p.feria_id)).size

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-feria-800">Mi trayectoria</h1>

      {/* credencial */}
      <div className="mt-6 card p-6">
        <div className="flex items-center gap-4">
          <span className="w-14 h-14 rounded-xl bg-feria-600 text-white flex items-center justify-center font-display font-bold text-xl shrink-0">
            {user?.nombre?.[0] || 'E'}
          </span>
          <div>
            <div className="font-display text-lg font-bold text-feria-800">{user?.nombre}</div>
            <div className="text-sm text-feria-500">Expositor</div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <StatCard valor={participaciones.length} label="Participaciones" />
          <StatCard valor={feriasDistintas} label="Ferias distintas" />
          <StatCard valor={0} label="Certificados" />
        </div>
      </div>

      {/* timeline */}
      <h2 className="font-display text-lg font-bold text-feria-800 mt-8">Tu recorrido</h2>
      <div className="mt-4 space-y-3">
        {!loaded && <p className="text-feria-500">Cargando…</p>}
        {loaded && participaciones.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-feria-600 font-medium">Todavía no tienes participaciones</p>
            <p className="text-sm text-feria-500 mt-1">Tu primer certificado aparecerá después de una participación confirmada.</p>
          </div>
        )}
        {participaciones.map(p => (
          <div key={p.id} className="card p-4 flex items-center gap-4">
            <span className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Check size={20} weight="bold" />
            </span>
            <div className="flex-1">
              <div className="font-semibold text-feria-800">{p.feria_nombre}</div>
              <div className="text-sm text-feria-500 flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1"><MapPin size={13} />{p.feria_ciudad}</span>
                <span className="inline-flex items-center gap-1"><CalendarBlank size={13} />{fmtFecha(p.feria_fecha)}</span>
              </div>
            </div>
            <span className="text-xs text-emerald-600 font-medium shrink-0">Participación verificada</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ valor, label }: { valor: number; label: string }) {
  return (
    <div className="card p-4 text-center">
      <div className="font-display text-3xl font-extrabold text-feria-800">{valor}</div>
      <div className="text-xs text-feria-500 mt-1">{label}</div>
    </div>
  )
}
