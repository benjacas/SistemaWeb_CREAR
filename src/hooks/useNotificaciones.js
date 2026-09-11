import { useState, useEffect } from 'react'
import { notificacionesDemo } from '../mock/fixtures'

export function useNotificaciones(alumnoId) {
  const [notificaciones, setNotificaciones] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        // más adelante: const data = await api.getNotificaciones(alumnoId)
        setNotificaciones(notificacionesDemo)
      } catch (error) {
        console.warn('[modo demo] notificaciones falló, usando mock', error)
        setNotificaciones(notificacionesDemo)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [alumnoId])

  function marcarLeida(id) {
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)))
  }

  function marcarTodasLeidas() {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))
  }

  return { notificaciones, cargando, marcarLeida, marcarTodasLeidas }
}
