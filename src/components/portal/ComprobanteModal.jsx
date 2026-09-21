import { CheckCircle2, Banknote, Landmark, CreditCard, Share2 } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { useToast } from '../../context/ToastContext'
import { formatMoneda, formatFecha, infoMetodoPago, ultimoPago } from '../../utils/format'

const ICONOS_METODO = { banknote: Banknote, landmark: Landmark, 'credit-card': CreditCard }

export function IconoMetodoPago({ metodo, size = 14, className = '' }) {
  const { icono } = infoMetodoPago(metodo)
  const Icon = ICONOS_METODO[icono] ?? Banknote
  return <Icon size={size} className={className} />
}

// navigator.share() no existe en la mayoría de los navegadores de escritorio
// — sin un celular real a mano para probarlo, esto se hace a prueba de que
// no exista en vez de asumir que sí. Pendiente confirmar el share nativo en
// un dispositivo móvil real (ver Claude.md, Decisiones pendientes).
async function compartirComprobante(cargo, pago, toast) {
  const texto = `Comprobante ${pago?.comprobante_numero ?? '—'} — ${cargo.concepto} — ${formatMoneda(cargo.monto_final)}`
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Comprobante de pago', text: texto })
    } catch {
      // el usuario canceló el share nativo — no es un error
    }
    return
  }
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(texto)
    toast('Comprobante copiado al portapapeles')
    return
  }
  toast('No se pudo compartir desde este navegador')
}

export default function ComprobanteModal({ isOpen, onClose, cargo, alumno }) {
  const toast = useToast()
  if (!cargo) return null
  // LÍMITE CONOCIDO: muestra solo el pago más reciente del cargo (ver
  // ultimoPago en utils/format.js) — si un cargo llega a tener más de un
  // pago, esta pantalla no los lista todos todavía.
  const pago = ultimoPago(cargo)
  const { label: metodoLabel } = infoMetodoPago(pago?.metodo)
  const nombreAlumno = alumno ? `${alumno.nombre} ${alumno.apellido}` : '—'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Comprobante" size="sm">
      <div className="flex flex-col items-center text-center gap-1 mb-5">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
          <CheckCircle2 size={28} className="text-emerald-500" />
        </div>
        <p className="text-base font-semibold text-gray-800">¡Pago confirmado!</p>
        <p className="text-xs text-gray-400">N.º {pago?.comprobante_numero ?? '—'}</p>
      </div>

      <dl className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-gray-400">Alumno/a</dt>
          <dd className="font-medium text-gray-800 text-right">{nombreAlumno}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-gray-400">Concepto</dt>
          <dd className="font-medium text-gray-800 text-right">{cargo.concepto}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-gray-400">Método</dt>
          <dd className="font-medium text-gray-800 flex items-center gap-1.5">
            <IconoMetodoPago metodo={pago?.metodo} className="text-gray-400" />
            {metodoLabel}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-gray-400">Fecha</dt>
          <dd className="font-medium text-gray-800">{pago ? formatFecha(pago.fecha_pago) : '—'}</dd>
        </div>
      </dl>

      <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between">
        <span className="text-sm text-gray-500">Total</span>
        <span className="text-xl font-bold text-gray-800">{formatMoneda(cargo.monto_final)}</span>
      </div>

      <Button variant="primary" className="w-full justify-center mt-5" onClick={() => compartirComprobante(cargo, pago, toast)}>
        <Share2 size={16} />
        Compartir
      </Button>
    </Modal>
  )
}
