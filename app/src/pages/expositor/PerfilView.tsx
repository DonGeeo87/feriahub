import { useEffect, useState } from 'react'
import { Check, Warning } from '@phosphor-icons/react'
import { api, type Perfil } from '../../lib/api'
import { ApiError } from '../../lib/api'

const CATEGORIAS = ['Artesanía', 'Cerámica', 'Textil', 'Gastronomía', 'Diseño', 'Moda', 'Bebidas', 'Dulces', 'Decoración', 'Agro', 'Navidad']

export default function PerfilView() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [rubro, setRubro] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [foto, setFoto] = useState('')
  const [categorias, setCategorias] = useState<string[]>([])
  const [guardando, setGuardando] = useState(false)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  useEffect(() => {
    api.get<Perfil>('/perfiles/mio').then(p => {
      setPerfil(p)
      setRubro(p.rubro); setCiudad(p.ciudad); setDescripcion(p.descripcion); setFoto(p.foto)
      setCategorias(p.categorias || [])
    }).catch(() => setMsg({ tipo: 'error', texto: 'No se pudo cargar tu perfil.' }))
  }, [])

  const toggleCategoria = (c: string) => {
    setCategorias(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  const guardar = async () => {
    setGuardando(true); setMsg(null)
    try {
      const p = await api.put<Perfil>('/perfiles/mio', { rubro, ciudad, descripcion, foto, categorias })
      setPerfil(p)
      setMsg({ tipo: 'ok', texto: `Perfil guardado. Completitud: ${p.pct_perfil}%.` })
    } catch (e) {
      setMsg({ tipo: 'error', texto: e instanceof ApiError ? e.message : 'Error al guardar' })
    } finally {
      setGuardando(false)
    }
  }

  const pctEstimado = calcularPct(rubro, ciudad, foto, descripcion, categorias)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-feria-800">Mi perfil</h1>
      <p className="text-feria-600 mt-1">Esta información se reutiliza en todas tus postulaciones.</p>

      {/* progreso */}
      <div className="mt-5 card p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-feria-700">Completitud del perfil</span>
          <span className="text-sm font-bold text-feria-800">{pctEstimado}%</span>
        </div>
        <div className="mt-2 h-2.5 bg-feria-100 rounded-full overflow-hidden">
          <div className="h-full bg-feria-600 transition-all" style={{ width: `${pctEstimado}%` }} />
        </div>
        {pctEstimado >= 60 ? (
          <p className="mt-2 text-sm text-emerald-600 flex items-center gap-1.5"><Check size={16} weight="bold" /> Listo para postular a todas las ferias.</p>
        ) : (
          <p className="mt-2 text-sm text-amber-600 flex items-center gap-1.5"><Warning size={16} weight="bold" /> Completa al menos 60% para postular.</p>
        )}
      </div>

      {/* formulario */}
      <div className="mt-5 card p-6 space-y-4">
        <div>
          <label className="label">Rubro principal</label>
          <input className="input" value={rubro} onChange={e => setRubro(e.target.value)} placeholder="Cerámica artesanal" />
        </div>
        <div>
          <label className="label">Comuna</label>
          <input className="input" value={ciudad} onChange={e => setCiudad(e.target.value)} placeholder="Valparaíso" />
        </div>
        <div>
          <label className="label">URL de foto de perfil</label>
          <input className="input" value={foto} onChange={e => setFoto(e.target.value)} placeholder="https://…" />
        </div>
        <div>
          <label className="label">Sobre tu emprendimiento</label>
          <textarea className="input min-h-[90px]" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Cuéntanos qué haces…" />
        </div>
        <div>
          <label className="label">Categorías (elige las que aplican)</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS.map(c => (
              <button key={c} type="button" onClick={() => toggleCategoria(c)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${categorias.includes(c) ? 'bg-feria-600 text-white' : 'bg-feria-100 text-feria-700 hover:bg-feria-200'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {msg && (
          <div className={`rounded-lg px-3 py-2 text-sm ${msg.tipo === 'ok' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {msg.texto}
          </div>
        )}

        <button onClick={guardar} disabled={guardando} className="btn-primary w-full">
          {guardando ? 'Guardando…' : 'Guardar perfil'}
        </button>
      </div>
    </div>
  )
}

function calcularPct(rubro: string, ciudad: string, foto: string, descripcion: string, categorias: string[]) {
  let pts = 0
  if (rubro) pts += 25
  if (ciudad) pts += 25
  if (foto) pts += 25
  if (descripcion) pts += 15
  if (categorias.length) pts += 10
  return pts
}
