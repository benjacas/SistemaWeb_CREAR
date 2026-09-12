import { useState, useEffect } from 'react'
import { eventosDemo, butacasOcupadasDemo } from '../mock/fixtures'

export function useEvento(eventoId) {
  const [evento, setEvento] = useState(null)
  const [butacasOcupadas, setButacasOcupadas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        // más adelante: const data = await api.getEvento(eventoId)
        setEvento(eventosDemo.find((e) => e.id === eventoId) ?? null)
        setButacasOcupadas(butacasOcupadasDemo[eventoId] ?? [])
      } catch (error) {
        console.warn('[modo demo] evento falló, usando mock', error)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [eventoId])

  return { evento, butacasOcupadas, cargando }
}
