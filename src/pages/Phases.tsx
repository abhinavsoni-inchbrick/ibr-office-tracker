import { Link } from 'react-router-dom'
import { ProgressBar } from '../components/ProgressBar'
import { useStore } from '../store/useStore'

export function Phases() {
  const phases = useStore((s) => s.phases)
  const tasks = useStore((s) => s.tasks)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="section-title">Project Phases</h1>
        <p className="mt-1 text-sm text-ink-400">
          Twelve predefined stages for the office development
        </p>
      </div>

      <div className="space-y-3">
        {phases.map((phase) => {
          const phaseTasks = tasks.filter((t) => t.phaseId === phase.id)
          const done = phaseTasks.filter((t) => t.status === 'completed').length
          const total = phaseTasks.length
          const pct = total === 0 ? 0 : Math.round((done / total) * 100)
          const inProgress = phaseTasks.filter((t) => t.status === 'in_progress').length

          return (
            <div key={phase.id} className="card p-5">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
                    Phase {phase.order}
                  </p>
                  <h2 className="font-display text-lg font-semibold text-ink-900">
                    {phase.name}
                  </h2>
                </div>
                <div className="text-right text-sm text-ink-500">
                  <p>
                    <span className="font-semibold text-ink-900">{done}</span> / {total}{' '}
                    complete
                  </p>
                  {inProgress > 0 && (
                    <p className="text-sky-700">{inProgress} in progress</p>
                  )}
                </div>
              </div>
              <ProgressBar value={pct} />
              <div className="mt-3 flex justify-between text-xs text-ink-400">
                <span>{pct}%</span>
                <Link
                  to={`/tasks`}
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
