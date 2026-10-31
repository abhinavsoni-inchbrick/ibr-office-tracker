import type { Phase } from '../types'

export const PHASE_NAMES = [
  'Layout Plan Finalization',
  '3D Design & Visualization',
  'Technical Drawings',
  'Budget & BOQ',
  'Vendor Finalization',
  'Civil Work',
  'Electrical & AC Work',
  'Interior Finishing',
  'Furniture Installation',
  'IT & Networking',
  'Testing & Inspection',
  'Final Handover',
] as const

export function createSeedPhases(): Phase[] {
  return PHASE_NAMES.map((name, index) => ({
    id: `phase-${index + 1}`,
    name,
    order: index + 1,
  }))
}
