import { useEffect, useMemo, useState } from 'react'
import { MagnifyingGlass, MapPin, CalendarBlank, ArrowRight } from '@phosphor-icons/react'
import { api, type Feria } from '../../lib/api'
import { fmtFecha } from '../../lib/format'

export default function ExplorarFerias({ onVerFeria }: { onVerFeria: (id: number) => void }) {
  const [ferias, setFerias] = useState<Feria[]>([])
  const [query, setQuery] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [rubro, setRubro] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    api.get<Feria[]>('/ferias').then(f => { setFerias(f); setLoaded(true) })
  }, [])

  const ciudades = useMemo(() => [...new Set(ferias.map(f => f.ciudad).filter(Boolean))].sort(), [ferias])
  const rubros = useMemo(() => [...new Set(ferias.flatMap(f => f.rubros || []))].sort(), [ferias])

  const filtradas = ferias.filter(f => {
    if (ciudad && f.ciudad !== ciudad) return false
    if (rubro && !(f.rubros || []).includes(rubro)) return false
    if (query) {
      const q = query.toLowerCase()
      const ok = f.nombre.toLowerCase().includes(q) || (f.rubros || []).some(r => r.toLowerCase().includes(q))
      if (!ok) return false
    }
    return true
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-feria-800">Explorar ferias</h1>
      <p className="text-feria-600 mt-1">Encuentra las ferias donde puedes participar.</p>

      {/* búsqueda */}
      <div className="mt-5 flex items-center gap-2 card px-4 py-3">
        <MagnifyingGlass size={20} className="text-feria-400" weight="bold" />
        <input className="flex-1 bg-transparent border-none focus:outline-none text-feria-800 placeholder:text-feria-400"
          placeholder="Buscar por nombre o categoría…" value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      {/* filtros */}
      <div className="mt-4 flex flex-wrap gap-2">
        <select className="input w-auto" value={ciudad} onChange={e => setCiudad(e.target.value)}>
          <option value="">Todas las comunas</option>
          {ciudades.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input w-auto" value={rubro} onChange={e => setRubro(e.target.value)}>
          <option value="">Todas las categorías</option>
          {rubros.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* grid */}
      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {!loaded && <p className="text-feria-500 col-span-full">Cargando ferias…</p>}
        {loaded && filtradas.length === 0 && (
          <p className="text-feria-500 col-span-full">No encontramos ferias con esos filtros. Prueba con otros.</p>
        )}
        {filtradas.map(f => (
          <FeriaCard key={f.id} f={f} onVer={() => onVerFeria(f.id)} />
        ))}
      </div>
    </div>
  )
}

function FeriaCard({ f, onVer }: { f: Feria; onVer: () => void }) {
  const cuposLibres = Math.max(f.cupos - f.postulados, 0)
  return (
    <div className="card p-5 hover:shadow-lift transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-feria-800">{f.nombre}</h3>
        <span className={`badge-status ${f.estado === 'abierta' ? 'bg-feria-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
          {f.estado === 'abierta' ? 'Abierta' : f.estado === 'proxima' ? 'Próxima' : 'Cerrada'}
        </span>
      </div>
      <div className="mt-2 text-sm text-feria-500 flex items-center gap-3">
        <span className="inline-flex items-center gap-1"><MapPin size={14} />{f.ciudad}</span>
        <span className="inline-flex items-center gap-1"><CalendarBlank size={14} />{fmtFecha(f.fecha)}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {(f.rubros || []).slice(0, 3).map(r => <span key={r} className="chip">{r}</span>)}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-feria-500"><span className="font-semibold text-feria-700">{cuposLibres}</span> cupos libres</span>
        <button onClick={onVer} className="btn-primary">Ver feria <ArrowRight size={16} weight="bold" /></button>
      </div>
    </div>
  )
}
