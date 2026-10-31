import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  createEmptyLayoutFinalization,
  createLayoutPhaseTasks,
} from '../data/layoutFinalization'
import { createSeedPhases } from '../data/phases'
import { uid } from '../lib/utils'
import type {
  ActivityEntry,
  AppState,
  Attachment,
  BoqItem,
  Comment,
  DesignFile,
  Expense,
  LayoutFinalization,
  LayoutOptionId,
  Task,
  TeamMember,
  TrackerData,
} from '../types'

const DATA_VERSION = 2

type PartialTask = Omit<
  Task,
  'id' | 'comments' | 'attachments' | 'createdAt' | 'updatedAt'
>

interface Actions {
  login: (userId: string) => void
  logout: () => void
  setAdminPin: (pin: string) => void
  verifyAdminPin: (pin: string) => boolean

  addTeamMember: (member: Omit<TeamMember, 'id'>) => void
  updateTeamMember: (id: string, patch: Partial<TeamMember>) => void
  removeTeamMember: (id: string) => void

  addTask: (input: PartialTask) => string
  updateTask: (id: string, patch: Partial<PartialTask>) => void
  deleteTask: (id: string) => void
  addComment: (taskId: string, text: string) => void
  addTaskAttachment: (taskId: string, file: Attachment) => void
  removeTaskAttachment: (taskId: string, attachmentId: string) => void

  addFile: (file: Omit<DesignFile, 'id'>) => void
  updateFile: (id: string, patch: Partial<DesignFile>) => void
  removeFile: (id: string) => void

  addBoq: (item: Omit<BoqItem, 'id'>) => void
  updateBoq: (id: string, patch: Partial<BoqItem>) => void
  removeBoq: (id: string) => void

  addExpense: (item: Omit<Expense, 'id'>) => void
  updateExpense: (id: string, patch: Partial<Expense>) => void
  removeExpense: (id: string) => void

  log: (message: string) => void
  exportData: () => TrackerData
  importData: (data: TrackerData) => void
  clearAllData: () => void

  ensureLayoutSeed: () => void
  setLayoutOption: (option: LayoutOptionId | null) => void
  setLayoutNotes: (notes: string) => void
  toggleLayoutChecklist: (id: string) => void
  finalizeLayout: () => boolean
  reopenLayout: () => void

  currentUser: () => TeamMember | null
  isAdmin: () => boolean
}

function emptyData(): TrackerData {
  return {
    phases: createSeedPhases(),
    tasks: createLayoutPhaseTasks().map((t) => {
      const now = new Date().toISOString()
      return {
        ...t,
        id: uid('task'),
        comments: [],
        attachments: [],
        createdAt: now,
        updatedAt: now,
      }
    }),
    team: [],
    files: [],
    boqItems: [],
    expenses: [],
    activity: [],
    layoutFinalization: createEmptyLayoutFinalization(),
    adminPin: '',
    version: DATA_VERSION,
  }
}

function actor(get: () => AppState & Actions): { id: string | null; name: string } {
  const user = get().currentUser()
  return { id: user?.id ?? null, name: user?.name ?? 'System' }
}

export const useStore = create<AppState & Actions>()(
  persist(
    (set, get) => ({
      ...emptyData(),
      currentUserId: null,

      currentUser: () => {
        const { team, currentUserId } = get()
        return team.find((m) => m.id === currentUserId) ?? null
      },

      isAdmin: () => get().currentUser()?.role === 'admin',

      login: (userId) => {
        set({ currentUserId: userId })
        get().ensureLayoutSeed()
        const user = get().team.find((m) => m.id === userId)
        if (user) {
          get().log(`${user.name} signed in`)
        }
      },

      ensureLayoutSeed: () => {
        const s = get()
        const hasPhase1 = s.tasks.some((t) => t.phaseId === 'phase-1')
        const layout = s.layoutFinalization ?? createEmptyLayoutFinalization()
        if (hasPhase1 && s.layoutFinalization) return
        const now = new Date().toISOString()
        const seeded = hasPhase1
          ? []
          : createLayoutPhaseTasks().map((t) => ({
              ...t,
              id: uid('task'),
              comments: [],
              attachments: [],
              createdAt: now,
              updatedAt: now,
            }))
        set({
          layoutFinalization: layout,
          tasks: seeded.length ? [...seeded, ...s.tasks] : s.tasks,
          version: DATA_VERSION,
        })
      },

      setLayoutOption: (option) => {
        set((s) => ({
          layoutFinalization: {
            ...(s.layoutFinalization ?? createEmptyLayoutFinalization()),
            selectedOption: option,
            finalized: false,
            finalizedAt: null,
            finalizedByName: null,
          },
        }))
        if (option) get().log(`Selected layout option: ${option}`)
      },

      setLayoutNotes: (notes) => {
        set((s) => ({
          layoutFinalization: {
            ...(s.layoutFinalization ?? createEmptyLayoutFinalization()),
            notes,
          },
        }))
      },

      toggleLayoutChecklist: (id) => {
        set((s) => {
          const base = s.layoutFinalization ?? createEmptyLayoutFinalization()
          return {
            layoutFinalization: {
              ...base,
              checklist: base.checklist.map((c) =>
                c.id === id ? { ...c, done: !c.done } : c,
              ),
              finalized: false,
              finalizedAt: null,
              finalizedByName: null,
            },
          }
        })
      },

      finalizeLayout: () => {
        const layout = get().layoutFinalization ?? createEmptyLayoutFinalization()
        if (!layout.selectedOption) return false
        if (!layout.checklist.every((c) => c.done)) return false
        const user = get().currentUser()
        set({
          layoutFinalization: {
            ...layout,
            finalized: true,
            finalizedAt: new Date().toISOString(),
            finalizedByName: user?.name ?? 'Unknown',
          },
        })
        // Mark phase-1 finalize task complete when present
        get().tasks
          .filter(
            (t) =>
              t.phaseId === 'phase-1' &&
              t.title.toLowerCase().includes('finalize layout'),
          )
          .forEach((t) => get().updateTask(t.id, { status: 'completed' }))
        get().log(
          `Layout plan finalized: ${layout.selectedOption.replace('_', '-')}`,
        )
        return true
      },

      reopenLayout: () => {
        set((s) => ({
          layoutFinalization: {
            ...(s.layoutFinalization ?? createEmptyLayoutFinalization()),
            finalized: false,
            finalizedAt: null,
            finalizedByName: null,
          },
        }))
        get().log('Layout plan reopened for edits')
      },

      logout: () => {
        const user = get().currentUser()
        if (user) get().log(`${user.name} signed out`)
        set({ currentUserId: null })
      },

      setAdminPin: (pin) => set({ adminPin: pin }),

      verifyAdminPin: (pin) => {
        const stored = get().adminPin
        if (!stored) return true
        return stored === pin
      },

      log: (message) => {
        const a = actor(get)
        const entry: ActivityEntry = {
          id: uid('act'),
          actorId: a.id,
          actorName: a.name,
          message,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({
          activity: [entry, ...s.activity].slice(0, 300),
        }))
      },

      addTeamMember: (member) => {
        const id = uid('user')
        set((s) => ({ team: [...s.team, { ...member, id }] }))
        get().log(`Added team member: ${member.name}`)
      },

      updateTeamMember: (id, patch) => {
        set((s) => ({
          team: s.team.map((m) => (m.id === id ? { ...m, ...patch, id: m.id } : m)),
        }))
        get().log(`Updated team member`)
      },

      removeTeamMember: (id) => {
        const m = get().team.find((t) => t.id === id)
        set((s) => ({
          team: s.team.filter((t) => t.id !== id),
          currentUserId: s.currentUserId === id ? null : s.currentUserId,
          tasks: s.tasks.map((t) =>
            t.assigneeId === id ? { ...t, assigneeId: null } : t,
          ),
        }))
        if (m) get().log(`Removed team member: ${m.name}`)
      },

      addTask: (input) => {
        const id = uid('task')
        const now = new Date().toISOString()
        const task: Task = {
          ...input,
          id,
          comments: [],
          attachments: [],
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({ tasks: [task, ...s.tasks] }))
        get().log(`Created task: ${task.title}`)
        return id
      },

      updateTask: (id, patch) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, ...patch, id: t.id, updatedAt: new Date().toISOString() }
              : t,
          ),
        }))
        const t = get().tasks.find((x) => x.id === id)
        if (t) get().log(`Updated task: ${t.title}`)
      },

      deleteTask: (id) => {
        const t = get().tasks.find((x) => x.id === id)
        set((s) => ({ tasks: s.tasks.filter((x) => x.id !== id) }))
        if (t) get().log(`Deleted task: ${t.title}`)
      },

      addComment: (taskId, text) => {
        const user = get().currentUser()
        if (!user) return
        const comment: Comment = {
          id: uid('cmt'),
          authorId: user.id,
          text,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  comments: [...t.comments, comment],
                  updatedAt: new Date().toISOString(),
                }
              : t,
          ),
        }))
        get().log(`Commented on a task`)
      },

      addTaskAttachment: (taskId, file) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  attachments: [...t.attachments, file],
                  updatedAt: new Date().toISOString(),
                }
              : t,
          ),
        }))
        get().log(`Attached file: ${file.name}`)
      },

      removeTaskAttachment: (taskId, attachmentId) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  attachments: t.attachments.filter((a) => a.id !== attachmentId),
                  updatedAt: new Date().toISOString(),
                }
              : t,
          ),
        }))
        get().log(`Removed a task attachment`)
      },

      addFile: (file) => {
        const id = uid('file')
        set((s) => ({ files: [{ ...file, id }, ...s.files] }))
        get().log(`Uploaded design file: ${file.name}`)
      },

      updateFile: (id, patch) => {
        set((s) => ({
          files: s.files.map((f) => (f.id === id ? { ...f, ...patch, id: f.id } : f)),
        }))
      },

      removeFile: (id) => {
        const f = get().files.find((x) => x.id === id)
        set((s) => ({ files: s.files.filter((x) => x.id !== id) }))
        if (f) get().log(`Removed design file: ${f.name}`)
      },

      addBoq: (item) => {
        const id = uid('boq')
        set((s) => ({ boqItems: [...s.boqItems, { ...item, id }] }))
        get().log(`Added BOQ item: ${item.item}`)
      },

      updateBoq: (id, patch) => {
        set((s) => ({
          boqItems: s.boqItems.map((b) =>
            b.id === id ? { ...b, ...patch, id: b.id } : b,
          ),
        }))
      },

      removeBoq: (id) => {
        const b = get().boqItems.find((x) => x.id === id)
        set((s) => ({ boqItems: s.boqItems.filter((x) => x.id !== id) }))
        if (b) get().log(`Removed BOQ item: ${b.item}`)
      },

      addExpense: (item) => {
        const id = uid('exp')
        set((s) => ({ expenses: [{ ...item, id }, ...s.expenses] }))
        get().log(`Logged expense: ${item.title}`)
      },

      updateExpense: (id, patch) => {
        set((s) => ({
          expenses: s.expenses.map((e) =>
            e.id === id ? { ...e, ...patch, id: e.id } : e,
          ),
        }))
      },

      removeExpense: (id) => {
        const e = get().expenses.find((x) => x.id === id)
        set((s) => ({ expenses: s.expenses.filter((x) => x.id !== id) }))
        if (e) get().log(`Removed expense: ${e.title}`)
      },

      exportData: () => {
        const s = get()
        return {
          phases: s.phases,
          tasks: s.tasks,
          team: s.team,
          files: s.files,
          boqItems: s.boqItems,
          expenses: s.expenses,
          activity: s.activity,
          layoutFinalization:
            s.layoutFinalization ?? createEmptyLayoutFinalization(),
          adminPin: s.adminPin,
          version: DATA_VERSION,
        }
      },

      importData: (data) => {
        const phases =
          data.phases?.length >= 12 ? data.phases : createSeedPhases()
        const imported = data as TrackerData & {
          layoutFinalization?: LayoutFinalization
        }
        set({
          phases,
          tasks: data.tasks ?? [],
          team: data.team ?? [],
          files: data.files ?? [],
          boqItems: data.boqItems ?? [],
          expenses: data.expenses ?? [],
          activity: data.activity ?? [],
          layoutFinalization:
            imported.layoutFinalization ?? createEmptyLayoutFinalization(),
          adminPin: data.adminPin ?? '',
          version: DATA_VERSION,
          currentUserId: null,
        })
        get().log('Imported project data snapshot')
      },

      clearAllData: () => {
        set({ ...emptyData(), currentUserId: null })
      },
    }),
    {
      name: 'ibr-office-tracker',
      partialize: (s) => ({
        phases: s.phases,
        tasks: s.tasks,
        team: s.team,
        files: s.files,
        boqItems: s.boqItems,
        expenses: s.expenses,
        activity: s.activity,
        layoutFinalization: s.layoutFinalization,
        adminPin: s.adminPin,
        version: s.version,
        currentUserId: s.currentUserId,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>
        return {
          ...current,
          ...p,
          layoutFinalization:
            p.layoutFinalization ?? createEmptyLayoutFinalization(),
          phases: p.phases?.length ? p.phases : current.phases,
          version: DATA_VERSION,
        }
      },
    },
  ),
)
