import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LayoutFinalizationPanel } from '../components/LayoutFinalizationPanel'
import { ProgressBar } from '../components/ProgressBar'
import { useStore } from '../store/useStore'

export function Phases() {
  const phases = useStore((s) => s.phases)
  const tasks = useStore((s) => s.tasks)
  const layout = useStore((s) => s.layoutFinalization)
  const ensureLayoutSeed = useStore((s) => s.ensureLayoutSeed)

  useEffect(() => {
    ensureLayoutSeed()
  }, [ensureLayoutSeed])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="section-title">Project Phases</h1>
        <p className="mt-1 text-sm text-ink-400">
          Twelve predefined stages for the office development — begin by verifying
          your CAD layout
        </p>
      </div>

      <LayoutFinalizationPanel />

      <div className="space-y-3">
        {phases.map((phase) => {
          const isLayoutPhase = phase.id === 'phase-1'
          const phaseTasks = tasks.filter((t) => t.phaseId === phase.id)
          const checklist = layout?.checklist ?? []
          const checksDone = checklist.filter((c) => c.done).length
          const checksTotal = checklist.length

          // Phase 1 progress = checklist (+ finalized bonus) so it never stays 0/0
          let done = phaseTasks.filter((t) => t.status === 'completed').length
          let total = phaseTasks.length
          let pct = total === 0 ? 0 : Math.round((done / total) * 100)
          let subtitle = `${done} / ${total} tasks complete`

          if (isLayoutPhase) {
            done = checksDone
            total = Math.max(checksTotal, 1)
            pct = layout?.finalized
              ? 100
              : Math.round((checksDone / Math.max(checksTotal, 1)) * 100)
            subtitle = layout?.finalized
              ? `${checksTotal} / ${checksTotal} checks · finalized`
              : `${checksDone} / ${checksTotal} checks complete`
          }

          const inProgress = phaseTasks.filter((t) => t.status === 'in_progress').length

          return (
            <div
              key={phase.id}
              className={`card p-5 ${isLayoutPhase && !layout?.finalized ? 'ring-1 ring-warn/40' : ''}`}
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
                    Phase {phase.order}
                    {isLayoutPhase && !layout?.finalized && (
                      <span className="ml-2 text-warn">Action needed</span>
                    )}
                    {isLayoutPhase && layout?.finalized && (
                      <span className="ml-2 text-accent">Layout locked</span>
                    )}
                  </p>
                  <h2 className="font-display text-lg font-semibold text-ink-900">
                    {phase.name}
                  </h2>
                </div>
                <div className="text-right text-sm text-ink-500">
                  <p>
                    <span className="font-semibold text-ink-900">
                      {isLayoutPhase ? checksDone : done}
                    </span>{' '}
                    / {isLayoutPhase ? checksTotal : total}{' '}
                    {isLayoutPhase ? 'checks' : 'complete'}
                  </p>
                  {!isLayoutPhase && inProgress > 0 && (
                    <p className="text-sky-700">{inProgress} in progress</p>
                  )}
                  {isLayoutPhase && (
                    <p className="text-xs text-ink-400">
                      {phaseTasks.length} linked tasks
                    </p>
                  )}
                </div>
              </div>
              <ProgressBar value={pct} />
              <div className="mt-3 flex justify-between text-xs text-ink-400">
                <span>
                  {pct}% · {subtitle}
                </span>
                <Link
                  to="/tasks"
                  className="font-medium text-accent hover:underline"
                  state={{ phaseId: phase.id }}
                >
                  View tasks
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
