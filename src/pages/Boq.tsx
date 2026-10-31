import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '../components/Modal'
import { useStore } from '../store/useStore'
import type { BoqStatus } from '../types'

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function Boq() {
  const items = useStore((s) => s.boqItems)
  const addBoq = useStore((s) => s.addBoq)
  const updateBoq = useStore((s) => s.updateBoq)
  const removeBoq = useStore((s) => s.removeBoq)

  const [open, setOpen] = useState(false)
  const [item, setItem] = useState('')
  const [qty, setQty] = useState(1)
  const [unit, setUnit] = useState('nos')
  const [rate, setRate] = useState(0)
  const [vendor, setVendor] = useState('')
  const [status, setStatus] = useState<BoqStatus>('planned')

  const total = items.reduce((sum, b) => sum + b.qty * b.rate, 0)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!item.trim()) return
    addBoq({ item: item.trim(), qty, unit, rate, vendor: vendor.trim(), status })
    setItem('')
    setQty(1)
    setUnit('nos')
    setRate(0)
    setVendor('')
    setStatus('planned')
    setOpen(false)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">BOQ & Purchases</h1>
          <p className="mt-1 text-sm text-ink-400">
            Bill of quantities — estimated total {INR.format(total)}
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setOpen(true)}>
          <Plus size={16} />
          Add item
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-ink-100 bg-ink-100/40 text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Unit</th>
                <th className="px-4 py-3 font-medium">Rate</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {items.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-ink-400">
                    No BOQ items yet.
                  </td>
                </tr>
              )}
              {items.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-2">
                    <input
                      className="input border-0 bg-transparent px-0"
                      value={b.item}
                      onChange={(e) => updateBoq(b.id, { item: e.target.value })}
                    />
                  </td>
                  <td className="px-4 py-2 w-20">
                    <input
                      type="number"
                      className="input border-0 bg-transparent px-0"
                      value={b.qty}
                      min={0}
                      onChange={(e) => updateBoq(b.id, { qty: Number(e.target.value) })}
                    />
                  </td>
                  <td className="px-4 py-2 w-20">
                    <input
                      className="input border-0 bg-transparent px-0"
                      value={b.unit}
                      onChange={(e) => updateBoq(b.id, { unit: e.target.value })}
                    />
                  </td>
                  <td className="px-4 py-2 w-28">
                    <input
                      type="number"
                      className="input border-0 bg-transparent px-0"
                      value={b.rate}
                      min={0}
                      onChange={(e) => updateBoq(b.id, { rate: Number(e.target.value) })}
                    />
                  </td>
                  <td className="px-4 py-2 text-ink-700">{INR.format(b.qty * b.rate)}</td>
                  <td className="px-4 py-2">
                    <input
                      className="input border-0 bg-transparent px-0"
                      value={b.vendor}
                      onChange={(e) => updateBoq(b.id, { vendor: e.target.value })}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      className="input w-auto border-0 bg-transparent px-0 text-xs"
                      value={b.status}
                      onChange={(e) =>
                        updateBoq(b.id, { status: e.target.value as BoqStatus })
                      }
                    >
                      <option value="planned">Planned</option>
                      <option value="ordered">Ordered</option>
                      <option value="received">Received</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      className="btn-ghost p-1.5 text-danger"
                      onClick={() => removeBoq(b.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {items.length > 0 && (
              <tfoot>
                <tr className="border-t border-ink-100 bg-ink-100/30">
                  <td colSpan={4} className="px-4 py-3 text-right text-sm font-medium">
                    Total
                  </td>
                  <td className="px-4 py-3 font-semibold">{INR.format(total)}</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <Modal open={open} title="Add BOQ item" onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Item</label>
            <input
              className="input"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Qty</label>
              <input
                type="number"
                className="input"
                value={qty}
                min={0}
                onChange={(e) => setQty(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">Unit</label>
              <input className="input" value={unit} onChange={(e) => setUnit(e.target.value)} />
            </div>
            <div>
              <label className="label">Rate (₹)</label>
              <input
                type="number"
                className="input"
                value={rate}
                min={0}
                onChange={(e) => setRate(Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <label className="label">Vendor</label>
            <input className="input" value={vendor} onChange={(e) => setVendor(e.target.value)} />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value as BoqStatus)}
            >
              <option value="planned">Planned</option>
              <option value="ordered">Ordered</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
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
