import type { Task, TaskStatus, Priority } from '../types'

export function uid(prefix = 'id'): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''))
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isOverdue(task: Task): boolean {
  if (task.status === 'completed' || !task.dueDate) return false
  const due = new Date(task.dueDate + 'T23:59:59')
  return due.getTime() < Date.now()
}

export function daysUntil(dueDate: string): number {
  const due = new Date(dueDate + 'T23:59:59')
  return Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export function statusLabel(s: TaskStatus): string {
  if (s === 'in_progress') return 'In progress'
  if (s === 'completed') return 'Completed'
  return 'Pending'
}

export function priorityLabel(p: Priority): string {
  return p.charAt(0).toUpperCase() + p.slice(1)
}

export function statusClass(s: TaskStatus): string {
  if (s === 'completed') return 'bg-accent-soft text-accent'
  if (s === 'in_progress') return 'bg-sky-50 text-sky-800'
  return 'bg-ink-100 text-ink-700'
}

export function priorityClass(p: Priority): string {
  if (p === 'high') return 'bg-danger-soft text-danger'
  if (p === 'medium') return 'bg-warn-soft text-warn'
  return 'bg-ink-100 text-ink-600'
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export const MAX_ATTACHMENT_BYTES = 1.5 * 1024 * 1024

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}
