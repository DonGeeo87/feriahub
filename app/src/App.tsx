import { useState } from 'react'
import { AuthProvider, useAuth } from './lib/auth'
import { AppShell, type ExpositorTab, type OrganizadorTab } from './components/AppShell'
import LoginView, { RegisterView } from './pages/LoginView'
import ExpositorHome from './pages/expositor/ExpositorHome'
import ExplorarFerias from './pages/expositor/ExplorarFerias'
import DetalleFeria from './pages/expositor/DetalleFeria'
import MisPostulaciones from './pages/expositor/MisPostulaciones'
import MiTrayectoria from './pages/expositor/MiTrayectoria'
import PerfilView from './pages/expositor/PerfilView'
import DashboardOrganizador from './pages/organizador/DashboardOrganizador'
import PanelPostulaciones from './pages/organizador/PanelPostulaciones'

export default function App() {
  return (
    <AuthProvider>
      <Inner />
    </AuthProvider>
  )
}

function Inner() {
  const { user } = useAuth()
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  // Vista pública: login/registro si no hay sesión
  if (!user) {
    return authMode === 'login'
      ? <LoginView onSwitch={setAuthMode} />
      : <RegisterView onSwitch={setAuthMode} />
  }

  // Rol expositor
  if (user.rol === 'expositor') {
    return <ExpositorApp />
  }

  // Rol organizador
  return <OrganizadorApp />
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
