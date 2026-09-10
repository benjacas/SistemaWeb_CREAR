import { useNavigate } from 'react-router-dom'
import { Bell, CircleUserRound, LogOut } from 'lucide-react'
import Button from '../../ui/Button'

export default function PortalHeader() {
  const navigate = useNavigate()

  return (
    <header className="flex items-center justify-between gap-2 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 bg-gradient-to-br from-primary to-primary-dark"
      >
        C
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="p-2 rounded-lg text-gray-500 hover:bg-primary-light hover:text-primary transition-colors"
          aria-label="Notificaciones"
        >
          <Bell size={20} />
        </button>
        <button
          type="button"
          className="p-2 rounded-lg text-gray-500 hover:bg-primary-light hover:text-primary transition-colors"
          aria-label="Perfil"
        >
          <CircleUserRound size={20} />
        </button>
        {/* placeholder hasta que exista login real (ver Claude.md) */}
        <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
          <LogOut size={16} />
          Salir
        </Button>
      </div>
    </header>
  )
}
