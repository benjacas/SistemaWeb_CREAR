import Modal from '../ui/Modal'

export default function ClaseDetalleModal({ isOpen, onClose, clase }) {
  if (!clase) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={clase.nombre} size="sm">
      <dl className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-gray-400">Nivel</dt>
          <dd className="font-medium text-gray-800">{clase.nivel}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-gray-400">Horario</dt>
          <dd className="font-medium text-gray-800 text-right">{clase.horario}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-gray-400">Profesora</dt>
          <dd className="font-medium text-gray-800 text-right">{clase.profesora}</dd>
        </div>
      </dl>
    </Modal>
  )
}
