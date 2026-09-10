import { NavLink } from 'react-router-dom'
import { Home, Wallet, CalendarCheck, Users, NotebookPen } from 'lucide-react'

const links = [
  { to: '/portal', label: 'Inicio', icon: Home, end: true },
  { to: '/portal/pagos', label: 'Pagos', icon: Wallet },
  { to: '/portal/asistencia', label: 'Asistencia', icon: CalendarCheck },
  { to: '/portal/grupos', label: 'Grupos', icon: Users },
  { to: '/portal/evaluaciones', label: 'Notas', icon: NotebookPen },
]

export default function BottomNav() {
  return (
    <nav className="flex items-stretch justify-around bg-white border-t border-gray-200 shrink-0 pb-[env(safe-area-inset-bottom)]">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[11px] font-medium transition-colors ${
              isActive ? 'text-primary' : 'text-gray-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className={`p-1.5 rounded-lg ${isActive ? 'bg-primary-light' : ''}`}>
                <Icon size={20} />
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
