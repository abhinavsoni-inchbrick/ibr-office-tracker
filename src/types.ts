export type Role = 'admin' | 'member'
export type Priority = 'low' | 'medium' | 'high'
export type TaskStatus = 'pending' | 'in_progress' | 'completed'
export type BoqStatus = 'planned' | 'ordered' | 'received' | 'cancelled'
export type LayoutOptionId = 'client_first' | 'sales_first' | 'hybrid'

export interface LayoutChecklistItem {
  id: string
  label: string
  done: boolean
}

export interface LayoutFinalization {
  selectedOption: LayoutOptionId | null
  notes: string
  checklist: LayoutChecklistItem[]
  finalized: boolean
  finalizedAt: string | null
  finalizedByName: string | null
}

export interface Phase {
  id: string
  name: string
  order: number
}

export interface Comment {
  id: string
  authorId: string
  text: string
  createdAt: string
}

export interface Attachment {
  id: string
  name: string
  dataUrl: string
  size: number
  uploadedAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  phaseId: string
  assigneeId: string | null
  priority: Priority
  status: TaskStatus
  startDate: string
  dueDate: string
  comments: Comment[]
  attachments: Attachment[]
  createdAt: string
  updatedAt: string
}

export interface TeamMember {
  id: string
  name: string
  role: Role
  email: string
}

export interface DesignFile {
  id: string
  name: string
  category: string
  note: string
  dataUrl: string | null
  size: number
  uploadedAt: string
}

export interface BoqItem {
  id: string
  item: string
  qty: number
  unit: string
  rate: number
  vendor: string
  status: BoqStatus
}

export interface Expense {
  id: string
  title: string
  category: string
  amount: number
  date: string
  notes: string
}

export interface ActivityEntry {
  id: string
  actorId: string | null
  actorName: string
  message: string
  createdAt: string
}

export interface TrackerData {
  phases: Phase[]
  tasks: Task[]
  team: TeamMember[]
  files: DesignFile[]
  boqItems: BoqItem[]
  expenses: Expense[]
  activity: ActivityEntry[]
  layoutFinalization: LayoutFinalization
  adminPin: string
  version: number
}

export interface AppState extends TrackerData {
  currentUserId: string | null
}
