import { useEffect, useState } from 'react'
import { MagnifyingGlass, ClipboardText, Trophy, ArrowRight, MapPin, CalendarBlank } from '@phosphor-icons/react'
import { api, type Feria, type Postulacion, type Participacion, type Perfil } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { fmtFecha, estadoMeta } from '../../lib/format'
import type { ExpositorTab } from '../../components/AppShell'

export default function ExpositorHome({ onTab }: { onTab: (t: ExpositorTab) => void }) {
  const { user } = useAuth()
  const [ferias, setFerias] = useState<Feria[]>([])
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([])
  const [participaciones, setParticipaciones] = useState<Participacion[]>([])
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get<Feria[]>('/ferias'),
      api.get<Postulacion[]>('/postulaciones/mias'),
      api.get<Participacion[]>('/participaciones/mias'),
      api.get<Perfil>('/perfiles/mio').catch(() => null),
    ]).then(([f, p, part, per]) => {
      setFerias(f); setPostulaciones(p); setParticipaciones(part); setPerfil(per); setLoaded(true)
    })
  }, [])

  const abiertas = ferias.filter(f => f.estado === 'abierta').slice(0, 3)
  const perfilCompleto = (perfil?.pct_perfil ?? 0) >= 60

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hola + acción principal */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-feria-800">
            Hola, {user?.nombre?.split(' ')[0] || 'expositor'} 👋
          </h1>
          <p className="text-feria-600 mt-1">
            {loaded ? `Encontramos ${ferias.length} ferias. ${abiertas.length} con postulaciones abiertas.` : 'Cargando…'}
          </p>
        </div>
        <button onClick={() => onTab('explorar')} className="btn-accent">
          <MagnifyingGlass size={18} weight="bold" /> Encontrar una feria
        </button>
      </div>

      {/* 3 acciones grandes */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ActionCard icon={<MagnifyingGlass size={24} weight="duotone" />} title="Encontrar una feria" onClick={() => onTab('explorar')} />
        <ActionCard icon={<ClipboardText size={24} weight="duotone" />} title="Ver mis postulaciones" onClick={() => onTab('postulaciones')} />
        <ActionCard icon={<Trophy size={24} weight="duotone" />} title="Ver mi trayectoria" onClick={() => onTab('trayectoria')} />
      </div>

      {/* próximas oportunidades */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-feria-800">Postulaciones abiertas</h2>
          <button onClick={() => onTab('explorar')} className="text-sm font-semibold text-feria-600 hover:text-feria-800 inline-flex items-center gap-1">
            Ver todas <ArrowRight size={16} weight="bold" />
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {ferias.length === 0 && <p className="text-feria-500 text-sm col-span-full">Cargando ferias…</p>}
          {abiertas.map(f => (
            <FeriaCard key={f.id} f={f} onPick={() => onTab('explorar')} />
          ))}
        </div>
      </section>

      {/* recomendaciones si perfil incompleto */}
      {!perfilCompleto && (
        <div className="mt-8 card border-t-4 border-t-feria-accent p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-semibold text-feria-800">Completa tu perfil</p>
            <p className="text-sm text-feria-600 mt-0.5">Te falta {60 - (perfil?.pct_perfil ?? 0)}% para postular a todas las ferias.</p>
          </div>
          <button onClick={() => onTab('perfil')} className="btn-primary">Completar perfil</button>
        </div>
      )}

      {/* tus postulaciones */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-feria-800">Tus postulaciones</h2>
        <div className="mt-3 card divide-y divide-feria-100">
          {postulaciones.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-feria-600">Aún no tienes postulaciones.</p>
              <button onClick={() => onTab('explorar')} className="mt-3 btn-accent">Encuentra tu primera feria</button>
            </div>
          )}
          {postulaciones.slice(0, 3).map(p => {
            const meta = estadoMeta[p.estado] ?? estadoMeta.recibida
            return (
              <div key={p.id} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-feria-800">{p.feria_nombre}</div>
                  <div className="text-sm text-feria-500">{fmtFecha(p.feria_fecha)}</div>
                </div>
                <span className={`badge-status ${meta.cls}`}>{meta.label}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* tu trayectoria */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-feria-800">Tu trayectoria</h2>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <StatCard label="Participaciones" valor={participaciones.length} />
          <StatCard label="Ferias distintas" valor={new Set(participaciones.map(p => p.feria_id)).size} />
          <StatCard label="Certificados" valor={0} />
        </div>
      </section>
    </div>
  )
}

function ActionCard({ icon, title, onClick }: { icon: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="card p-5 text-left hover:shadow-lift hover:border-feria-300 transition-all">
      <span className="w-12 h-12 rounded-xl bg-feria-100 text-feria-600 flex items-center justify-center">{icon}</span>
      <div className="mt-3 font-semibold text-feria-800">{title}</div>
      <div className="text-xs text-feria-500 mt-0.5 inline-flex items-center gap-1">Abrir <ArrowRight size={14} /></div>
    </button>
  )
}

function FeriaCard({ f, onPick }: { f: Feria; onPick: () => void }) {
  return (
    <div className="card p-5 hover:shadow-lift transition-shadow cursor-pointer" onClick={onPick}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-feria-800">{f.nombre}</h3>
        <span className="badge-status bg-feria-600 text-white">{f.estado === 'abierta' ? 'Abierta' : 'Cerrada'}</span>
      </div>
      <div className="mt-2 text-sm text-feria-500 flex items-center gap-3">
        <span className="inline-flex items-center gap-1"><MapPin size={14} />{f.ciudad}</span>
        <span className="inline-flex items-center gap-1"><CalendarBlank size={14} />{fmtFecha(f.fecha)}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {f.rubros?.slice(0, 3).map((r: string) => <span key={r} className="chip">{r}</span>)}
      </div>
      <div className="mt-3 text-sm text-feria-500"><span className="font-semibold text-feria-700">{f.cupos - f.postulados}</span> cupos disponibles</div>
    </div>
  )
}

function StatCard({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="card p-4 text-center">
      <div className="font-display text-3xl font-extrabold text-feria-800">{valor}</div>
      <div className="text-xs text-feria-500 mt-1">{label}</div>
    </div>
  )
}