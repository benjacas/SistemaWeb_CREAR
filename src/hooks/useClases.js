import { useState, useEffect } from 'react'
import { misClasesDemo, clasesDisponiblesDemo, solicitudesInscripcionDemo } from '../mock/fixtures'

export function useClases(alumnoId) {
  const [misClases, setMisClases] = useState([])
  const [clasesDisponibles, setClasesDisponibles] = useState([])
  const [cargando, setCargando] = useState(true)
  const [solicitudes, setSolicitudes] = useState({ ...solicitudesInscripcionDemo })

  useEffect(() => {
    async function cargar() {
      try {
        // más adelante: const data = await api.getClases(alumnoId)
        setMisClases(misClasesDemo)
        setClasesDisponibles(clasesDisponiblesDemo)
      } catch (error) {
        console.warn('[modo demo] clases falló, usando mock', error)
        setMisClases(misClasesDemo)
        setClasesDisponibles(clasesDisponiblesDemo)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [alumnoId])

  function solicitarInscripcion(claseId, tipo) {
    setSolicitudes((prev) => ({ ...prev, [claseId]: tipo }))
    // más adelante: llamada real a la API, y el toast de éxito se dispara según la respuesta
  }

  return { misClases, clasesDisponibles, cargando, solicitudes, solicitarInscripcion }
}
