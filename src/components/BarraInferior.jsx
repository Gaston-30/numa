import { NavLink } from 'react-router-dom'
import { Home, Store, User } from 'lucide-react'

const items = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/comercios', label: 'Comercios', icon: Store },
  { to: '/comercio', label: 'Mi comercio', icon: User },
]

export default function BarraInferior() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 flex border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
              isActive ? 'font-semibold text-numa-naranja' : 'text-gray-500'
            }`
          }
        >
          <Icon size={22} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}