import type { DiscoverClassGroup, DiscoverGroupedSchedule } from '../../../lib/scheduling'

// Re-export server types for convenience
export type { DiscoverClassGroup, DiscoverGroupedSchedule }

/**
 * A display item can either be a single-schedule group or a multi-schedule group
 */
export type DiscoverDisplayItem =
  | { type: 'single'; group: DiscoverClassGroup }
  | { type: 'group'; group: DiscoverClassGroup }

/**
 * State for the TimeSlotPicker dialog/drawer
 */
export interface TimeSlotPickerState {
  isOpen: boolean
  group: DiscoverClassGroup | null
}

/**
 * Groups of DiscoverClassGroup organized by date category
 */
export interface GroupedByDate {
  today: DiscoverClassGroup[]
  tomorrow: DiscoverClassGroup[]
  thisWeek: DiscoverClassGroup[]
  later: DiscoverClassGroup[]
}
