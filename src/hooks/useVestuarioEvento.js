import { useState, useEffect } from 'react'
import { vestuarioPorEventoDemo } from '../mock/fixtures'

export function useVestuarioEvento(eventoId) {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        // más adelante: const data = await api.getVestuarioEvento(eventoId)
        setItems(vestuarioPorEventoDemo[eventoId] ?? [])
      } catch (error) {
        console.warn('[modo demo] vestuario falló, usando mock', error)
        setItems(vestuarioPorEventoDemo[eventoId] ?? [])
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [eventoId])

  // Simula la pasarela de pago, mismo criterio que confirmarCompra en
  // useMisEntradas: pasa a 'pago_en_revision', nunca a 'pagado' directo.
  function pagarVestuario(itemId) {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, estado: 'pago_en_revision' } : item)))
  }

  // TEMPORAL — sacar cuando exista backend real (webhook de Mercado Pago),
  // mismo criterio que marcarComoPagada en useMisEntradas.
  function marcarComoPagado(itemId) {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, estado: 'pagado' } : item)))
  }

  return { items, cargando, pagarVestuario, marcarComoPagado }
}
