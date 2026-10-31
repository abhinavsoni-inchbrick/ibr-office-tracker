import { useState } from 'react'
import { useStore } from '../store/useStore'

export function Login() {
  const team = useStore((s) => s.team)
  const login = useStore((s) => s.login)
  const addTeamMember = useStore((s) => s.addTeamMember)
  const setAdminPin = useStore((s) => s.setAdminPin)
  const [selectedId, setSelectedId] = useState('')
  const [setupName, setSetupName] = useState('')
  const [setupEmail, setSetupEmail] = useState('')
  const [setupPin, setSetupPin] = useState('')

  const isEmpty = team.length === 0

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!setupName.trim()) return
    addTeamMember({
      name: setupName.trim(),
      email: setupEmail.trim(),
      role: 'admin',
    })
    if (setupPin.trim()) setAdminPin(setupPin.trim())
    const created = useStore.getState().team.at(-1)
    if (created) login(created.id)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedId) login(selectedId)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-ink-100 via-[#f4f6f8] to-accent-soft/40 px-4">
      <div className="w-full max-w-md card p-8 shadow-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl font-semibold tracking-tight text-ink-900">
            Inch & Brick Realty
          </p>
          <p className="mt-1 text-sm text-ink-400">Office Development Tracker</p>
        </div>

        {isEmpty ? (
          <form onSubmit={handleSetup} className="space-y-4">
            <p className="text-sm text-ink-600">
              First-time setup — create the project admin account. Data stays in this
              browser (localStorage).
            </p>
            <div>
              <label className="label" htmlFor="name">
                Your name
              </label>
              <input
                id="name"
                className="input"
                value={setupName}
                onChange={(e) => setSetupName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label" htmlFor="email">
                Email (optional)
              </label>
              <input
                id="email"
                type="email"
                className="input"
                value={setupEmail}
                onChange={(e) => setSetupEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="pin">
                Admin PIN (optional, for import/reset)
              </label>
              <input
                id="pin"
                type="password"
                className="input"
                value={setupPin}
                onChange={(e) => setSetupPin(e.target.value)}
                placeholder="Leave blank to skip"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Create admin & continue
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label" htmlFor="member">
                Sign in as
              </label>
              <select
                id="member"
                className="input"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                required
              >
                <option value="">Select team member…</option>
                {team.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={!selectedId}>
              Continue
            </button>
            <p className="text-center text-xs text-ink-400">
              Local session only — no cloud account required.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
