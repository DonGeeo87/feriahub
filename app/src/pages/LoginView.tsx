import { useState } from 'react'
import { Storefront, MapPin, SignIn, ArrowRight } from '@phosphor-icons/react'
import { useAuth } from '../lib/auth'
import { ApiError } from '../lib/api'
import type { Rol } from '../lib/api'

export default function LoginView({ onSwitch, demoError }: { onSwitch: (m: 'login' | 'register') => void; demoError?: string }) {
  const { login, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al iniciar sesión')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="card p-6">
        <h1 className="font-display text-2xl font-bold text-feria-800">Ingresa a FeriaHub</h1>
        <p className="mt-1 text-sm text-feria-600">Accede para encontrar tu próxima feria.</p>

        {error && <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">{error}</div>}
        {demoError && !error && <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-700">{demoError}</div>}

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.cl" required />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Ingresando…' : (<><SignIn size={18} weight="bold" /> Ingresar</>)}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-feria-600">
          ¿No tienes cuenta?{' '}
          <button onClick={() => onSwitch('register')} className="font-semibold text-feria-700 hover:underline">
            Crea una gratis
          </button>
        </p>
      </div>
    </div>
  )
}

export function RegisterView({ onSwitch, initialRol }: { onSwitch: (m: 'login' | 'register') => void; initialRol?: Rol }) {
  const { register, loading } = useAuth()
  const [rol, setRol] = useState<Rol | null>(initialRol || null)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rol) return
    setError('')
    try {
      await register({ email, password, nombre, rol })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al registrarse')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="card p-6">
        <h1 className="font-display text-2xl font-bold text-feria-800">Crea tu cuenta</h1>

        {/* paso 1: ¿qué eres? */}
        {!rol && (
          <div className="mt-5">
            <p className="text-sm text-feria-600 mb-4">Primero, cuéntanos en qué lado estás.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setRol('expositor')} className="card p-5 text-center hover:border-feria-500 hover:shadow-lift transition-all">
                <Storefront size={28} weight="duotone" className="mx-auto text-feria-600" />
                <div className="mt-2 font-semibold text-feria-800">Soy expositor</div>
                <div className="text-xs text-feria-500 mt-1">Busco ferias y postulo</div>
              </button>
              <button onClick={() => setRol('organizador')} className="card p-5 text-center hover:border-feria-accent hover:shadow-lift transition-all">
                <MapPin size={28} weight="duotone" className="mx-auto text-feria-accent" />
                <div className="mt-2 font-semibold text-feria-800">Soy organizador</div>
                <div className="text-xs text-feria-500 mt-1">Publico ferias y selecciono</div>
              </button>
            </div>
          </div>
        )}

        {/* paso 2: datos mínimos */}
        {rol && (
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="chip">{rol === 'expositor' ? 'Expositor' : 'Organizador'}</span>
              <button type="button" onClick={() => setRol(null)} className="text-xs text-feria-500 hover:underline">Cambiar</button>
            </div>
            <div>
              <label className="label">{rol === 'expositor' ? 'Nombre o emprendimiento' : 'Nombre o entidad'}</label>
              <input className="input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="María Artesanía" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@ejemplo.cl" required />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" minLength={6} required />
            </div>
            {error && <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">{error}</div>}
            <button type="submit" disabled={loading} className="btn-accent w-full">
              {loading ? 'Creando…' : (<><ArrowRight size={18} weight="bold" /> Crear cuenta</>)}
            </button>
          </form>
        )}

        <p className="mt-5 text-sm text-center text-feria-600">
          ¿Ya tienes cuenta?{' '}
          <button onClick={() => onSwitch('login')} className="font-semibold text-feria-700 hover:underline">Ingresa</button>
        </p>
      </div>
    </div>
  )
}
