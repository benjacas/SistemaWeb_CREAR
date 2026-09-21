import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'

// Edita los datos del tutor (email/teléfono), no de la alumna — ver Fase
// B13. Sin campo de domicilio: no existe en `padre_tutor` del lado real.
export default function EditarContactoModal({ isOpen, onClose, datosActuales, onGuardar }) {
  const [form, setForm] = useState({ telefono: '', email: '' })

  useEffect(() => {
    if (isOpen && datosActuales) {
      setForm({
        telefono: datosActuales.telefono ?? '',
        email: datosActuales.email ?? '',
      })
    }
  }, [isOpen, datosActuales])

  function handleGuardar() {
    onGuardar(form)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar datos de contacto" size="sm">
      <div className="space-y-4">
        <Input
          label="Teléfono"
          value={form.telefono}
          onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleGuardar}>Guardar</Button>
        </div>
      </div>
    </Modal>
  )
}
