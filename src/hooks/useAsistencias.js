import { useState, useEffect } from 'react'
import { asistenciasDemo } from '../mock/fixtures'

export function useAsistencias(alumnoId) {
  const [asistencias, setAsistencias] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        // más adelante: const data = await api.getAsistencias(alumnoId)
        setAsistencias(asistenciasDemo)
      } catch (error) {
        console.warn('[modo demo] asistencias falló, usando mock', error)
        setAsistencias(asistenciasDemo)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [alumnoId])

  return { asistencias, cargando }
}
