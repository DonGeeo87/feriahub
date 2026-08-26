import { useEffect, useState } from 'react'
import { ClipboardText, Check, MapPin, Plus, ArrowRight, SquaresFour, CalendarDots } from '@phosphor-icons/react'
import { api, type Feria, type PostulacionPanel } from '../../lib/api'
import { fmtFecha } from '../../lib/format'
import type { OrganizadorTab } from '../../components/AppShell'
import CalendarioFerias from '../expositor/CalendarioFerias'

export default function DashboardOrganizador({ onTab }: { onTab: (t: OrganizadorTab) => void }) {
  const [ferias, setFerias] = useState<Feria[]>([])
  const [postulaciones, setPostulaciones] = useState<PostulacionPanel[]>([])
  const [loaded, setLoaded] = useState(false)
  const [vista, setVista] = useState<'grid' | 'calendario'>('grid')

  useEffect(() => {
    Promise.all([
      api.get<Feria[]>('/ferias'),
      api.get<PostulacionPanel[]>('/postulaciones/panel'),
    ]).then(([f, p]) => { setFerias(f); setPostulaciones(p); setLoaded(true) })
  }, [])

  const abiertas = ferias.filter(f => f.estado === 'abierta')
  const aceptadas = postulaciones.filter(p => p.estado === 'aceptada').length

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-feria-800">¿Qué está pasando con tus eventos?</h1>
          <p className="text-feria-600 mt-1">Resumen de tu actividad.</p>
        </div>
        <button className="btn-accent"><Plus size={18} weight="bold" /> Nueva feria</button>
      </div>

      {/* stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Ferias activas" valor={abiertas.length} />
        <StatCard label="Postulaciones" valor={postulaciones.length} />
        <StatCard label="Aceptadas" valor={aceptadas} />
        <StatCard label="Pendientes de revisión" valor={postulaciones.filter(p => ['recibida', 'en_revision', 'en_espera'].includes(p.estado)).length} />
      </div>

      {/* mis eventos */}
      <div className="flex items-center justify-between flex-wrap gap-3 mt-8">
        <h2 className="font-display text-lg font-bold text-feria-800">Mis eventos</h2>
        {/* toggle tarjetas / calendario */}
        <div className="flex rounded-lg border border-feria-200 overflow-hidden">
          <button onClick={() => setVista('grid')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium ${vista === 'grid' ? 'bg-feria-600 text-white' : 'text-feria-600 hover:bg-feria-50'}`}>
            <SquaresFour size={16} /> Tarjetas
          </button>
          <button onClick={() => setVista('calendario')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium ${vista === 'calendario' ? 'bg-feria-600 text-white' : 'text-feria-600 hover:bg-feria-50'}`}>
            <CalendarDots size={16} /> Calendario
          </button>
        </div>
      </div>

      {vista === 'calendario' ? (
        <div className="mt-3">
          <CalendarioFerias ferias={ferias} onVerFeria={() => onTab('postulaciones')} />
        </div>
      ) : (
      <div className="mt-3 space-y-3">
        {!loaded && <p className="text-feria-500">Cargando…</p>}
        {loaded && ferias.length === 0 && <p className="text-feria-500">Aún no creas ferias.</p>}
        {ferias.map(f => (
          <div key={f.id} className="card p-5 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-feria-800">{f.nombre}</div>
              <div className="text-sm text-feria-500 flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1"><MapPin size={13} />{f.ciudad}</span>
                <span className="inline-flex items-center gap-1">{fmtFecha(f.fecha)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`badge-status ${f.estado === 'abierta' ? 'bg-feria-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {f.estado === 'abierta' ? 'Convocatoria abierta' : f.estado === 'proxima' ? 'Próxima' : 'Finalizada'}
              </span>
              <button onClick={() => onTab('postulaciones')} className="btn-ghost">
                Ver postulaciones <ArrowRight size={16} weight="bold" />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  )
}

function StatCard({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="card p-4">
      <div className="font-display text-3xl font-extrabold text-feria-800">{valor}</div>
      <div className="text-xs text-feria-500 mt-1">{label}</div>
    </div>
  )
}
