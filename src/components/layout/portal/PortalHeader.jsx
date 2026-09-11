import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import Avatar from '../../ui/Avatar'
import Badge from '../../ui/Badge'
import { familiaDemo } from '../../../mock/fixtures'

export default function PortalHeader({ noLeidas = 0 }) {
  const navigate = useNavigate()

  return (
    <header className="flex items-center justify-between gap-2 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
      <button type="button" onClick={() => navigate('/portal/perfil')} aria-label="Perfil">
        <Avatar nombre={familiaDemo.nombre} />
      </button>

      <button
        type="button"
        onClick={() => navigate('/portal/notificaciones')}
        className="relative p-2 rounded-lg text-gray-500 hover:bg-primary-light hover:text-primary transition-colors"
        aria-label="Notificaciones"
      >
        <Bell size={20} />
        {noLeidas > 0 && (
          <span className="absolute -top-1 -right-1">
            <Badge color="red">{noLeidas}</Badge>
          </span>
        )}
      </button>
    </header>
  )
}
