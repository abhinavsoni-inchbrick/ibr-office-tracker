import { CheckCircle2, Lock, Unlock } from 'lucide-react'
import { LAYOUT_OPTIONS } from '../data/layoutFinalization'
import { formatDateTime } from '../lib/utils'
import { useStore } from '../store/useStore'
import type { LayoutOptionId } from '../types'

export function LayoutFinalizationPanel() {
  const layout = useStore(
    (s) => s.layoutFinalization ?? {
      selectedOption: null,
      notes: '',
      checklist: [],
      finalized: false,
      finalizedAt: null,
      finalizedByName: null,
    },
  )
  const setLayoutOption = useStore((s) => s.setLayoutOption)
  const setLayoutNotes = useStore((s) => s.setLayoutNotes)
  const toggleLayoutChecklist = useStore((s) => s.toggleLayoutChecklist)
  const finalizeLayout = useStore((s) => s.finalizeLayout)
  const reopenLayout = useStore((s) => s.reopenLayout)
  const isAdmin = useStore((s) => s.isAdmin())

  const allChecked = layout.checklist.length > 0 && layout.checklist.every((c) => c.done)
  const canFinalize = !!layout.selectedOption && allChecked && !layout.finalized
  const selected = LAYOUT_OPTIONS.find((o) => o.id === layout.selectedOption)

  const onFinalize = () => {
    const ok = finalizeLayout()
    if (!ok) {
      alert('Select a layout and complete every checklist item before finalizing.')
    }
  }

  return (
    <section className="card overflow-hidden border-accent/20">
      <div className="border-b border-ink-100 bg-accent-soft/50 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-accent">
              Phase 1 · start here
            </p>
            <h2 className="font-display text-lg font-semibold text-ink-900">
              Layout Plan Finalization
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-ink-600">
              Enter the layout you made in the CAD planner, verify it against the
              checklist, then lock it before 3D / drawings / BOQ work begins.
            </p>
          </div>
          {layout.finalized ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white">
              <Lock size={14} />
              Finalized
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-warn-soft px-3 py-1.5 text-xs font-medium text-warn">
              <Unlock size={14} />
              Not finalized
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6 p-5">
        <div>
          <p className="label">1. Select the layout to verify</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            {LAYOUT_OPTIONS.map((opt) => {
              const active = layout.selectedOption === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={layout.finalized}
                  onClick={() => setLayoutOption(opt.id as LayoutOptionId)}
                  className={`rounded-lg border p-4 text-left transition-colors disabled:opacity-70 ${
                    active
                      ? 'border-accent bg-accent-soft ring-1 ring-accent'
                      : 'border-ink-100 bg-white hover:border-ink-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display font-semibold text-ink-900">{opt.name}</p>
                    {opt.recommended && (
                      <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-ink-500">{opt.focus}</p>
                  <p className="mt-2 font-mono text-[11px] text-ink-400">{opt.sourceFile}</p>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="label">2. Verification checklist</p>
          <ul className="mt-2 space-y-2">
            {layout.checklist.map((item) => (
              <li key={item.id}>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm ${
                    item.done
                      ? 'border-accent/30 bg-accent-soft/40 text-ink-800'
                      : 'border-ink-100 bg-white text-ink-700'
                  } ${layout.finalized ? 'cursor-default' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={item.done}
                    disabled={layout.finalized}
                    onChange={() => toggleLayoutChecklist(item.id)}
                  />
                  <span>{item.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label className="label" htmlFor="layout-notes">
            3. Verification notes / decisions
          </label>
          <textarea
            id="layout-notes"
            className="input mt-1 min-h-[96px]"
            placeholder="Record site measures, stakeholder comments, accepted warn flags, roof decision…"
            value={layout.notes}
            disabled={layout.finalized}
            onChange={(e) => setLayoutNotes(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
          <div className="text-sm text-ink-500">
            {layout.finalized ? (
              <p className="flex items-center gap-2 text-accent">
                <CheckCircle2 size={16} />
                Locked as <strong className="text-ink-900">{selected?.name}</strong>
                {layout.finalizedByName
                  ? ` by ${layout.finalizedByName}`
                  : ''}
                {layout.finalizedAt ? ` · ${formatDateTime(layout.finalizedAt)}` : ''}
              </p>
            ) : (
              <p>
                {layout.selectedOption
                  ? `Selected: ${selected?.name}`
                  : 'No layout selected yet'}
                {' · '}
                {layout.checklist.filter((c) => c.done).length}/
                {layout.checklist.length} checks done
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {layout.finalized ? (
              isAdmin && (
                <button type="button" className="btn-secondary" onClick={reopenLayout}>
                  Reopen for edits
                </button>
              )
            ) : (
              <button
                type="button"
                className="btn-primary"
                disabled={!canFinalize}
                onClick={onFinalize}
              >
                Finalize layout plan
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
