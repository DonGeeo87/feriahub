export const fmtFecha = (iso: string) => {
  if (!iso) return ''
  const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''))
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
}

export const estadoMeta: Record<string, { label: string; cls: string }> = {
  aceptada: { label: 'Aceptada', cls: 'bg-emerald-100 text-emerald-700' },
  en_revision: { label: 'En revisión', cls: 'bg-amber-100 text-amber-700' },
  recibida: { label: 'Recibida', cls: 'bg-sky-100 text-sky-700' },
  rechazada: { label: 'Rechazada', cls: 'bg-rose-100 text-rose-700' },
  en_espera: { label: 'En espera', cls: 'bg-gray-100 text-gray-600' },
}
