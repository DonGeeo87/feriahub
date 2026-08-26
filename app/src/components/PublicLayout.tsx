import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Storefront } from '@phosphor-icons/react'

export default function PublicLayout() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-feria-800/90 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-feria-accent text-white flex items-center justify-center">
              <Storefront size={18} weight="bold" />
            </span>
            <span className="font-display font-bold text-lg text-white">FeriaHub</span>
          </button>

          <nav className="flex items-center gap-2">
            <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors">
              Ingresar
            </Link>
            <Link to="/register" className="rounded-lg bg-feria-accent px-4 py-2 text-sm font-semibold text-white hover:bg-feria-accent/90 transition-colors">
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-feria-900 text-white/60">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/80">F</span>
            <span className="text-sm">FeriaHub — Postula a ferias con un perfil, una vez.</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-4 h-4 rounded bg-white/10 flex items-center justify-center text-[9px] font-bold text-white/70">CG</span>
            <span>Hecho por <span className="text-white/80 font-medium">Código Guerrero Dev</span> · Chile</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
