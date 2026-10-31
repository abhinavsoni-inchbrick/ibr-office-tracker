import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { MobileMenuButton, Sidebar } from './Sidebar'

export function Layout() {
  const [open, setOpen] = useState(false)
  const ensureLayoutSeed = useStore((s) => s.ensureLayoutSeed)

  useEffect(() => {
    ensureLayoutSeed()
  }, [ensureLayoutSeed])

  return (
    <div className="flex min-h-screen bg-[#f4f6f8]">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-ink-100/80 bg-white px-4 py-3 lg:hidden">
          <MobileMenuButton onClick={() => setOpen(true)} />
          <span className="font-display text-sm font-semibold text-ink-900">
            Inch & Brick Tracker
          </span>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
