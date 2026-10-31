import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '../components/Modal'
import { formatDate, todayISO } from '../lib/utils'
import { useStore } from '../store/useStore'

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const CATEGORIES = [
  'Materials',
  'Labour',
  'Furniture',
  'Electrical',
  'AC',
  'IT',
  'Misc',
]

export function Expenses() {
  const expenses = useStore((s) => s.expenses)
  const addExpense = useStore((s) => s.addExpense)
  const removeExpense = useStore((s) => s.removeExpense)

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [amount, setAmount] = useState(0)
  const [date, setDate] = useState(todayISO())
  const [notes, setNotes] = useState('')

  const total = expenses.reduce((s, e) => s + e.amount, 0)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    addExpense({
      title: title.trim(),
      category,
      amount,
      date,
      notes: notes.trim(),
    })
    setTitle('')
    setAmount(0)
    setNotes('')
    setDate(todayISO())
    setOpen(false)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Expenses</h1>
          <p className="mt-1 text-sm text-ink-400">
            Running total {INR.format(total)}
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setOpen(true)}>
          <Plus size={16} />
          Add expense
        </button>
      </div>

      <div className="card overflow-hidden">
        <ul className="divide-y divide-ink-100">
          {expenses.length === 0 && (
            <li className="px-4 py-10 text-center text-sm text-ink-400">
              No expenses logged yet.
            </li>
          )}
          {expenses.map((e) => (
            <li key={e.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium text-ink-900">{e.title}</p>
                <p className="text-xs text-ink-400">
                  {e.category} · {formatDate(e.date)}
                </p>
                {e.notes && <p className="mt-1 text-sm text-ink-600">{e.notes}</p>}
              </div>
              <div className="flex items-center gap-3">
                <p className="font-semibold text-ink-900">{INR.format(e.amount)}</p>
                <button
                  type="button"
                  className="btn-ghost p-1.5 text-danger"
                  onClick={() => removeExpense(e.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Modal open={open} title="Add expense" onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
              <label className="label">Amount (₹)</label>
              <input
                type="number"
                className="input"
                value={amount}
                min={0}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input min-h-[60px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
