import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import { AppShell, type ExpositorTab, type OrganizadorTab } from './components/AppShell'
import PublicLayout from './components/PublicLayout'
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

function Inner() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Entrar a la demo sin registrarse (elige rol y entra con cuenta demo)
  const entrarDemo = async (rol: 'expositor' | 'organizador') => {
    try {
      if (rol === 'organizador') {
        await login('org@feriahub.cl', 'demo1234')
        navigate('/organizador')
      } else {
        await login('expo@feriahub.cl', 'demo1234')
        navigate('/expositor')
      }
    } catch {
      // si falla, ir a login
      navigate('/login')
    }
  }

  // Si hay sesión, redirige según rol cuando toca una ruta pública
  if (user) {
    if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/') {
      return <Navigate to={user.rol === 'expositor' ? '/expositor' : '/organizador'} replace />
    }
  }

  return (
    <Routes>
      {/* LANDING: full-screen inmersiva, SIN navbar/footer (scrollable) */}
      <Route path="/" element={<ScrollScrubLanding onChooseRol={(rol) => { navigate('/register') }} onExploreDemo={() => entrarDemo('expositor')} onExploreDemoOrganizador={() => entrarDemo('organizador')} />} />

      {/* Públicas (login/register con navbar/footer) */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={user ? <Navigate to={user.rol === 'expositor' ? '/expositor' : '/organizador'} replace /> : <LoginView onSwitch={(m) => navigate(m === 'register' ? '/register' : '/login')} />} />
        <Route path="/register" element={user ? <Navigate to={user.rol === 'expositor' ? '/expositor' : '/organizador'} replace /> : <RegisterView onSwitch={(m) => navigate(m === 'login' ? '/login' : '/register')} />} />
      </Route>

      {/* Expositor (con AppShell) */}
      <Route path="/expositor/*" element={user?.rol === 'expositor' ? <ExpositorApp /> : <Navigate to="/login" replace />} />
      {/* Organizador (con AppShell) */}
      <Route path="/organizador/*" element={user?.rol === 'organizador' ? <OrganizadorApp /> : <Navigate to="/login" replace />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function ExpositorApp() {
  const [tab, setTab] = useState<ExpositorTab>('home')
  const [feriaSeleccionada, setFeriaSeleccionada] = useState<number | null>(null)
  const navigate = useNavigate()

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
  const navigate = useNavigate()

  return (
    <AppShell tab={tab} onTab={setTab}>
      {tab === 'dashboard' && <DashboardOrganizador onTab={setTab} />}
      {tab === 'postulaciones' && <PanelPostulaciones />}
    </AppShell>
  )
}
