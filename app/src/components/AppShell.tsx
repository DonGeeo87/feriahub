import { ReactNode } from 'react'
import { Storefront, SignOut, House, MagnifyingGlass, ClipboardText, Trophy, User } from '@phosphor-icons/react'
import { useAuth } from '../lib/auth'

export type ExpositorTab = 'home' | 'explorar' | 'postulaciones' | 'trayectoria' | 'perfil'
export type OrganizadorTab = 'dashboard' | 'postulaciones'

const NAV_EXPO: { id: ExpositorTab; label: string; icon: ReactNode }[] = [
  { id: 'home', label: 'Inicio', icon: <House size={18} weight="bold" /> },
  { id: 'explorar', label: 'Explorar', icon: <MagnifyingGlass size={18} weight="bold" /> },
  { id: 'postulaciones', label: 'Postulaciones', icon: <ClipboardText size={18} weight="bold" /> },
  { id: 'trayectoria', label: 'Trayectoria', icon: <Trophy size={18} weight="bold" /> },
  { id: 'perfil', label: 'Perfil', icon: <User size={18} weight="bold" /> },
]

const NAV_ORG: { id: OrganizadorTab; label: string; icon: ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <House size={18} weight="bold" /> },
  { id: 'postulaciones', label: 'Postulaciones', icon: <ClipboardText size={18} weight="bold" /> },
]

export function AppShell({
  tab, onTab, children,
}: { tab: string; onTab: (t: any) => void; children: ReactNode }) {
  const { user, logout } = useAuth()
  const nav = user?.rol === 'expositor' ? NAV_EXPO : NAV_ORG

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur border-b border-feria-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <button onClick={() => onTab(user?.rol === 'expositor' ? 'home' : 'dashboard')} className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-feria-600 text-white flex items-center justify-center">
              <Storefront size={18} weight="bold" />
            </span>
            <span className="font-display font-bold text-lg text-feria-800">FeriaHub</span>
          </button>

          <nav className="hidden sm:flex items-center gap-1">
            {nav.map(n => (
              <button key={n.id} onClick={() => onTab(n.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${tab === n.id ? 'bg-feria-600 text-white' : 'text-feria-700 hover:bg-feria-100'}`}>
                {n.icon}{n.label}
              </button>
            ))}
          </nav>

          <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-feria-500 hover:bg-feria-100" title="Cerrar sesión">
            <SignOut size={18} weight="bold" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>

        {/* nav móvil inferior */}
        <nav className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-feria-100 flex">
          {nav.map(n => (
            <button key={n.id} onClick={() => onTab(n.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${tab === n.id ? 'text-feria-700' : 'text-feria-400'}`}>
              {n.icon}<span>{n.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 pb-16 sm:pb-0">{children}</main>
    </div>
  )
}
