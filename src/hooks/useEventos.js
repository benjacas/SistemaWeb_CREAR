import { useState, useEffect } from 'react'
import { eventosDemo } from '../mock/fixtures'

export function useEventos() {
  const [eventos, setEventos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        // más adelante: const data = await api.getEventos()
        setEventos(eventosDemo)
      } catch (error) {
        console.warn('[modo demo] eventos falló, usando mock', error)
        setEventos(eventosDemo)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  return { eventos, cargando }
}
