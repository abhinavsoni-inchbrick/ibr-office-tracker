import { AlertCircle, CheckCircle2, CircleDashed, Clock3, ListTodo } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProgressBar } from '../components/ProgressBar'
import { useStore } from '../store/useStore'
import {
  daysUntil,
  formatDate,
  formatDateTime,
  isOverdue,
  statusClass,
  statusLabel,
} from '../lib/utils'

export function Dashboard() {
  const tasks = useStore((s) => s.tasks)
  const team = useStore((s) => s.team)
  const activity = useStore((s) => s.activity)
  const phases = useStore((s) => s.phases)

  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'completed').length
  const pending = tasks.filter((t) => t.status === 'pending').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const overdue = tasks.filter(isOverdue).length
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100)

  const upcoming = [...tasks]
    .filter((t) => t.status !== 'completed' && t.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 6)

  const recent = activity.slice(0, 8)

  const stats = [
    { label: 'Total tasks', value: total, icon: ListTodo, tone: 'text-ink-800' },
    { label: 'Completed', value: completed, icon: CheckCircle2, tone: 'text-accent' },
    { label: 'Pending', value: pending, icon: CircleDashed, tone: 'text-ink-600' },
    { label: 'In progress', value: inProgress, icon: Clock3, tone: 'text-sky-700' },
    { label: 'Overdue', value: overdue, icon: AlertCircle, tone: 'text-danger' },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="section-title">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-400">
          Office fit-out progress across {phases.length} phases
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card px-4 py-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
                {label}
              </p>
              <Icon size={16} className={tone} strokeWidth={1.75} />
            </div>
            <p className={`mt-2 font-display text-3xl font-semibold ${tone}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-ink-900">
              Overall project progress
            </h2>
            <p className="text-sm text-ink-400">
              {completed} of {total} tasks complete
            </p>
          </div>
          <p className="font-display text-2xl font-semibold text-accent">{pct}%</p>
        </div>
        <ProgressBar value={pct} className="h-3" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Upcoming deadlines</h2>
            <Link to="/tasks" className="text-xs font-medium text-accent hover:underline">
              View all
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-ink-400">No upcoming deadlines.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {upcoming.map((t) => {
                const days = daysUntil(t.dueDate)
                const late = isOverdue(t)
                const member = team.find((m) => m.id === t.assigneeId)
                return (
                  <li key={t.id} className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-900">{t.title}</p>
                      <p className="text-xs text-ink-400">
                        {member?.name ?? 'Unassigned'} · {formatDate(t.dueDate)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-medium ${
                        late ? 'text-danger' : days <= 3 ? 'text-warn' : 'text-ink-400'
                      }`}
                    >
                      {late ? 'Overdue' : days === 0 ? 'Today' : `${days}d`}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Recent activity</h2>
            <Link to="/activity" className="text-xs font-medium text-accent hover:underline">
              Full log
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-ink-400">No activity yet.</p>
          ) : (
            <ul className="space-y-3">
              {recent.map((a) => (
                <li key={a.id} className="flex gap-3 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <div>
                    <p className="text-ink-800">
                      <span className="font-medium">{a.actorName}</span> — {a.message}
                    </p>
                    <p className="text-xs text-ink-400">{formatDateTime(a.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card p-5">
        <h2 className="mb-4 font-display text-base font-semibold">Tasks by status</h2>
        <div className="flex flex-wrap gap-3">
          {(
            [
              ['pending', pending],
              ['in_progress', inProgress],
              ['completed', completed],
            ] as const
          ).map(([status, count]) => (
            <div
              key={status}
              className={`rounded-md px-3 py-2 text-sm ${statusClass(status)}`}
            >
              {statusLabel(status)}: <strong>{count}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
