import { useState, useEffect } from 'react'
import { cargosDemo } from '../mock/fixtures'

export function useCargos(alumnoId) {
  const [cargos, setCargos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        // más adelante: const data = await api.getCargos(alumnoId)
        setCargos(cargosDemo)
      } catch (error) {
        console.warn('[modo demo] cargos falló, usando mock', error)
        setCargos(cargosDemo)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [alumnoId])

  return { cargos, cargando }
}
