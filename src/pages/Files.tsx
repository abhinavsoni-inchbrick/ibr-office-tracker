import { Download, FileStack, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '../components/Modal'
import {
  MAX_ATTACHMENT_BYTES,
  fileToDataUrl,
  formatBytes,
  formatDateTime,
} from '../lib/utils'
import { useStore } from '../store/useStore'

const CATEGORIES = [
  'Layout',
  '3D Visualization',
  'Technical Drawing',
  'Reference',
  'Other',
]

export function Files() {
  const files = useStore((s) => s.files)
  const addFile = useStore((s) => s.addFile)
  const removeFile = useStore((s) => s.removeFile)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [note, setNote] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)

  const reset = () => {
    setName('')
    setCategory(CATEGORIES[0])
    setNote('')
    setFile(null)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    try {
      let dataUrl: string | null = null
      let size = 0
      if (file) {
        if (file.size > MAX_ATTACHMENT_BYTES) {
          alert(`File too large. Max ${formatBytes(MAX_ATTACHMENT_BYTES)}.`)
          return
        }
        dataUrl = await fileToDataUrl(file)
        size = file.size
      }
      addFile({
        name: name.trim(),
        category,
        note: note.trim(),
        dataUrl,
        size,
        uploadedAt: new Date().toISOString(),
      })
      reset()
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Design & Layout Files</h1>
          <p className="mt-1 text-sm text-ink-400">
            Lightweight file notes stored locally (keep files small)
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setOpen(true)}>
          <Plus size={16} />
          Add file
        </button>
      </div>

      {files.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-16 text-center">
          <FileStack className="mb-3 text-ink-300" size={36} strokeWidth={1.5} />
          <p className="text-sm text-ink-400">No design files yet.</p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {files.map((f) => (
            <li key={f.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink-900">{f.name}</p>
                  <p className="text-xs text-ink-400">
                    {f.category} · {formatDateTime(f.uploadedAt)}
                    {f.size > 0 ? ` · ${formatBytes(f.size)}` : ''}
                  </p>
                  {f.note && <p className="mt-2 text-sm text-ink-600">{f.note}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  {f.dataUrl && (
                    <a
                      href={f.dataUrl}
                      download={f.name}
                      className="btn-ghost p-1.5"
                      aria-label="Download"
                    >
                      <Download size={15} />
                    </a>
                  )}
                  <button
                    type="button"
                    className="btn-ghost p-1.5 text-danger"
                    onClick={() => {
                      if (confirm('Remove this file?')) removeFile(f.id)
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={open}
        title="Add design file"
        onClose={() => {
          setOpen(false)
          reset()
        }}
      >
        <form onSubmit={(e) => void submit(e)} className="space-y-4">
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
            <label className="label">Category</label>
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Note</label>
            <textarea
              className="input min-h-[60px]"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div>
            <label className="label">File (optional, max {formatBytes(MAX_ATTACHMENT_BYTES)})</label>
            <input
              type="file"
              className="input"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={busy}>
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
