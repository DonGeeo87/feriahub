import { createContext, useContext, useState, ReactNode } from 'react'
import { api, ApiError, type User } from '../lib/api'

type AuthCtx = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (data: { email: string; password: string; nombre: string; rol: 'expositor' | 'organizador' }) => Promise<User>
  logout: () => void
  setUser: (u: User | null) => void
}

const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('feriahub_user')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const guardar = (token: string, u: User) => {
    localStorage.setItem('feriahub_token', token)
    localStorage.setItem('feriahub_user', JSON.stringify(u))
    setUser(u)
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const r = await api.post<{ token: string; user: User }>('/auth/login', { email, password }, false)
      guardar(r.token, r.user)
      return r.user
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: { email: string; password: string; nombre: string; rol: 'expositor' | 'organizador' }) => {
    setLoading(true)
    try {
      const r = await api.post<{ token: string; user: User }>('/auth/register', data, false)
      guardar(r.token, r.user)
      return r.user
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('feriahub_token')
    localStorage.removeItem('feriahub_user')
    setUser(null)
  }

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
