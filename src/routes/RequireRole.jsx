import { useContext, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { AlumnoActivoContext } from '../context/AlumnoActivoContext'
import { getMisAlumnos } from '../api/client'
import Spinner from '../components/ui/Spinner'

export default function RequireRole({ children }) {
  const location = useLocation()
  const { token, logout } = useContext(AuthContext)
  const { alumnoActivo, alumnosVinculados, setAlumnosVinculados, setAlumnoActivo } = useContext(AlumnoActivoContext)
  const [verificando, setVerificando] = useState(true)

  useEffect(() => {
    if (!token) { setVerificando(false); return }
    if (alumnosVinculados.length > 0) { setVerificando(false); return } // ya poblado, viene de un login recién hecho

    getMisAlumnos(token)
      .then((alumnos) => {
        setAlumnosVinculados(alumnos)
        // Repoblar la lista no alcanza para saber CUÁL alumno estaba
        // elegido antes de la recarga — se restaura acá mismo (mismo
        // callback, no un efecto aparte reaccionando al cambio de
        // alumnosVinculados) para que quede resuelto antes de sacar el
        // spinner. Hacerlo en un efecto separado deja una carrera real:
        // "verificando ya pasó a false pero alumnoActivo todavía no se
        // restauró" manda de más al selector, aunque haya 1 solo alumno
        // guardado de una sesión anterior.
        const idGuardado = localStorage.getItem('crear_alumno_activo_id')
        const recordado = alumnos.find((a) => a.id === idGuardado)
        if (recordado) setAlumnoActivo(recordado)
      })
      .catch(() => logout()) // token vencido o inválido — no queda otra que volver a loguearse
      .finally(() => setVerificando(false))
  }, [token])

  if (!token) return <Navigate to="/portal-login" replace />
  if (verificando) return <Spinner className="min-h-svh" />
  // El propio /seleccionar-alumno también pasa por este guard (necesita
  // token) — pero no hay que exigirle "ya tener alumno elegido" a la
  // pantalla que justamente existe para elegirlo, si no, redirige a sí
  // misma en bucle.
  if (!alumnoActivo && location.pathname !== '/seleccionar-alumno') {
    return <Navigate to="/seleccionar-alumno" replace />
  }
  return children
}
