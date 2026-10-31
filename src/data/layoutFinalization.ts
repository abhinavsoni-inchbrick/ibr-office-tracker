import type { LayoutChecklistItem, LayoutOptionId, Task } from '../types'
import { todayISO } from '../lib/utils'

export const LAYOUT_OPTIONS: {
  id: LayoutOptionId
  name: string
  focus: string
  recommended: boolean
  sourceFile: string
}[] = [
  {
    id: 'client_first',
    name: 'Client-first',
    focus: 'Showroom path + gallery — recommended for NRI/HNI walk-ins',
    recommended: true,
    sourceFile: 'layouts/client_first.json',
  },
  {
    id: 'sales_first',
    name: 'Sales-first',
    focus: 'Max sales desks / phone booths — if call volume dominates',
    recommended: false,
    sourceFile: 'layouts/sales_first.json',
  },
  {
    id: 'hybrid',
    name: 'Hybrid',
    focus: 'Roof flex cabanas — needs Delhi weather package + engineer review',
    recommended: false,
    sourceFile: 'layouts/hybrid.json',
  },
]

export const DEFAULT_CHECKLIST: Omit<LayoutChecklistItem, 'done'>[] = [
  {
    id: 'chk-option',
    label: 'Chosen layout option recorded (Client-first / Sales-first / Hybrid)',
  },
  {
    id: 'chk-headcount',
    label: 'Headcount & seat plan verified (sales 24 locked, design seats ~42)',
  },
  {
    id: 'chk-cabins',
    label: 'Named cabins confirmed (directors, HR, leadership)',
  },
  {
    id: 'chk-validate',
    label: 'CAD layout validated (npm run validate — 0 hard errors)',
  },
  {
    id: 'chk-circulation',
    label: 'Circulation / clearances reviewed (warn flags accepted or fixed)',
  },
  {
    id: 'chk-roof',
    label: 'Roof / open terrace scope decided (or marked N/A)',
  },
  {
    id: 'chk-stakeholder',
    label: 'Stakeholder sign-off on selected layout',
  },
]

export function createEmptyLayoutFinalization() {
  return {
    selectedOption: null as LayoutOptionId | null,
    notes: '',
    checklist: DEFAULT_CHECKLIST.map((c) => ({ ...c, done: false })),
    finalized: false,
    finalizedAt: null as string | null,
    finalizedByName: null as string | null,
  }
}

export function createLayoutPhaseTasks(): Omit<
  Task,
  'id' | 'comments' | 'attachments' | 'createdAt' | 'updatedAt'
>[] {
  const start = todayISO()
  return [
    {
      title: 'Enter & select final layout option',
      description:
        'Record which V2 layout is going forward: Client-first (recommended), Sales-first, or Hybrid. Source files in layouts/*.json.',
      phaseId: 'phase-1',
      assigneeId: null,
      priority: 'high',
      status: 'pending',
      startDate: start,
      dueDate: '',
    },
    {
      title: 'Verify headcount, cabins & seat program',
      description:
        'Confirm sales 24 (NRI/HNI/domestic), marketing/IT/leadership seats, and named cabins against office_config.json.',
      phaseId: 'phase-1',
      assigneeId: null,
      priority: 'high',
      status: 'pending',
      startDate: start,
      dueDate: '',
    },
    {
      title: 'Run CAD validate & review clearance warns',
      description:
        'From app/: npm run validate. All three layouts should pass hard errors. Review clearance / area-sum / acoustic warns.',
      phaseId: 'phase-1',
      assigneeId: null,
      priority: 'medium',
      status: 'pending',
      startDate: start,
      dueDate: '',
    },
    {
      title: 'Stakeholder review & finalize layout plan',
      description:
        'Walk through the selected plan, capture notes, complete the Phase 1 checklist on Project Phases, then click Finalize layout plan.',
      phaseId: 'phase-1',
      assigneeId: null,
      priority: 'high',
      status: 'pending',
      startDate: start,
      dueDate: '',
    },
  ]
}
