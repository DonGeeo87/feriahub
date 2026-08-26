import { useEffect, useState } from 'react'
import { Check, X, MapPin } from '@phosphor-icons/react'
import { api, ApiError, type PostulacionPanel } from '../../lib/api'
import { estadoMeta } from '../../lib/format'

type Filtro = 'todas' | string

export default function PanelPostulaciones() {
  const [posts, setPosts] = useState<PostulacionPanel[]>([])
  const [tab, setTab] = useState<Filtro>('todas')
  const [loaded, setLoaded] = useState(false)
  const [msg, setMsg] = useState<{ id: number; texto: string } | null>(null)

  const cargar = () => {
    api.get<PostulacionPanel[]>('/postulaciones/panel').then(p => { setPosts(p); setLoaded(true) })
  }

  useEffect(cargar, [])

  const filtrar = tab === 'todas' ? posts : posts.filter(p => p.estado === tab)

  const cambiar = async (id: number, estado: string) => {
    try {
      await api.patch(`/postulaciones/${id}/estado`, { estado })
      cargar()
      setMsg({ id, texto: estado === 'aceptada' ? 'Expositor aceptado' : 'Postulación rechazada' })
      setTimeout(() => setMsg(null), 2500)
    } catch (e) {
      setMsg({ id, texto: e instanceof ApiError ? e.message : 'Error' })
    }
  }

  const tabs = [
    { id: 'todas', label: 'Todas' },
    { id: 'recibida', label: 'Recibidas' },
    { id: 'en_revision', label: 'En revisión' },
    { id: 'aceptada', label: 'Aceptadas' },
    { id: 'rechazada', label: 'Rechazadas' },
    { id: 'en_espera', label: 'En espera' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-feria-800">Postulaciones</h1>
      <p className="text-feria-600 mt-1">Revisa y decide sobre tus candidatos.</p>

      {/* tabs */}
      <div className="mt-5 flex flex-wrap gap-1.5">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${tab === t.id ? 'bg-feria-600 text-white' : 'text-feria-700 hover:bg-feria-100'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* grid de tarjetas compactas */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {!loaded && <p className="text-feria-500 col-span-full">Cargando…</p>}
        {loaded && filtrar.length === 0 && (
          <p className="text-feria-500 py-8 text-center col-span-full">Sin postulaciones en esta vista.</p>
        )}
        {filtrar.map(p => {
          const meta = estadoMeta[p.estado] ?? estadoMeta.recibida
          return (
            <div key={p.id} className="card p-4 flex flex-col">
              {/* encabezado */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-feria-800 truncate">{p.expositor_nombre}</div>
                  <div className="text-xs text-feria-500 mt-0.5 truncate">{p.expositor_rubro}</div>
                </div>
                <span className={`badge-status shrink-0 ${meta.cls}`}>{meta.label}</span>
              </div>

              {/* feria + ciudad */}
              <div className="mt-2 text-xs text-feria-600 flex items-center gap-1 truncate">
                <MapPin size={12} className="shrink-0" />
                <span className="truncate">{p.feria_nombre}</span>
              </div>

              {/* descripción del perfil */}
              {p.snapshot && (p.snapshot as any).descripcion && (
                <p className="mt-2 text-xs text-feria-600 line-clamp-2 flex-1">{(p.snapshot as any).descripcion}</p>
              )}

              {/* feedback */}
              {msg?.id === p.id && (
                <div className="mt-2 rounded-lg bg-feria-50 px-3 py-1.5 text-xs text-feria-600">{msg.texto}</div>
              )}

              {/* acciones */}
              <div className="mt-3 flex gap-2">
                {p.estado !== 'aceptada' && (
                  <button onClick={() => cambiar(p.id, 'aceptada')} className="btn-primary flex-1 text-xs py-2">
                    <Check size={14} weight="bold" /> Aceptar
                  </button>
                )}
                {p.estado !== 'rechazada' && (
                  <button onClick={() => cambiar(p.id, 'rechazada')} className="btn-ghost flex-1 text-xs py-2 text-rose-600">
                    <X size={14} weight="bold" /> Rechazar
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
