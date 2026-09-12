import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { ToastProvider } from './context/ToastContext'
import { AlumnoActivoProvider } from './context/AlumnoActivoContext'
import Layout from './components/layout/Layout'
import PortalShell from './components/layout/portal/PortalShell'
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
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <Login />} />
        {/* Portal Alumno/Tutor: sin guard de rol todavía, el login del portal no existe (ver Claude.md) */}
        <Route path="/portal" element={<AlumnoActivoProvider><PortalShell /></AlumnoActivoProvider>}>
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
          <Route path="mis-entradas" element={<PortalMisEntradas />} />
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
    </ToastProvider>
  )
}
