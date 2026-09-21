import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import { AlumnoActivoProvider } from './context/AlumnoActivoContext'
import RequireRole from './routes/RequireRole'
import Layout from './components/layout/Layout'
import PortalShell from './components/layout/portal/PortalShell'
import PortalLogin from './pages/PortalLogin'
import PortalSeleccionarAlumno from './pages/portal/SeleccionarAlumno'
import PortalHome from './pages/portal/Home'
import PortalPagos from './pages/portal/Pagos'
import PortalAsistencia from './pages/portal/Asistencia'
import PortalClases from './pages/portal/Clases'
import PortalHorarios from './pages/portal/Horarios'
import PortalEvaluaciones from './pages/portal/Evaluaciones'
import PortalPerfil from './pages/portal/Perfil'
import PortalNotificaciones from './pages/portal/Notificaciones'
import PortalEventos from './pages/portal/Eventos'
import PortalEventoDetalle from './pages/portal/EventoDetalle'
import PortalEventoButacas from './pages/portal/EventoButacas'
import PortalResumenCompra from './pages/portal/ResumenCompra'
import PortalMisEntradas from './pages/portal/MisEntradas'
import PortalVestuarioEvento from './pages/portal/VestuarioEvento'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Alumnos from './pages/Alumnos'
import Grupos from './pages/Grupos'
import Profesores from './pages/Profesores'
import Inscripciones from './pages/Inscripciones'
import Asistencia from './pages/Asistencia'
import Pagos from './pages/Pagos'
import Evaluaciones from './pages/Evaluaciones'
import Padres from './pages/Padres'
import Sueldos from './pages/Sueldos'
import Spinner from './components/ui/Spinner'

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  const appLayout = session === undefined
    ? <Spinner className="min-h-screen" />
    : session
      ? <Layout />
      : <Navigate to="/login" replace />

  return (
    <ToastProvider>
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <Login />} />
        {/* Portal Alumno/Tutor: AlumnoActivoProvider envuelve login + selector +
            portal para que sobreviva la navegación entre esas 3 pantallas (si
            solo envolviera /portal, se remontaría con el mock al entrar y
            perdería los datos reales que cargó el login). Desde la Fase 3a el
            login es real; /portal está protegido por RequireRole. */}
        <Route element={<AlumnoActivoProvider><Outlet /></AlumnoActivoProvider>}>
          <Route path="/portal-login" element={<PortalLogin />} />
          <Route path="/seleccionar-alumno" element={<RequireRole><PortalSeleccionarAlumno /></RequireRole>} />
          <Route path="/portal" element={<RequireRole><PortalShell /></RequireRole>}>
            <Route index element={<PortalHome />} />
            <Route path="pagos" element={<PortalPagos />} />
            <Route path="asistencia" element={<PortalAsistencia />} />
            <Route path="clases" element={<PortalClases />} />
            <Route path="horarios" element={<PortalHorarios />} />
            <Route path="evaluaciones" element={<PortalEvaluaciones />} />
            <Route path="perfil" element={<PortalPerfil />} />
            <Route path="notificaciones" element={<PortalNotificaciones />} />
            <Route path="eventos" element={<PortalEventos />} />
            <Route path="eventos/:id" element={<PortalEventoDetalle />} />
            <Route path="eventos/:id/butacas" element={<PortalEventoButacas />} />
            <Route path="eventos/:id/resumen" element={<PortalResumenCompra />} />
            <Route path="eventos/:id/vestuario" element={<PortalVestuarioEvento />} />
            <Route path="mis-entradas" element={<PortalMisEntradas />} />
          </Route>
        </Route>
        <Route path="/" element={appLayout}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="alumnos" element={<Alumnos />} />
          <Route path="padres" element={<Padres />} />
          <Route path="grupos" element={<Grupos />} />
          <Route path="profesores" element={<Profesores />} />
          <Route path="inscripciones" element={<Inscripciones />} />
          <Route path="asistencia" element={<Asistencia />} />
          <Route path="pagos" element={<Pagos />} />
          <Route path="sueldos" element={<Sueldos />} />
          <Route path="evaluaciones" element={<Evaluaciones />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </AuthProvider>
    </ToastProvider>
  )
}
