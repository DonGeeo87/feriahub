const BASE = '/api'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function getToken(): string | null {
  return localStorage.getItem('feriahub_token')
}

async function request<T>(method: string, path: string, body?: unknown, auth = true): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    let msg = 'Error de servidor'
    try {
      const data = await res.json()
      if (data?.error) msg = data.error
    } catch { /* ignore */ }
    throw new ApiError(res.status, msg)
  }
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(p: string, auth = true) => request<T>('GET', p, undefined, auth),
  post: <T>(p: string, b?: unknown, auth = true) => request<T>('POST', p, b, auth),
  put: <T>(p: string, b?: unknown, auth = true) => request<T>('PUT', p, b, auth),
  patch: <T>(p: string, b?: unknown, auth = true) => request<T>('PATCH', p, b, auth),
}

export type Rol = 'expositor' | 'organizador'
export type User = { id: number; email: string; rol: Rol; nombre: string }
export type Perfil = {
  id: number; usuario_id: number; rubro: string; ciudad: string
  descripcion: string; foto: string; categorias: string[]; pct_perfil: number
}
export type Feria = {
  id: number; nombre: string; ciudad: string; fecha: string; lugar: string
  rubros: string[]; estado: 'abierta' | 'cerrada' | 'proxima'; cupos: number
  postulados: number; organizador: string; requisitos: string
}
export type Postulacion = {
  id: number; feria_id: number; estado: string; snapshot: Record<string, unknown>
  feria_nombre: string; feria_ciudad: string; feria_fecha: string; creado_at: string
}
export type Participacion = {
  id: number; feria_id: number; feria_nombre: string; feria_ciudad: string
  feria_fecha: string; asistio: number
}
export type PostulacionPanel = {
  id: number; estado: string; feria_id: number; feria_nombre: string
  expositor_nombre: string; expositor_rubro: string; expositor_ciudad: string
  snapshot: Record<string, unknown>
}
