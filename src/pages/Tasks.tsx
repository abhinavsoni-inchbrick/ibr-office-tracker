import { Paperclip, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Modal } from '../components/Modal'
import { TaskForm } from '../components/TaskForm'
import {
  MAX_ATTACHMENT_BYTES,
  fileToDataUrl,
  formatBytes,
  formatDate,
  formatDateTime,
  isOverdue,
  priorityClass,
  priorityLabel,
  statusClass,
  statusLabel,
  uid,
} from '../lib/utils'
import { useStore } from '../store/useStore'
import type { Priority, Task, TaskStatus } from '../types'

export function Tasks() {
  const tasks = useStore((s) => s.tasks)
  const phases = useStore((s) => s.phases)
  const team = useStore((s) => s.team)
  const deleteTask = useStore((s) => s.deleteTask)
  const addComment = useStore((s) => s.addComment)
  const addTaskAttachment = useStore((s) => s.addTaskAttachment)
  const removeTaskAttachment = useStore((s) => s.removeTaskAttachment)
  const updateTask = useStore((s) => s.updateTask)

  const location = useLocation()
  const initialPhase =
    (location.state as { phaseId?: string } | null)?.phaseId ?? 'all'

  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const [phaseFilter, setPhaseFilter] = useState(initialPhase)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [detail, setDetail] = useState<Task | null>(null)
  const [comment, setComment] = useState('')

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
      if (phaseFilter !== 'all' && t.phaseId !== phaseFilter) return false
      return true
    })
  }, [tasks, statusFilter, priorityFilter, phaseFilter])

  const liveDetail = detail ? tasks.find((t) => t.id === detail.id) ?? null : null

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (t: Task) => {
    setEditing(t)
    setFormOpen(true)
  }

  const onAttach = async (taskId: string, file: File | null) => {
    if (!file) return
    if (file.size > MAX_ATTACHMENT_BYTES) {
      alert(`File too large. Max ${formatBytes(MAX_ATTACHMENT_BYTES)}.`)
      return
    }
    const dataUrl = await fileToDataUrl(file)
    addTaskAttachment(taskId, {
      id: uid('att'),
      name: file.name,
      dataUrl,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">All Tasks</h1>
          <p className="mt-1 text-sm text-ink-400">{filtered.length} shown</p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreate}>
          <Plus size={16} />
          Add task
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          className="input w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          className="input w-auto"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
        >
          <option value="all">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          className="input w-auto max-w-xs"
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value)}
        >
          <option value="all">All phases</option>
          {phases.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-ink-100 bg-ink-100/40 text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-4 py-3 font-medium">Task</th>
                <th className="px-4 py-3 font-medium">Phase</th>
                <th className="px-4 py-3 font-medium">Assignee</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Due</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-ink-400">
                    No tasks match these filters.
                  </td>
                </tr>
              )}
              {filtered.map((t) => {
                const phase = phases.find((p) => p.id === t.phaseId)
                const member = team.find((m) => m.id === t.assigneeId)
                return (
                  <tr key={t.id} className="hover:bg-ink-100/30">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="text-left font-medium text-ink-900 hover:text-accent"
                        onClick={() => setDetail(t)}
                      >
                        {t.title}
                      </button>
                      {isOverdue(t) && (
                        <span className="ml-2 text-xs font-medium text-danger">Overdue</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-600">{phase?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-600">{member?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs ${priorityClass(t.priority)}`}>
                        {priorityLabel(t.priority)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className={`rounded border-0 px-2 py-1 text-xs ${statusClass(t.status)}`}
                        value={t.status}
                        onChange={(e) =>
                          updateTask(t.id, { status: e.target.value as TaskStatus })
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{formatDate(t.dueDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          className="btn-ghost p-1.5"
                          onClick={() => openEdit(t)}
                          aria-label="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-ghost p-1.5 text-danger"
                          onClick={() => {
                            if (confirm('Delete this task?')) deleteTask(t.id)
                          }}
                          aria-label="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={formOpen}
        title={editing ? 'Edit task' : 'Add task'}
        onClose={() => setFormOpen(false)}
        wide
      >
        <TaskForm initial={editing} onDone={() => setFormOpen(false)} />
      </Modal>

      <Modal
        open={!!liveDetail}
        title={liveDetail?.title ?? 'Task'}
        onClose={() => {
          setDetail(null)
          setComment('')
        }}
        wide
      >
        {liveDetail && (
          <div className="space-y-5">
            <p className="text-sm text-ink-600 whitespace-pre-wrap">
              {liveDetail.description || 'No description.'}
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className={`rounded px-2 py-1 ${statusClass(liveDetail.status)}`}>
                {statusLabel(liveDetail.status)}
              </span>
              <span className={`rounded px-2 py-1 ${priorityClass(liveDetail.priority)}`}>
                {priorityLabel(liveDetail.priority)}
              </span>
              <span className="rounded bg-ink-100 px-2 py-1 text-ink-600">
                Due {formatDate(liveDetail.dueDate)}
              </span>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold">Attachments</h3>
              <ul className="mb-2 space-y-1">
                {liveDetail.attachments.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-2 rounded-md bg-ink-100/50 px-3 py-2 text-sm"
                  >
                    <a
                      href={a.dataUrl}
                      download={a.name}
                      className="flex items-center gap-2 text-accent hover:underline"
                    >
                      <Paperclip size={14} />
                      {a.name}
                      <span className="text-ink-400">({formatBytes(a.size)})</span>
                    </a>
                    <button
                      type="button"
                      className="text-danger"
                      onClick={() => removeTaskAttachment(liveDetail.id, a.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
              <label className="btn-secondary cursor-pointer text-xs">
                <Paperclip size={14} />
                Add file
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    void onAttach(liveDetail.id, e.target.files?.[0] ?? null)
                    e.target.value = ''
                  }}
                />
              </label>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold">Comments</h3>
              <ul className="mb-3 max-h-48 space-y-2 overflow-y-auto">
                {liveDetail.comments.length === 0 && (
                  <li className="text-sm text-ink-400">No comments yet.</li>
                )}
                {liveDetail.comments.map((c) => {
                  const author = team.find((m) => m.id === c.authorId)
                  return (
                    <li key={c.id} className="rounded-md bg-ink-100/40 px-3 py-2 text-sm">
                      <p className="font-medium text-ink-800">{author?.name ?? 'Unknown'}</p>
                      <p className="text-ink-700">{c.text}</p>
                      <p className="text-xs text-ink-400">{formatDateTime(c.createdAt)}</p>
                    </li>
                  )
                })}
              </ul>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!comment.trim()) return
                  addComment(liveDetail.id, comment.trim())
                  setComment('')
                }}
              >
                <input
                  className="input"
                  placeholder="Add a comment…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button type="submit" className="btn-primary shrink-0">
                  Post
                </button>
              </form>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
