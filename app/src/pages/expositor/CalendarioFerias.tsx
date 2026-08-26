import { useMemo, useState } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import type { Feria } from '../../lib/api'
import { fmtFecha } from '../../lib/format'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS_SEM = ['L','M','X','J','V','S','D']

export default function CalendarioFerias({ ferias, onVerFeria }: { ferias: Feria[]; onVerFeria: (id: number) => void }) {
  const hoy = new Date()

  // Inicializar en el mes de la próxima feria (si hay), para no abrir vacío
  const fechaInicial = useMemo(() => {
    if (ferias.length === 0) return hoy
    const conFecha = ferias.filter(f => f.fecha).sort((a, b) => a.fecha.localeCompare(b.fecha))
    if (conFecha.length === 0) return hoy
    const primera = new Date(conFecha[0].fecha + 'T12:00:00')
    return isNaN(primera.getTime()) ? hoy : primera
  }, []) // solo al montar

  const [mes, setMes] = useState(fechaInicial.getMonth())
  const [anio, setAnio] = useState(fechaInicial.getFullYear())

  // agrupar ferias por día del mes
  const feriasPorDia = useMemo(() => {
    const map: Record<string, Feria[]> = {}
    for (const f of ferias) {
      const d = new Date(f.fecha + 'T12:00:00')
      if (d.getFullYear() === anio && d.getMonth() === mes) {
        const key = d.getDate()
        if (!map[key]) map[key] = []
        map[key].push(f)
      }
    }
    return map
  }, [ferias, mes, anio])

  const cambiarMes = (delta: number) => {
    let m = mes + delta, a = anio
    if (m < 0) { m = 11; a-- }
    else if (m > 11) { m = 0; a++ }
    setMes(m); setAnio(a)
  }

  // construir la grilla del mes
  const primerDia = new Date(anio, mes, 1)
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()
  const offset = (primerDia.getDay() + 6) % 7 // Lunes = 0

  const celdas: (number | null)[] = Array(offset).fill(null)
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d)

  return (
    <div>
      {/* cabecera mes */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-feria-800">{MESES[mes]} {anio}</h2>
        <div className="flex gap-1">
          <button onClick={() => cambiarMes(-1)} className="btn-ghost"><CaretLeft size={18} /></button>
          <button onClick={() => { setMes(hoy.getMonth()); setAnio(hoy.getFullYear()) }} className="btn-ghost text-xs px-3">Hoy</button>
          <button onClick={() => cambiarMes(1)} className="btn-ghost"><CaretRight size={18} /></button>
        </div>
      </div>

      {/* grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {DIAS_SEM.map(d => <div key={d} className="text-center text-xs font-semibold text-feria-400 py-1">{d}</div>)}
        {celdas.map((d, i) => {
          if (d === null) return <div key={`e${i}`} className="min-h-16 rounded-lg border border-dashed border-feria-100" />
          const feriasDia = feriasPorDia[d] || []
          const esHoy = d === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear()
          return (
            <div key={d}
              className={`min-h-16 rounded-lg p-1 border ${esHoy ? 'border-feria-accent bg-feria-50' : 'border-feria-100'} ${feriasDia.length ? 'bg-feria-50/60' : ''}`}>
              <div className={`text-xs font-semibold ${esHoy ? 'text-feria-accent' : 'text-feria-500'}`}>{d}</div>
              {feriasDia.slice(0, 2).map(f => (
                <button key={f.id} onClick={() => onVerFeria(f.id)}
                  className="mt-0.5 w-full text-left text-[10px] leading-tight bg-feria-600 text-white rounded px-1 py-0.5 truncate hover:bg-feria-700">
                  {f.nombre}
                </button>
              ))}
              {feriasDia.length > 2 && <div className="text-[9px] text-feria-400 mt-0.5">+{feriasDia.length - 2} más</div>}
            </div>
          )
        })}
      </div>

      <div className="mt-4 text-sm text-feria-500">
        <span className="font-semibold text-feria-700">{ferias.length}</span> ferias en {MESES[mes]} {anio}
      </div>
    </div>
  )
}
