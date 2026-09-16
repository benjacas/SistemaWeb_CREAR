import { useParams, useNavigate, useLocation, useOutletContext } from 'react-router-dom'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { formatMoneda, formatButaca } from '../../utils/format'

export default function ResumenCompra() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { misEntradasApi } = useOutletContext()
  const butacasSeleccionadas = location.state?.butacasSeleccionadas ?? []
  const sillasRuedasSeleccionadas = location.state?.sillasRuedasSeleccionadas ?? []
  const itemsSeleccionados = [...butacasSeleccionadas, ...sillasRuedasSeleccionadas]

  if (itemsSeleccionados.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          title="No hay butacas seleccionadas"
          description="Volvé a elegir tus butacas para continuar con la compra."
          action={
            <Button variant="primary" onClick={() => navigate(`/portal/eventos/${id}/butacas`)}>
              Elegir butacas
            </Button>
          }
        />
      </div>
    )
  }

  const total = itemsSeleccionados.reduce((acc, b) => acc + b.precio, 0)

  function confirmar() {
    misEntradasApi.confirmarCompra(id, itemsSeleccionados)
    navigate('/portal/mis-entradas')
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Resumen de compra</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <ul className="space-y-2">
          {itemsSeleccionados.map((b) => (
            <li key={b.clave} className="flex items-center justify-between text-sm text-gray-700">
              <span>{formatButaca(b)}</span>
              <span className="font-medium text-gray-800">{formatMoneda(b.precio)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">Total</span>
          <span className="text-xl font-bold text-gray-800">{formatMoneda(total)}</span>
        </div>
      </div>

      <Button variant="primary" className="w-full justify-center" onClick={confirmar}>
        Confirmar y pagar
      </Button>
    </div>
  )
}