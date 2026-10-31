import {
  Activity,
  ClipboardList,
  FileStack,
  IndianRupee,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  ShoppingCart,
  Users,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useStore } from '../store/useStore'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'All Tasks', icon: ClipboardList },
  { to: '/phases', label: 'Project Phases', icon: Layers },
  { to: '/files', label: 'Design & Layout', icon: FileStack },
  { to: '/boq', label: 'BOQ & Purchases', icon: ShoppingCart },
  { to: '/expenses', label: 'Expenses', icon: IndianRupee },
  { to: '/team', label: 'Team Members', icon: Users },
  { to: '/activity', label: 'Activity Log', icon: Activity },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const user = useStore((s) => s.currentUser())
  const logout = useStore((s) => s.logout)

  const nav = (
    <>
      <div className="border-b border-white/10 px-5 py-6">
        <p className="font-display text-lg font-semibold tracking-tight text-white">
          Inch & Brick
        </p>
        <p className="mt-0.5 text-xs text-ink-300">Office Development Tracker</p>
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-ink-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 px-4 py-4">
        <div className="mb-3 px-1">
          <p className="truncate text-sm font-medium text-white">{user?.name}</p>
          <p className="text-xs capitalize text-ink-400">{user?.role}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            logout()
            onClose()
          }}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-300 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <>
      <aside className="hidden w-60 shrink-0 flex-col bg-ink-900 lg:flex">{nav}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink-950/50"
            aria-label="Close menu"
            onClick={onClose}
          />
          <aside className="relative z-10 flex h-full w-64 flex-col bg-ink-900 shadow-xl">
            <button
              type="button"
              className="absolute right-3 top-4 rounded-md p-1 text-ink-300 hover:bg-white/10"
              onClick={onClose}
            >
              <X size={18} />
            </button>
            {nav}
          </aside>
        </div>
      )}
    </>
  )
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="btn-ghost -ml-2 p-2 lg:hidden"
      onClick={onClick}
      aria-label="Open menu"
    >
      <Menu size={20} />
    </button>
  )
}
