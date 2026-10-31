import { formatDateTime } from '../lib/utils'
import { useStore } from '../store/useStore'

export function Activity() {
  const activity = useStore((s) => s.activity)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="section-title">Activity Log</h1>
        <p className="mt-1 text-sm text-ink-400">
          Recent changes on this device ({activity.length})
        </p>
      </div>

      <div className="card">
        {activity.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-ink-400">No activity yet.</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {activity.map((a) => (
              <li key={a.id} className="flex gap-4 px-5 py-4">
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                <div className="min-w-0">
                  <p className="text-sm text-ink-800">
                    <span className="font-medium">{a.actorName}</span>
                    <span className="text-ink-400"> — </span>
                    {a.message}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-400">
                    {formatDateTime(a.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
