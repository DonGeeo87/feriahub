import { useState } from 'react'
import { AuthProvider, useAuth } from './lib/auth'
import { AppShell, type ExpositorTab, type OrganizadorTab } from './components/AppShell'
import LoginView, { RegisterView } from './pages/LoginView'
import ScrollScrubLanding from './pages/public/ScrollScrubLanding'
import ExpositorHome from './pages/expositor/ExpositorHome'
import ExplorarFerias from './pages/expositor/ExplorarFerias'
import DetalleFeria from './pages/expositor/DetalleFeria'
import MisPostulaciones from './pages/expositor/MisPostulaciones'
import MiTrayectoria from './pages/expositor/MiTrayectoria'
import PerfilView from './pages/expositor/PerfilView'
import DashboardOrganizador from './pages/organizador/DashboardOrganizador'
import PanelPostulaciones from './pages/organizador/PanelPostulaciones'
import { api, type Rol } from './lib/api'

export default function App() {
  return (
    <AuthProvider>
      <Inner />
    </AuthProvider>
  )
}

type PublicView = 'landing' | 'login' | 'register'

function Inner() {
  const { user, login } = useAuth()
  const [view, setView] = useState<PublicView>('landing')
  const [initialRol, setInitialRol] = useState<Rol | undefined>()
  const [demoError, setDemoError] = useState('')

  // Entrar a la demo sin registrarse: login con cuenta demo de expositor
  const entrarDemo = async () => {
    try {
      await login('expo@feriahub.cl', 'demo1234')
    } catch {
      setDemoError('No se pudo cargar la demo. Intenta crearte una cuenta gratis.')
    }
  }

  // Si hay sesión, vamos directo a la app según rol
  if (user) {
    return user.rol === 'expositor' ? <ExpositorApp /> : <OrganizadorApp />
  }

  // Vista pública: landing scrollable por defecto
  if (view === 'landing') {
    return <ScrollScrubLanding onChooseRol={(rol) => { setInitialRol(rol); setView('register') }} onExploreDemo={entrarDemo} />
  }
  if (view === 'register') {
    return <RegisterView onSwitch={(m) => setView(m === 'login' ? 'login' : 'register')} initialRol={initialRol} />
  }
  return <LoginView onSwitch={(m) => setView(m === 'register' ? 'register' : 'login')} demoError={demoError} />
}

function ExpositorApp() {
  const [tab, setTab] = useState<ExpositorTab>('home')
  const [feriaSeleccionada, setFeriaSeleccionada] = useState<number | null>(null)

  const go = (t: ExpositorTab) => { setTab(t); setFeriaSeleccionada(null) }

  return (
    <AppShell tab={tab} onTab={go}>
      {feriaSeleccionada !== null ? (
        <DetalleFeria
          feriaId={feriaSeleccionada}
          onBack={() => { setFeriaSeleccionada(null); setTab('explorar') }}
          onPostulada={() => { setFeriaSeleccionada(null); setTab('postulaciones') }}
        />
      ) : (
        <>
          {tab === 'home' && <ExpositorHome onTab={go} />}
          {tab === 'explorar' && <ExplorarFerias onVerFeria={id => setFeriaSeleccionada(id)} />}
          {tab === 'postulaciones' && <MisPostulaciones />}
          {tab === 'trayectoria' && <MiTrayectoria />}
          {tab === 'perfil' && <PerfilView />}
        </>
      )}
    </AppShell>
  )
}

function OrganizadorApp() {
  const [tab, setTab] = useState<OrganizadorTab>('dashboard')

  return (
    <AppShell tab={tab} onTab={setTab}>
      {tab === 'dashboard' && <DashboardOrganizador onTab={setTab} />}
      {tab === 'postulaciones' && <PanelPostulaciones />}
    </AppShell>
  )
}
