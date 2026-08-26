import { useEffect, useState } from 'react'
import { Check, X } from '@phosphor-icons/react'
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
    <div className="max-w-5xl mx-auto px-4 py-8">
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

      {/* lista */}
      <div className="mt-4 space-y-3">
        {!loaded && <p className="text-feria-500">Cargando…</p>}
        {loaded && filtrar.length === 0 && (
          <p className="text-feria-500 py-8 text-center">Sin postulaciones en esta vista.</p>
        )}
        {filtrar.map(p => {
          const meta = estadoMeta[p.estado] ?? estadoMeta.recibida
          return (
            <div key={p.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-feria-800">{p.expositor_nombre}</div>
                  <div className="text-sm text-feria-500 mt-0.5">{p.expositor_rubro} · {p.expositor_ciudad}</div>
                  <div className="text-sm text-feria-600 mt-1">{p.feria_nombre}</div>
                </div>
                <span className={`badge-status ${meta.cls}`}>{meta.label}</span>
              </div>

              {/* snapshot del perfil */}
              {p.snapshot && (p.snapshot as any).descripcion && (
                <p className="mt-3 text-sm text-feria-600 border-t border-feria-100 pt-3">{(p.snapshot as any).descripcion}</p>
              )}

              {msg?.id === p.id && (
                <div className="mt-2 rounded-lg bg-feria-50 px-3 py-1.5 text-xs text-feria-600">{msg.texto}</div>
              )}

              <div className="mt-3 flex gap-2">
                {p.estado !== 'aceptada' && (
                  <button onClick={() => cambiar(p.id, 'aceptada')} className="btn-primary flex-1">
                    <Check size={16} weight="bold" /> Aceptar
                  </button>
                )}
                {p.estado !== 'rechazada' && (
                  <button onClick={() => cambiar(p.id, 'rechazada')} className="btn-ghost flex-1 text-rose-600">
                    <X size={16} weight="bold" /> Rechazar
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
