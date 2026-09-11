import { useState, useEffect } from 'react'
import { evaluacionesDemo } from '../mock/fixtures'

export function useEvaluaciones(alumnoId) {
  const [evaluaciones, setEvaluaciones] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        // más adelante: const data = await api.getEvaluaciones(alumnoId)
        setEvaluaciones(evaluacionesDemo)
      } catch (error) {
        console.warn('[modo demo] evaluaciones falló, usando mock', error)
        setEvaluaciones(evaluacionesDemo)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [alumnoId])

  return { evaluaciones, cargando }
}
