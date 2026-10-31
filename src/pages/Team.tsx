import { Download, Plus, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { Modal } from '../components/Modal'
import { useStore } from '../store/useStore'
import type { Role, TrackerData } from '../types'

export function Team() {
  const team = useStore((s) => s.team)
  const addTeamMember = useStore((s) => s.addTeamMember)
  const updateTeamMember = useStore((s) => s.updateTeamMember)
  const removeTeamMember = useStore((s) => s.removeTeamMember)
  const isAdmin = useStore((s) => s.isAdmin())
  const currentUserId = useStore((s) => s.currentUserId)
  const exportData = useStore((s) => s.exportData)
  const importData = useStore((s) => s.importData)
  const clearAllData = useStore((s) => s.clearAllData)
  const verifyAdminPin = useStore((s) => s.verifyAdminPin)
  const setAdminPin = useStore((s) => s.setAdminPin)
  const adminPin = useStore((s) => s.adminPin)

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('member')
  const [pinInput, setPinInput] = useState('')
  const [newPin, setNewPin] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    if (!isAdmin && role === 'admin') {
      alert('Only admins can create admin users.')
      return
    }
    addTeamMember({
      name: name.trim(),
      email: email.trim(),
      role: isAdmin ? role : 'member',
    })
    setName('')
    setEmail('')
    setRole('member')
    setOpen(false)
  }

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ibr-office-tracker-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (file: File | null) => {
    if (!file) return
    if (!isAdmin) {
      alert('Only admins can import data.')
      return
    }
    if (adminPin && !verifyAdminPin(pinInput)) {
      alert('Incorrect admin PIN.')
      return
    }
    try {
      const text = await file.text()
      const data = JSON.parse(text) as TrackerData
      if (!Array.isArray(data.tasks) || !Array.isArray(data.team)) {
        throw new Error('Invalid file')
      }
      if (!confirm('Import will replace all current local data. Continue?')) return
      importData(data)
      alert('Import complete. Please sign in again.')
    } catch {
      alert('Could not import that file.')
    }
  }

  const handleClear = () => {
    if (!isAdmin) return
    if (adminPin && !verifyAdminPin(pinInput)) {
      alert('Incorrect admin PIN.')
      return
    }
    if (!confirm('Clear ALL local data? This cannot be undone.')) return
    clearAllData()
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Team Members</h1>
          <p className="mt-1 text-sm text-ink-400">{team.length} people</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setOpen(true)}>
          <Plus size={16} />
          Add member
        </button>
      </div>

      {!isAdmin && (
        <p className="text-sm text-ink-400">
          You can add members. Only admins can change roles or import/clear data.
        </p>
      )}

      <div className="card overflow-hidden">
        <ul className="divide-y divide-ink-100">
          {team.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium text-ink-900">
                  {m.name}
                  {m.id === currentUserId && (
                    <span className="ml-2 text-xs font-normal text-accent">You</span>
                  )}
                </p>
                <p className="text-xs text-ink-400">{m.email || 'No email'}</p>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <select
                    className="input w-auto text-xs"
                    value={m.role}
                    onChange={(e) =>
                      updateTeamMember(m.id, { role: e.target.value as Role })
                    }
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                ) : (
                  <span className="rounded bg-ink-100 px-2 py-1 text-xs capitalize text-ink-600">
                    {m.role}
                  </span>
                )}
                {isAdmin && m.id !== currentUserId && (
                  <button
                    type="button"
                    className="btn-ghost p-1.5 text-danger"
                    onClick={() => {
                      if (confirm(`Remove ${m.name}?`)) removeTeamMember(m.id)
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <section className="card p-5 space-y-4">
        <div>
          <h2 className="font-display text-base font-semibold">Backup & share</h2>
          <p className="mt-1 text-sm text-ink-400">
            Data lives in this browser. Export a JSON file to share with teammates or
            move to another device.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={handleExport}>
            <Download size={16} />
            Export JSON
          </button>
          {isAdmin && (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={16} />
                Import JSON
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  void handleImport(e.target.files?.[0] ?? null)
                  e.target.value = ''
                }}
              />
              <button type="button" className="btn-danger" onClick={handleClear}>
                Clear all data
              </button>
            </>
          )}
        </div>
        {isAdmin && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Confirm admin PIN (if set)</label>
              <input
                type="password"
                className="input"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Required for import / clear"
              />
            </div>
            <div>
              <label className="label">Set / update admin PIN</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  className="input"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="New PIN"
                />
                <button
                  type="button"
                  className="btn-secondary shrink-0"
                  onClick={() => {
                    setAdminPin(newPin.trim())
                    setNewPin('')
                    alert(newPin.trim() ? 'PIN updated.' : 'PIN cleared.')
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <Modal open={open} title="Add team member" onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {isAdmin && (
            <div>
              <label className="label">Role</label>
              <select
                className="input"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
