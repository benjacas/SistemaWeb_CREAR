import { useState, useEffect } from 'react'
import { misEntradasDemo, eventosDemo } from '../mock/fixtures'

export function useMisEntradas() {
  const [entradas, setEntradas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        // más adelante: const data = await api.getMisEntradas(alumnoId)
        setEntradas(misEntradasDemo)
      } catch (error) {
        console.warn('[modo demo] entradas falló, usando mock', error)
        setEntradas(misEntradasDemo)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  // Simula lo que en el futuro haría Mercado Pago + el webhook: agrega la
  // entrada ya como 'pago_en_revision', nunca 'pagado' directo — la
  // confirmación real es un paso aparte (ver marcarComoPagada, TEMPORAL).
  function confirmarCompra(eventoId, butacasSeleccionadas) {
    const evento = eventosDemo.find((e) => e.id === eventoId)
    const nuevaEntrada = {
      id: `ent-${Date.now()}`,
      eventoId,
      eventoTitulo: evento?.titulo ?? '',
      fecha: evento?.fecha ?? '',
      lugar: evento?.lugar ?? '',
      butacas: butacasSeleccionadas.map((b) => ({ sector: b.sector, fila: b.fila, numero: b.numero })),
      estado: 'pago_en_revision',
      montoTotal: butacasSeleccionadas.reduce((acc, b) => acc + b.precio, 0),
    }
    setEntradas((prev) => [...prev, nuevaEntrada])
    return nuevaEntrada
  }

  // TEMPORAL — sacar cuando exista backend real: hoy no hay webhook de
  // Mercado Pago que confirme el pago, así que esto simula "la secretaría
  // revisó el comprobante a mano". Sin este botón no hay forma de ver ni
  // probar el estado final ('pagado') sin un backend real.
  function marcarComoPagada(entradaId) {
    setEntradas((prev) => prev.map((e) => (e.id === entradaId ? { ...e, estado: 'pagado' } : e)))
  }

  return { entradas, cargando, confirmarCompra, marcarComoPagada }
}
